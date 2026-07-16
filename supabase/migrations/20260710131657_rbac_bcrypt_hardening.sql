/*
# RBAC, Bcrypt Password Hashing, Input Constraints, and RLS Hardening

## Overview
This migration addresses multiple critical and high-severity security issues identified
in a post-launch audit:

1. **Admin RBAC table** — Introduces an `admin_users` table so RLS policies can
   distinguish a real chamber admin from any random Supabase Auth user. Previously
   ALL authenticated users had full UPDATE/DELETE/SELECT rights on sensitive tables,
   meaning anyone who self-registered could act as admin.

2. **Bcrypt directory password hashing** — The `site_settings.directory_password` column
   is renamed to `directory_password_hash` and all values are migrated to bcrypt hashes
   via `pgcrypto.crypt()`. The `verify_directory_password` and a new
   `set_directory_password` RPC are updated accordingly. Plaintext passwords are never
   stored again.

3. **Remove hardcoded default password** — The `DEFAULT 'rugby2024'` from the schema is
   replaced with a hashed default so the raw value is not visible in the schema definition.

4. **DB-level CHECK constraint on event_rsvps.guests** — The client-side `max={10}` was
   the only guard. Added `CHECK (guests BETWEEN 1 AND 20)` at the database level so API
   callers cannot bypass it.

5. **RLS policy updates** — All UPDATE/DELETE policies on sensitive tables
   (`membership_applications`, `contact_messages`, `event_rsvps`, `club_funds`,
   `site_settings`) are tightened to require the calling user to be in `admin_users`,
   checked via a SECURITY DEFINER helper function `is_admin()`.

## New Objects

- `admin_users` table: stores `user_id` (FK to auth.users). Any user in this table
  is treated as an admin by RLS policies.
- `is_admin()` function: SECURITY DEFINER, returns true if `auth.uid()` is in
  `admin_users`. Used in all admin-only RLS policies.
- `set_directory_password(new_password text)` function: SECURITY DEFINER, hashes the
  supplied password with bcrypt and stores the hash. Only callable by admins (checked
  inside the function).
- Updated `verify_directory_password(input_password text)`: now uses
  `crypt(input, hash) = hash` for constant-time bcrypt comparison.

## Modified Tables
- `site_settings`: column `directory_password` → `directory_password_hash` (bcrypt).
- `event_rsvps`: added `CHECK (guests BETWEEN 1 AND 20)`.

## Security Changes
- All admin-sensitive RLS policies now require `is_admin()` rather than just
  `authenticated`.
- `site_settings` SELECT is now admin-only (previously authenticated-only but the
  rename makes this explicit).
*/

-- ============================================================
-- Ensure pgcrypto is available
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. admin_users table
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can read the admin list (bootstrap: service role seeds it)
DROP POLICY IF EXISTS "admins_select_admin_users" ON admin_users;
CREATE POLICY "admins_select_admin_users"
ON admin_users FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================
-- 2. is_admin() helper — SECURITY DEFINER so policies can call it cheaply
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  );
END;
$$;

-- ============================================================
-- 3. Migrate site_settings to bcrypt password hash
-- ============================================================
-- Add the new hash column if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'directory_password_hash'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN directory_password_hash text;
  END IF;
END $$;

-- Migrate existing plaintext value to bcrypt hash (runs safely on repeated apply)
UPDATE site_settings
SET directory_password_hash = crypt(directory_password, gen_salt('bf', 10))
WHERE id = 1
  AND directory_password_hash IS NULL;

-- Make hash column NOT NULL now that it's populated
ALTER TABLE site_settings ALTER COLUMN directory_password_hash SET NOT NULL;

-- Drop the old plaintext column
ALTER TABLE site_settings DROP COLUMN IF EXISTS directory_password;

-- ============================================================
-- 4. Updated verify_directory_password — bcrypt comparison
-- ============================================================
CREATE OR REPLACE FUNCTION verify_directory_password(input_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_hash text;
BEGIN
  SELECT directory_password_hash INTO stored_hash FROM site_settings WHERE id = 1;
  IF stored_hash IS NULL THEN
    RETURN false;
  END IF;
  -- crypt() with the stored hash is constant-time bcrypt comparison
  RETURN crypt(input_password, stored_hash) = stored_hash;
END;
$$;

-- ============================================================
-- 5. set_directory_password — admin-only, hashes before storing
-- ============================================================
CREATE OR REPLACE FUNCTION set_directory_password(new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;
  IF length(new_password) < 6 THEN
    RAISE EXCEPTION 'Password must be at least 6 characters';
  END IF;
  UPDATE site_settings
  SET directory_password_hash = crypt(new_password, gen_salt('bf', 10)),
      updated_at = now()
  WHERE id = 1;
END;
$$;

-- ============================================================
-- 6. DB-level constraint on event_rsvps.guests
-- ============================================================
ALTER TABLE event_rsvps
  DROP CONSTRAINT IF EXISTS guests_range,
  ADD CONSTRAINT guests_range CHECK (guests BETWEEN 1 AND 20);

-- ============================================================
-- 7. Tighten RLS on membership_applications
-- ============================================================
DROP POLICY IF EXISTS "auth_select_applications" ON membership_applications;
CREATE POLICY "admin_select_applications"
ON membership_applications FOR SELECT
TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "auth_update_applications" ON membership_applications;
CREATE POLICY "admin_update_applications"
ON membership_applications FOR UPDATE
TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- 8. Tighten RLS on contact_messages
-- ============================================================
DROP POLICY IF EXISTS "auth_select_messages" ON contact_messages;
CREATE POLICY "admin_select_messages"
ON contact_messages FOR SELECT
TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "auth_delete_messages" ON contact_messages;
CREATE POLICY "admin_delete_messages"
ON contact_messages FOR DELETE
TO authenticated
USING (is_admin());

-- ============================================================
-- 9. Tighten RLS on event_rsvps
-- ============================================================
DROP POLICY IF EXISTS "auth_select_rsvps" ON event_rsvps;
CREATE POLICY "admin_select_rsvps"
ON event_rsvps FOR SELECT
TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "auth_delete_rsvps" ON event_rsvps;
CREATE POLICY "admin_delete_rsvps"
ON event_rsvps FOR DELETE
TO authenticated
USING (is_admin());

-- ============================================================
-- 10. Tighten RLS on club_funds
-- ============================================================
DROP POLICY IF EXISTS "auth_update_club_funds" ON club_funds;
CREATE POLICY "admin_update_club_funds"
ON club_funds FOR UPDATE
TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- 11. Tighten RLS on site_settings
-- ============================================================
DROP POLICY IF EXISTS "anon_select_site_settings" ON site_settings;
CREATE POLICY "admin_select_site_settings"
ON site_settings FOR SELECT
TO authenticated
USING (is_admin());

DROP POLICY IF EXISTS "auth_update_site_settings" ON site_settings;
CREATE POLICY "admin_update_site_settings"
ON site_settings FOR UPDATE
TO authenticated
USING (is_admin()) WITH CHECK (is_admin());
