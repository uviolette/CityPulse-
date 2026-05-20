import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { Incident } from '../../types';
import { FeedItem } from './FeedItem';
import { Plus, RefreshCw, Filter, MapPin, Users } from 'lucide-react';
import { sustainabilityCategories } from '../../utils/sustainability';
import { ElevenLabsWidget } from '../AIWidget/ElevenLabsWidget';

interface HomeFeedProps {
  onOpenDetail: (incident: Incident) => void;
  onOpenCreate: () => void;
}

export function HomeFeed({ onOpenDetail, onOpenCreate }: HomeFeedProps) {
  const { t } = useTranslation();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchIncidents();
  }, [selectedCategory]);

  async function fetchIncidents() {
    setIsLoading(true);
    let query = supabase
      .from('incidents')
      .select(
        `
        *,
        user:users(id, display_name, avatar_url),
        incident_media(*)
      `
      )
      .order('created_at', { ascending: false });

    if (selectedCategory !== 'all') {
      query = query.eq('category', selectedCategory);
    }

    const { data, error } = await query.limit(50);

    if (!error && data) {
      setIncidents(data as unknown as Incident[]);
    }
    setIsLoading(false);
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    await fetchIncidents();
    setIsRefreshing(false);
  }

  const totalParticipants = incidents.reduce((sum, inc) => sum + inc.volunteer_count, 0);
  const activeInitiatives = incidents.filter(inc => inc.status !== 'resolved').length;

  return (
    <>
      <ElevenLabsWidget />
      <div className="pb-24 min-h-screen">
      <div className="sticky top-0 z-10 glass-effect shadow-cool">
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="heading-serif text-3xl text-blue-600 mb-0.5">
                {t('app.name')}
              </h1>
              <p className="heading-script text-lg text-blue-400">
                {t('home.subtitle')}
              </p>
            </div>
            <button
              onClick={onOpenCreate}
              className="p-3 cool-gradient text-white rounded-2xl shadow-cool hover:scale-105 transition-transform"
            >
              <Plus size={22} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="cool-card p-4 border-2 border-gray-100">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <MapPin size={14} />
                <span className="text-xs font-bold">{t('status.active')}</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{activeInitiatives}</p>
            </div>
            <div className="cool-card p-4 border-2 border-gray-100">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Users size={14} />
                <span className="text-xs font-bold">{t('home.volunteer')}</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{totalParticipants}</p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedCategory === 'all'
                  ? 'cool-gradient text-white shadow-md'
                  : 'bg-white text-blue-600 border-2 border-gray-200 hover:border-blue-300'
              }`}
            >
              <Filter size={14} />
              {t('home.allCategories')}
            </button>
            {Object.entries(sustainabilityCategories).map(([key, info]) => {
              const Icon = info.icon;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                    selectedCategory === key
                      ? `bg-gradient-to-r ${info.color} text-white shadow-md`
                      : `bg-white ${info.textColor} border-2 ${info.borderColor}`
                  }`}
                >
                  <Icon size={14} />
                  {info.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-5 pt-4 space-y-3">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="w-full py-3 cool-card text-blue-600 hover:bg-gray-50 font-bold flex items-center justify-center gap-2 transition-all border-2 border-gray-100"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? t('common.loading') : t('home.refreshFeed')}
        </button>

        {isLoading ? (
          <div className="py-16 text-center">
            <div className="inline-block p-4 cool-card shadow-cool mb-3">
              <RefreshCw className="text-blue-600 animate-spin" size={28} />
            </div>
            <p className="text-blue-600 font-semibold">{t('home.loadingIncidents')}</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="py-16 text-center">
            <div className="inline-block p-4 cool-card shadow-cool mb-3">
              <MapPin className="text-blue-400" size={32} />
            </div>
            <p className="text-blue-600 font-bold mb-2">{t('home.noIncidents')}</p>
            <p className="text-sm text-gray-600">{t('home.createInitiative')}</p>
          </div>
        ) : (
          incidents.map((incident) => (
            <FeedItem
              key={incident.id}
              incident={incident}
              onTap={() => onOpenDetail(incident)}
            />
          ))
        )}
      </div>
    </div>
    </>
  );
}
