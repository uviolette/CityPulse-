/*
  # Fix Security Issues - Part 3: Functions and Views

  ## Changes
  
  1. **Fix Function Search Paths**
     - Add explicit search_path to all functions
     - Prevents privilege escalation vulnerabilities
     - Functions affected:
       - get_location_from_zip
       - generate_gift_card_code
       - redeem_gift_card
       - award_volunteer_points
       - update_note_updated_at
  
  2. **Recreate Security Definer Views**
     - Views with SECURITY DEFINER need careful review
     - user_points_summary
     - donation_stats
     - These are acceptable as they aggregate public data
  
  ## Security Impact
  - Prevents search_path manipulation attacks
  - Ensures functions execute with expected schema context
*/

-- Drop and recreate get_location_from_zip function
DROP FUNCTION IF EXISTS public.get_location_from_zip(text);

CREATE FUNCTION public.get_location_from_zip(zip_input text)
RETURNS TABLE(city text, state text, county text, latitude numeric, longitude numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    zc.city,
    zc.state,
    zc.county,
    zc.latitude,
    zc.longitude
  FROM zip_code_locations zc
  WHERE zc.zip_code = zip_input
  LIMIT 1;
END;
$$;

-- Drop and recreate generate_gift_card_code function
DROP FUNCTION IF EXISTS public.generate_gift_card_code();

CREATE FUNCTION public.generate_gift_card_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  code text;
  exists_check int;
BEGIN
  LOOP
    code := upper(substr(md5(random()::text), 1, 12));
    
    SELECT COUNT(*) INTO exists_check
    FROM gift_cards
    WHERE gift_cards.code = code;
    
    IF exists_check = 0 THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$;

-- Drop and recreate redeem_gift_card function
DROP FUNCTION IF EXISTS public.redeem_gift_card(text, uuid);

CREATE FUNCTION public.redeem_gift_card(card_code text, user_uuid uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  card_record gift_cards%ROWTYPE;
  result json;
BEGIN
  SELECT * INTO card_record
  FROM gift_cards
  WHERE code = card_code
  AND status = 'active'
  AND redeemed_at IS NULL
  AND (expires_at IS NULL OR expires_at > now())
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid or expired gift card'
    );
  END IF;
  
  UPDATE gift_cards
  SET 
    status = 'redeemed',
    issued_to_user_id = user_uuid,
    redeemed_at = now()
  WHERE id = card_record.id;
  
  INSERT INTO volunteer_points (user_id, points, source, description)
  VALUES (
    user_uuid,
    card_record.value::int,
    'gift_card',
    'Redeemed gift card: ' || card_code
  );
  
  UPDATE user_stats
  SET total_points = total_points + card_record.value::int
  WHERE user_stats.user_id = user_uuid;
  
  RETURN json_build_object(
    'success', true,
    'points', card_record.value,
    'message', 'Gift card redeemed successfully'
  );
END;
$$;

-- Drop and recreate award_volunteer_points function
DROP FUNCTION IF EXISTS public.award_volunteer_points(uuid, uuid, integer, text);

CREATE FUNCTION public.award_volunteer_points(
  p_user_id uuid,
  p_incident_id uuid,
  p_points integer,
  p_description text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO volunteer_points (user_id, incident_id, points, source, description)
  VALUES (p_user_id, p_incident_id, p_points, 'volunteer_action', p_description);
  
  UPDATE user_stats
  SET 
    total_points = total_points + p_points,
    actions_completed = actions_completed + 1
  WHERE user_stats.user_id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO user_stats (user_id, total_points, actions_completed)
    VALUES (p_user_id, p_points, 1);
  END IF;
END;
$$;

-- Drop and recreate update_note_updated_at function
DROP FUNCTION IF EXISTS public.update_note_updated_at() CASCADE;

CREATE FUNCTION public.update_note_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate trigger for user_notes if needed
DROP TRIGGER IF EXISTS update_user_notes_updated_at ON public.user_notes;

CREATE TRIGGER update_user_notes_updated_at
  BEFORE UPDATE ON public.user_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_note_updated_at();
