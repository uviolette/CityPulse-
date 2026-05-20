/*
  # Update Sample Data with Real US Cities and Organizations

  1. Purpose
    - Replace existing sample data with professional, production-ready examples
    - Include real US cities across America
    - Feature actual organizations like NYC 311, EPA, and major environmental groups
    - Demonstrate real-world sustainability initiatives

  2. Data Updates
    - Clears existing sample incidents
    - Adds 20+ professional examples across major US cities
    - Includes various sustainability categories
    - Shows realistic participation numbers and status

  3. Organizations Featured
    - NYC 311 (Municipal Service)
    - EPA Regions (Federal Agency)
    - NYC Parks Department
    - TreesNY
    - The Nature Conservancy
    - Sierra Club
    - Clean Water Action
    - Urban Green Council
    - American Forests
    - Local city departments
*/

-- Clear existing sample data
DELETE FROM incidents WHERE title LIKE '%Community Garden%' OR title LIKE '%Plastic-Free Market%' OR title LIKE '%Beach Cleanup%';

-- Insert professional sample data across US cities
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
    'NYC 311 Street Tree Planting Initiative',
    'Partner with NYC Parks Department and 311 to plant 1,000 street trees across Manhattan. Report locations via 311 app. Professional arborists will oversee planting. Trees improve air quality and reduce urban heat.',
    'tree_planting',
    40.7589,
    -73.9851,
    'Manhattan, New York, NY',
    'in_progress',
    284,
    67
  ),
  (
    'LA County Solar Panel Bulk Purchase Program',
    'Join EPA Region 9 approved solar cooperative. Bulk pricing available for residential installations. Pre-qualified contractors. Financing options through Clean Energy Alliance. Reduce grid dependency by 40%.',
    'renewable_energy',
    34.0522,
    -118.2437,
    'Los Angeles, CA',
    'reported',
    423,
    156
  ),
  (
    'Chicago River Cleanup - Sierra Club Partnership',
    'Monthly river cleanup events coordinated with Sierra Club Illinois Chapter. All equipment provided. Focus on removing plastics and debris. Data collection for EPA water quality reports.',
    'pollution_control',
    41.8781,
    -87.6298,
    'Chicago River, Chicago, IL',
    'reported',
    198,
    89
  ),
  (
    'Houston Metro Green Line Expansion Support',
    'Advocate for expanded light rail to reduce vehicle emissions. Partner with Houston Metro and Clean Air Coalition. Reduces traffic congestion and improves air quality. Public hearing next month.',
    'sustainable_transport',
    29.7604,
    -95.3698,
    'Downtown Houston, TX',
    'reported',
    512,
    234
  ),
  (
    'Phoenix Urban Heat Island Mitigation Project',
    'EPA-funded initiative to plant shade trees in high-temperature zones. Collaborate with American Forests and city planning department. Target 500 trees in underserved neighborhoods this year.',
    'air_quality',
    33.4484,
    -112.0740,
    'Phoenix, AZ',
    'in_progress',
    367,
    145
  ),
  (
    'Philadelphia Zero Waste Initiative - Streets Department',
    'Citywide composting program expansion. Partner with Philadelphia Streets Department. Free compost bins for residents. Divert 30% of waste from landfills. Drop-off locations at farmers markets.',
    'waste_management',
    39.9526,
    -75.1652,
    'Philadelphia, PA',
    'in_progress',
    289,
    78
  ),
  (
    'San Antonio River Authority Water Conservation',
    'Install rain barrels and native landscaping. Partnership with San Antonio River Authority. Rebate program for water-efficient upgrades. Reduce residential water use by 25%. Free workshops monthly.',
    'water_conservation',
    29.4241,
    -98.4936,
    'San Antonio, TX',
    'reported',
    178,
    56
  ),
  (
    'San Diego Community Solar Gardens',
    'The Nature Conservancy sponsored community gardens with integrated solar panels. Provides fresh produce and clean energy. Educational programs for schools. Open to all residents.',
    'community_gardens',
    32.7157,
    -117.1611,
    'Balboa Park, San Diego, CA',
    'reported',
    445,
    123
  ),
  (
    'Dallas Building Energy Efficiency Retrofit Program',
    'Commercial building energy audits and upgrades. Partnership with Urban Green Council. Focus on HVAC and lighting efficiency. Available grants and tax incentives. Target 20% energy reduction.',
    'energy_efficiency',
    32.7767,
    -96.7970,
    'Downtown Dallas, TX',
    'in_progress',
    167,
    34
  ),
  (
    'Austin Zero Emissions Vehicle Infrastructure',
    'Expand EV charging network across city. Austin Energy partnership. 100 new charging stations planned. Support citywide carbon neutrality goal by 2040. Free installation for businesses.',
    'sustainable_transport',
    30.2672,
    -97.7431,
    'Austin, TX',
    'in_progress',
    598,
    201
  ),
  (
    'San Jose Urban Agriculture Zone Development',
    'Convert vacant lots into productive urban farms. Partnership with American Forests and local nonprofits. Provides fresh food to food deserts. Job training programs included. 10 sites identified.',
    'sustainable_agriculture',
    37.3382,
    -121.8863,
    'East San Jose, CA',
    'reported',
    234,
    87
  ),
  (
    'Seattle Green Building Code Implementation',
    'New construction sustainability standards. Urban Green Council advising. Requires LEED Silver minimum. Rainwater harvesting and solar ready. City council vote pending.',
    'green_building',
    47.6062,
    -122.3321,
    'Seattle, WA',
    'reported',
    389,
    112
  ),
  (
    'Denver Mile High Clean Air Initiative',
    'Reduce vehicle emissions through improved public transit and bike infrastructure. Partnership with EPA Region 8. $50M funding approved. New bike lanes on 15 major corridors.',
    'air_quality',
    39.7392,
    -104.9903,
    'Denver, CO',
    'in_progress',
    456,
    178
  ),
  (
    'Boston Harbor Island Restoration Project',
    'Coastal habitat restoration with The Nature Conservancy. Remove invasive species and plant natives. Improve marine ecosystem health. Volunteer days every weekend. Educational tours available.',
    'pollution_control',
    42.3601,
    -71.0589,
    'Boston Harbor, MA',
    'in_progress',
    312,
    145
  ),
  (
    'Portland Comprehensive Curbside Composting',
    'Citywide food scrap collection program. Portland Bureau of Environmental Services manages. Weekly pickup with recycling. Reduces methane emissions. Free compost for participants.',
    'waste_management',
    45.5152,
    -122.6784,
    'Portland, OR',
    'resolved',
    523,
    89
  ),
  (
    'NYC 311 Reported Illegal Dumping Cleanup',
    'Community response to 311 reports of illegal waste dumping. NYC Sanitation Department coordination. Hazardous material removal. Surveillance cameras installed. Fines for violators.',
    'pollution_control',
    40.6782,
    -73.9442,
    'Brooklyn, New York, NY',
    'in_progress',
    267,
    45
  ),
  (
    'Chicago Green Roof Incentive Program',
    'Tax credits for commercial green roof installations. Partnership with Urban Green Council. Reduces stormwater runoff by 50%. Improves building insulation. Supports urban biodiversity.',
    'green_building',
    41.8781,
    -87.6298,
    'Downtown Chicago, IL',
    'reported',
    198,
    67
  ),
  (
    'LA Metro Bike Share Expansion',
    'Double bike share stations across LA County. Clean Water Action advocacy. Connect to metro rail stations. Electric bike options. Reduce short car trips by 15%.',
    'sustainable_transport',
    34.0522,
    -118.2437,
    'Los Angeles County, CA',
    'reported',
    467,
    189
  ),
  (
    'Houston Renewable Energy Purchasing Program',
    'City government switches to 100% renewable energy. Sets example for businesses. Partnership with local solar and wind farms. Reduces municipal carbon footprint by 45%. Educational outreach included.',
    'renewable_energy',
    29.7604,
    -95.3698,
    'Houston, TX',
    'reported',
    389,
    134
  ),
  (
    'Philadelphia Tree Equity Initiative',
    'American Forests Tree Equity Score analysis. Plant trees in underserved neighborhoods. Address environmental justice. Improve health outcomes. Community input on species selection.',
    'tree_planting',
    39.9526,
    -75.1652,
    'North Philadelphia, PA',
    'in_progress',
    345,
    98
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
