/*
  # Fix Function Search Path

  1. Purpose
    - Set immutable search_path on functions to prevent search path manipulation attacks
    - Ensure functions always use the correct schema
    - Prevent potential SQL injection through search_path changes

  2. Changes
    - Recreate award_volunteer_points function with explicit search_path
    - Set search_path to 'public, pg_temp' to prevent attacks

  3. Security Impact
    - Prevents search_path based attacks
    - Ensures function behavior is consistent and predictable
    - Follows PostgreSQL security best practices
*/

-- Drop and recreate award_volunteer_points with fixed search_path
DROP FUNCTION IF EXISTS award_volunteer_points(uuid, uuid, integer, text, text);

CREATE OR REPLACE FUNCTION award_volunteer_points(
  p_user_id uuid,
  p_incident_id uuid,
  p_points integer,
  p_activity_type text,
  p_description text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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
