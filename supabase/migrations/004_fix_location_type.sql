-- =============================================
-- Migration 004: Fix location type inconsistency
-- =============================================
-- This migration converts the location column from GEOGRAPHY to JSONB
-- to match the setup.sql schema and the API usage pattern.

-- Drop the PostGIS index if it exists
DROP INDEX IF EXISTS tasks_location_idx;

-- Convert location from GEOGRAPHY to JSONB
-- First, add a temporary column to hold the JSONB data
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS location_jsonb JSONB;

-- Convert existing GEOGRAPHY data to JSONB format {lat, lng}
UPDATE tasks 
SET location_jsonb = jsonb_build_object(
  'lat', ST_Y(location::geometry),
  'lng', ST_X(location::geometry)
)
WHERE location IS NOT NULL;

-- Drop the old GEOGRAPHY column
ALTER TABLE tasks DROP COLUMN IF EXISTS location;

-- Rename the new column to location
ALTER TABLE tasks RENAME COLUMN location_jsonb TO location;

-- Add a GIN index for JSONB queries (useful for filtering by lat/lng ranges)
CREATE INDEX IF NOT EXISTS tasks_location_idx ON tasks USING GIN (location);
