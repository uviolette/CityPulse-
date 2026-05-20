/*
  # Drop Unused Database Indexes

  1. Purpose
    - Remove unused indexes to reduce database overhead
    - Improve write performance by eliminating unnecessary index maintenance
    - Reduce storage consumption

  2. Changes
    - Drop all unused indexes identified by the database analyzer
    - Keep only indexes that are actively used for queries

  3. Notes
    - Indexes can be recreated if query patterns change in the future
    - Primary key and foreign key indexes are not affected
*/

-- Drop unused indexes on users table
DROP INDEX IF EXISTS idx_users_zip_code;
DROP INDEX IF EXISTS idx_users_language;
DROP INDEX IF EXISTS idx_users_state;

-- Drop unused indexes on incident_media table
DROP INDEX IF EXISTS idx_incident_media_incident_id;
DROP INDEX IF EXISTS idx_incident_media_user_id;

-- Drop unused indexes on actions table
DROP INDEX IF EXISTS idx_actions_user_id;

-- Drop unused indexes on user_notes table
DROP INDEX IF EXISTS idx_user_notes_user_id;
DROP INDEX IF EXISTS idx_user_notes_is_public;
DROP INDEX IF EXISTS idx_user_notes_created_at;

-- Drop unused indexes on note_comments table
DROP INDEX IF EXISTS idx_note_comments_note_id;
DROP INDEX IF EXISTS idx_note_comments_user_id;

-- Drop unused indexes on incidents table
DROP INDEX IF EXISTS idx_incidents_county;
DROP INDEX IF EXISTS idx_incidents_city;
DROP INDEX IF EXISTS idx_incidents_neighborhood;
DROP INDEX IF EXISTS idx_incidents_type;
DROP INDEX IF EXISTS idx_incidents_severity;
DROP INDEX IF EXISTS idx_incidents_status;
DROP INDEX IF EXISTS idx_incidents_location;
DROP INDEX IF EXISTS idx_incidents_zip_code;
DROP INDEX IF EXISTS idx_incidents_user_id;

-- Drop unused indexes on status_history table
DROP INDEX IF EXISTS idx_status_history_incident;
DROP INDEX IF EXISTS idx_status_history_user_id;

-- Drop unused indexes on comments table
DROP INDEX IF EXISTS idx_comments_incident;
DROP INDEX IF EXISTS idx_comments_user_id;

-- Drop unused indexes on zip_code_locations table
DROP INDEX IF EXISTS idx_zip_code_locations_zip;
DROP INDEX IF EXISTS idx_zip_code_locations_state;
DROP INDEX IF EXISTS idx_zip_code_locations_city;

-- Drop unused indexes on gift_cards table
DROP INDEX IF EXISTS idx_gift_cards_code;
DROP INDEX IF EXISTS idx_gift_cards_status;
DROP INDEX IF EXISTS idx_gift_cards_created_by;

-- Drop unused indexes on volunteer_points table
DROP INDEX IF EXISTS idx_volunteer_points_incident_id;

-- Drop unused indexes on donations table
DROP INDEX IF EXISTS idx_donations_stripe_payment_intent_id;
DROP INDEX IF EXISTS idx_donations_state_selected;
DROP INDEX IF EXISTS idx_donations_is_nationwide;
