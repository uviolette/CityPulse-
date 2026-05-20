import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Action, Incident } from '../../types';
import { Clock, ThumbsUp, Zap, Building2, Users, TrendingUp, Award, Target } from 'lucide-react';
import { getCategoryInfo, organizations } from '../../utils/sustainability';
import { ElevenLabsWidget } from '../AIWidget/ElevenLabsWidget';

export function ActivityView() {
  const [actions, setActions] = useState<(Action & { incident: Incident })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActions();
  }, []);

  async function fetchActions() {
    setIsLoading(true);
    const { data } = await supabase
      .from('actions')
      .select(`*, incident:incidents(*)`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      setActions(data as unknown as (Action & { incident: Incident })[]);
    }
    setIsLoading(false);
  }

  const timeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const exampleActivities = [
    {
      id: 'org-1',
      organization: organizations[0],
      type: 'initiative',
      title: 'NYC 311 Street Tree Planting Initiative',
      description: 'Partnership with NYC Parks Department to plant 1,000 street trees across Manhattan',
      location: 'Manhattan, NY',
      volunteers: 67,
      supporters: 284,
      category: 'tree_planting',
      timestamp: '2h ago'
    },
    {
      id: 'org-2',
      organization: organizations[1],
      type: 'milestone',
      title: 'EPA Region 2 Water Quality Standards Met',
      description: 'Hudson River cleanup initiative achieved federal water quality standards',
      location: 'New York, NY',
      volunteers: 156,
      supporters: 423,
      category: 'water_conservation',
      timestamp: '4h ago'
    },
    {
      id: 'org-3',
      organization: organizations[5],
      type: 'initiative',
      title: 'Sierra Club Chicago River Cleanup Partnership',
      description: 'Monthly river cleanup events coordinated with Sierra Club Illinois Chapter',
      location: 'Chicago, IL',
      volunteers: 89,
      supporters: 198,
      category: 'pollution_control',
      timestamp: '6h ago'
    },
    {
      id: 'org-4',
      organization: organizations[4],
      type: 'expansion',
      title: 'The Nature Conservancy Coastal Restoration',
      description: 'Expanded habitat restoration program to 10 new coastal sites',
      location: 'Boston Harbor, MA',
      volunteers: 145,
      supporters: 312,
      category: 'sustainable_agriculture',
      timestamp: '8h ago'
    },
    {
      id: 'org-5',
      organization: organizations[8],
      type: 'initiative',
      title: 'Urban Green Council Building Efficiency Program',
      description: 'Commercial building energy audits and HVAC upgrades across Dallas',
      location: 'Dallas, TX',
      volunteers: 34,
      supporters: 167,
      category: 'energy_efficiency',
      timestamp: '12h ago'
    },
    {
      id: 'org-6',
      organization: organizations[2],
      type: 'milestone',
      title: 'NYC Parks Department Green Spaces Initiative',
      description: 'Converted 5 vacant lots into community gardens in Brooklyn',
      location: 'Brooklyn, NY',
      volunteers: 123,
      supporters: 445,
      category: 'community_gardens',
      timestamp: '1d ago'
    }
  ];

  const totalVolunteers = exampleActivities.reduce((sum, act) => sum + act.volunteers, 0);
  const totalSupporters = exampleActivities.reduce((sum, act) => sum + act.supporters, 0);
  const activeOrgs = new Set(exampleActivities.map(act => act.organization.name)).size;

  return (
    <>
      <ElevenLabsWidget />
      <div className="pb-24 min-h-screen">
      <div className="sticky top-0 z-10 glass-effect shadow-bakery px-5 py-4 border-b-2 border-[#C77B86]/20">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="text-[#D88A2D]" size={24} />
          <h1 className="text-xl font-bold text-[#8E2C3A]">Activity Feed</h1>
        </div>
        <p className="text-xs text-[#8B4A1C]/70 font-medium">Real-time partnerships and initiatives</p>
      </div>

      <div className="px-5 pt-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bakery-card p-3 border-2 border-[#C77B86]/20">
            <div className="flex items-center gap-2 mb-1">
              <Building2 size={14} className="text-[#D88A2D]" />
              <span className="text-xs font-bold text-[#8B4A1C]">Orgs</span>
            </div>
            <p className="text-xl font-bold text-[#8E2C3A]">{activeOrgs}</p>
          </div>
          <div className="bakery-card p-3 border-2 border-[#C77B86]/20">
            <div className="flex items-center gap-2 mb-1">
              <Users size={14} className="text-[#D88A2D]" />
              <span className="text-xs font-bold text-[#8B4A1C]">Volunteers</span>
            </div>
            <p className="text-xl font-bold text-[#8E2C3A]">{totalVolunteers}</p>
          </div>
          <div className="bakery-card p-3 border-2 border-[#C77B86]/20">
            <div className="flex items-center gap-2 mb-1">
              <ThumbsUp size={14} className="text-[#D88A2D]" />
              <span className="text-xs font-bold text-[#8B4A1C]">Support</span>
            </div>
            <p className="text-xl font-bold text-[#8E2C3A]">{totalSupporters}</p>
          </div>
        </div>

        <div className="bakery-card p-4 border-2 border-[#C77B86]/20">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#8E2C3A]">Partner Organizations</h2>
            <span className="text-xs text-[#8B4A1C]/70 font-medium">{organizations.length} active</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {organizations.slice(0, 6).map((org, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-[#F1E7D8] border-2 border-[#C77B86]/20 hover:border-[#D88A2D] hover:bg-[#F5ECE3] transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Building2 size={14} className="text-[#D88A2D]" />
                  <h3 className="text-xs font-bold text-[#8E2C3A] truncate">{org.name}</h3>
                </div>
                <p className="text-xs text-[#8B4A1C]/70 font-medium">{org.type}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#8E2C3A]">Recent Organization Activity</h2>
            <span className="text-xs text-[#8B4A1C]/70 font-medium">{exampleActivities.length} initiatives</span>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="py-12 text-center bakery-card border-2 border-[#C77B86]/20">
                <TrendingUp className="text-[#D88A2D] animate-pulse mx-auto mb-3" size={32} />
                <p className="text-[#8E2C3A] font-medium">Loading activity...</p>
              </div>
            ) : (
              exampleActivities.map((activity) => {
                const categoryInfo = getCategoryInfo(activity.category);
                const Icon = categoryInfo.icon;
                return (
                  <div
                    key={activity.id}
                    className="bakery-card shadow-bakery hover:shadow-lg transition-all p-4 border-2 border-[#C77B86]/20 hover:border-[#C77B86]/40"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${categoryInfo.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        <Icon className="text-white" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 size={12} className="text-[#D88A2D]" />
                          <span className="text-xs font-bold text-[#D88A2D]">{activity.organization.name}</span>
                          <span className="text-xs text-[#8B4A1C]/50">•</span>
                          <span className="text-xs text-[#8B4A1C]/70 font-medium">{activity.organization.type}</span>
                        </div>
                        <h3 className="text-sm font-bold text-[#8E2C3A] mb-1 leading-snug">
                          {activity.title}
                        </h3>
                        <p className="text-xs text-[#8B4A1C] leading-relaxed mb-2">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs">
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${categoryInfo.bgColor} ${categoryInfo.textColor} font-bold border ${categoryInfo.borderColor}`}>
                            <Icon size={11} />
                            {categoryInfo.label}
                          </div>
                          <span className="text-[#8B4A1C]/70 font-medium">{activity.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t-2 border-[#C77B86]/10">
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1 text-[#D88A2D] font-bold">
                          <Users size={13} />
                          <span>{activity.volunteers}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[#8E2C3A] font-bold">
                          <ThumbsUp size={13} />
                          <span>{activity.supporters}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#8B4A1C]/70 font-medium">
                        <Clock size={11} />
                        {activity.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {actions.length > 0 && (
          <div className="bakery-card p-4 border-2 border-[#C77B86]/20">
            <h2 className="text-sm font-bold text-[#8E2C3A] mb-3">Community Actions</h2>
            <div className="space-y-2">
              {actions.slice(0, 10).map((action) => {
                const categoryInfo = action.incident ? getCategoryInfo(action.incident.category) : null;
                const Icon = categoryInfo?.icon;
                return (
                  <div
                    key={action.id}
                    className="p-3 rounded-2xl bg-[#F1E7D8] border-2 border-[#C77B86]/20 hover:border-[#D88A2D] transition-all"
                  >
                    <div className="flex items-start gap-3">
                      {categoryInfo && Icon && (
                        <div className={`w-8 h-8 rounded-2xl bg-gradient-to-br ${categoryInfo.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                          <Icon className="text-white" size={16} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {action.action_type === 'upvote' ? (
                            <div className="flex items-center gap-1 text-[#8E2C3A]">
                              <ThumbsUp size={12} />
                              <span className="text-xs font-bold">Supporter</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-[#D88A2D]">
                              <Zap size={12} />
                              <span className="text-xs font-bold">Volunteer</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-[#8E2C3A] font-bold line-clamp-1 mb-1">
                          {action.incident?.title}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-[#8B4A1C]/70 font-medium">
                          <Clock size={10} />
                          {timeAgo(action.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
