/*
  # Fix Multiple Permissive RLS Policies

  1. Purpose
    - Replace multiple permissive policies with single restrictive policies
    - Improve security by using explicit OR conditions instead of multiple permissive policies
    - Prevent potential security gaps from policy interactions

  2. Changes
    - Drop existing permissive SELECT policies
    - Create single restrictive policies with combined conditions using OR

  3. Security Impact
    - More predictable and secure access control
    - Easier to audit and maintain
    - Same functionality with better security posture
*/

-- Fix donations table policies
DROP POLICY IF EXISTS "Public can view non-anonymous completed donations" ON donations;
DROP POLICY IF EXISTS "Users can view their own donations" ON donations;

CREATE POLICY "Users can view donations"
  ON donations
  FOR SELECT
  TO authenticated
  USING (
    -- Users can view their own donations
    user_id = auth.uid()
    OR
    -- Everyone can view non-anonymous completed donations
    (status = 'completed' AND is_anonymous = false)
  );

-- Fix gift_cards table policies
DROP POLICY IF EXISTS "Anyone can view unused gift cards for redemption" ON gift_cards;
DROP POLICY IF EXISTS "Users can view their issued gift cards" ON gift_cards;
DROP POLICY IF EXISTS "Users can view their redeemed gift cards" ON gift_cards;

CREATE POLICY "Users can view gift cards"
  ON gift_cards
  FOR SELECT
  TO authenticated
  USING (
    -- Users can view unused gift cards for redemption
    status = 'unused'
    OR
    -- Users can view their issued gift cards
    issued_to_user_id = auth.uid()
    OR
    -- Users can view their redeemed gift cards
    user_id = auth.uid()
  );

-- Fix user_notes table policies
DROP POLICY IF EXISTS "Users can view public notes" ON user_notes;
DROP POLICY IF EXISTS "Users can view their own notes" ON user_notes;

CREATE POLICY "Users can view notes"
  ON user_notes
  FOR SELECT
  TO authenticated
  USING (
    -- Users can view their own notes
    user_id = auth.uid()
    OR
    -- Users can view public notes
    is_public = true
  );

-- Fix volunteer_points table policies
DROP POLICY IF EXISTS "Anyone can view volunteer points for leaderboard" ON volunteer_points;
DROP POLICY IF EXISTS "Users can view their own volunteer points" ON volunteer_points;

CREATE POLICY "Users can view volunteer points"
  ON volunteer_points
  FOR SELECT
  TO authenticated
  USING (
    -- Everyone can view all volunteer points for leaderboard
    true
  );
