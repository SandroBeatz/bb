-- Add email to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email) WHERE email IS NOT NULL;

-- Make phone unique (dedup first: keep Clerk profiles over UUID ones)
DO $$
DECLARE
  dup RECORD;
BEGIN
  FOR dup IN
    SELECT phone, array_agg(id ORDER BY (id LIKE 'user_%') DESC, created_at ASC) AS ids
    FROM profiles
    WHERE phone IS NOT NULL
    GROUP BY phone
    HAVING count(*) > 1
  LOOP
    -- Keep first (prefer Clerk user), delete rest
    UPDATE bookings SET client_id = dup.ids[1] WHERE client_id = ANY(dup.ids[2:]);
    UPDATE reviews SET client_id = dup.ids[1] WHERE client_id = ANY(dup.ids[2:]);
    DELETE FROM profiles WHERE id = ANY(dup.ids[2:]);
  END LOOP;
END $$;

DROP INDEX IF EXISTS idx_profiles_phone;
CREATE UNIQUE INDEX idx_profiles_phone_unique ON profiles(phone) WHERE phone IS NOT NULL;

-- Master-client junction table
CREATE TABLE master_clients (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  master_id       text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id       text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  display_name    text,
  notes           text,
  invitation_status text NOT NULL DEFAULT 'none'
    CHECK (invitation_status IN ('none', 'sent', 'accepted')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(master_id, client_id)
);

CREATE INDEX idx_master_clients_master ON master_clients(master_id);
CREATE INDEX idx_master_clients_client ON master_clients(client_id);

-- RLS
ALTER TABLE master_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "master_clients viewable" ON master_clients FOR SELECT USING (true);
CREATE POLICY "master_clients manageable" ON master_clients FOR ALL USING (true);

-- Backfill: create links from existing booking history
INSERT INTO master_clients (master_id, client_id)
SELECT DISTINCT master_id, client_id
FROM bookings
WHERE master_id != client_id
ON CONFLICT (master_id, client_id) DO NOTHING;
