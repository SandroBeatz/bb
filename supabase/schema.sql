-- ============================================================
-- BeautyBook: Consolidated schema
-- Clerk user IDs (text) as primary keys, Supabase RLS via JWT
-- Run once on a fresh Supabase project
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- GRANTS (restored after schema drop/recreate)
-- ─────────────────────────────────────────────────────────────

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL   ON ALL TABLES    IN SCHEMA public TO authenticated, service_role;
GRANT ALL   ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT SELECT ON ALL TABLES   IN SCHEMA public TO anon;

-- ─────────────────────────────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────────────────────────────

CREATE TABLE profiles (
  id          text PRIMARY KEY,  -- Clerk user ID (user_xxx)
  role        text NOT NULL DEFAULT 'client' CHECK (role IN ('master', 'client', 'admin')),
  full_name   text NOT NULL DEFAULT '',
  username    text UNIQUE,
  avatar_url  text,
  telegram_id text,
  email       text,
  phone       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_profiles_email ON profiles(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX idx_profiles_phone ON profiles(phone) WHERE phone IS NOT NULL;

CREATE TABLE master_profiles (
  id                   text PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  bio                  text,
  city                 text,
  specializations      text[] NOT NULL DEFAULT '{}',
  contacts             jsonb  NOT NULL DEFAULT '{}',
  work_hours           jsonb  NOT NULL DEFAULT '{}',
  rating               numeric(3,2) NOT NULL DEFAULT 0,
  subscription_tier    text NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  subscription_ends_at timestamptz,
  cover_url            text
);

CREATE TABLE services (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  master_id        text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name             text NOT NULL,
  description      text,
  price            numeric(10,2) NOT NULL DEFAULT 0,
  duration_minutes integer NOT NULL DEFAULT 60,
  is_active        boolean NOT NULL DEFAULT true
);

CREATE TABLE payment_types (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  master_id  text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name       text NOT NULL,
  is_active  boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0
);

-- Per-master phone-based clients (not tied to auth users)
CREATE TABLE clients (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  master_id         text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  phone             text NOT NULL,
  name              text NOT NULL DEFAULT '',
  telegram_id       bigint,
  telegram_username text,
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE(master_id, phone)
);

CREATE TABLE bookings (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  master_id     text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id     uuid REFERENCES clients(id) ON DELETE RESTRICT,
  service_id    uuid NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  starts_at     timestamptz NOT NULL,
  ends_at       timestamptz NOT NULL,
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  source        text NOT NULL DEFAULT 'online' CHECK (source IN ('online', 'offline', 'telegram')),
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE payment_records (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id      uuid UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  master_id       text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  payment_type_id uuid NOT NULL REFERENCES payment_types(id) ON DELETE RESTRICT,
  amount          numeric(10,2) NOT NULL DEFAULT 0,
  recorded_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE portfolio_items (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  master_id   text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_url   text NOT NULL,
  caption     text,
  service_tag text,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE reviews (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  master_id  text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id  text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating     integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────

CREATE INDEX idx_bookings_master_starts ON bookings(master_id, starts_at);
CREATE INDEX idx_bookings_client        ON bookings(client_id);
CREATE INDEX idx_portfolio_master_sort  ON portfolio_items(master_id, sort_order);
CREATE INDEX idx_clients_master         ON clients(master_id);
CREATE INDEX idx_clients_phone          ON clients(phone);

-- ─────────────────────────────────────────────────────────────
-- TRIGGER: auto-update master rating on review insert/delete
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_master_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_master_id text;
BEGIN
  v_master_id := COALESCE(NEW.master_id, OLD.master_id);
  UPDATE master_profiles
  SET rating = COALESCE(
    (SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE master_id = v_master_id),
    0
  )
  WHERE id = v_master_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER reviews_after_insert
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_master_rating();

CREATE TRIGGER reviews_after_delete
  AFTER DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_master_rating();

-- ─────────────────────────────────────────────────────────────
-- RLS
-- Uses auth.jwt() ->> 'sub' because Clerk IDs are text, not UUID
-- ─────────────────────────────────────────────────────────────

ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services        ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_types   ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews         ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients         ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK ((auth.jwt() ->> 'sub') = id);
CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING ((auth.jwt() ->> 'sub') = id);

-- master_profiles
CREATE POLICY "master_profiles_select" ON master_profiles
  FOR SELECT USING (true);
CREATE POLICY "master_profiles_insert" ON master_profiles
  FOR INSERT WITH CHECK ((auth.jwt() ->> 'sub') = id);
CREATE POLICY "master_profiles_update" ON master_profiles
  FOR UPDATE USING ((auth.jwt() ->> 'sub') = id);

-- services
CREATE POLICY "services_select" ON services
  FOR SELECT USING (true);
CREATE POLICY "services_manage" ON services
  FOR ALL USING ((auth.jwt() ->> 'sub') = master_id);

-- payment_types
CREATE POLICY "payment_types_select" ON payment_types
  FOR SELECT USING (is_active = true);
CREATE POLICY "payment_types_manage" ON payment_types
  FOR ALL USING ((auth.jwt() ->> 'sub') = master_id);

-- bookings
CREATE POLICY "bookings_select" ON bookings
  FOR SELECT USING ((auth.jwt() ->> 'sub') = master_id);
CREATE POLICY "bookings_insert" ON bookings
  FOR INSERT WITH CHECK (true);
CREATE POLICY "bookings_update" ON bookings
  FOR UPDATE USING ((auth.jwt() ->> 'sub') = master_id);
CREATE POLICY "bookings_delete" ON bookings
  FOR DELETE USING ((auth.jwt() ->> 'sub') = master_id);

-- payment_records
CREATE POLICY "payment_records_manage" ON payment_records
  FOR ALL USING ((auth.jwt() ->> 'sub') = master_id);

-- portfolio_items
CREATE POLICY "portfolio_select" ON portfolio_items
  FOR SELECT USING (true);
CREATE POLICY "portfolio_manage" ON portfolio_items
  FOR ALL USING ((auth.jwt() ->> 'sub') = master_id);

-- reviews
CREATE POLICY "reviews_select" ON reviews
  FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON reviews
  FOR INSERT WITH CHECK (true);

-- clients (only master can manage their own clients)
CREATE POLICY "clients_manage" ON clients
  FOR ALL USING ((auth.jwt() ->> 'sub') = master_id);

-- ─────────────────────────────────────────────────────────────
-- RE-APPLY GRANTS after all tables created
-- ─────────────────────────────────────────────────────────────

GRANT ALL   ON ALL TABLES    IN SCHEMA public TO authenticated, service_role;
GRANT ALL   ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT SELECT ON ALL TABLES   IN SCHEMA public TO anon;

-- ─────────────────────────────────────────────────────────────
-- STORAGE BUCKETS
-- ─────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- avatars
DROP POLICY IF EXISTS "avatars_public_read"   ON storage.objects;
DROP POLICY IF EXISTS "avatars_auth_insert"   ON storage.objects;
DROP POLICY IF EXISTS "avatars_auth_update"   ON storage.objects;
DROP POLICY IF EXISTS "avatars_service_all"   ON storage.objects;

CREATE POLICY "avatars_public_read"     ON storage.objects FOR SELECT TO public        USING (bucket_id = 'avatars');
CREATE POLICY "avatars_auth_insert"     ON storage.objects FOR INSERT TO authenticated  WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "avatars_auth_update"     ON storage.objects FOR UPDATE TO authenticated  USING (bucket_id = 'avatars');
CREATE POLICY "avatars_service_all"     ON storage.objects FOR ALL    TO service_role   USING (bucket_id = 'avatars') WITH CHECK (bucket_id = 'avatars');

-- portfolio
DROP POLICY IF EXISTS "portfolio_public_read" ON storage.objects;
DROP POLICY IF EXISTS "portfolio_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "portfolio_auth_update" ON storage.objects;
DROP POLICY IF EXISTS "portfolio_service_all" ON storage.objects;

CREATE POLICY "portfolio_public_read"   ON storage.objects FOR SELECT TO public        USING (bucket_id = 'portfolio');
CREATE POLICY "portfolio_auth_insert"   ON storage.objects FOR INSERT TO authenticated  WITH CHECK (bucket_id = 'portfolio');
CREATE POLICY "portfolio_auth_update"   ON storage.objects FOR UPDATE TO authenticated  USING (bucket_id = 'portfolio');
CREATE POLICY "portfolio_service_all"   ON storage.objects FOR ALL    TO service_role   USING (bucket_id = 'portfolio') WITH CHECK (bucket_id = 'portfolio');
