-- Add auth_user_id to profiles so profiles can link to Supabase auth users
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;

ALTER TABLE profiles
ALTER COLUMN auth_user_id DROP NOT NULL;
