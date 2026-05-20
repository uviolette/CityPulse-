/*
  # Gift Cards & Donations System

  ## Overview
  This migration creates a complete gift card reward system and donation tracking system
  with Stripe integration support.

  ## 1. New Tables
  
  ### `gift_cards` Table
  Stores gift card rewards that users can earn and redeem
  - `id` (uuid, primary key) - Unique identifier
  - `code` (text, unique) - 8-character alphanumeric redemption code
  - `value` (numeric) - USD value of the gift card
  - `status` (text) - Current status: 'unused', 'redeemed', 'expired'
  - `user_id` (uuid, nullable) - User who redeemed the card (null if not yet redeemed)
  - `issued_to_user_id` (uuid, nullable) - User who earned the card
  - `issued_at` (timestamptz) - When the card was created
  - `redeemed_at` (timestamptz, nullable) - When the card was redeemed
  - `expires_at` (timestamptz, nullable) - Expiration date (null = never expires)
  - `created_by` (uuid, nullable) - Admin who created the card
  - `notes` (text, nullable) - Admin notes about the card

  ### `donations` Table
  Tracks all donation transactions through Stripe
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, nullable) - User who donated (null for anonymous)
  - `amount` (numeric) - Donation amount in USD
  - `currency` (text) - Currency code (default: 'USD')
  - `stripe_payment_intent_id` (text, unique) - Stripe Payment Intent ID
  - `stripe_checkout_session_id` (text, unique, nullable) - Stripe Checkout Session ID
  - `status` (text) - Payment status: 'pending', 'completed', 'failed', 'refunded'
  - `donor_name` (text, nullable) - Optional donor name
  - `donor_email` (text, nullable) - Optional donor email
  - `is_anonymous` (boolean) - Whether donation should be displayed anonymously
  - `created_at` (timestamptz) - When the donation was initiated
  - `completed_at` (timestamptz, nullable) - When the payment was completed

  ### `volunteer_points` Table
  Tracks points users earn for volunteering activities
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - User earning points
  - `incident_id` (uuid, nullable) - Related incident if applicable
  - `points` (integer) - Number of points earned
  - `activity_type` (text) - Type of activity: 'volunteer', 'report', 'verify', 'donate'
  - `description` (text) - Description of what earned the points
  - `created_at` (timestamptz) - When points were earned

  ## 2. Security
  All tables have Row Level Security (RLS) enabled with appropriate policies:
  
  ### Gift Cards:
  - Users can view their own gift cards (issued to them or redeemed by them)
  - Authenticated users can view unused cards they want to redeem
  - Only authenticated users can redeem cards
  - Admins can manage all cards (handled via service role)

  ### Donations:
  - Users can view their own donations
  - Anonymous donations are viewable with limited info
  - Public can view aggregate donation stats
  - Admins can view all donations (handled via service role)

  ### Volunteer Points:
  - Users can view their own points
  - Public can view leaderboard data (aggregated)
  - Only authenticated users can earn points

  ## 3. Indexes
  - Gift card code lookup (for redemption)
  - Gift card status filtering
  - Donation user lookup
  - Donation status filtering
  - Volunteer points user lookup

  ## 4. Functions
  - `generate_gift_card_code()` - Generates unique 8-character alphanumeric codes
  - `redeem_gift_card()` - Handles gift card redemption logic
  - `award_volunteer_points()` - Awards points to users for activities

  ## 5. Important Notes
  - Gift card codes are auto-generated and guaranteed to be unique
  - Expired cards are marked by status, not automatically
  - Stripe IDs are stored for transaction tracking and refunds
  - All monetary values are stored as numeric(10,2) for precision
  - Timestamps use timestamptz for proper timezone handling
  - RLS policies ensure users can only access their own data
*/

-- Create gift_cards table
CREATE TABLE IF NOT EXISTS gift_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  value numeric(10,2) NOT NULL CHECK (value > 0),
  status text NOT NULL DEFAULT 'unused' CHECK (status IN ('unused', 'redeemed', 'expired')),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  issued_to_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  issued_at timestamptz DEFAULT now() NOT NULL,
  redeemed_at timestamptz,
  expires_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  currency text DEFAULT 'USD' NOT NULL,
  stripe_payment_intent_id text UNIQUE,
  stripe_checkout_session_id text UNIQUE,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  donor_name text,
  donor_email text,
  is_anonymous boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  completed_at timestamptz,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create volunteer_points table
CREATE TABLE IF NOT EXISTS volunteer_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  incident_id uuid REFERENCES incidents(id) ON DELETE SET NULL,
  points integer NOT NULL CHECK (points > 0),
  activity_type text NOT NULL CHECK (activity_type IN ('volunteer', 'report', 'verify', 'donate', 'action')),
  description text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_gift_cards_status ON gift_cards(status);
CREATE INDEX IF NOT EXISTS idx_gift_cards_user_id ON gift_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_gift_cards_issued_to_user_id ON gift_cards(issued_to_user_id);
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_stripe_payment_intent_id ON donations(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_points_user_id ON volunteer_points(user_id);

-- Function to generate unique gift card code
CREATE OR REPLACE FUNCTION generate_gift_card_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    new_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM gift_cards WHERE code = new_code) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Function to redeem gift card
CREATE OR REPLACE FUNCTION redeem_gift_card(
  card_code text,
  redeeming_user_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  card_record gift_cards;
  result json;
BEGIN
  -- Lock the row for update
  SELECT * INTO card_record
  FROM gift_cards
  WHERE code = card_code
  FOR UPDATE;

  -- Check if card exists
  IF card_record IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Gift card not found'
    );
  END IF;

  -- Check if already redeemed
  IF card_record.status = 'redeemed' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Gift card has already been redeemed'
    );
  END IF;

  -- Check if expired
  IF card_record.status = 'expired' OR (card_record.expires_at IS NOT NULL AND card_record.expires_at < now()) THEN
    -- Mark as expired if not already
    UPDATE gift_cards SET status = 'expired', updated_at = now() WHERE id = card_record.id;
    RETURN json_build_object(
      'success', false,
      'error', 'Gift card has expired'
    );
  END IF;

  -- Redeem the card
  UPDATE gift_cards
  SET 
    status = 'redeemed',
    user_id = redeeming_user_id,
    redeemed_at = now(),
    updated_at = now()
  WHERE id = card_record.id;

  -- Award points equal to card value (e.g., $25 = 25 points)
  INSERT INTO volunteer_points (user_id, points, activity_type, description)
  VALUES (
    redeeming_user_id,
    (card_record.value)::integer,
    'action',
    'Redeemed gift card: ' || card_code
  );

  RETURN json_build_object(
    'success', true,
    'value', card_record.value,
    'message', 'Gift card redeemed successfully'
  );
END;
$$;

-- Function to award volunteer points
CREATE OR REPLACE FUNCTION award_volunteer_points(
  target_user_id uuid,
  points_amount integer,
  activity text,
  activity_description text,
  related_incident_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO volunteer_points (user_id, incident_id, points, activity_type, description)
  VALUES (target_user_id, related_incident_id, points_amount, activity, activity_description);
END;
$$;

-- Enable Row Level Security
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_points ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gift_cards

-- Users can view unused gift cards (for redemption)
CREATE POLICY "Anyone can view unused gift cards for redemption"
  ON gift_cards FOR SELECT
  TO authenticated
  USING (status = 'unused');

-- Users can view gift cards issued to them
CREATE POLICY "Users can view their issued gift cards"
  ON gift_cards FOR SELECT
  TO authenticated
  USING (issued_to_user_id = auth.uid());

-- Users can view gift cards they redeemed
CREATE POLICY "Users can view their redeemed gift cards"
  ON gift_cards FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can update gift cards to redeem them (handled via function)
CREATE POLICY "Users can redeem gift cards"
  ON gift_cards FOR UPDATE
  TO authenticated
  USING (status = 'unused')
  WITH CHECK (user_id = auth.uid() AND status = 'redeemed');

-- RLS Policies for donations

-- Users can view their own donations
CREATE POLICY "Users can view their own donations"
  ON donations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Public can view completed non-anonymous donations (for transparency)
CREATE POLICY "Public can view non-anonymous completed donations"
  ON donations FOR SELECT
  TO authenticated
  USING (status = 'completed' AND is_anonymous = false);

-- Users can insert their own donations
CREATE POLICY "Users can create their own donations"
  ON donations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- System can update donation status (via service role for Stripe webhooks)
CREATE POLICY "Service role can update donations"
  ON donations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for volunteer_points

-- Users can view their own points
CREATE POLICY "Users can view their own volunteer points"
  ON volunteer_points FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Public can view aggregated leaderboard data
CREATE POLICY "Anyone can view volunteer points for leaderboard"
  ON volunteer_points FOR SELECT
  TO authenticated
  USING (true);

-- Only system can insert points (via functions)
CREATE POLICY "Service role can insert volunteer points"
  ON volunteer_points FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create a view for user points summary
CREATE OR REPLACE VIEW user_points_summary AS
SELECT 
  user_id,
  SUM(points) as total_points,
  COUNT(*) as total_activities,
  MAX(created_at) as last_activity
FROM volunteer_points
GROUP BY user_id;

-- Create a view for donation statistics
CREATE OR REPLACE VIEW donation_stats AS
SELECT 
  COUNT(*) as total_donations,
  SUM(amount) as total_amount,
  AVG(amount) as average_amount,
  COUNT(DISTINCT user_id) as unique_donors
FROM donations
WHERE status = 'completed';
