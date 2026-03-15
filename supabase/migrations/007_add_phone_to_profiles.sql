-- Add phone number field to profiles for offline clients
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;

-- Index for phone search
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone) WHERE phone IS NOT NULL;
