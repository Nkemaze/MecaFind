CREATE TABLE IF NOT EXISTS workshop_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mechanic_profile_id UUID NOT NULL REFERENCES mechanic_profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  filename TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
