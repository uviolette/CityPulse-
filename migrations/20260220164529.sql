/*
  # Fix Security Issues - Part 4: Fix RLS Policies with Always True Conditions

  ## Changes
  
  1. **Fix RLS Policies that Bypass Security**
     - Remove policies with always true conditions
     - Replace with proper service role authentication
     - Affected policies:
       - donations: "Service role can update donations"
       - volunteer_points: "Service role can insert volunteer points"
       - zip_code_locations: "Service can insert ZIP code locations"
       - zip_code_locations: "Service can update ZIP code locations"
  
  ## Security Impact
  - These policies were effectively bypassing RLS
  - Service role operations should use service_role key, not rely on RLS bypass
  - Proper authentication should be enforced at application level
  
  ## Important Notes
  - Service role operations (from edge functions) automatically bypass RLS
  - No need for permissive "always true" policies
  - These operations should use the service role key in edge functions
*/

-- Remove the always-true policies for donations
DROP POLICY IF EXISTS "Service role can update donations" ON public.donations;

-- Remove the always-true policies for volunteer_points
DROP POLICY IF EXISTS "Service role can insert volunteer points" ON public.volunteer_points;

-- Remove the always-true policies for zip_code_locations
DROP POLICY IF EXISTS "Service can insert ZIP code locations" ON public.zip_code_locations;
DROP POLICY IF EXISTS "Service can update ZIP code locations" ON public.zip_code_locations;
