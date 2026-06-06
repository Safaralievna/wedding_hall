-- Wedding Hall Platform — PostgreSQL schema

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  username VARCHAR(100) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'owner', 'admin')),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS otps (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS districts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS venues (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  district_id INTEGER NOT NULL REFERENCES districts(id),
  address VARCHAR(300) NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  price NUMERIC(12, 2) NOT NULL CHECK (price > 0),
  phone VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS venue_images (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS singers (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS karnay_surnay (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER NOT NULL UNIQUE REFERENCES venues(id) ON DELETE CASCADE,
  available BOOLEAN NOT NULL DEFAULT FALSE,
  price NUMERIC(12, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cars (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  brand VARCHAR(150) NOT NULL,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  guest_count INTEGER NOT NULL CHECK (guest_count > 0),
  total_price NUMERIC(12, 2) NOT NULL,
  advance_paid NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'upcoming', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS booking_extras (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  extra_type VARCHAR(20) NOT NULL CHECK (extra_type IN ('singer', 'karnay', 'car', 'menu')),
  extra_id INTEGER NOT NULL,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venues_district ON venues(district_id);
CREATE INDEX IF NOT EXISTS idx_venues_status ON venues(status);
CREATE INDEX IF NOT EXISTS idx_bookings_venue_date ON bookings(venue_id, event_date);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);

-- Migration helpers for existing databases
ALTER TABLE venues ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS price NUMERIC(12, 2) NOT NULL DEFAULT 0;

-- Legacy enum migrations (older DBs used PostgreSQL enums)
DO $$
DECLARE
  enum_pair RECORD;
BEGIN
  FOR enum_pair IN
    SELECT * FROM (VALUES
      ('booking_status', 'confirmed'),
      ('extra_type', 'menu'),
      ('venue_status', 'rejected')
    ) AS t(enum_name, enum_value)
  LOOP
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = enum_pair.enum_name) THEN
      IF NOT EXISTS (
        SELECT 1 FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = enum_pair.enum_name AND e.enumlabel = enum_pair.enum_value
      ) THEN
        EXECUTE format('ALTER TYPE %I ADD VALUE %L', enum_pair.enum_name, enum_pair.enum_value);
      END IF;
    END IF;
  END LOOP;
END $$;

-- VARCHAR check constraints (skip when column uses enum type)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'status' AND data_type = 'character varying'
  ) THEN
    ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
    ALTER TABLE bookings ADD CONSTRAINT bookings_status_check
      CHECK (status IN ('confirmed', 'upcoming', 'completed', 'cancelled'));
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'booking_extras' AND column_name = 'extra_type' AND data_type = 'character varying'
  ) THEN
    ALTER TABLE booking_extras DROP CONSTRAINT IF EXISTS booking_extras_extra_type_check;
    ALTER TABLE booking_extras ADD CONSTRAINT booking_extras_extra_type_check
      CHECK (extra_type IN ('singer', 'karnay', 'car', 'menu'));
  END IF;
END $$;
