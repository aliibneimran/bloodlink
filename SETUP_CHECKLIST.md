# Quick Setup Checklist

Use this checklist to verify your BloodLink setup is complete. Check them off as you complete each step.

## Environment Configuration
- [ ] Created `.env.local` file in project root
- [ ] Added `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Added `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Ran `npm run dev` to load environment variables

## Supabase Database
- [ ] Created database schema by running `lib/schema.sql` in Supabase SQL Editor
- [ ] Ran the RLS migration: `lib/migrations/001-fix-rls-policies.sql`
  - [ ] Verified Results section shows 3 policy rows

## Supabase Authentication
- [ ] Enabled Email authentication in Supabase → Authentication → Providers

## Testing
- [ ] Can access `http://localhost:3000/donor` without errors
- [ ] Can fill in donor registration form
- [ ] Can select location on map
- [ ] See "success" page after registration
- [ ] See profile created in Supabase → Table Editor → profiles
- [ ] See auth user created in Supabase → Authentication → Users

## Dashboard Access
- [ ] Can access `http://localhost:3000/dashboard`
- [ ] Can sign in with email/password from registration
- [ ] Can see dashboard with blood requests
- [ ] Can create blood request at `/request`

## Troubleshooting Steps

If something doesn't work:

1. **Check browser console** (F12 → Console tab)
   - Look for error messages
   - Check Network tab for API response errors

2. **Check server logs** (where you ran `npm run dev`)
   - Look for error messages from the API

3. **Verify Supabase connection**:
   - Go to Supabase Dashboard
   - Click **Settings** → **API**
   - Copy credentials again and update `.env.local`

4. **Check database permissions**:
   - Go to Supabase SQL Editor
   - Run: `SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename = 'profiles';`
   - Should show 3 rows for: public read, public insert, public update

5. **Check auth is enabled**:
   - Go to Supabase → **Authentication** → **Providers**
   - Email provider should be toggled ON

6. **Check environment variables are loaded**:
   - Restart `npm run dev`
   - Check if errors mention missing configuration

## Support

If you're still having issues after going through this checklist:

1. Share the error message from browser console
2. Share the server log output from `npm run dev`
3. Verify all steps in `SETUP.md` are complete
4. Check the `lib/migrations/README.md` for database migration details
