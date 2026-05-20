import {
  Recycle,
  TreePine,
  Sun,
  Droplets,
  Wind,
  Sprout,
  Leaf,
  Trash2,
  Factory,
  Bike,
  Building2,
  Zap,
  Award
} from 'lucide-react';

export const sustainabilityCategories = {
  waste_management: {
    label: 'Waste Management',
    icon: Recycle,
    color: 'from-[#7FA8C3] to-[#6B94AF]',
    bgColor: 'bg-[#DAE6F0]',
    textColor: 'text-[#7FA8C3]',
    borderColor: 'border-[#B8CFE0]',
    emoji: '♻️'
  },
  tree_planting: {
    label: 'Urban Forestry',
    icon: TreePine,
    color: 'from-[#A3BFA2] to-[#8FAD8E]',
    bgColor: 'bg-[#E2EDE2]',
    textColor: 'text-[#8FAD8E]',
    borderColor: 'border-[#C9DBCA]',
    emoji: '🌲'
  },
  renewable_energy: {
    label: 'Renewable Energy',
    icon: Sun,
    color: 'from-[#D8A86A] to-[#C49556]',
    bgColor: 'bg-[#F5E6D6]',
    textColor: 'text-[#C49556]',
    borderColor: 'border-[#EBCFAD]',
    emoji: '☀️'
  },
  water_conservation: {
    label: 'Water Conservation',
    icon: Droplets,
    color: 'from-[#7FA8C3] to-[#6B94AF]',
    bgColor: 'bg-[#DAE6F0]',
    textColor: 'text-[#6B94AF]',
    borderColor: 'border-[#B8CFE0]',
    emoji: '💧'
  },
  air_quality: {
    label: 'Air Quality',
    icon: Wind,
    color: 'from-[#92B5CC] to-[#7FA8C3]',
    bgColor: 'bg-[#E0EBF3]',
    textColor: 'text-[#7FA8C3]',
    borderColor: 'border-[#C0D7E8]',
    emoji: '🌬️'
  },
  community_gardens: {
    label: 'Community Gardens',
    icon: Sprout,
    color: 'from-[#B5CCAA] to-[#A3BFA2]',
    bgColor: 'bg-[#E8F1E8]',
    textColor: 'text-[#A3BFA2]',
    borderColor: 'border-[#D2E3D1]',
    emoji: '🌱'
  },
  sustainable_transport: {
    label: 'Sustainable Transport',
    icon: Bike,
    color: 'from-[#8FB7B0] to-[#7FA8A3]',
    bgColor: 'bg-[#E0EDE9]',
    textColor: 'text-[#7FA8A3]',
    borderColor: 'border-[#C5DAD5]',
    emoji: '🚲'
  },
  recycling_programs: {
    label: 'Recycling Programs',
    icon: Trash2,
    color: 'from-[#A3BFA2] to-[#8FAD8E]',
    bgColor: 'bg-[#E2EDE2]',
    textColor: 'text-[#A3BFA2]',
    borderColor: 'border-[#C9DBCA]',
    emoji: '🗑️'
  },
  green_building: {
    label: 'Green Building',
    icon: Building2,
    color: 'from-[#9FA5A8] to-[#8B9195]',
    bgColor: 'bg-[#E5E7E8]',
    textColor: 'text-[#8B9195]',
    borderColor: 'border-[#CFD3D5]',
    emoji: '🏢'
  },
  pollution_control: {
    label: 'Pollution Control',
    icon: Factory,
    color: 'from-[#A86A70] to-[#945661]',
    bgColor: 'bg-[#E8D8DA]',
    textColor: 'text-[#A86A70]',
    borderColor: 'border-[#D4B5B8]',
    emoji: '🏭'
  },
  energy_efficiency: {
    label: 'Energy Efficiency',
    icon: Zap,
    color: 'from-[#D8A86A] to-[#C49556]',
    bgColor: 'bg-[#F5E6D6]',
    textColor: 'text-[#D8A86A]',
    borderColor: 'border-[#EBCFAD]',
    emoji: '⚡'
  },
  sustainable_agriculture: {
    label: 'Sustainable Agriculture',
    icon: Leaf,
    color: 'from-[#B5CCAA] to-[#A3BFA2]',
    bgColor: 'bg-[#E8F1E8]',
    textColor: 'text-[#B5CCAA]',
    borderColor: 'border-[#D2E3D1]',
    emoji: '🌾'
  }
};

export function getCategoryInfo(category: string) {
  return sustainabilityCategories[category as keyof typeof sustainabilityCategories] || {
    label: category,
    icon: Sprout,
    color: 'from-[#9FA5A8] to-[#8B9195]',
    bgColor: 'bg-[#E5E7E8]',
    textColor: 'text-[#8B9195]',
    borderColor: 'border-[#CFD3D5]',
    emoji: '📋'
  };
}

export function getImpactLevel(score: number): { label: string; icon: typeof Award; color: string; emoji: string } {
  if (score >= 1000) return { label: 'Sustainability Champion', icon: Award, color: 'text-[#D8A86A]', emoji: '🏆' };
  if (score >= 500) return { label: 'Environmental Leader', icon: Award, color: 'text-[#A3BFA2]', emoji: '🌟' };
  if (score >= 250) return { label: 'Active Contributor', icon: Award, color: 'text-[#8FAD8E]', emoji: '⭐' };
  if (score >= 100) return { label: 'Community Member', icon: Award, color: 'text-[#7FA8C3]', emoji: '👥' };
  if (score >= 50) return { label: 'Getting Started', icon: Award, color: 'text-[#B5CCAA]', emoji: '🌱' };
  return { label: 'New Member', icon: Award, color: 'text-[#A3BFA2]', emoji: '🌿' };
}

export const cities = [
  { name: 'New York, NY', lat: 40.7128, lng: -74.0060, state: 'NY' },
  { name: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437, state: 'CA' },
  { name: 'Chicago, IL', lat: 41.8781, lng: -87.6298, state: 'IL' },
  { name: 'Houston, TX', lat: 29.7604, lng: -95.3698, state: 'TX' },
  { name: 'Phoenix, AZ', lat: 33.4484, lng: -112.0740, state: 'AZ' },
  { name: 'Philadelphia, PA', lat: 39.9526, lng: -75.1652, state: 'PA' },
  { name: 'San Antonio, TX', lat: 29.4241, lng: -98.4936, state: 'TX' },
  { name: 'San Diego, CA', lat: 32.7157, lng: -117.1611, state: 'CA' },
  { name: 'Dallas, TX', lat: 32.7767, lng: -96.7970, state: 'TX' },
  { name: 'Austin, TX', lat: 30.2672, lng: -97.7431, state: 'TX' },
  { name: 'San Jose, CA', lat: 37.3382, lng: -121.8863, state: 'CA' },
  { name: 'Seattle, WA', lat: 47.6062, lng: -122.3321, state: 'WA' },
  { name: 'Denver, CO', lat: 39.7392, lng: -104.9903, state: 'CO' },
  { name: 'Boston, MA', lat: 42.3601, lng: -71.0589, state: 'MA' },
  { name: 'Portland, OR', lat: 45.5152, lng: -122.6784, state: 'OR' }
];

export const organizations = [
  { name: 'NYC 311', type: 'Municipal Service', website: '311.nyc.gov' },
  { name: 'EPA Region 2', type: 'Federal Agency', website: 'epa.gov' },
  { name: 'NYC Parks Department', type: 'Municipal Agency', website: 'nycparks.org' },
  { name: 'TreesNY', type: 'Non-Profit', website: 'treesny.org' },
  { name: 'The Nature Conservancy', type: 'Non-Profit', website: 'nature.org' },
  { name: 'Sierra Club', type: 'Non-Profit', website: 'sierraclub.org' },
  { name: 'Clean Water Action', type: 'Non-Profit', website: 'cleanwater.org' },
  { name: 'GreenWave', type: 'Environmental Group', website: 'greenwave.org' },
  { name: 'Urban Green Council', type: 'Non-Profit', website: 'urbangreencouncil.org' },
  { name: 'American Forests', type: 'Conservation Org', website: 'americanforests.org' }
];
