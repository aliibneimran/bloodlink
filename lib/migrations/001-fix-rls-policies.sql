-- Migration: Fix RLS policies to allow public profile creation
-- This fixes the "permission denied for table profiles" error

-- Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "Allow authenticated insert" ON profiles;
DROP POLICY IF EXISTS "Allow update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow public insert" ON profiles;
DROP POLICY IF EXISTS "Allow public update" ON profiles;
DROP POLICY IF EXISTS "Allow public read" ON profiles;

-- Recreate permissive policies for public access
CREATE POLICY "Allow public read" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON profiles FOR UPDATE USING (true) WITH CHECK (true);

-- Verify policies are in place
SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename = 'profiles';
