/*
# Bootstrap Admin Trigger

## Overview
A new Supabase project has no admin users. Someone needs to be able to sign up
the first time to become the initial admin. This migration creates a trigger on
`auth.users` that automatically inserts the very first registered user into
`admin_users` — but ONLY when the table is empty (zero existing admins).

This means:
- The first account ever created becomes the admin.
- All subsequent signups are plain auth users with no elevated privileges.
- The admin signup UI path should be removed from the frontend (done separately)
  so ordinary visitors cannot register at all. The admin can add additional
  admins manually via the Supabase dashboard by inserting into admin_users.

## New Objects
- `bootstrap_first_admin()`: trigger function that inserts the new user into
  `admin_users` if and only if `admin_users` is currently empty.
- `trg_bootstrap_first_admin`: AFTER INSERT trigger on `auth.users`.
*/

CREATE OR REPLACE FUNCTION bootstrap_first_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only promote to admin if no admins exist yet
  IF NOT EXISTS (SELECT 1 FROM admin_users) THEN
    INSERT INTO admin_users (user_id) VALUES (NEW.id)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bootstrap_first_admin ON auth.users;
CREATE TRIGGER trg_bootstrap_first_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION bootstrap_first_admin();
