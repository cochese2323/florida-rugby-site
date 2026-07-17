
CREATE OR REPLACE FUNCTION verify_directory_password(input_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stored_hash text;
BEGIN
  SELECT directory_password_hash INTO stored_hash FROM site_settings WHERE id = 1;
  IF stored_hash IS NULL THEN
    RETURN false;
  END IF;
  RETURN extensions.crypt(input_password, stored_hash) = stored_hash;
END;
$$;

UPDATE site_settings
SET directory_password_hash = extensions.crypt('Sharks9', extensions.gen_salt('bf'))
WHERE id = 1;
