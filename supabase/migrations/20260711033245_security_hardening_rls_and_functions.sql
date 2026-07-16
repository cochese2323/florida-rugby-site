/*
# Security Hardening: Tighten INSERT Policies & Revoke Function Execute

## Overview
Fixes two classes of issues flagged by security audit:

1. INSERT policies with `WITH CHECK (true)` on contact_messages, event_rsvps,
   and membership_applications allow unrestricted inserts by anon/authenticated.
   Replace with meaningful constraints (rate-limiting via CHECK constraints is
   not feasible at the policy level, so we constrain to required non-null
   columns and reasonable length limits to prevent abuse).

2. SECURITY DEFINER functions are callable by anon and authenticated roles via
   the REST API. Revoke EXECUTE from public/authenticated/anon on functions that
   should not be directly callable, and grant EXECUTE only where needed:
   - bootstrap_first_admin: trigger-only, revoke all direct EXECUTE
   - is_admin: internal helper for RLS, revoke all direct EXECUTE
   - get_founding_member_count: public count, keep EXECUTE on anon/authenticated
     but it must stay SECURITY DEFINER to bypass RLS — this is intentional, so
     we keep it but document it.
   - verify_directory_password: public needs to verify directory password, keep
     EXECUTE on anon/authenticated — intentional SECURITY DEFINER.
   - set_directory_password: admin-only, revoke from anon/authenticated, keep
     on authenticated only (function body checks is_admin()).

   Per the audit, we revoke EXECUTE from anon AND authenticated on all functions,
   then re-grant only where the function is genuinely meant to be callable.
*/

-- ============================================================
-- 1. Tighten INSERT policies on contact_messages
-- ============================================================
-- Require non-null name, email, subject, message with reasonable length limits
DROP POLICY IF EXISTS "anon_insert_messages" ON contact_messages;
CREATE POLICY "anon_insert_messages"
ON contact_messages FOR INSERT
TO anon, authenticated
WITH CHECK (
  name IS NOT NULL
  AND length(name) BETWEEN 1 AND 200
  AND email IS NOT NULL
  AND length(email) BETWEEN 3 AND 320
  AND subject IS NOT NULL
  AND length(subject) BETWEEN 1 AND 300
  AND message IS NOT NULL
  AND length(message) BETWEEN 1 AND 5000
);

-- ============================================================
-- 2. Tighten INSERT policies on event_rsvps
-- ============================================================
DROP POLICY IF EXISTS "anon_insert_rsvps" ON event_rsvps;
CREATE POLICY "anon_insert_rsvps"
ON event_rsvps FOR INSERT
TO anon, authenticated
WITH CHECK (
  event_id IS NOT NULL
  AND length(event_id) BETWEEN 1 AND 100
  AND name IS NOT NULL
  AND length(name) BETWEEN 1 AND 200
  AND email IS NOT NULL
  AND length(email) BETWEEN 3 AND 320
  AND guests IS NOT NULL
  AND guests BETWEEN 1 AND 20
  AND (message IS NULL OR length(message) <= 5000)
);

-- ============================================================
-- 3. Tighten INSERT policies on membership_applications
-- ============================================================
DROP POLICY IF EXISTS "anon_insert_applications" ON membership_applications;
CREATE POLICY "anon_insert_applications"
ON membership_applications FOR INSERT
TO anon, authenticated
WITH CHECK (
  full_name IS NOT NULL
  AND length(full_name) BETWEEN 1 AND 200
  AND email IS NOT NULL
  AND length(email) BETWEEN 3 AND 320
  AND supported_club IS NOT NULL
  AND length(supported_club) BETWEEN 1 AND 200
  AND (phone IS NULL OR length(phone) <= 50)
  AND (business_name IS NULL OR length(business_name) <= 300)
  AND (business_category IS NULL OR length(business_category) <= 200)
  AND (city IS NULL OR length(city) <= 200)
  AND (message IS NULL OR length(message) <= 5000)
);

-- ============================================================
-- 4. Revoke EXECUTE on SECURITY DEFINER functions
-- ============================================================
-- bootstrap_first_admin: trigger-only, no direct execution needed
REVOKE EXECUTE ON FUNCTION bootstrap_first_admin() FROM PUBLIC, anon, authenticated;

-- is_admin: internal helper for RLS policies, not meant to be called directly
REVOKE EXECUTE ON FUNCTION is_admin() FROM PUBLIC, anon, authenticated;

-- set_directory_password: admin-only, function body checks is_admin()
-- Revoke from anon; keep from authenticated but the function self-guards.
-- Actually, revoke from both anon and authenticated — the function checks
-- is_admin() internally, but we should still not expose it to anon.
-- Keep authenticated since admins use the anon key client which authenticates
-- as the authenticated role.
REVOKE EXECUTE ON FUNCTION set_directory_password(new_password text) FROM PUBLIC, anon;
-- Keep EXECUTE on authenticated (admins sign in and call via RPC)

-- verify_directory_password: intentionally public (anon needs to verify
-- directory password). Keep EXECUTE on anon and authenticated.
-- No change needed — this is intentional SECURITY DEFINER.

-- get_founding_member_count: intentionally public (anon needs the count
-- for the homepage counter). Keep EXECUTE on anon and authenticated.
-- No change needed — this is intentional SECURITY DEFINER.

-- ============================================================
-- 5. Re-grant EXECUTE explicitly where needed
-- ============================================================
-- verify_directory_password: anon + authenticated (intentional)
GRANT EXECUTE ON FUNCTION verify_directory_password(input_password text) TO anon, authenticated;

-- get_founding_member_count: anon + authenticated (intentional)
GRANT EXECUTE ON FUNCTION get_founding_member_count() TO anon, authenticated;

-- set_directory_password: authenticated only (admin checks is_admin() inside)
GRANT EXECUTE ON FUNCTION set_directory_password(new_password text) TO authenticated;
