/*
  # Add Sample Sustainability Data

  1. Sample Data
    - Creates sample incidents focused on sustainability topics
    - Includes various categories: recycling, tree planting, clean energy, waste reduction
    - Demonstrates the platform's potential with real-world examples
  
  2. Categories
    - Recycling & Waste
    - Tree Planting
    - Clean Energy
    - Water Conservation
    - Air Quality
    - Community Gardens
    - Plastic Reduction
*/

-- Insert sample sustainability incidents
INSERT INTO incidents (
  user_id,
  title,
  description,
  category,
  latitude,
  longitude,
  location_name,
  status,
  upvote_count,
  volunteer_count
)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  title,
  description,
  category,
  latitude,
  longitude,
  location_name,
  status,
  upvote_count,
  volunteer_count
FROM (VALUES
  (
    'Community Garden Initiative',
    'Let''s transform the empty lot on Maple Street into a thriving community garden! We need volunteers to help with soil preparation, planting, and ongoing maintenance.',
    'community_gardens',
    40.7128,
    -74.0060,
    'Maple Street & 5th Ave',
    'reported',
    23,
    8
  ),
  (
    'Plastic-Free Market Day',
    'Organizing a monthly plastic-free farmers market. Local vendors committed to zero-waste packaging. Help us spread the word and set up!',
    'plastic_reduction',
    40.7580,
    -73.9855,
    'Central Plaza',
    'in_progress',
    45,
    15
  ),
  (
    'Beach Cleanup Drive',
    'Join us this Saturday for our monthly beach cleanup! All supplies provided. Let''s keep our coastline pristine and protect marine life.',
    'recycling_waste',
    40.5731,
    -73.9712,
    'Brighton Beach',
    'reported',
    67,
    22
  ),
  (
    'Solar Panel Co-op',
    'Forming a neighborhood solar panel buying cooperative to get group discounts. Already have 15 families interested! Join us to go green and save money.',
    'clean_energy',
    40.7484,
    -73.9857,
    'Westside Neighborhood',
    'in_progress',
    89,
    34
  ),
  (
    'Tree Planting Weekend',
    'City approved 100 new trees for our neighborhood! We need volunteers to help plant them this weekend. All skill levels welcome!',
    'tree_planting',
    40.7589,
    -73.9851,
    'Riverside Park',
    'reported',
    134,
    45
  ),
  (
    'Rainwater Harvesting Workshop',
    'Free workshop on setting up rainwater collection systems for your home. Learn how to conserve water and reduce your bill!',
    'water_conservation',
    40.7282,
    -73.9942,
    'Community Center',
    'reported',
    28,
    12
  ),
  (
    'Bike Lane Expansion Petition',
    'Help us petition for safer bike lanes on Main Street! Reduce traffic, improve air quality, and make cycling safer for everyone.',
    'air_quality',
    40.7489,
    -73.9680,
    'Main Street Corridor',
    'in_progress',
    156,
    67
  ),
  (
    'Composting Hub Launch',
    'New community composting station opening next month! Drop off your food scraps and get free compost for your garden.',
    'recycling_waste',
    40.7614,
    -73.9776,
    'North Park Entrance',
    'in_progress',
    78,
    19
  ),
  (
    'Pollinator Garden Project',
    'Creating a butterfly and bee-friendly garden in the school yard. Students will learn about pollinators while beautifying our community!',
    'tree_planting',
    40.7455,
    -73.9903,
    'Lincoln Elementary School',
    'reported',
    52,
    18
  ),
  (
    'Repair Café Monthly Meetup',
    'Bring broken items instead of throwing them away! Our volunteers will help you fix electronics, clothes, furniture, and more.',
    'waste_reduction',
    40.7369,
    -74.0036,
    'Green Community Hub',
    'reported',
    43,
    11
  ),
  (
    'Green Roof Installation',
    'Converting our apartment building''s roof into a green space with plants, seating area, and rainwater collection. Looking for gardening enthusiasts!',
    'tree_planting',
    40.7505,
    -73.9934,
    '42nd Street Building',
    'in_progress',
    61,
    23
  ),
  (
    'LED Street Light Conversion',
    'Working with the city to replace old street lights with energy-efficient LEDs. Will reduce energy use by 60%! Support the initiative.',
    'clean_energy',
    40.7411,
    -73.9897,
    'Downtown District',
    'resolved',
    92,
    8
  )
) AS sample_data(
  title,
  description,
  category,
  latitude,
  longitude,
  location_name,
  status,
  upvote_count,
  volunteer_count
)
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

