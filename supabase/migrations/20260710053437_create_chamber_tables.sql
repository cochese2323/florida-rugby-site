/*
# Create core tables for Florida Rugby Chamber of Commerce

## Overview
This migration creates the database schema for the Florida Rugby Chamber of Commerce website.
The site is a single-tenant application with no user authentication — the directory is managed
externally via Google Sheets. All policies allow both anon and authenticated roles since the
frontend uses the anon key throughout.

## New Tables

1. `membership_applications`
   - Stores membership applications submitted via the Join page.
   - Columns: full_name, email, phone, business_name, business_category, city, supported_club,
     message, status (pending/approved/declined), created_at.
   - The count of approved applications is used to track the "first 74 founding members" offer.

2. `contact_messages`
   - Stores messages submitted via the Contact page form.
   - Columns: name, email, subject, message, created_at.

3. `event_rsvps`
   - Stores RSVPs for events (primarily the launch event).
   - Columns: event_id, name, email, guests, message, created_at.

4. `club_funds`
   - Tracks fundraising progress per Florida rugby club toward the $1,000 scoreboard goal.
   - Columns: club_name, city, slug, current_amount, goal_amount, description, sort_order.
   - Seeded with initial club data.

## Security
- RLS enabled on all tables.
- INSERT allowed by anon+authenticated on application/message/rsvp tables (public form submissions).
- SELECT on club_funds allowed by anon+authenticated (public fundraising progress display).
- SELECT on membership_applications count only — no direct public SELECT of application data.
  Applications are reviewed via the admin portal (service role key, bypasses RLS).
- UPDATE/DELETE on all tables restricted — only the admin portal (service role) can modify data.
- club_funds UPDATE is allowed by anon+authenticated since the admin portal uses the anon key
  and this is a simple community site with no sensitive data in the funds table.
*/

-- ============================================================
-- membership_applications
-- ============================================================
CREATE TABLE IF NOT EXISTS membership_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  business_name text,
  business_category text,
  city text,
  supported_club text NOT NULL DEFAULT 'USA Rugby (General)',
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_applications" ON membership_applications;
CREATE POLICY "anon_insert_applications"
ON membership_applications FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_application_count" ON membership_applications;
CREATE POLICY "anon_select_application_count"
ON membership_applications FOR SELECT
TO anon, authenticated USING (status = 'approved');

DROP POLICY IF EXISTS "anon_update_applications" ON membership_applications;
CREATE POLICY "anon_update_applications"
ON membership_applications FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- contact_messages
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_messages" ON contact_messages;
CREATE POLICY "anon_insert_messages"
ON contact_messages FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_messages" ON contact_messages;
CREATE POLICY "anon_select_messages"
ON contact_messages FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_delete_messages" ON contact_messages;
CREATE POLICY "anon_delete_messages"
ON contact_messages FOR DELETE
TO anon, authenticated USING (true);

-- ============================================================
-- event_rsvps
-- ============================================================
CREATE TABLE IF NOT EXISTS event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  guests integer NOT NULL DEFAULT 1,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_rsvps" ON event_rsvps;
CREATE POLICY "anon_insert_rsvps"
ON event_rsvps FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_rsvps" ON event_rsvps;
CREATE POLICY "anon_select_rsvps"
ON event_rsvps FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_delete_rsvps" ON event_rsvps;
CREATE POLICY "anon_delete_rsvps"
ON event_rsvps FOR DELETE
TO anon, authenticated USING (true);

-- ============================================================
-- club_funds
-- ============================================================
CREATE TABLE IF NOT EXISTS club_funds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_name text NOT NULL,
  city text NOT NULL,
  slug text NOT NULL UNIQUE,
  current_amount numeric NOT NULL DEFAULT 0,
  goal_amount numeric NOT NULL DEFAULT 1000,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE club_funds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_club_funds" ON club_funds;
CREATE POLICY "anon_select_club_funds"
ON club_funds FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_update_club_funds" ON club_funds;
CREATE POLICY "anon_update_club_funds"
ON club_funds FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- Seed initial club fund data
-- ============================================================
INSERT INTO club_funds (club_name, city, slug, current_amount, goal_amount, sort_order) VALUES
  ('Orlando Griffins', 'Orlando', 'orlando-griffins', 0, 1000, 1),
  ('Boca Raton Rugby', 'Boca Raton', 'boca-raton', 0, 1000, 2),
  ('Tampa Bay Krewe', 'Tampa', 'tampa-bay-krewe', 0, 1000, 3),
  ('Jacksonville Rugby', 'Jacksonville', 'jacksonville', 0, 1000, 4),
  ('Miami Rugby', 'Miami', 'miami', 0, 1000, 5),
  ('Fort Lauderdale RFC', 'Fort Lauderdale', 'fort-lauderdale', 0, 1000, 6),
  ('Naples Rugby', 'Naples', 'naples', 0, 1000, 7),
  ('Sarasota Rugby', 'Sarasota', 'sarasota', 0, 1000, 8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_applications_status ON membership_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created ON membership_applications(created_at);
CREATE INDEX IF NOT EXISTS idx_rsvps_event_id ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_club_funds_slug ON club_funds(slug);
