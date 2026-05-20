/*
  # Fix Security Issues - Part 2: Optimize RLS Policies

  ## Changes
  
  1. **Optimize RLS Policies with SELECT Subqueries**
     - Replace `auth.uid()` with `(select auth.uid())` in all policies
     - This prevents re-evaluation of auth function for each row
     - Dramatically improves query performance at scale
  
  ## Tables Updated
  - users
  - incidents
  - incident_media
  - actions
  - user_stats
  - user_preferences
  - status_history
  - comments
  - gift_cards
  - user_notes
  - donations
  - volunteer_points
  - note_comments
  
  ## Performance Impact
  - Auth function is evaluated once per query instead of once per row
  - Reduces CPU usage and improves response times
  - Critical for tables with large row counts
*/

-- Drop and recreate users policies
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

-- Drop and recreate incidents policies
DROP POLICY IF EXISTS "Users can create incidents" ON public.incidents;
DROP POLICY IF EXISTS "Users can update own incidents" ON public.incidents;

CREATE POLICY "Users can create incidents"
  ON public.incidents FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own incidents"
  ON public.incidents FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Drop and recreate incident_media policies
DROP POLICY IF EXISTS "Users can upload media to incidents" ON public.incident_media;

CREATE POLICY "Users can upload media to incidents"
  ON public.incident_media FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- Drop and recreate actions policies
DROP POLICY IF EXISTS "Users can create actions" ON public.actions;
DROP POLICY IF EXISTS "Users can delete own actions" ON public.actions;

CREATE POLICY "Users can create actions"
  ON public.actions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own actions"
  ON public.actions FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Drop and recreate user_stats policies
DROP POLICY IF EXISTS "Users can update own stats" ON public.user_stats;

CREATE POLICY "Users can update own stats"
  ON public.user_stats FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Drop and recreate user_preferences policies
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;

CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- Drop and recreate status_history policies
DROP POLICY IF EXISTS "Only incident owner can add status history" ON public.status_history;

CREATE POLICY "Only incident owner can add status history"
  ON public.status_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM incidents
      WHERE incidents.id = status_history.incident_id
      AND incidents.user_id = (select auth.uid())
    )
  );

-- Drop and recreate comments policies
DROP POLICY IF EXISTS "Authenticated users can add comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;

CREATE POLICY "Authenticated users can add comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Drop and recreate gift_cards policies
DROP POLICY IF EXISTS "Users can view their issued gift cards" ON public.gift_cards;
DROP POLICY IF EXISTS "Users can view their redeemed gift cards" ON public.gift_cards;
DROP POLICY IF EXISTS "Users can redeem gift cards" ON public.gift_cards;

CREATE POLICY "Users can view their issued gift cards"
  ON public.gift_cards FOR SELECT
  TO authenticated
  USING (created_by = (select auth.uid()));

CREATE POLICY "Users can view their redeemed gift cards"
  ON public.gift_cards FOR SELECT
  TO authenticated
  USING (issued_to_user_id = (select auth.uid()));

CREATE POLICY "Users can redeem gift cards"
  ON public.gift_cards FOR UPDATE
  TO authenticated
  USING (status = 'active' AND redeemed_at IS NULL)
  WITH CHECK (issued_to_user_id = (select auth.uid()));

-- Drop and recreate user_notes policies
DROP POLICY IF EXISTS "Users can view their own notes" ON public.user_notes;
DROP POLICY IF EXISTS "Users can create their own notes" ON public.user_notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.user_notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.user_notes;

CREATE POLICY "Users can view their own notes"
  ON public.user_notes FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create their own notes"
  ON public.user_notes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own notes"
  ON public.user_notes FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own notes"
  ON public.user_notes FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Drop and recreate donations policies
DROP POLICY IF EXISTS "Users can view their own donations" ON public.donations;
DROP POLICY IF EXISTS "Users can create their own donations" ON public.donations;

CREATE POLICY "Users can view their own donations"
  ON public.donations FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create their own donations"
  ON public.donations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- Drop and recreate volunteer_points policies
DROP POLICY IF EXISTS "Users can view their own volunteer points" ON public.volunteer_points;

CREATE POLICY "Users can view their own volunteer points"
  ON public.volunteer_points FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Drop and recreate note_comments policies
DROP POLICY IF EXISTS "Users can view comments on accessible notes" ON public.note_comments;
DROP POLICY IF EXISTS "Users can create comments on accessible notes" ON public.note_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.note_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.note_comments;

CREATE POLICY "Users can view comments on accessible notes"
  ON public.note_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_notes
      WHERE user_notes.id = note_comments.note_id
      AND (user_notes.is_public = true OR user_notes.user_id = (select auth.uid()))
    )
  );

CREATE POLICY "Users can create comments on accessible notes"
  ON public.note_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (select auth.uid()) AND
    EXISTS (
      SELECT 1 FROM user_notes
      WHERE user_notes.id = note_comments.note_id
      AND (user_notes.is_public = true OR user_notes.user_id = (select auth.uid()))
    )
  );

CREATE POLICY "Users can update their own comments"
  ON public.note_comments FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own comments"
  ON public.note_comments FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));
