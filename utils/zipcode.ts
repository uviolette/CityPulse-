import { supabase } from '../lib/supabase';

export interface LocationData {
  zipCode: string;
  state: string;
  stateAbbr: string;
  county: string | null;
  city: string;
  neighborhood: string | null;
  latitude: number;
  longitude: number;
  country: string;
}

export async function lookupZipCode(zipCode: string): Promise<LocationData | null> {
  const cleanZip = zipCode.trim().replace(/\s+/g, '');

  if (!/^\d{5}$/.test(cleanZip)) {
    throw new Error('Invalid ZIP code format. Please enter a 5-digit ZIP code.');
  }

  try {
    const cached = await getCachedLocation(cleanZip);
    if (cached) {
      return cached;
    }

    const apiData = await fetchFromZippopotamAPI(cleanZip);
    if (apiData) {
      await cacheLocation(apiData);
      return apiData;
    }

    return null;
  } catch (error) {
    console.error('Error looking up ZIP code:', error);
    throw error;
  }
}

async function getCachedLocation(zipCode: string): Promise<LocationData | null> {
  try {
    const { data, error } = await supabase
      .from('zip_code_locations')
      .select('*')
      .eq('zip_code', zipCode)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      zipCode: data.zip_code,
      state: data.state,
      stateAbbr: data.state_abbr,
      county: data.county,
      city: data.city,
      neighborhood: data.neighborhood,
      latitude: data.latitude,
      longitude: data.longitude,
      country: data.country || 'United States',
    };
  } catch (error) {
    console.error('Error fetching cached location:', error);
    return null;
  }
}

async function fetchFromZippopotamAPI(zipCode: string): Promise<LocationData | null> {
  try {
    const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('ZIP code not found. Please check and try again.');
      }
      throw new Error('Unable to fetch location data. Please try again later.');
    }

    const data = await response.json();

    if (!data.places || data.places.length === 0) {
      throw new Error('No location data found for this ZIP code.');
    }

    const place = data.places[0];

    const stateFullName = getStateFullName(place['state abbreviation']);
    const countyName = place['place name'].includes('County')
      ? place['place name']
      : `${place['place name']} County`;

    return {
      zipCode: data['post code'],
      state: stateFullName,
      stateAbbr: place['state abbreviation'],
      county: countyName,
      city: place['place name'],
      neighborhood: null,
      latitude: parseFloat(place.latitude),
      longitude: parseFloat(place.longitude),
      country: data.country || 'United States',
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch ZIP code data. Please try again.');
  }
}

async function cacheLocation(location: LocationData): Promise<void> {
  try {
    const { error } = await supabase
      .from('zip_code_locations')
      .upsert({
        zip_code: location.zipCode,
        state: location.state,
        state_abbr: location.stateAbbr,
        county: location.county,
        city: location.city,
        neighborhood: location.neighborhood,
        latitude: location.latitude,
        longitude: location.longitude,
        country: location.country,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'zip_code',
      });

    if (error) {
      console.error('Error caching location:', error);
    }
  } catch (error) {
    console.error('Error caching location:', error);
  }
}

function getStateFullName(abbr: string): string {
  const stateMap: Record<string, string> = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
    'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
    'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
    'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
    'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
    'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
    'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
    'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
    'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
    'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
    'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia',
    'PR': 'Puerto Rico', 'VI': 'Virgin Islands', 'GU': 'Guam', 'AS': 'American Samoa',
    'MP': 'Northern Mariana Islands'
  };

  return stateMap[abbr] || abbr;
}

export function formatLocation(location: LocationData | null): string {
  if (!location) return '';

  const parts = [
    location.city,
    location.county,
    location.stateAbbr,
  ].filter(Boolean);

  return parts.join(', ');
}

export async function updateUserLocation(userId: string, zipCode: string): Promise<LocationData> {
  const location = await lookupZipCode(zipCode);

  if (!location) {
    throw new Error('Unable to find location for the provided ZIP code.');
  }

  const { error } = await supabase
    .from('users')
    .update({
      zip_code: location.zipCode,
      state: location.state,
      county: location.county,
      city: location.city,
      neighborhood: location.neighborhood,
      latitude: location.latitude,
      longitude: location.longitude,
      location_name: formatLocation(location),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    throw new Error('Failed to update user location. Please try again.');
  }

  return location;
}

export async function resolveIncidentLocation(zipCode: string): Promise<{
  state: string;
  county: string | null;
  city: string;
  neighborhood: string | null;
  latitude: number;
  longitude: number;
  locationName: string;
}> {
  const location = await lookupZipCode(zipCode);

  if (!location) {
    throw new Error('Unable to find location for the provided ZIP code.');
  }

  return {
    state: location.state,
    county: location.county,
    city: location.city,
    neighborhood: location.neighborhood,
    latitude: location.latitude,
    longitude: location.longitude,
    locationName: formatLocation(location),
  };
}
