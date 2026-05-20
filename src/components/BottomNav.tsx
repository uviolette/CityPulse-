import React from 'react';
import { Home, Activity, Zap, Map, User, Gift, Heart, Shield } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { t } = useLanguage();

  const tabs = [
    { id: 'home', label: t('nav.home'), icon: Home },
    { id: 'activity', label: t('nav.activity'), icon: Activity },
    { id: 'action', label: t('nav.action'), icon: Zap },
    { id: 'map', label: t('nav.map'), icon: Map },
    { id: 'rewards', label: t('rewards.title'), icon: Gift },
    { id: 'donations', label: t('donation.title'), icon: Heart },
    { id: 'preferences', label: t('preferences.title'), icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-effect shadow-cool z-50 border-t-2 border-gray-100">
      <div className="flex items-center overflow-x-auto px-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex-1 min-w-[70px] py-3 px-1 flex flex-col items-center gap-1 transition-all relative ${
              activeTab === id
                ? 'text-blue-600'
                : 'text-gray-400 hover:text-blue-600'
            }`}
          >
            {activeTab === id && (
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-1 cool-gradient rounded-full shadow-sm" />
            )}
            <Icon size={20} className={activeTab === id ? 'scale-110' : ''} />
            <span className="text-[9px] font-bold whitespace-nowrap">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
