import React, { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { VoiceCommandProvider } from './contexts/VoiceCommandContext';
import { AuthForm } from './components/Auth/AuthForm';
import { LanguageSelector } from './components/LanguageSelector/LanguageSelector';
import { ThemeToggle } from './components/ThemeToggle/ThemeToggle';
import { BackgroundParticles } from './components/BackgroundParticles/BackgroundParticles';
import { BottomNav } from './components/Navigation/BottomNav';
import { HomeFeed } from './components/Home/HomeFeed';
import { ActivityView } from './components/Activity/ActivityView';
import { ActionView } from './components/Action/ActionView';
import { MapView } from './components/Map/MapView';
import { PreferencesView } from './components/Preferences/PreferencesView';
import { GiftCardsView } from './components/Rewards/GiftCardsView';
import { DonationsView } from './components/Donations/DonationsView';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { IncidentDetail } from './components/Home/IncidentDetail';
import { CreateIncident } from './components/Create/CreateIncident';
import { VoiceAssistant } from './components/VoiceAssistant/VoiceAssistant';
import { ChatBot } from './components/ChatBot/ChatBot';
import { NovaMascot } from './components/Nova/NovaMascot';
import { Incident } from './types';
import { Loader, Mic } from 'lucide-react';

function AppContent() {
  const { session, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showCreateIncident, setShowCreateIncident] = useState(false);
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);

  const handleScrollDown = useCallback(() => {
    window.scrollBy({ top: 300, behavior: 'smooth' });
  }, []);

  const handleScrollUp = useCallback(() => {
    window.scrollBy({ top: -300, behavior: 'smooth' });
  }, []);

  const handleBack = useCallback(() => {
    if (selectedIncident) {
      setSelectedIncident(null);
    } else if (showCreateIncident) {
      setShowCreateIncident(false);
    } else if (showVoiceAssistant) {
      setShowVoiceAssistant(false);
    }
  }, [selectedIncident, showCreateIncident, showVoiceAssistant]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-blue-500 mx-auto mb-4" size={32} />
          <p className="text-gray-600">Loading CityPulse...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthForm />;
  }

  return (
    <VoiceCommandProvider
      onNavigate={setActiveTab}
      onScrollDown={handleScrollDown}
      onScrollUp={handleScrollUp}
      onBack={handleBack}
    >
      <div className="min-h-screen bg-gray-50">
        <BackgroundParticles />
        <LanguageSelector />
        <ThemeToggle />

      {activeTab === 'home' && (
        <HomeFeed
          onOpenDetail={setSelectedIncident}
          onOpenCreate={() => setShowCreateIncident(true)}
        />
      )}
      {activeTab === 'activity' && <ActivityView />}
      {activeTab === 'action' && <ActionView />}
      {activeTab === 'map' && <MapView />}
      {activeTab === 'rewards' && <GiftCardsView />}
      {activeTab === 'donations' && <DonationsView />}
      {activeTab === 'admin' && <AdminDashboard />}
      {activeTab === 'preferences' && <PreferencesView onNavigateToAdmin={() => setActiveTab('admin')} />}

      <button
        onClick={() => setShowVoiceAssistant(true)}
        className="fixed bottom-24 right-6 p-4 rounded-full cool-gradient shadow-lg hover:shadow-xl hover:scale-105 transition-all z-40"
        aria-label="Open voice assistant"
      >
        <Mic className="text-white" size={24} />
      </button>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {selectedIncident && (
        <IncidentDetail
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
        />
      )}

      {showCreateIncident && (
        <CreateIncident
          onClose={() => setShowCreateIncident(false)}
          onSuccess={() => {
            setShowCreateIncident(false);
            setActiveTab('home');
          }}
        />
      )}

      {showVoiceAssistant && (
        <VoiceAssistant onClose={() => setShowVoiceAssistant(false)} />
      )}

      <ChatBot />
      <NovaMascot />
      </div>
    </VoiceCommandProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider>
          <AccessibilityProvider>
            <AppContent />
          </AccessibilityProvider>
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
