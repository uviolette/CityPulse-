import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { UserPreferences, UserStats } from '../../types';
import { Bell, MapPin, Filter, Shield, LogOut, Award, Sparkles, TrendingUp, Leaf, Navigation, Volume2, VolumeX } from 'lucide-react';
import { getImpactLevel } from '../../utils/sustainability';
import { updateUserLocation } from '../../utils/zipcode';
import { AccessibilityPanel } from '../Accessibility/AccessibilityPanel';

interface PreferencesViewProps {
  onNavigateToAdmin?: () => void;
}

export function PreferencesView({ onNavigateToAdmin }: PreferencesViewProps) {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [radius, setRadius] = useState(5);
  const [notifications, setNotifications] = useState(true);
  const [zipCode, setZipCode] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [zipError, setZipError] = useState('');
  const [zipSuccess, setZipSuccess] = useState('');

  useEffect(() => {
    if (user) {
      fetchPreferencesAndStats();
      fetchUserLocation();
    }
  }, [user]);

  async function fetchUserLocation() {
    if (!user) return;

    const { data } = await supabase
      .from('users')
      .select('zip_code, location_name')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setZipCode(data.zip_code || '');
      setCurrentLocation(data.location_name || 'Not set');
    }
  }

  async function fetchPreferencesAndStats() {
    setIsLoading(true);
    const [prefsResponse, statsResponse] = await Promise.all([
      supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle(),
      supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle(),
    ]);

    if (prefsResponse.data) {
      setPreferences(prefsResponse.data);
      setRadius(prefsResponse.data.search_radius_km);
      setNotifications(prefsResponse.data.notification_enabled);
    }

    if (statsResponse.data) {
      setStats(statsResponse.data);
    }

    setIsLoading(false);
  }

  async function handleUpdateZipCode() {
    if (!user || !zipCode.trim()) {
      setZipError(t('preferences.enterZipCodeError'));
      return;
    }

    setZipError('');
    setZipSuccess('');

    try {
      const location = await updateUserLocation(user.id, zipCode.trim());
      setCurrentLocation(`${location.city}, ${location.county}, ${location.stateAbbr}`);
      setZipSuccess(t('preferences.locationUpdated'));
      setTimeout(() => setZipSuccess(''), 3000);
    } catch (error) {
      setZipError(error instanceof Error ? error.message : t('preferences.locationError'));
    }
  }

  async function updatePreferences() {
    if (!user) return;

    await supabase
      .from('user_preferences')
      .update({
        search_radius_km: radius,
        notification_enabled: notifications,
      })
      .eq('user_id', user.id);
  }

  async function handleSignOut() {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  }

  const impactLevel = getImpactLevel(stats?.impact_score || 0);

  return (
    <div className="pb-24 min-h-screen">
      <div className="sticky top-0 z-10 glass-effect shadow-bakery px-6 py-4">
        <h1 className="text-2xl font-bold text-[#8E2C3A]">{t('preferences.title')}</h1>
        <p className="text-sm text-[#8B4A1C]/70 font-medium">{t('preferences.subtitle')}</p>
      </div>

      <div className="px-6 pt-6 space-y-6">
        {isLoading ? (
          <div className="py-12 text-center">
            <Sparkles className="text-[#D88A2D] animate-pulse mx-auto mb-3" size={32} />
            <p className="text-[#8E2C3A] font-medium">{t('preferences.loading')}</p>
          </div>
        ) : (
          <>
            <div className="bakery-card shadow-bakery p-6 border-2 border-[#C77B86]/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bakery-gradient flex items-center justify-center text-4xl shadow-bakery">
                  {impactLevel.emoji}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[#8E2C3A]">{user?.display_name || user?.username}</h2>
                  <p className={`text-sm font-bold ${impactLevel.color} flex items-center gap-1`}>
                    <Award size={16} />
                    {impactLevel.label}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#8B4A1C] font-medium">{t('preferences.impactLevel')}</span>
                  <span className="font-bold text-[#D88A2D]">{stats?.impact_score || 0} pts</span>
                </div>
                <div className="w-full h-3 bg-[#C77B86]/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bakery-gradient transition-all duration-500"
                    style={{ width: `${Math.min((stats?.impact_score || 0) / 10, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-[#8B4A1C]/70 text-center font-medium">Keep going! Every action counts.</p>
              </div>
            </div>

            <div className="bakery-gradient rounded-3xl shadow-bakery p-6 text-[#F5ECE3]">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={24} />
                <h2 className="text-xl font-bold">{t('preferences.yourImpact')}</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F5ECE3]/20 backdrop-blur-sm rounded-3xl p-4 border-2 border-[#F5ECE3]/30">
                  <div className="text-3xl mb-1">🌱</div>
                  <p className="text-3xl font-bold mb-1">{stats?.issues_reported || 0}</p>
                  <p className="text-sm text-[#F5ECE3]/90 font-medium">{t('preferences.initiativesStarted')}</p>
                </div>
                <div className="bg-[#F5ECE3]/20 backdrop-blur-sm rounded-3xl p-4 border-2 border-[#F5ECE3]/30">
                  <div className="text-3xl mb-1">💪</div>
                  <p className="text-3xl font-bold mb-1">{stats?.times_volunteered || 0}</p>
                  <p className="text-sm text-[#F5ECE3]/90 font-medium">{t('preferences.timesVolunteered')}</p>
                </div>
                <div className="bg-[#F5ECE3]/20 backdrop-blur-sm rounded-3xl p-4 border-2 border-[#F5ECE3]/30">
                  <div className="text-3xl mb-1">✅</div>
                  <p className="text-3xl font-bold mb-1">{stats?.issues_helped_fix || 0}</p>
                  <p className="text-sm text-[#F5ECE3]/90 font-medium">{t('preferences.issuesResolved')}</p>
                </div>
                <div className="bg-[#F5ECE3]/20 backdrop-blur-sm rounded-3xl p-4 border-2 border-[#F5ECE3]/30">
                  <div className="text-3xl mb-1">👍</div>
                  <p className="text-3xl font-bold mb-1">{stats?.upvotes_given || 0}</p>
                  <p className="text-sm text-[#F5ECE3]/90 font-medium">{t('preferences.upvotesGiven')}</p>
                </div>
              </div>
            </div>

            <div className="bakery-card shadow-bakery p-6 border-2 border-[#C77B86]/20">
              <h3 className="text-lg font-bold text-[#8E2C3A] flex items-center gap-2 mb-4">
                <Award size={22} className="text-[#D88A2D]" />
                {t('preferences.achievements')}
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-4 bg-gradient-to-br from-[#F1E7D8] to-[#F5ECE3] border-2 border-[#D88A2D]/30 rounded-3xl hover:scale-105 transition-transform cursor-pointer">
                  <div className="text-4xl mb-2">🏆</div>
                  <p className="text-xs font-bold text-[#8E2C3A]">{t('achievements.firstInitiative')}</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-[#F1E7D8] to-[#F5ECE3] border-2 border-[#C77B86]/30 rounded-3xl hover:scale-105 transition-transform cursor-pointer">
                  <div className="text-4xl mb-2">❤️</div>
                  <p className="text-xs font-bold text-[#8E2C3A]">{t('achievements.activeHelper')}</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-[#F1E7D8] to-[#F5ECE3] border-2 border-[#D88A2D]/30 rounded-3xl hover:scale-105 transition-transform cursor-pointer">
                  <div className="text-4xl mb-2">⭐</div>
                  <p className="text-xs font-bold text-[#8E2C3A]">{t('achievements.communityStar')}</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-[#F1E7D8] to-[#F5ECE3] border-2 border-[#D88A2D]/30 rounded-3xl hover:scale-105 transition-transform cursor-pointer">
                  <div className="text-4xl mb-2">🌳</div>
                  <p className="text-xs font-bold text-[#8E2C3A]">{t('achievements.treeHugger')}</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-[#F1E7D8] to-[#F5ECE3] border-2 border-[#C77B86]/20 rounded-3xl hover:scale-105 transition-transform cursor-pointer opacity-40">
                  <div className="text-4xl mb-2">🎖️</div>
                  <p className="text-xs font-bold text-[#8E2C3A]">{t('achievements.warrior')}</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-[#F1E7D8] to-[#F5ECE3] border-2 border-[#C77B86]/20 rounded-3xl hover:scale-105 transition-transform cursor-pointer opacity-40">
                  <div className="text-4xl mb-2">👑</div>
                  <p className="text-xs font-bold text-[#8E2C3A]">{t('achievements.champion')}</p>
                </div>
              </div>
            </div>

            <div className="bakery-card shadow-bakery p-6 border-2 border-[#C77B86]/20 space-y-5">
              <h3 className="text-lg font-bold text-[#8E2C3A] flex items-center gap-2">
                <Filter size={22} className="text-[#D88A2D]" />
                {t('preferences.preferencesTitle')}
              </h3>

              <div className="bg-gradient-to-br from-[#D88A2D]/10 to-[#F1E7D8] border-2 border-[#D88A2D]/30 rounded-3xl p-4">
                <label className="flex items-center gap-3 mb-3 text-sm font-bold text-[#8E2C3A]">
                  <Navigation size={18} className="text-[#D88A2D]" />
                  {t('preferences.yourLocation')}
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder={t('preferences.enterZipCode')}
                      maxLength={5}
                      className="flex-1 px-4 py-3 bg-[#F5ECE3] border-2 border-[#D88A2D]/40 rounded-full focus:outline-none focus:ring-2 focus:ring-[#D88A2D] font-bold text-[#8E2C3A]"
                    />
                    <button
                      onClick={handleUpdateZipCode}
                      className="px-6 py-3 bg-gradient-to-r from-[#D88A2D] to-[#8B4A1C] text-[#F5ECE3] rounded-full font-bold hover:opacity-90 transition-all shadow-md"
                    >
                      {t('preferences.update')}
                    </button>
                  </div>
                  {currentLocation && (
                    <div className="text-sm text-[#8E2C3A] font-bold">
                      <span className="font-bold">{t('preferences.current')}:</span> {currentLocation}
                    </div>
                  )}
                  {zipError && (
                    <div className="text-sm text-[#8E2C3A] font-medium bg-[#C77B86]/20 px-3 py-2 rounded-full">
                      {zipError}
                    </div>
                  )}
                  {zipSuccess && (
                    <div className="text-sm text-[#D88A2D] font-medium bg-[#D88A2D]/20 px-3 py-2 rounded-full">
                      {zipSuccess}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 mb-3 text-sm font-bold text-[#8E2C3A]">
                  <MapPin size={18} className="text-[#D88A2D]" />
                  {t('preferences.searchRadius')}: {radius} km
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full h-2 bg-[#C77B86]/30 rounded-full appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-[#F1E7D8] rounded-3xl hover:bg-[#F5ECE3] transition-colors">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-[#C77B86] text-[#8E2C3A] focus:ring-2 focus:ring-[#8E2C3A]"
                  />
                  <Bell size={20} className="text-[#D88A2D]" />
                  <span className="text-sm font-bold text-[#8E2C3A] flex-1">{t('preferences.pushNotifications')}</span>
                </label>
              </div>

              <button
                onClick={updatePreferences}
                className="w-full py-4 bakery-gradient text-[#F5ECE3] pill-button font-bold"
              >
                {t('preferences.savePreferences')}
              </button>
            </div>

            <AccessibilityPanel />

            <div className="bakery-card shadow-bakery p-6 border-2 border-[#C77B86]/20">
              <h3 className="text-lg font-bold text-[#8E2C3A] mb-4 flex items-center gap-2">
                <Sparkles size={22} className="text-[#D88A2D]" />
                {t('preferences.appSettings')}
              </h3>

              <div>
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-[#F1E7D8] rounded-3xl hover:bg-[#F5ECE3] transition-colors">
                  <input
                    type="checkbox"
                    checked={useTheme().uiSoundsEnabled}
                    onChange={() => useTheme().toggleUiSounds()}
                    className="w-5 h-5 rounded border-2 border-[#C77B86] text-[#8E2C3A] focus:ring-2 focus:ring-[#8E2C3A]"
                  />
                  {useTheme().uiSoundsEnabled ? (
                    <Volume2 size={20} className="text-[#D88A2D]" />
                  ) : (
                    <VolumeX size={20} className="text-[#8B4A1C]/50" />
                  )}
                  <span className="text-sm font-bold text-[#8E2C3A] flex-1">{t('preferences.uiSoundEffects')}</span>
                </label>
              </div>
            </div>

            <div className="bakery-card shadow-bakery p-6 border-2 border-[#C77B86]/20">
              <h3 className="text-lg font-bold text-[#8E2C3A] mb-4">{t('preferences.account')}</h3>
              <div className="p-4 bg-[#D88A2D]/10 border-2 border-[#D88A2D]/30 rounded-3xl">
                <p className="text-xs font-bold text-[#8E2C3A] mb-1">{t('preferences.username')}</p>
                <p className="text-sm text-[#8E2C3A] font-bold">{user?.username}</p>
              </div>
            </div>

            {onNavigateToAdmin && (
              <button
                onClick={onNavigateToAdmin}
                className="w-full py-4 bg-gradient-to-r from-[#8B4A1C] to-[#D88A2D] hover:opacity-90 text-[#F5ECE3] pill-button font-bold flex items-center justify-center gap-2"
              >
                <Shield size={20} />
                {t('navigation.admin')}
              </button>
            )}

            <button
              onClick={handleSignOut}
              className="w-full py-4 bg-gradient-to-r from-[#9B2E3D] to-[#8E2C3A] hover:opacity-90 text-[#F5ECE3] pill-button font-bold flex items-center justify-center gap-2"
            >
              <LogOut size={20} />
              {t('preferences.signOut')}
            </button>

            <div className="text-center space-y-2 pt-4 pb-6">
              <div className="flex items-center justify-center gap-2 text-sm text-[#8B4A1C] font-medium">
                <Leaf size={16} className="text-[#D88A2D]" />
                <span>{t('app.version')}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-[#8B4A1C]/70 font-medium">
                <Shield size={14} />
                <span>{t('app.dataSecure')}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
