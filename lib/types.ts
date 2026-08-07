export type BloodGroup = 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';
export type DonorStatus = 'available' | 'busy';
export type RequestType = 'instant' | 'pre_booking';
export type RequestStatus = 'pending' | 'accepted' | 'completed' | 'cancelled';

export interface Profile {
  id: string;
  auth_user_id?: string | null;
  name: string;
  phone: string;
  blood_group: BloodGroup;
  is_donor: boolean;
  status: DonorStatus;
  location: { lat: number; lon: number } | null;
  last_donated_at: string | null;
  created_at: string;
}

export interface BloodRequest {
  id: string;
  requester_id: string;
  patient_blood_group: BloodGroup;
  request_type: RequestType;
  required_date: string;
  hospital_name: string;
  hospital_location: { lat: number; lon: number } | string | null;
  status: RequestStatus;
  accepted_by_donor_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Donor {
  id: string;
  name: string;
  phone: string;
  blood_group: BloodGroup;
  status: DonorStatus;
  lat: number;
  lng: number;
  distance_m: number;
}

export interface CancelledLog {
  id: string;
  request_id: string;
  donor_id: string;
  cancelled_at: string;
  reason: string;
}

export interface GeolocationCoords {
  lat: number;
  lon: number;
}

export interface NearbyDonor extends Profile {
  distance_m: number;
}

export interface CreateProfileInput {
  name: string;
  phone: string;
  blood_group: BloodGroup;
  is_donor: boolean;
  location: GeolocationCoords;
}

export interface CreateBloodRequestInput {
  requester_id: string;
  patient_blood_group: BloodGroup;
  request_type: RequestType;
  required_date: string;
  hospital_name: string;
  hospital_location: GeolocationCoords;
}

export interface AcceptRequestInput {
  request_id: string;
  donor_id: string;
}

export interface CancelRequestInput {
  request_id: string;
  donor_id: string;
  reason: string;
}
