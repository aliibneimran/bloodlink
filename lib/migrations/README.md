# Database Migrations

This directory contains SQL migration scripts needed to update your Supabase database.

## How to Apply Migrations

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of the migration file (e.g., `001-fix-rls-policies.sql`)
5. Paste it into the query editor
6. Click **Run** to execute the migration
7. Look at the **Results** section at the bottom - it will show the policies that are now in place

## Migration: 001-fix-rls-policies.sql

**Status**: Required for public profile creation

This migration updates the Row Level Security (RLS) policies on the `profiles` table to allow public inserts. Without this, users cannot register as donors or create blood requests.

### What it fixes
- "permission denied for table profiles" error when creating new profiles
- "policy already exists" errors by dropping all old policies first
- Allows unauthenticated users to create their profile and auth account

### When to run
- If you see "permission denied for table profiles" errors
- If you see "policy already exists" errors
- After deploying the auto-auth system update

### Commands included
- Drops all existing policies (handles cases where old names or new names already exist)
- Creates three new public-access policies:
  - `Allow public read` - Anyone can view profiles
  - `Allow public insert` - Anyone can create a new profile
  - `Allow public update` - Anyone can update a profile
- Verifies the policies are in place by showing them at the bottom

### After running
- You should see 3 rows in the Results section showing the policies
- The /donor and /request endpoints should work without permission errors
- Try registering as a donor or creating a blood request again
