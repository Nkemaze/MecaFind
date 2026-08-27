CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('car_owner', 'mechanic', 'admin');
CREATE TYPE account_status AS ENUM ('active', 'suspended');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE payment_status AS ENUM ('pending', 'confirmed', 'failed', 'cancelled');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'car_owner',
  phone VARCHAR(32),
  status account_status NOT NULL DEFAULT 'active',
  password_reset_token_hash TEXT,
  password_reset_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE mechanic_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  workshop_name VARCHAR(180) NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL DEFAULT 'Yaoundé',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  phone VARCHAR(32) NOT NULL,
  whatsapp VARCHAR(32),
  approval_status approval_status NOT NULL DEFAULT 'pending',
  is_mobile_service BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX mechanic_profiles_lat_idx ON mechanic_profiles (latitude);
CREATE INDEX mechanic_profiles_lng_idx ON mechanic_profiles (longitude);

CREATE TABLE mechanic_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mechanic_profile_id UUID NOT NULL REFERENCES mechanic_profiles(id) ON DELETE CASCADE,
  service_name VARCHAR(120) NOT NULL
);

CREATE TABLE mechanic_car_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mechanic_profile_id UUID NOT NULL REFERENCES mechanic_profiles(id) ON DELETE CASCADE,
  brand_name VARCHAR(120) NOT NULL
);

CREATE TABLE workshop_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mechanic_profile_id UUID NOT NULL REFERENCES mechanic_profiles(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  opens_at TIME,
  closes_at TIME,
  is_closed BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (mechanic_profile_id, day_of_week)
);

CREATE TABLE workshop_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mechanic_profile_id UUID NOT NULL REFERENCES mechanic_profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  filename TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE usage_wallets (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  free_uses_remaining INTEGER NOT NULL DEFAULT 3 CHECK (free_uses_remaining >= 0),
  paid_uses_remaining INTEGER NOT NULL DEFAULT 0 CHECK (paid_uses_remaining >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  provider VARCHAR(80) NOT NULL,
  provider_reference VARCHAR(255) UNIQUE,
  amount_fcfa INTEGER NOT NULL CHECK (amount_fcfa > 0),
  status payment_status NOT NULL DEFAULT 'pending',
  usages_granted INTEGER NOT NULL DEFAULT 5 CHECK (usages_granted > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

CREATE TABLE usage_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  mechanic_profile_id UUID REFERENCES mechanic_profiles(id),
  request_id UUID UNIQUE,
  type VARCHAR(50) NOT NULL,
  source VARCHAR(20) NOT NULL CHECK (source IN ('free', 'paid')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
