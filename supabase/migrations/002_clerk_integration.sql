-- Remove Supabase auth.users FK constraint — using Clerk for auth, not Supabase Auth.
-- Clerk user IDs (user_xxx) don't exist in auth.users, so the FK would reject all inserts.
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- auth.uid() always returns null with Clerk (no Supabase session).
-- All writes go through server API routes using service role (bypasses RLS), so this is safe.
-- RLS SELECT policies with USING (true) still work for public reads via anon key.
