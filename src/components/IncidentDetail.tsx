import React, { useState, useEffect } from 'react';
import { Incident } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { X, ThumbsUp, Zap, Share2, MapPin, Clock, Award } from 'lucide-react';
import { getCategoryInfo } from '../../utils/sustainability';

interface IncidentDetailProps {
  incident: Incident;
  onClose: () => void;
}

export function IncidentDetail({ incident, onClose }: IncidentDetailProps) {
  const { user } = useAuth();
  const [upvoted, setUpvoted] = useState(false);
  const [volunteered, setVolunteered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const categoryInfo = getCategoryInfo(incident.category);
  const CategoryIcon = categoryInfo.icon;

  useEffect(() => {
    if (user) {
      fetchUserActions();
    }
  }, [user, incident.id]);

  async function fetchUserActions() {
    const { data } = await supabase
      .from('actions')
      .select('*')
      .eq('incident_id', incident.id)
      .eq('user_id', user?.id);

    if (data) {
      setUpvoted(data.some((a) => a.action_type === 'upvote'));
      setVolunteered(data.some((a) => a.action_type === 'volunteer'));
    }
  }

  async function handleUpvote() {
    if (!user) return;
    setIsLoading(true);

    try {
      if (upvoted) {
        await supabase
          .from('actions')
          .delete()
          .eq('incident_id', incident.id)
          .eq('user_id', user.id)
          .eq('action_type', 'upvote');
      } else {
        await supabase.from('actions').insert({
          incident_id: incident.id,
          user_id: user.id,
          action_type: 'upvote',
        });
      }
      setUpvoted(!upvoted);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVolunteer() {
    if (!user) return;
    setIsLoading(true);

    try {
      if (volunteered) {
        await supabase
          .from('actions')
          .delete()
          .eq('incident_id', incident.id)
          .eq('user_id', user.id)
          .eq('action_type', 'volunteer');
      } else {
        await supabase.from('actions').insert({
          incident_id: incident.id,
          user_id: user.id,
          action_type: 'volunteer',
        });
      }
      setVolunteered(!volunteered);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleShare() {
    const shareData = {
      title: incident.title,
      text: `Check out this initiative: ${incident.title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
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

  return (
    <div className="fixed inset-0 bg-[#8E2C3A]/40 backdrop-blur-sm z-50 flex items-end animate-fadeIn">
      <div className="w-full bg-[#F5ECE3] rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-bakery">
        <div className={`h-3 bg-gradient-to-r ${categoryInfo.color}`} />

        <div className="sticky top-0 bg-[#F5ECE3]/95 backdrop-blur-md border-b-2 border-[#C77B86]/20 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-[#8E2C3A]">Initiative Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#C77B86]/20 rounded-2xl transition-colors"
          >
            <X size={24} className="text-[#8E2C3A]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className={`flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br ${categoryInfo.color} shadow-bakery mx-auto`}>
            <span className="text-4xl">{categoryInfo.emoji}</span>
          </div>

          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${categoryInfo.bgColor} ${categoryInfo.textColor} text-sm font-bold ${categoryInfo.borderColor} border-2 mb-3 shadow-sm`}>
              <CategoryIcon size={16} />
              {categoryInfo.label}
            </div>
            <h3 className="text-2xl font-bold text-[#8E2C3A] mb-2">{incident.title}</h3>
            <div className="flex items-center justify-center gap-2 text-sm text-[#8B4A1C]/70 font-medium">
              <Clock size={16} />
              {timeAgo(incident.created_at)}
            </div>
          </div>

          {incident.description && (
            <div className="bg-[#F1E7D8] rounded-3xl p-5 border-2 border-[#C77B86]/20">
              <p className="text-[#8B4A1C] leading-relaxed">{incident.description}</p>
            </div>
          )}

          <div className="bg-[#D88A2D]/10 rounded-3xl p-5 border-2 border-[#D88A2D]/30">
            <div className="flex items-center gap-2 text-[#D88A2D] mb-2">
              <MapPin size={18} />
              <span className="font-bold text-sm">Location</span>
            </div>
            <p className="text-[#8E2C3A] font-bold">{incident.location_name || 'Unknown location'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bakery-gradient rounded-3xl p-5 text-[#F5ECE3] text-center shadow-bakery">
              <ThumbsUp size={24} className="mx-auto mb-2" />
              <div className="text-3xl font-bold mb-1">{incident.upvote_count}</div>
              <p className="text-sm text-[#F5ECE3]/80 font-medium">People agree</p>
            </div>
            <div className="bg-gradient-to-br from-[#D88A2D] to-[#8B4A1C] rounded-3xl p-5 text-[#F5ECE3] text-center shadow-bakery">
              <Zap size={24} className="mx-auto mb-2" />
              <div className="text-3xl font-bold mb-1">{incident.volunteer_count}</div>
              <p className="text-sm text-[#F5ECE3]/80 font-medium">Volunteering</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleUpvote}
              disabled={isLoading}
              className={`w-full py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 transition-all pill-button ${
                upvoted
                  ? 'bakery-gradient text-[#F5ECE3]'
                  : 'bg-[#F5ECE3] text-[#8E2C3A] border-2 border-[#C77B86]/40 hover:border-[#C77B86]'
              }`}
            >
              <ThumbsUp size={22} className={upvoted ? 'fill-current' : ''} />
              {upvoted ? 'You support this!' : 'Support This'}
            </button>

            <button
              onClick={handleVolunteer}
              disabled={isLoading}
              className={`w-full py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 transition-all pill-button ${
                volunteered
                  ? 'bg-gradient-to-r from-[#D88A2D] to-[#8B4A1C] text-[#F5ECE3]'
                  : 'bg-[#F5ECE3] text-[#D88A2D] border-2 border-[#D88A2D]/40 hover:border-[#D88A2D]'
              }`}
            >
              <Zap size={22} className={volunteered ? 'fill-current' : ''} />
              {volunteered ? 'Already Volunteering!' : 'Volunteer to Help'}
            </button>

            <button
              onClick={handleShare}
              className="w-full py-4 rounded-full font-bold text-lg bg-[#F5ECE3] text-[#8B4A1C] border-2 border-[#C77B86]/30 hover:border-[#C77B86] transition-all flex items-center justify-center gap-3 pill-button"
            >
              <Share2 size={22} />
              Share Initiative
            </button>
          </div>

          {(upvoted || volunteered) && (
            <div className="bg-gradient-to-r from-[#F1E7D8] to-[#F5ECE3] rounded-3xl p-5 border-2 border-[#D88A2D]/30 flex items-start gap-3">
              <Award className="text-[#D88A2D] flex-shrink-0" size={24} />
              <div>
                <p className="font-bold text-[#8E2C3A] mb-1">Great job!</p>
                <p className="text-sm text-[#8B4A1C]">Your contribution makes a difference in building our community.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
