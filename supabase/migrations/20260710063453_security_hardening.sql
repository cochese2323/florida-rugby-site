/*
# Security Hardening: Tighten RLS, Add Admin Auth, Server-Side Directory Password

## Overview
This migration fixes three critical security vulnerabilities in the original schema:
1. RLS policies were too permissive — any anon user could read all contact messages,
   RSVPs, and update/delete records they should not have access to.
2. Admin "authentication" was a hardcoded password in client-side JavaScript.
3. The directory gate password was hardcoded in client-side JavaScript, visible in the bundle.

## Changes

### 1. RLS Policy Overhaul

**membership_applications:**
- INSERT: stays open (public can submit applications) — KEPT.
- SELECT: was `USING (status = 'approved')` which exposed approved applicants' full
  data (name, email, phone, business). Now restricted to authenticated users only
  (admins). The public count is served via a SECURITY DEFINER function (see below).
- UPDATE: was `USING (true)` — anyone could approve their own application.
  Now restricted to authenticated users (admins) only.

**contact_messages:**
- INSERT: stays open (public can submit contact form) — KEPT.
- SELECT: was open to anon — anyone could read all messages including emails.
  Now restricted to authenticated users (admins) only.
- DELETE: was open to anon — anyone could delete messages.
  Now restricted to authenticated users (admins) only.

**event_rsvps:**
- INSERT: stays open (public can RSVP) — KEPT.
- SELECT: was open to anon — anyone could read all RSVP emails.
  Now restricted to authenticated users (admins) only.
- DELETE: was open to anon — anyone could delete RSVPs.
  Now restricted to authenticated users (admins) only.

**club_funds:**
- SELECT: stays open (public can see fundraising progress) — KEPT.
- UPDATE: was open to anon — anyone could change fundraising amounts.
  Now restricted to authenticated users (admins) only.

### 2. Security Definer Function for Public Count

`get_founding_member_count()` — returns the count of approved applications,
capped at 74. SECURITY DEFINER means it runs with the function owner's
privileges (bypassing RLS), so the public can get the count without being
able to SELECT from membership_applications directly. No personal data is
exposed — only a number.

### 3. Site Settings Table & Directory Password Function

`site_settings` — a single-row table for configuration values.
Currently holds `directory_password` for the member directory gate.

`verify_directory_password(input text)` — SECURITY DEFINER function that
securely compares the input against the stored password in site_settings.
Returns true/false. The actual password never reaches the client.

### Important Notes
- The admin must create a Supabase auth account (email/password) to access the
  admin portal. The RLS policies use auth.uid() to verify authenticated status.
- The directory password is stored in the database (site_settings table) and
  is only readable by authenticated users. The verify function runs as
  SECURITY DEFINER so the anon client can check a password without seeing it.
- The public founding member count is served via get_founding_member_count()
  so the home page counter continues to work without exposing application data.
*/
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- Security Definer: Public founding member count
-- ============================================================
-- Returns count of approved applications, capped at the founding limit (74).
-- SECURITY DEFINER bypasses RLS so the anon client can get the count
-- without being able to SELECT application rows directly.
CREATE OR REPLACE FUNCTION get_founding_member_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  approved_count integer;
BEGIN
  SELECT COUNT(*) INTO approved_count
  FROM membership_applications
  WHERE status = 'approved';

  RETURN LEAST(approved_count, 74);
END;
$$;

-- ============================================================
-- Site settings table (for directory password, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  directory_password text NOT NULL DEFAULT 'rugby2024',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public can verify a password (via the function), but cannot read settings directly
DROP POLICY IF EXISTS "anon_select_site_settings" ON site_settings;
CREATE POLICY "anon_select_site_settings"
ON site_settings FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_site_settings" ON site_settings;
CREATE POLICY "auth_update_site_settings"
ON site_settings FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

-- Seed the single settings row
INSERT INTO site_settings (id, directory_password) VALUES (1, 'rugby2024')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Security Definer: Verify directory password
-- ============================================================
-- Compares input against the stored directory password.
-- SECURITY DEFINER so the anon client can verify without reading site_settings.
CREATE OR REPLACE FUNCTION verify_directory_password(input_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_password text;
BEGIN
  SELECT directory_password INTO stored_password FROM site_settings WHERE id = 1;
  RETURN input_password = stored_password;
END;
$$;

-- ============================================================
-- Tighten RLS: membership_applications
-- ============================================================
-- INSERT stays open (public applications)
DROP POLICY IF EXISTS "anon_insert_applications" ON membership_applications;
CREATE POLICY "anon_insert_applications"
ON membership_applications FOR INSERT
TO anon, authenticated WITH CHECK (true);

-- SELECT: now authenticated-only (was exposing approved applicants' data to anon)
DROP POLICY IF EXISTS "anon_select_application_count" ON membership_applications;
CREATE POLICY "auth_select_applications"
ON membership_applications FOR SELECT
TO authenticated USING (true);

-- UPDATE: now authenticated-only (was open to all — anyone could approve apps)
DROP POLICY IF EXISTS "anon_update_applications" ON membership_applications;
CREATE POLICY "auth_update_applications"
ON membership_applications FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- Tighten RLS: contact_messages
-- ============================================================
-- INSERT stays open (public contact form)
DROP POLICY IF EXISTS "anon_insert_messages" ON contact_messages;
CREATE POLICY "anon_insert_messages"
ON contact_messages FOR INSERT
TO anon, authenticated WITH CHECK (true);

-- SELECT: now authenticated-only (was exposing all messages to anon)
DROP POLICY IF EXISTS "anon_select_messages" ON contact_messages;
CREATE POLICY "auth_select_messages"
ON contact_messages FOR SELECT
TO authenticated USING (true);

-- DELETE: now authenticated-only (was allowing anon to delete messages)
DROP POLICY IF EXISTS "anon_delete_messages" ON contact_messages;
CREATE POLICY "auth_delete_messages"
ON contact_messages FOR DELETE
TO authenticated USING (true);

-- ============================================================
-- Tighten RLS: event_rsvps
-- ============================================================
-- INSERT stays open (public RSVPs)
DROP POLICY IF EXISTS "anon_insert_rsvps" ON event_rsvps;
CREATE POLICY "anon_insert_rsvps"
ON event_rsvps FOR INSERT
TO anon, authenticated WITH CHECK (true);

-- SELECT: now authenticated-only (was exposing all RSVP emails to anon)
DROP POLICY IF EXISTS "anon_select_rsvps" ON event_rsvps;
CREATE POLICY "auth_select_rsvps"
ON event_rsvps FOR SELECT
TO authenticated USING (true);

-- DELETE: now authenticated-only (was allowing anon to delete RSVPs)
DROP POLICY IF EXISTS "anon_delete_rsvps" ON event_rsvps;
CREATE POLICY "auth_delete_rsvps"
ON event_rsvps FOR DELETE
TO authenticated USING (true);

-- ============================================================
-- Tighten RLS: club_funds
-- ============================================================
-- SELECT stays open (public fundraising progress)
DROP POLICY IF EXISTS "anon_select_club_funds" ON club_funds;
CREATE POLICY "anon_select_club_funds"
ON club_funds FOR SELECT
TO anon, authenticated USING (true);

-- UPDATE: now authenticated-only (was allowing anon to change fundraising amounts)
DROP POLICY IF EXISTS "anon_update_club_funds" ON club_funds;
CREATE POLICY "auth_update_club_funds"
ON club_funds FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);
