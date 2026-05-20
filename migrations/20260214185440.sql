/*
  # Add ZIP Code Support for Location-Based Features

  1. New Columns for Users Table
    - `zip_code` (text) - User's ZIP code for automatic location detection
    
  2. New Columns for Incidents Table
    - `zip_code` (text) - ZIP code where incident occurred
    
  3. New Table: ZIP Code Locations (Cache)
    - Store resolved ZIP code to location mappings
    - Reduce API calls and improve performance
    - Enable offline location resolution
    
  4. Indexes
    - Add indexes for ZIP code queries
    
  5. Security
    - Enable RLS on new table
    - Add appropriate policies

  This migration enables automatic location detection from ZIP codes,
  organizing data hierarchically by State → County → City → Neighborhood.
*/

-- Add ZIP code column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'zip_code'
  ) THEN
    ALTER TABLE users ADD COLUMN zip_code text;
  END IF;
END $$;

-- Add ZIP code column to incidents table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'incidents' AND column_name = 'zip_code'
  ) THEN
    ALTER TABLE incidents ADD COLUMN zip_code text;
  END IF;
END $$;

-- Create ZIP code locations cache table
CREATE TABLE IF NOT EXISTS zip_code_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zip_code text UNIQUE NOT NULL,
  state text NOT NULL,
  state_abbr text NOT NULL,
  county text,
  city text NOT NULL,
  neighborhood text,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  country text DEFAULT 'United States',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE zip_code_locations ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_zip_code ON users(zip_code);
CREATE INDEX IF NOT EXISTS idx_incidents_zip_code ON incidents(zip_code);
CREATE INDEX IF NOT EXISTS idx_zip_code_locations_zip ON zip_code_locations(zip_code);
CREATE INDEX IF NOT EXISTS idx_zip_code_locations_state ON zip_code_locations(state);
CREATE INDEX IF NOT EXISTS idx_zip_code_locations_city ON zip_code_locations(city);

-- RLS Policies for zip_code_locations
CREATE POLICY "Anyone can view ZIP code locations"
  ON zip_code_locations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service can insert ZIP code locations"
  ON zip_code_locations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Service can update ZIP code locations"
  ON zip_code_locations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert some common ZIP codes for testing (New York area examples)
INSERT INTO zip_code_locations (zip_code, state, state_abbr, county, city, latitude, longitude)
VALUES 
  ('11417', 'New York', 'NY', 'Queens County', 'Queens', 40.6784, -73.8443),
  ('10001', 'New York', 'NY', 'New York County', 'Manhattan', 40.7506, -73.9971),
  ('11201', 'New York', 'NY', 'Kings County', 'Brooklyn', 40.6944, -73.9897),
  ('10451', 'New York', 'NY', 'Bronx County', 'Bronx', 40.8208, -73.9229),
  ('10301', 'New York', 'NY', 'Richmond County', 'Staten Island', 40.6337, -74.0838),
  ('90001', 'California', 'CA', 'Los Angeles County', 'Los Angeles', 33.9731, -118.2479),
  ('94102', 'California', 'CA', 'San Francisco County', 'San Francisco', 37.7793, -122.4193),
  ('60601', 'Illinois', 'IL', 'Cook County', 'Chicago', 41.8857, -87.6182),
  ('02101', 'Massachusetts', 'MA', 'Suffolk County', 'Boston', 42.3704, -71.0269),
  ('98101', 'Washington', 'WA', 'King County', 'Seattle', 47.6103, -122.3341),
  ('75201', 'Texas', 'TX', 'Dallas County', 'Dallas', 32.7876, -96.7984),
  ('33101', 'Florida', 'FL', 'Miami-Dade County', 'Miami', 25.7753, -80.1977),
  ('30301', 'Georgia', 'GA', 'Fulton County', 'Atlanta', 33.7490, -84.3880),
  ('85001', 'Arizona', 'AZ', 'Maricopa County', 'Phoenix', 33.4484, -112.0740),
  ('80201', 'Colorado', 'CO', 'Denver County', 'Denver', 39.7539, -104.9968)
ON CONFLICT (zip_code) DO NOTHING;

-- Function to get location from ZIP code
CREATE OR REPLACE FUNCTION get_location_from_zip(zip text)
RETURNS TABLE (
  state text,
  state_abbr text,
  county text,
  city text,
  neighborhood text,
  latitude double precision,
  longitude double precision
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    zl.state,
    zl.state_abbr,
    zl.county,
    zl.city,
    zl.neighborhood,
    zl.latitude,
    zl.longitude
  FROM zip_code_locations zl
  WHERE zl.zip_code = zip
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;
