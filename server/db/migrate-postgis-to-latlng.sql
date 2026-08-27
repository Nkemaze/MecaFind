-- Run this ONCE if you have an existing database with PostGIS geography data.
-- It extracts lat/lng from the old `location` column into new columns.

-- 1. Add the new columns
ALTER TABLE mechanic_profiles ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE mechanic_profiles ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- 2. Migrate data from PostGIS geography to lat/lng
UPDATE mechanic_profiles
   SET latitude  = ST_Y(location::geometry),
       longitude = ST_X(location::geometry)
 WHERE latitude IS NULL;

-- 3. Make columns NOT NULL after data is migrated
ALTER TABLE mechanic_profiles ALTER COLUMN latitude SET NOT NULL;
ALTER TABLE mechanic_profiles ALTER COLUMN longitude SET NOT NULL;

-- 4. Drop the old geography column and its index
DROP INDEX IF EXISTS mechanic_profiles_location_index;
ALTER TABLE mechanic_profiles DROP COLUMN IF EXISTS location;

-- 5. Add btree indexes for lat/lng
CREATE INDEX IF NOT EXISTS mechanic_profiles_lat_idx ON mechanic_profiles (latitude);
CREATE INDEX IF NOT EXISTS mechanic_profiles_lng_idx ON mechanic_profiles (longitude);
