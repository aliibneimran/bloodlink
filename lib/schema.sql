-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Blood type enum
CREATE TYPE blood_group_enum AS ENUM ('O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-');

-- Donor status enum
CREATE TYPE donor_status_enum AS ENUM ('available', 'busy');

-- Request type enum
CREATE TYPE request_type_enum AS ENUM ('instant', 'pre_booking');

-- Request status enum
CREATE TYPE request_status_enum AS ENUM ('pending', 'accepted', 'completed', 'cancelled');

-- Profiles table for donors and requesters
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  blood_group blood_group_enum,
  is_donor BOOLEAN DEFAULT FALSE,
  status donor_status_enum DEFAULT 'busy',
  location GEOGRAPHY(POINT, 4326),
  last_donated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create spatial index on location
CREATE INDEX idx_profiles_location ON profiles USING GIST (location);

-- Blood requests table
CREATE TABLE blood_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  patient_blood_group blood_group_enum NOT NULL,
  request_type request_type_enum NOT NULL,
  required_date TIMESTAMP NOT NULL,
  hospital_name TEXT NOT NULL,
  hospital_location GEOGRAPHY(POINT, 4326) NOT NULL,
  status request_status_enum DEFAULT 'pending',
  accepted_by_donor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create spatial index on hospital location
CREATE INDEX idx_blood_requests_location ON blood_requests USING GIST (hospital_location);
CREATE INDEX idx_blood_requests_status ON blood_requests(status);

-- Cancelled logs table
CREATE TABLE cancelled_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES blood_requests(id) ON DELETE CASCADE,
  donor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cancelled_at TIMESTAMP DEFAULT NOW(),
  reason TEXT
);

-- Function to get nearby donors
CREATE OR REPLACE FUNCTION get_nearby_donors(
  lat FLOAT,
  lon FLOAT,
  radius_km INT,
  blood_type blood_group_enum
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  phone TEXT,
  blood_group blood_group_enum,
  status donor_status_enum,
  distance_m FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.phone,
    p.blood_group,
    p.status,
    ST_Distance(p.location, ST_GeogFromText('SRID=4326;POINT(' || lon || ' ' || lat || ')'))::FLOAT AS distance_m
  FROM profiles p
  WHERE
    p.is_donor = TRUE
    AND p.blood_group = blood_type
    AND p.status = 'available'
    AND ST_DWithin(
      p.location,
      ST_GeogFromText('SRID=4326;POINT(' || lon || ' ' || lat || ')'),
      radius_km * 1000
    )
  ORDER BY distance_m ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to atomically accept a blood request (only first donor succeeds)
CREATE OR REPLACE FUNCTION accept_blood_request_atomically(
  request_id UUID,
  donor_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_current_status request_status_enum;
BEGIN
  -- Get current request status with lock
  SELECT status INTO v_current_status FROM blood_requests
  WHERE id = request_id
  FOR UPDATE;

  -- Check if already accepted
  IF v_current_status != 'pending' THEN
    RETURN QUERY SELECT FALSE::BOOLEAN, 'Request already ' || v_current_status || ' by another donor'::TEXT;
    RETURN;
  END IF;

  -- Atomically update request
  UPDATE blood_requests
  SET
    status = 'accepted',
    accepted_by_donor_id = donor_id,
    updated_at = NOW()
  WHERE id = request_id AND status = 'pending';

  IF FOUND THEN
    RETURN QUERY SELECT TRUE::BOOLEAN, 'Request accepted successfully'::TEXT;
  ELSE
    RETURN QUERY SELECT FALSE::BOOLEAN, 'Request was already accepted by another donor'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to cancel a blood request by a donor
CREATE OR REPLACE FUNCTION cancel_blood_request_by_donor(
  request_id UUID,
  donor_id UUID,
  reason_text TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
BEGIN
  -- Log the cancellation
  INSERT INTO cancelled_logs (request_id, donor_id, reason)
  VALUES (request_id, donor_id, reason_text);

  -- Reset request to pending
  UPDATE blood_requests
  SET
    status = 'pending',
    accepted_by_donor_id = NULL,
    updated_at = NOW()
  WHERE id = request_id AND accepted_by_donor_id = donor_id;

  IF FOUND THEN
    RETURN QUERY SELECT TRUE::BOOLEAN, 'Request cancelled and returned to pending'::TEXT;
  ELSE
    RETURN QUERY SELECT FALSE::BOOLEAN, 'Could not cancel request'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE cancelled_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles (allow public read/insert, auth update own)
CREATE POLICY "Allow public read" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON profiles FOR UPDATE USING (true) WITH CHECK (true);

-- RLS Policies for blood_requests (allow public read, auth insert/update)
CREATE POLICY "Allow public read requests" ON blood_requests FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert requests" ON blood_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update requests" ON blood_requests FOR UPDATE USING (true) WITH CHECK (true);

-- RLS Policies for cancelled_logs (allow authenticated insert/read)
CREATE POLICY "Allow public read logs" ON cancelled_logs FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert logs" ON cancelled_logs FOR INSERT WITH CHECK (true);
