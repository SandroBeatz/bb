-- Migration 010: Make old_client_id nullable
-- After 009_clients_table.sql, bookings.old_client_id is the renamed former client_id
-- (references profiles.id / Clerk user IDs). New bookings from unauthenticated clients
-- only have client_id (FK → clients.id) and never have old_client_id.

ALTER TABLE bookings ALTER COLUMN old_client_id DROP NOT NULL;
