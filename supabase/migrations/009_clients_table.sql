-- Phase 0.1: New clients table (phone-based, per-master)
-- Replaces the old client profiles model with master-scoped clients
-- Note: profiles.id is text (Clerk user ID), not uuid

-- 1. Add cover_url to master_profiles
ALTER TABLE master_profiles ADD COLUMN IF NOT EXISTS cover_url text;

-- 2. Create clients table
CREATE TABLE clients (
  id                 uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  master_id          text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  phone              text NOT NULL,
  name               text NOT NULL DEFAULT '',
  telegram_id        bigint,
  telegram_username  text,
  notes              text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE(master_id, phone)
);

CREATE INDEX idx_clients_master ON clients(master_id);
CREATE INDEX idx_clients_phone ON clients(phone);

-- RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Service role (server) can do everything — all API routes use service role
CREATE POLICY "service_role_all" ON clients FOR ALL USING (true) WITH CHECK (true);

-- 3. Populate clients from existing booking history
-- For each unique (master_id, client_phone) pair, create a client record
INSERT INTO clients (master_id, phone, name, created_at)
SELECT DISTINCT ON (b.master_id, p.phone)
  b.master_id,
  p.phone AS phone,
  COALESCE(NULLIF(p.full_name, ''), 'Клиент') AS name,
  MIN(b.created_at) OVER (PARTITION BY b.master_id, b.client_id) AS created_at
FROM bookings b
JOIN profiles p ON p.id = b.client_id
WHERE b.master_id != b.client_id
  AND p.phone IS NOT NULL
ON CONFLICT (master_id, phone) DO NOTHING;

-- 4. Add new client_id column to bookings (uuid, nullable during migration)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS new_client_id uuid REFERENCES clients(id) ON DELETE RESTRICT;

-- 5. Backfill new_client_id: match old client profile → new clients record via phone
UPDATE bookings
SET new_client_id = c.id
FROM profiles p, clients c
WHERE p.id = bookings.client_id
  AND c.master_id = bookings.master_id
  AND c.phone = p.phone
  AND bookings.new_client_id IS NULL;

-- 6. Rename columns: keep old_client_id as backup, promote new_client_id to client_id
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_client_id_fkey;
ALTER TABLE bookings RENAME COLUMN client_id TO old_client_id;
ALTER TABLE bookings RENAME COLUMN new_client_id TO client_id;

-- 7. Deprecate reviews table (mark but don't drop — data preservation)
COMMENT ON TABLE reviews IS 'DEPRECATED: Removed in v2.0. Kept for data preservation only.';

-- 8. Remove master_clients table (superseded by clients table)
DROP TABLE IF EXISTS master_clients;
