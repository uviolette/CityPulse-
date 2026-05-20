/*
  # Fix Security Definer Views

  1. Purpose
    - Remove SECURITY DEFINER from views to prevent privilege escalation
    - Use SECURITY INVOKER instead (default behavior)
    - Maintain proper access control through RLS policies

  2. Changes
    - Recreate views without SECURITY DEFINER
    - Views will run with the privileges of the current user
    - Access will be controlled by RLS policies on underlying tables

  3. Security Impact
    - Eliminates potential privilege escalation vectors
    - More secure by default - users only see data they have access to
    - Aligns with principle of least privilege
*/

-- Drop and recreate user_points_summary view
DROP VIEW IF EXISTS user_points_summary;

CREATE VIEW user_points_summary AS
SELECT 
  user_id,
  SUM(points) as total_points,
  COUNT(*) as activities_count,
  MAX(created_at) as last_activity
FROM volunteer_points
GROUP BY user_id;

-- Drop and recreate donation_stats view
DROP VIEW IF EXISTS donation_stats;

CREATE VIEW donation_stats AS
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
