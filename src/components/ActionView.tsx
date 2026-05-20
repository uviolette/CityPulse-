import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Incident } from '../../types';
import { MapPin, ThumbsUp, Zap, Filter, Sparkles, Heart } from 'lucide-react';
import { getCategoryInfo } from '../../utils/sustainability';
import { ElevenLabsWidget } from '../AIWidget/ElevenLabsWidget';

export function ActionView() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'unresolved' | 'trending'>('unresolved');

  useEffect(() => {
    fetchIncidents();
  }, [filterType]);

  async function fetchIncidents() {
    setIsLoading(true);
    let query = supabase
      .from('incidents')
      .select(`*, user:users(id, display_name, avatar_url), incident_media(*)`)
      .order('upvote_count', { ascending: false });

    if (filterType === 'unresolved') {
      query = query.neq('status', 'resolved');
    }

    const { data } = await query.limit(50);
    if (data) {
      setIncidents(data as unknown as Incident[]);
    }
    setIsLoading(false);
  }

  return (
    <>
      <ElevenLabsWidget />
      <div className="pb-24 min-h-screen">
      <div className="sticky top-0 z-10 glass-effect shadow-bakery px-6 py-4 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="text-[#D88A2D]" size={28} />
            <h1 className="text-2xl font-bold text-[#8E2C3A]">Take Action</h1>
          </div>
          <p className="text-sm text-[#8B4A1C]/70 font-medium">Help make a difference today</p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['all', 'unresolved', 'trending'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterType(filter)}
              className={`px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                filterType === filter
                  ? 'bakery-gradient text-[#F5ECE3] shadow-md'
                  : 'bg-[#F5ECE3] text-[#8E2C3A] border-2 border-[#C77B86]/30 hover:border-[#C77B86]'
              }`}
            >
              {filter === 'all' && <Filter size={16} />}
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 pt-6 space-y-4">
        {isLoading ? (
          <div className="py-12 text-center">
            <Sparkles className="text-[#D88A2D] animate-pulse mx-auto mb-3" size={32} />
            <p className="text-[#8E2C3A] font-medium">Finding ways you can help...</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="py-12 text-center">
            <div className="inline-block p-4 bakery-card shadow-bakery mb-3">
              <span className="text-5xl">🎯</span>
            </div>
            <p className="text-[#8E2C3A] font-bold">No initiatives to act on</p>
            <p className="text-sm text-[#8B4A1C]/70">Check back soon!</p>
          </div>
        ) : (
          incidents.map((incident) => {
            const categoryInfo = getCategoryInfo(incident.category);
            const CategoryIcon = categoryInfo.icon;
            return (
              <div
                key={incident.id}
                className="bakery-card shadow-bakery hover:shadow-lg transition-all overflow-hidden border-2 border-[#C77B86]/20"
              >
                <div className={`h-3 bg-gradient-to-r ${categoryInfo.color}`} />

                <div className="p-5">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-3xl bg-gradient-to-br ${categoryInfo.color} flex items-center justify-center flex-shrink-0 shadow-bakery`}>
                      <span className="text-2xl">{categoryInfo.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#8E2C3A] mb-2 text-lg">{incident.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-[#8B4A1C]/70 font-medium">
                        <MapPin size={14} className="text-[#D88A2D]" />
                        {incident.location_name || 'Unknown location'}
                      </div>
                    </div>
                  </div>

                  {incident.description && (
                    <p className="text-sm text-[#8B4A1C] mb-4 line-clamp-2 leading-relaxed">
                      {incident.description}
                    </p>
                  )}

                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${categoryInfo.bgColor} ${categoryInfo.textColor} text-xs font-bold ${categoryInfo.borderColor} border-2 mb-4`}>
                    <CategoryIcon size={14} />
                    {categoryInfo.label}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center justify-center gap-2 py-3 bg-[#8E2C3A]/10 rounded-2xl border-2 border-[#8E2C3A]/20">
                      <ThumbsUp size={18} className="text-[#8E2C3A]" />
                      <span className="font-bold text-[#8E2C3A]">{incident.upvote_count}</span>
                      <span className="text-xs text-[#8E2C3A]/70 font-bold">supports</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 py-3 bg-[#D88A2D]/10 rounded-2xl border-2 border-[#D88A2D]/20">
                      <Heart size={18} className="text-[#D88A2D]" />
                      <span className="font-bold text-[#D88A2D]">{incident.volunteer_count}</span>
                      <span className="text-xs text-[#D88A2D]/70 font-bold">volunteers</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button className="py-3 bakery-gradient hover:opacity-90 text-[#F5ECE3] rounded-full transition-all font-bold text-sm pill-button flex items-center justify-center gap-2">
                      <ThumbsUp size={16} />
                      Support
                    </button>
                    <button className="py-3 bg-gradient-to-r from-[#D88A2D] to-[#8B4A1C] hover:opacity-90 text-[#F5ECE3] rounded-full transition-all font-bold text-sm pill-button flex items-center justify-center gap-2">
                      <Zap size={16} />
                      Volunteer
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
    </>
  );
}
