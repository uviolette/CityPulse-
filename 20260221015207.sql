/*
  # Fix Remaining Security Issues

  1. Purpose
    - Explicitly set SECURITY INVOKER on views to ensure they run with caller privileges
    - Review and minimize SECURITY DEFINER usage on functions
    - Ensure all functions have immutable search_path set

  2. Changes
    - Recreate views with explicit SECURITY INVOKER option
    - Keep award_volunteer_points as SECURITY DEFINER (needed for updating user_stats)
    - Ensure search_path is properly set

  3. Security Impact
    - Views explicitly marked as SECURITY INVOKER prevent privilege escalation
    - Functions with SECURITY DEFINER are limited and have fixed search_path
    - Follows principle of least privilege
*/

-- Drop and recreate user_points_summary with explicit SECURITY INVOKER
DROP VIEW IF EXISTS user_points_summary CASCADE;

CREATE VIEW user_points_summary 
WITH (security_invoker = true) AS
SELECT 
  user_id,
  SUM(points) as total_points,
  COUNT(*) as activities_count,
  MAX(created_at) as last_activity
FROM volunteer_points
GROUP BY user_id;

-- Drop and recreate donation_stats with explicit SECURITY INVOKER
DROP VIEW IF EXISTS donation_stats CASCADE;

CREATE VIEW donation_stats
WITH (security_invoker = true) AS
SELECT 
  COALESCE(state_selected, 'Nationwide') as location,
  COUNT(*) as donation_count,
  SUM(amount) as total_amount,
  AVG(amount) as average_amount,
  COUNT(CASE WHEN is_anonymous = false THEN 1 END) as public_donations,
  COUNT(CASE WHEN is_anonymous = true THEN 1 END) as anonymous_donations
FROM donations
WHERE status = 'completed'
GROUP BY state_selected, is_nationwide;

-- Ensure award_volunteer_points has proper search_path
-- This function needs SECURITY DEFINER to update user_stats table
DROP FUNCTION IF EXISTS award_volunteer_points(uuid, uuid, integer, text, text);
DROP FUNCTION IF EXISTS award_volunteer_points(uuid, uuid, integer, text);

CREATE OR REPLACE FUNCTION award_volunteer_points(
  p_user_id uuid,
  p_incident_id uuid,
  p_points integer,
  p_activity_type text,
  p_description text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  -- Insert volunteer points record
  INSERT INTO volunteer_points (
    user_id,
    incident_id,
    points,
    activity_type,
    description
  ) VALUES (
    p_user_id,
    p_incident_id,
    p_points,
    p_activity_type,
    p_description
  );

  -- Update user stats impact score
  UPDATE user_stats
  SET 
    impact_score = COALESCE(impact_score, 0) + p_points,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Create user_stats record if it doesn't exist
  IF NOT FOUND THEN
    INSERT INTO user_stats (user_id, impact_score)
    VALUES (p_user_id, p_points)
    ON CONFLICT (user_id) DO UPDATE
    SET impact_score = user_stats.impact_score + p_points;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION award_volunteer_points(uuid, uuid, integer, text, text) TO authenticated;
