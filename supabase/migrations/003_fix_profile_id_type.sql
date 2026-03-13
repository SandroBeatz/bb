-- Fix: Clerk user IDs are text (user_xxx), not UUIDs.
-- Drop all tables and recreate with `text` for any column storing a Clerk user ID.

DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS payment_records CASCADE;
DROP TABLE IF EXISTS portfolio_items CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS payment_types CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS master_profiles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- profiles: id is a Clerk user ID (text)
CREATE TABLE profiles (
  id          text PRIMARY KEY,
  role        text NOT NULL DEFAULT 'client' CHECK (role IN ('master', 'client', 'admin')),
  full_name   text NOT NULL DEFAULT '',
  username    text UNIQUE,
  avatar_url  text,
  telegram_id text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- master_profiles: id references profiles(id)
CREATE TABLE master_profiles (
  id                   text PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  bio                  text,
  city                 text,
  specializations      text[] NOT NULL DEFAULT '{}',
  contacts             jsonb NOT NULL DEFAULT '{}',
  work_hours           jsonb NOT NULL DEFAULT '{}',
  rating               numeric(3,2) NOT NULL DEFAULT 0,
  subscription_tier    text NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  subscription_ends_at timestamptz
);

-- services: master_id references profiles(id)
CREATE TABLE services (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  master_id        text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name             text NOT NULL,
  description      text,
  price            numeric(10,2) NOT NULL DEFAULT 0,
  duration_minutes integer NOT NULL DEFAULT 60,
  is_active        boolean NOT NULL DEFAULT true
);

-- payment_types: master_id references profiles(id)
CREATE TABLE payment_types (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  master_id  text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name       text NOT NULL,
  is_active  boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0
);

-- bookings: master_id and client_id reference profiles(id)
CREATE TABLE bookings (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  master_id      text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id      text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id     uuid NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  starts_at      timestamptz NOT NULL,
  ends_at        timestamptz NOT NULL,
  status         text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  source         text NOT NULL DEFAULT 'online' CHECK (source IN ('online', 'offline', 'telegram')),
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- payment_records: master_id references profiles(id)
CREATE TABLE payment_records (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id      uuid UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  master_id       text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  payment_type_id uuid NOT NULL REFERENCES payment_types(id) ON DELETE RESTRICT,
  amount          numeric(10,2) NOT NULL DEFAULT 0,
  recorded_at     timestamptz NOT NULL DEFAULT now()
);

-- portfolio_items: master_id references profiles(id)
CREATE TABLE portfolio_items (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  master_id   text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_url   text NOT NULL,
  caption     text,
  service_tag text,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- reviews: master_id and client_id reference profiles(id)
CREATE TABLE reviews (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id uuid UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  master_id  text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id  text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating     integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_bookings_master_starts ON bookings(master_id, starts_at);
CREATE INDEX idx_bookings_client ON bookings(client_id);
CREATE INDEX idx_portfolio_master_sort ON portfolio_items(master_id, sort_order);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies: profiles
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (true);

-- RLS Policies: master_profiles
CREATE POLICY "Master profiles are viewable by everyone" ON master_profiles
  FOR SELECT USING (true);

CREATE POLICY "Masters can insert their own master profile" ON master_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Masters can update their own master profile" ON master_profiles
  FOR UPDATE USING (true);

-- RLS Policies: services
CREATE POLICY "Services are viewable by everyone" ON services
  FOR SELECT USING (true);

CREATE POLICY "Masters can manage their own services" ON services
  FOR ALL USING (true);

-- RLS Policies: payment_types
CREATE POLICY "Payment types visible to master and clients" ON payment_types
  FOR SELECT USING (is_active = true);

CREATE POLICY "Masters can manage their own payment types" ON payment_types
  FOR ALL USING (true);

-- RLS Policies: bookings
CREATE POLICY "Masters can view their own bookings" ON bookings
  FOR SELECT USING (true);

CREATE POLICY "Clients can view their own bookings" ON bookings
  FOR SELECT USING (true);

CREATE POLICY "Clients can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Masters can update booking status" ON bookings
  FOR UPDATE USING (true);

-- RLS Policies: payment_records
CREATE POLICY "Masters can manage payment records" ON payment_records
  FOR ALL USING (true);

-- RLS Policies: portfolio_items
CREATE POLICY "Portfolio items are viewable by everyone" ON portfolio_items
  FOR SELECT USING (true);

CREATE POLICY "Masters can manage their own portfolio" ON portfolio_items
  FOR ALL USING (true);

-- RLS Policies: reviews
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Clients can create reviews for their completed bookings" ON reviews
  FOR INSERT WITH CHECK (true);
