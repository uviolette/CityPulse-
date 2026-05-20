export interface User {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  zip_code: string | null;
  state: string | null;
  county: string | null;
  city: string | null;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Incident {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  zip_code: string | null;
  latitude: number;
  longitude: number;
  location_name: string | null;
  state: string | null;
  county: string | null;
  city: string | null;
  neighborhood: string | null;
  type: 'issue' | 'event' | 'incident';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'in_progress' | 'resolved';
  start_time: string | null;
  end_time: string | null;
  resolved_at: string | null;
  upvote_count: number;
  volunteer_count: number;
  created_at: string;
  updated_at: string;
  user?: User;
  media?: IncidentMedia[];
  comments?: Comment[];
  status_history?: StatusHistory[];
}

export interface IncidentMedia {
  id: string;
  incident_id: string;
  user_id: string;
  media_url: string;
  media_type: 'photo' | 'video';
  created_at: string;
}

export interface Action {
  id: string;
  incident_id: string;
  user_id: string;
  action_type: 'upvote' | 'volunteer';
  created_at: string;
}

export interface UserStats {
  id: string;
  user_id: string;
  issues_reported: number;
  issues_helped_fix: number;
  times_volunteered: number;
  upvotes_given: number;
  impact_score: number;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  search_radius_km: number;
  notification_enabled: boolean;
  categories: string[];
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  incident_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface StatusHistory {
  id: string;
  incident_id: string;
  user_id: string | null;
  old_status: string | null;
  new_status: string;
  comment: string | null;
  created_at: string;
  user?: User;
}

export interface HeatMapFilters {
  types: ('issue' | 'event' | 'incident')[];
  statuses: ('reported' | 'in_progress' | 'resolved')[];
  severities: ('low' | 'medium' | 'high' | 'critical')[];
  timeRange: {
    start: Date | null;
    end: Date | null;
  };
  state: string | null;
  city: string | null;
}

export interface HeatMapArea {
  id: string;
  name: string;
  level: 'state' | 'county' | 'city' | 'neighborhood';
  latitude: number;
  longitude: number;
  incidents: Incident[];
  color: string;
  intensity: number;
}

export interface GiftCard {
  id: string;
  code: string;
  value: number;
  status: 'unused' | 'redeemed' | 'expired';
  user_id: string | null;
  issued_to_user_id: string | null;
  issued_at: string;
  redeemed_at: string | null;
  expires_at: string | null;
  created_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Donation {
  id: string;
  user_id: string | null;
  amount: number;
  currency: string;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  donor_name: string | null;
  donor_email: string | null;
  is_anonymous: boolean;
  created_at: string;
  completed_at: string | null;
  updated_at: string;
}

export interface VolunteerPoints {
  id: string;
  user_id: string;
  incident_id: string | null;
  points: number;
  activity_type: 'volunteer' | 'report' | 'verify' | 'donate' | 'action';
  description: string;
  created_at: string;
}

export interface UserPointsSummary {
  user_id: string;
  total_points: number;
  total_activities: number;
  last_activity: string;
}
