/*
  # Fix Security Issues - Part 1: Add Missing Indexes

  ## Changes
  
  1. **Add Missing Foreign Key Indexes**
     - Add index on `actions.user_id`
     - Add index on `comments.user_id`
     - Add index on `gift_cards.created_by`
     - Add index on `incident_media.incident_id`
     - Add index on `incident_media.user_id`
     - Add index on `incidents.user_id`
     - Add index on `status_history.user_id`
     - Add index on `volunteer_points.incident_id`
  
  ## Performance Impact
  - Dramatically improves query performance for foreign key lookups
  - Reduces database load when joining tables
  - Essential for scaling to larger datasets
*/

-- Add index for actions.user_id
CREATE INDEX IF NOT EXISTS idx_actions_user_id ON public.actions(user_id);

-- Add index for comments.user_id
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);

-- Add index for gift_cards.created_by
CREATE INDEX IF NOT EXISTS idx_gift_cards_created_by ON public.gift_cards(created_by);

-- Add index for incident_media.incident_id
CREATE INDEX IF NOT EXISTS idx_incident_media_incident_id ON public.incident_media(incident_id);

-- Add index for incident_media.user_id
CREATE INDEX IF NOT EXISTS idx_incident_media_user_id ON public.incident_media(user_id);

-- Add index for incidents.user_id
CREATE INDEX IF NOT EXISTS idx_incidents_user_id ON public.incidents(user_id);

-- Add index for status_history.user_id
CREATE INDEX IF NOT EXISTS idx_status_history_user_id ON public.status_history(user_id);

-- Add index for volunteer_points.incident_id
CREATE INDEX IF NOT EXISTS idx_volunteer_points_incident_id ON public.volunteer_points(incident_id);
