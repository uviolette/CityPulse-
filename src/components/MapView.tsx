import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Incident } from '../../types';
import { Target, TrendingUp, AlertTriangle, CheckCircle, Activity, Map, Flame } from 'lucide-react';
import { getCategoryInfo } from '../../utils/sustainability';
import { USAMap } from './USAMap';
import { ActivityFeed } from './ActivityFeed';
import { HeatMapView } from './HeatMapView';
import { InteractiveUSMap } from './InteractiveUSMap';
import { useAuth } from '../../contexts/AuthContext';
import { ElevenLabsWidget } from '../AIWidget/ElevenLabsWidget';

export function MapView() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'traditional' | 'heatmap' | 'interactive'>('interactive');
  const [userLocation, setUserLocation] = useState<{ state: string | null; city: string | null }>({
    state: null,
    city: null,
  });

  useEffect(() => {
    fetchIncidents();
    fetchUserLocation();
  }, []);

  async function fetchUserLocation() {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('users')
        .select('location_name')
        .eq('id', user.id)
        .single();

      if (data?.location_name) {
        const locationParts = data.location_name.split(',').map((s: string) => s.trim());
        setUserLocation({
          state: locationParts[locationParts.length - 1] || null,
          city: locationParts[0] || null,
        });
      }
    } catch (error) {
      console.error('Error fetching user location:', error);
    }
  }

  async function fetchIncidents() {
    setIsLoading(true);
    const { data } = await supabase
      .from('incidents')
      .select(`*, user:users(id, display_name, avatar_url)`)
      .order('created_at', { ascending: false })
      .limit(100);

    if (data) {
      setIncidents(data as unknown as Incident[]);
    }
    setIsLoading(false);
  }

  const stateMapping: Record<string, string> = {
    'CA': 'CA', 'TX': 'TX', 'FL': 'FL', 'NY': 'NY', 'PA': 'PA',
    'IL': 'IL', 'OH': 'OH', 'GA': 'GA', 'NC': 'NC', 'MI': 'MI',
    'WA': 'WA', 'OR': 'OR', 'AZ': 'AZ', 'MA': 'MA', 'CO': 'CO'
  };

  const getStateData = () => {
    const stateData: Record<string, { status: 'good' | 'warning' | 'critical'; count: number }> = {};

    Object.keys(stateMapping).forEach((stateCode) => {
      const stateIncidents = incidents.filter(inc =>
        inc.location_name?.includes(stateCode)
      );

      const count = stateIncidents.length;
      if (count === 0) return;

      const resolvedCount = stateIncidents.filter(inc => inc.status === 'resolved').length;
      const reportedCount = stateIncidents.filter(inc => inc.status === 'reported').length;
      const resolveRate = count > 0 ? (resolvedCount / count) * 100 : 0;

      let status: 'good' | 'warning' | 'critical' = 'good';
      if (resolveRate >= 60) status = 'good';
      else if (resolveRate >= 30 || reportedCount > count * 0.5) status = 'warning';
      else status = 'critical';

      stateData[stateCode] = { status, count };
    });

    return stateData;
  };

  const generateActivityFeed = () => {
    const now = new Date();
    const activities = [
      {
        id: '1',
        type: 'improvement' as const,
        message: 'California improved by 12% this week with 15 resolved initiatives',
        state: 'CA',
        change: 12,
        timestamp: new Date(now.getTime() - 15 * 60000)
      },
      {
        id: '2',
        type: 'milestone' as const,
        message: 'National goal reached: 500+ active sustainability initiatives',
        change: undefined,
        timestamp: new Date(now.getTime() - 45 * 60000)
      },
      {
        id: '3',
        type: 'warning' as const,
        message: 'Texas showing increase in unresolved pollution control issues',
        state: 'TX',
        change: -8,
        timestamp: new Date(now.getTime() - 120 * 60000)
      },
      {
        id: '4',
        type: 'improvement' as const,
        message: 'NYC 311 partnership expanded tree planting to 5 new neighborhoods',
        state: 'NY',
        change: 18,
        timestamp: new Date(now.getTime() - 180 * 60000)
      },
      {
        id: '5',
        type: 'update' as const,
        message: 'Data refreshed for 12 states - 23 new initiatives added',
        timestamp: new Date(now.getTime() - 240 * 60000)
      },
      {
        id: '6',
        type: 'milestone' as const,
        message: 'Pacific Northwest achieved 75% resolution rate milestone',
        timestamp: new Date(now.getTime() - 360 * 60000)
      },
      {
        id: '7',
        type: 'improvement' as const,
        message: 'Florida water conservation initiatives up 15% this month',
        state: 'FL',
        change: 15,
        timestamp: new Date(now.getTime() - 480 * 60000)
      }
    ];
    return activities;
  };

  const stateData = getStateData();
  const totalInitiatives = incidents.length;
  const resolvedCount = incidents.filter(inc => inc.status === 'resolved').length;
  const inProgressCount = incidents.filter(inc => inc.status === 'in_progress').length;
  const reportedCount = incidents.filter(inc => inc.status === 'reported').length;
  const overallProgress = totalInitiatives > 0 ? Math.round((resolvedCount / totalInitiatives) * 100) : 0;
  const goalTarget = 75;
  const weeklyGrowth = 8.4;

  const filteredIncidents = selectedState
    ? incidents.filter(inc => inc.location_name?.includes(selectedState))
    : incidents.slice(0, 10);

  if (isLoading) {
    return (
      <>
        <ElevenLabsWidget />
        <div className="pb-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="text-[#D88A2D] animate-pulse mx-auto mb-3" size={40} />
          <p className="text-[#8E2C3A] font-bold">Loading command center...</p>
        </div>
      </div>
      </>
    );
  }

  if (viewMode === 'interactive') {
    return (
      <>
        <ElevenLabsWidget />
        <div className="pb-24 h-screen flex flex-col">
        <div className="sticky top-0 z-10 glass-effect shadow-bakery px-4 py-4 border-b-2 border-[#C77B86]/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#8E2C3A]">Interactive U.S. Map</h1>
              <p className="text-xs text-[#8B4A1C]/70 font-medium">Click states to explore regions and cities</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('heatmap')}
                className="flex items-center gap-2 px-4 py-2 bg-[#F5ECE3] border-2 border-[#C77B86]/30 rounded-full hover:border-[#C77B86] transition-colors"
              >
                <Flame size={16} className="text-[#D88A2D]" />
                <span className="text-sm font-bold text-[#8E2C3A]">Heat Map</span>
              </button>
              <button
                onClick={() => setViewMode('traditional')}
                className="flex items-center gap-2 px-4 py-2 bg-[#F5ECE3] border-2 border-[#C77B86]/30 rounded-full hover:border-[#C77B86] transition-colors"
              >
                <Map size={16} className="text-[#D88A2D]" />
                <span className="text-sm font-bold text-[#8E2C3A]">Dashboard</span>
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <InteractiveUSMap />
        </div>
      </div>
      </>
    );
  }

  if (viewMode === 'heatmap') {
    return (
      <>
        <ElevenLabsWidget />
        <div className="pb-24 min-h-screen">
        <div className="sticky top-0 z-10 glass-effect shadow-bakery px-4 py-4 border-b-2 border-[#C77B86]/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#8E2C3A]">Heat Map</h1>
              <p className="text-xs text-[#8B4A1C]/70 font-medium">Location-based incident visualization</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('interactive')}
                className="flex items-center gap-2 px-4 py-2 bg-[#F5ECE3] border-2 border-[#C77B86]/30 rounded-full hover:border-[#C77B86] transition-colors"
              >
                <Target size={16} className="text-[#D88A2D]" />
                <span className="text-sm font-bold text-[#8E2C3A]">Interactive</span>
              </button>
              <button
                onClick={() => setViewMode('traditional')}
                className="flex items-center gap-2 px-4 py-2 bg-[#F5ECE3] border-2 border-[#C77B86]/30 rounded-full hover:border-[#C77B86] transition-colors"
              >
                <Map size={16} className="text-[#D88A2D]" />
                <span className="text-sm font-bold text-[#8E2C3A]">Dashboard</span>
              </button>
            </div>
          </div>
        </div>
        <HeatMapView userState={userLocation.state} userCity={userLocation.city} />
      </div>
      </>
    );
  }

  return (
    <>
      <ElevenLabsWidget />
      <div className="pb-24 min-h-screen">
      <div className="sticky top-0 z-10 glass-effect shadow-bakery px-4 py-4 border-b-2 border-[#C77B86]/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#8E2C3A]">Command Center</h1>
            <p className="text-xs text-[#8B4A1C]/70 font-medium">National operations dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('interactive')}
              className="flex items-center gap-2 px-4 py-2 bg-[#F5ECE3] border-2 border-[#C77B86]/30 rounded-full hover:border-[#C77B86] transition-colors"
            >
              <Target size={16} className="text-[#D88A2D]" />
              <span className="text-sm font-bold text-[#8E2C3A]">Interactive</span>
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              className="flex items-center gap-2 px-4 py-2 bakery-gradient text-[#F5ECE3] pill-button shadow-md"
            >
              <Flame size={16} />
              <span className="text-sm font-bold">Heat Map</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#D88A2D] rounded-full animate-pulse" />
              <span className="text-xs font-bold text-[#8E2C3A]">Live</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        <div className="grid grid-cols-4 gap-2">
          <div className="bakery-card p-3 border-2 border-[#C77B86]/20">
            <div className="flex items-center gap-2 mb-1">
              <Target size={14} className="text-[#D88A2D]" />
              <span className="text-xs font-bold text-[#8B4A1C]">Total</span>
            </div>
            <p className="text-xl font-bold text-[#8E2C3A]">{totalInitiatives}</p>
            <p className="text-xs text-[#D88A2D] font-bold mt-1">+{weeklyGrowth}% week</p>
          </div>
          <div className="bakery-card p-3 border-2 border-[#C77B86]/20">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={14} className="text-[#D88A2D]" />
              <span className="text-xs font-bold text-[#8B4A1C]">Resolved</span>
            </div>
            <p className="text-xl font-bold text-[#8E2C3A]">{resolvedCount}</p>
            <p className="text-xs text-[#8B4A1C]/70 font-medium mt-1">{overallProgress}% complete</p>
          </div>
          <div className="bakery-card p-3 border-2 border-[#C77B86]/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-[#D88A2D]" />
              <span className="text-xs font-bold text-[#8B4A1C]">Active</span>
            </div>
            <p className="text-xl font-bold text-[#8E2C3A]">{inProgressCount}</p>
            <p className="text-xs text-[#8B4A1C]/70 font-medium mt-1">In progress</p>
          </div>
          <div className="bakery-card p-3 border-2 border-[#C77B86]/20">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={14} className="text-[#D88A2D]" />
              <span className="text-xs font-bold text-[#8B4A1C]">Reported</span>
            </div>
            <p className="text-xl font-bold text-[#8E2C3A]">{reportedCount}</p>
            <p className="text-xs text-[#8B4A1C]/70 font-medium mt-1">Needs action</p>
          </div>
        </div>

        <div className="bakery-card p-4 border-2 border-[#C77B86]/20">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-[#8E2C3A]">National Progress to Goal</h2>
              <p className="text-xs text-[#8B4A1C]/70 font-medium">Target: {goalTarget}% resolution rate</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#D88A2D]">{overallProgress}%</p>
              <p className="text-xs text-[#8B4A1C]/70 font-medium">Current</p>
            </div>
          </div>
          <div className="relative w-full h-3 bg-[#C77B86]/20 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bakery-gradient transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
            <div
              className="absolute top-0 h-full w-0.5 bg-[#8E2C3A]"
              style={{ left: `${goalTarget}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-[#8B4A1C] font-medium">
              {overallProgress >= goalTarget ? (
                <span className="text-[#D88A2D] font-bold">Goal achieved!</span>
              ) : (
                <span>{goalTarget - overallProgress}% to reach goal</span>
              )}
            </p>
            <p className="text-xs text-[#8B4A1C]/70 font-medium">{resolvedCount} of {totalInitiatives} resolved</p>
          </div>
        </div>

        <div className="bakery-card p-4 border-2 border-[#C77B86]/20">
          <h2 className="text-sm font-bold text-[#8E2C3A] mb-3">
            {selectedState ? `${selectedState} State View` : 'National Map'}
          </h2>
          <USAMap
            stateData={stateData}
            onStateClick={(state) => setSelectedState(selectedState === state ? null : state)}
            selectedState={selectedState}
          />
          {selectedState && (
            <button
              onClick={() => setSelectedState(null)}
              className="mt-3 w-full py-2 text-sm font-bold text-[#8E2C3A] hover:bg-[#F1E7D8] rounded-full transition-colors"
            >
              Back to National View
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bakery-card p-4 border-2 border-[#C77B86]/20">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={16} className="text-[#D88A2D]" />
              <h2 className="text-sm font-bold text-[#8E2C3A]">Activity Feed</h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <ActivityFeed activities={generateActivityFeed()} />
            </div>
          </div>

          <div className="bakery-card p-4 border-2 border-[#C77B86]/20">
            <h2 className="text-sm font-bold text-[#8E2C3A] mb-3">
              {selectedState ? `${selectedState} Initiatives` : 'Recent Initiatives'}
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredIncidents.map((incident) => {
                const categoryInfo = getCategoryInfo(incident.category);
                const Icon = categoryInfo.icon;
                return (
                  <div
                    key={incident.id}
                    className="p-3 rounded-2xl bg-[#F1E7D8] border-2 border-[#C77B86]/20 hover:border-[#D88A2D] transition-all"
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-8 h-8 rounded-2xl bg-gradient-to-br ${categoryInfo.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        <Icon className="text-white" size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#8E2C3A] text-xs line-clamp-1 mb-1">
                          {incident.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-[#8B4A1C]/70">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            incident.status === 'resolved' ? 'bg-[#D88A2D]/20 text-[#D88A2D]' :
                            incident.status === 'in_progress' ? 'bg-[#C77B86]/20 text-[#8E2C3A]' :
                            'bg-[#8E2C3A]/20 text-[#8E2C3A]'
                          }`}>
                            {incident.status === 'resolved' ? 'Resolved' :
                             incident.status === 'in_progress' ? 'Active' : 'Reported'}
                          </span>
                          <span className="truncate font-medium">{incident.location_name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
