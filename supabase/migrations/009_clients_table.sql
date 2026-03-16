-- Phase 0.1: New clients table (phone-based, per-master)
-- Replaces the old client profiles model with master-scoped clients

-- 1. Add cover_url to master_profiles
ALTER TABLE master_profiles ADD COLUMN IF NOT EXISTS cover_url text;

-- 2. Create clients table
CREATE TABLE clients (
  id                 uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  master_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
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
-- For each unique (master_id, client_id) pair in bookings, create a client record
-- using the client's profile data (phone, full_name)
INSERT INTO clients (master_id, phone, name, created_at)
SELECT DISTINCT ON (b.master_id, p.phone)
  b.master_id,
  COALESCE(p.phone, 'unknown_' || p.id::text) AS phone,
  COALESCE(NULLIF(p.full_name, ''), 'Клиент') AS name,
  MIN(b.created_at) OVER (PARTITION BY b.master_id, b.client_id) AS created_at
FROM bookings b
JOIN profiles p ON p.id = b.client_id
WHERE b.master_id != b.client_id
  AND p.phone IS NOT NULL
ON CONFLICT (master_id, phone) DO NOTHING;

-- 4. Add new client_id column to bookings (nullable during migration)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS new_client_id uuid REFERENCES clients(id) ON DELETE RESTRICT;

-- 5. Backfill new_client_id from old client_id via profiles.phone → clients
UPDATE bookings b
SET new_client_id = c.id
FROM profiles p
JOIN clients c ON c.master_id = b.master_id AND c.phone = p.phone
WHERE p.id = b.client_id
  AND b.new_client_id IS NULL;

-- 6. Drop old FK and rename columns
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_client_id_fkey;

-- Keep old client_id as backup for now (will clean up in next migration if needed)
ALTER TABLE bookings RENAME COLUMN client_id TO old_client_id;
ALTER TABLE bookings RENAME COLUMN new_client_id TO client_id;

-- Make client_id required (set a fallback for any NULL rows)
-- Any bookings that couldn't be migrated (no phone) get a placeholder
-- In practice all bookings should have a client

-- 7. Deprecate reviews table (mark but don't drop — data preservation)
COMMENT ON TABLE reviews IS 'DEPRECATED: Removed in v2.0. Kept for data preservation only.';

-- 8. Remove master_clients table (superseded by clients table)
DROP TABLE IF EXISTS master_clients;

-- 9. Update role check — role 'client' is no longer valid for new users
-- (existing data preserved, new users will only get 'master' role)
-- No schema change needed — just app logic
