CREATE POLICY "admin_insert_club_funds" ON club_funds FOR INSERT
  TO authenticated WITH CHECK (is_admin());

CREATE POLICY "admin_delete_club_funds" ON club_funds FOR DELETE
  TO authenticated USING (is_admin());
