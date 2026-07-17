-- The security hardening migration revoked EXECUTE on is_admin() from all roles
-- to prevent direct REST API calls. However, RLS policies that call is_admin()
-- also require the querying role to have EXECUTE permission. Without it, Postgres
-- cannot evaluate the policy and silently returns zero rows for authenticated admins.
--
-- Re-grant EXECUTE to authenticated only. Anon remains revoked.
-- Authenticated users can call is_admin() via RPC but it only reveals whether
-- the caller themselves is an admin — not a meaningful security exposure.
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
