-- Restore grants for all roles (service_role was missing table-level permissions)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL   ON ALL TABLES    IN SCHEMA public TO authenticated, service_role;
GRANT ALL   ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT SELECT ON ALL TABLES   IN SCHEMA public TO anon;
