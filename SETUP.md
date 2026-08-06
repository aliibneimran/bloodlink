# BloodLink Setup Guide

## Prerequisites

Before the application can work, you need to configure Supabase and your environment variables.

## Step 1: Environment Variables

Create or update your `.env.local` file in the project root with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key...
```

### How to find your credentials:

1. Go to your Supabase project dashboard
2. Click **Settings** (bottom left)
3. Go to **API**
4. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` key → `SUPABASE_SERVICE_ROLE_KEY`

**Important**: The `SUPABASE_SERVICE_ROLE_KEY` is a secret—never commit it to git or share it publicly.

## Step 2: Database Setup

### Create the database schema:

1. Go to your Supabase project → **SQL Editor**
2. Click **New Query**
3. Paste the contents of `lib/schema.sql`
4. Click **Run**

This creates:
- Tables: `profiles`, `blood_requests`, `cancelled_logs`
- Functions for donor matching and request management
- Initial RLS policies

### Apply the RLS migration:

If you see "permission denied for table profiles" errors after step 1, run this migration:

1. Go to **SQL Editor** → **New Query**
2. Paste the contents of `lib/migrations/001-fix-rls-policies.sql`
3. Click **Run**
4. Verify you see 3 rows in the Results section showing the policies

## Step 3: Enable Supabase Authentication

1. Go to your Supabase project → **Authentication** (left sidebar)
2. Click **Providers**
3. Scroll down to find **Email**
4. Toggle it ON if it's not already enabled
5. Leave other settings at defaults

## Step 4: Verify Setup

### Check environment variables:
```bash
# From project root, run:
npm run dev
# Open browser console to check for configuration errors
```

### Test profile creation:
1. Go to `http://localhost:3000/donor`
2. Fill in the form and select a location
3. If successful, you'll see a success page with your Donor ID
4. If you get an error about permissions or configuration, check:
   - Environment variables are in `.env.local`
   - Migration script was run
   - Email authentication is enabled in Supabase

## Troubleshooting

### Error: "Database permissions not configured"
- Run the migration script: `lib/migrations/001-fix-rls-policies.sql`
- Verify the Results section shows 3 policies

### Error: "Missing Supabase configuration"
- Check `.env.local` file exists in project root
- Verify all three keys are set and not empty
- Restart `npm run dev`

### Error: "Email rate limit exceeded"
- Supabase has a rate limit on account creation
- Wait a few minutes and try again
- Check browser console for the exact error

### Test creating an auth account manually:
1. Go to Supabase → **Authentication** → **Users**
2. Click **Add user**
3. Create a test user with email `test@bloodlink.local`
4. This verifies authentication is working

## Environment Variables Summary

| Variable | Source | Example |
|----------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Settings → API → Project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Settings → API → anon key | `eyJh...` (starts with eyJ) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Settings → API → service_role secret | `eyJh...` (starts with eyJ, longer than anon key) |

## Next Steps

Once setup is complete:
1. Users can register as donors at `/donor`
2. Users can create blood requests at `/request`
3. Users can view the dashboard at `/dashboard`
4. Authentication happens automatically during registration

For development, you can:
- Check the browser Network tab to see API responses
- Check the browser Console for detailed error messages
- Check Supabase Dashboard → SQL Editor to run diagnostic queries
