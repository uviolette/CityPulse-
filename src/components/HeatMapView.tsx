import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Filter, RefreshCw, Calendar, AlertTriangle, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Incident, HeatMapFilters } from '../../types';
import { HeatMapFilters as FilterPanel } from './HeatMapFilters';
import { IncidentDetailModal } from './IncidentDetailModal';

interface HeatMapViewProps {
  userState?: string | null;
  userCity?: string | null;
}

interface LocationData {
  name: string;
  incidents: Incident[];
  latitude: number;
  longitude: number;
  level: 'state' | 'city';
}

export function HeatMapView({ userState, userCity }: HeatMapViewProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<'state' | 'city' | 'neighborhood'>(() => {
    if (userCity) return 'city';
    if (userState) return 'state';
    return 'state';
  });
  const [selectedLocation, setSelectedLocation] = useState<string | null>(userState || null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filters, setFilters] = useState<HeatMapFilters>({
    types: ['issue', 'event', 'incident'],
    statuses: ['reported', 'in_progress', 'resolved'],
    severities: ['low', 'medium', 'high', 'critical'],
    timeRange: { start: null, end: null },
    state: userState || null,
    city: userCity || null,
  });

  useEffect(() => {
    if (userState && !filters.state) {
      setFilters(prev => ({ ...prev, state: userState, city: userCity }));
    }
  }, [userState, userCity]);

  useEffect(() => {
    fetchIncidents();

    if (autoRefresh) {
      const interval = setInterval(fetchIncidents, 30000);
      return () => clearInterval(interval);
    }
  }, [filters, autoRefresh]);

  useEffect(() => {
    const channel = supabase
      .channel('incidents-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, () => {
        if (autoRefresh) {
          fetchIncidents();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [autoRefresh]);

  const fetchIncidents = async () => {
    try {
      let query = supabase
        .from('incidents')
        .select(`
          *,
          user:users(username, display_name, avatar_url),
          media:incident_media(*),
          comments(*, user:users(username, display_name, avatar_url)),
          status_history(*, user:users(username, display_name))
        `)
        .in('type', filters.types)
        .in('status', filters.statuses)
        .in('severity', filters.severities);

      if (filters.state) {
        query = query.eq('state', filters.state);
      }

      if (filters.city) {
        query = query.eq('city', filters.city);
      }

      if (filters.timeRange.start) {
        query = query.gte('created_at', filters.timeRange.start.toISOString());
      }

      if (filters.timeRange.end) {
        query = query.lte('created_at', filters.timeRange.end.toISOString());
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setIncidents(data || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (incident: Incident): string => {
    if (incident.type === 'event') {
      if (incident.end_time && new Date(incident.end_time) < new Date()) {
        return 'rgba(127, 168, 195, 0.4)';
      }
      return 'rgba(127, 168, 195, 0.75)';
    }

    if (incident.type === 'incident' && incident.severity === 'critical') {
      return 'rgba(216, 168, 106, 0.8)';
    }

    if (incident.status === 'resolved') {
      return 'rgba(163, 191, 162, 0.7)';
    }

    if (incident.status === 'reported' || incident.status === 'in_progress') {
      return 'rgba(168, 106, 112, 0.75)';
    }

    return 'rgba(156, 163, 175, 0.5)';
  };

  const getStatusLabel = (incident: Incident): string => {
    if (incident.type === 'event') {
      if (incident.start_time) {
        const startTime = new Date(incident.start_time);
        const now = new Date();

        if (incident.end_time && new Date(incident.end_time) < now) {
          return `Event ended at ${new Date(incident.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }

        if (startTime <= now && (!incident.end_time || new Date(incident.end_time) >= now)) {
          return 'Happening Now';
        }

        return `Starts at ${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      return 'Event Scheduled';
    }

    if (incident.type === 'incident') {
      return `${incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)} Incident: ${incident.title}`;
    }

    if (incident.status === 'resolved') {
      if (incident.resolved_at) {
        const resolveTime = new Date(incident.resolved_at);
        return `Fixed at ${resolveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      return 'Fixed';
    }

    return `${incident.title} - Reported ${new Date(incident.created_at).toLocaleDateString()}`;
  };

  const locationData = useMemo(() => {
    const locations = new Map<string, LocationData>();

    incidents.forEach(incident => {
      let key: string;
      let displayName: string;

      if (zoomLevel === 'state') {
        key = incident.state || 'Unknown';
        displayName = key;
      } else if (zoomLevel === 'city') {
        key = `${incident.city}_${incident.state}`;
        displayName = incident.city ? `${incident.city}, ${incident.state}` : 'Unknown';
      } else {
        key = `${incident.neighborhood}_${incident.city}_${incident.state}`;
        displayName = incident.neighborhood
          ? `${incident.neighborhood}, ${incident.city}`
          : incident.city || 'Unknown';
      }

      if (!locations.has(key)) {
        locations.set(key, {
          name: displayName,
          incidents: [],
          latitude: incident.latitude,
          longitude: incident.longitude,
          level: zoomLevel,
        });
      }

      locations.get(key)!.incidents.push(incident);
    });

    return Array.from(locations.values());
  }, [incidents, zoomLevel]);

  const getAreaIntensity = (incidentsList: Incident[]): number => {
    const weights = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    const total = incidentsList.reduce((sum, inc) => sum + (weights[inc.severity] || 1), 0);
    return Math.min(total / 10, 1);
  };

  const stats = useMemo(() => {
    const unfixed = incidents.filter(i => i.status !== 'resolved' && i.type === 'issue').length;
    const fixed = incidents.filter(i => i.status === 'resolved').length;
    const events = incidents.filter(i => i.type === 'event').length;
    const majorIncidents = incidents.filter(i => i.type === 'incident' && i.severity === 'critical').length;

    return { unfixed, fixed, events, majorIncidents };
  }, [incidents]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="animate-spin text-[#D88A2D]" size={32} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Heat Map</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-full transition-colors ${
                autoRefresh ? 'bg-[#D9E5D9] text-[#7B9B7B] border-2 border-[#7B9B7B]' : 'bg-[#F1E7D8] text-[#8B4A1C] border-2 border-[#C77B86]/30'
              }`}
              title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
            >
              <RefreshCw className={autoRefresh ? 'animate-spin' : ''} size={20} />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bakery-gradient text-[#F5ECE3] rounded-full hover:shadow-bakery transition-all font-bold"
            >
              <Filter size={20} />
              <span>Filters</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="status-critical-light rounded-lg p-3 border-l-4" style={{ borderColor: 'var(--status-critical)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--status-critical)' }}>Unfixed Issues</p>
                <p className="text-2xl font-bold text-[#8E2C3A]">{stats.unfixed}</p>
              </div>
              <div className="w-10 h-10 rounded-full status-critical-solid opacity-70" />
            </div>
          </div>
          <div className="status-resolved-light rounded-lg p-3 border-l-4" style={{ borderColor: 'var(--status-resolved)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--status-resolved)' }}>Fixed Issues</p>
                <p className="text-2xl font-bold text-[#8E2C3A]">{stats.fixed}</p>
              </div>
              <div className="w-10 h-10 rounded-full status-resolved-solid opacity-70" />
            </div>
          </div>
          <div className="status-active-light rounded-lg p-3 border-l-4" style={{ borderColor: 'var(--status-active)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--status-active)' }}>Events</p>
                <p className="text-2xl font-bold text-[#8E2C3A]">{stats.events}</p>
              </div>
              <div className="w-10 h-10 rounded-full status-active-solid opacity-70" />
            </div>
          </div>
          <div className="status-warning-light rounded-lg p-3 border-l-4" style={{ borderColor: 'var(--status-warning)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--status-warning)' }}>Major Incidents</p>
                <p className="text-2xl font-bold text-[#8E2C3A]">{stats.majorIncidents}</p>
              </div>
              <div className="w-10 h-10 rounded-full status-warning-solid opacity-70" />
            </div>
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <MapPin size={16} />
            <span className="font-semibold">Hierarchy View:</span>
            <span className="text-gray-500">United States → State → City → Neighborhood</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel('state')}
              className={`px-4 py-2 rounded-full transition-all font-bold ${
                zoomLevel === 'state' ? 'bakery-gradient text-[#F5ECE3] shadow-bakery' : 'bg-[#F1E7D8] text-[#8E2C3A] border-2 border-[#C77B86]/30 hover:border-[#C77B86]'
              }`}
            >
              State Level
            </button>
            <button
              onClick={() => setZoomLevel('city')}
              className={`px-4 py-2 rounded-full transition-all font-bold ${
                zoomLevel === 'city' ? 'bakery-gradient text-[#F5ECE3] shadow-bakery' : 'bg-[#F1E7D8] text-[#8E2C3A] border-2 border-[#C77B86]/30 hover:border-[#C77B86]'
              }`}
            >
              City Level
            </button>
            <button
              onClick={() => setZoomLevel('neighborhood')}
              className={`px-4 py-2 rounded-full transition-all font-bold ${
                zoomLevel === 'neighborhood' ? 'bakery-gradient text-[#F5ECE3] shadow-bakery' : 'bg-[#F1E7D8] text-[#8E2C3A] border-2 border-[#C77B86]/30 hover:border-[#C77B86]'
              }`}
            >
              Neighborhood Level
            </button>
          </div>
          {filters.state && (
            <div className="bg-[#D0DEEA] border-2 border-[#6B8BA8] rounded-2xl px-4 py-2 text-sm">
              <span className="font-bold text-[#8E2C3A]">Viewing: </span>
              <span className="text-[#6B8BA8] font-medium">
                {filters.city ? `${filters.city}, ${filters.state}` : filters.state}
              </span>
              <button
                onClick={() => setFilters(prev => ({ ...prev, state: null, city: null }))}
                className="ml-3 text-[#8E2C3A] hover:text-[#D88A2D] font-bold underline"
              >
                View All States
              </button>
            </div>
          )}
        </div>
      </div>

      {showFilters && (
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locationData.map((location) => {
            const intensity = getAreaIntensity(location.incidents);
            const primaryColor = location.incidents[0] ? getStatusColor(location.incidents[0]) : 'rgba(156, 163, 175, 0.5)';

            return (
              <div
                key={location.name}
                className="bg-white rounded-lg shadow-md overflow-hidden border-2 hover:shadow-lg transition-shadow cursor-pointer"
                style={{ borderColor: primaryColor }}
                onClick={() => setSelectedLocation(location.name)}
              >
                <div
                  className="h-32 p-4 flex flex-col justify-between"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor.replace('0.', '0.3')})`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white drop-shadow-lg">{location.name}</h3>
                    <MapPin className="text-white drop-shadow-lg" size={24} />
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-white" size={16} />
                    <span className="text-white font-semibold">{location.incidents.length} Reports</span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  {location.incidents.slice(0, 3).map((incident) => (
                    <div
                      key={incident.id}
                      className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIncident(incident);
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                        style={{ backgroundColor: getStatusColor(incident) }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{incident.title}</p>
                        <p className="text-xs text-gray-600">{getStatusLabel(incident)}</p>
                      </div>
                    </div>
                  ))}

                  {location.incidents.length > 3 && (
                    <button
                      className="w-full text-sm text-[#8E2C3A] hover:text-[#D88A2D] font-bold"
                      onClick={() => setSelectedLocation(location.name)}
                    >
                      View {location.incidents.length - 3} more
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {locationData.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <MapPin size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">No incidents found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
        />
      )}
    </div>
  );
}
