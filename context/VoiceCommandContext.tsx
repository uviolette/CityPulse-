import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { useAccessibility } from './AccessibilityContext';
import { useLanguage } from './LanguageContext';

interface VoiceCommandContextType {
  startListening: () => void;
  stopListening: () => void;
}

const VoiceCommandContext = createContext<VoiceCommandContextType | undefined>(undefined);

interface VoiceCommandProviderProps {
  children: React.ReactNode;
  onNavigate: (tab: string) => void;
  onScrollDown?: () => void;
  onScrollUp?: () => void;
  onBack?: () => void;
}

export function VoiceCommandProvider({
  children,
  onNavigate,
  onScrollDown,
  onScrollUp,
  onBack,
}: VoiceCommandProviderProps) {
  const { voiceNavigationEnabled, speak, helpMode, setHelpMode } = useAccessibility();
  const { setLanguage, language } = useLanguage();
  const recognitionRef = useRef<any>(null);
  const lastCommandTimeRef = useRef<number>(0);
  const DEBOUNCE_MS = 1000;

  const processCommand = useCallback(
    (transcript: string) => {
      const now = Date.now();
      if (now - lastCommandTimeRef.current < DEBOUNCE_MS) {
        return;
      }
      lastCommandTimeRef.current = now;

      const command = transcript.toLowerCase().trim();

      if (command.includes('help') || command.includes('i need help') || command.includes("i don't understand")) {
        setHelpMode(true);
        speak('Help mode activated. I will give you simple step by step instructions.');
        return;
      }

      if (command.includes('go to home') || command.includes('open home')) {
        onNavigate('home');
        speak('Going to home page');
        return;
      }

      if (command.includes('go to activity') || command.includes('open activity')) {
        onNavigate('activity');
        speak('Going to activity page');
        return;
      }

      if (command.includes('go to action') || command.includes('open action')) {
        onNavigate('action');
        speak('Going to action page');
        return;
      }

      if (command.includes('go to map') || command.includes('open map')) {
        onNavigate('map');
        speak('Going to map page');
        return;
      }

      if (command.includes('go to rewards') || command.includes('open rewards')) {
        onNavigate('rewards');
        speak('Going to rewards page');
        return;
      }

      if (command.includes('go to donations') || command.includes('open donations')) {
        onNavigate('donations');
        speak('Going to donations page');
        return;
      }

      if (command.includes('go to preferences') || command.includes('open preferences') || command.includes('go to profile') || command.includes('open profile')) {
        onNavigate('preferences');
        speak('Going to preferences page');
        return;
      }

      if (command.includes('back')) {
        onBack?.();
        speak('Going back');
        return;
      }

      if (command.includes('scroll down')) {
        onScrollDown?.();
        speak('Scrolling down');
        return;
      }

      if (command.includes('scroll up')) {
        onScrollUp?.();
        speak('Scrolling up');
        return;
      }

      if (command.includes('switch language to arabic') || command.includes('change language to arabic')) {
        setLanguage('ar');
        speak('Language switched to Arabic');
        return;
      }

      if (command.includes('switch language to chinese') || command.includes('change language to chinese')) {
        setLanguage('zh');
        speak('Language switched to Chinese');
        return;
      }

      if (command.includes('switch language to spanish') || command.includes('change language to spanish')) {
        setLanguage('es');
        speak('Language switched to Spanish');
        return;
      }

      if (command.includes('switch language to english') || command.includes('change language to english')) {
        setLanguage('en');
        speak('Language switched to English');
        return;
      }

      if (command.includes('submit')) {
        const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
        if (submitButton) {
          submitButton.click();
          speak('Submitting');
        } else {
          speak('No submit button found');
        }
        return;
      }

      if (command.includes('cancel')) {
        const cancelButton = Array.from(document.querySelectorAll('button')).find(
          btn => btn.textContent?.toLowerCase().includes('cancel')
        ) as HTMLButtonElement;
        if (cancelButton) {
          cancelButton.click();
          speak('Cancelled');
        } else {
          speak('No cancel button found');
        }
        return;
      }

      speak("Sorry, I didn't understand that command.");
    },
    [onNavigate, onScrollDown, onScrollUp, onBack, speak, setLanguage, setHelpMode]
  );

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.error('Error stopping recognition:', error);
    }
  }, []);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = language;

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      processCommand(transcript);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        speak('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.error('Speech recognition error:', event.error);
      }
    };

    recognition.onend = () => {
      if (voiceNavigationEnabled) {
        try {
          recognition.start();
        } catch (error) {
          console.error('Error restarting recognition:', error);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error stopping recognition on cleanup:', error);
        }
      }
    };
  }, [language, processCommand, voiceNavigationEnabled, speak]);

  useEffect(() => {
    if (voiceNavigationEnabled && recognitionRef.current) {
      startListening();
    } else if (!voiceNavigationEnabled && recognitionRef.current) {
      stopListening();
    }
  }, [voiceNavigationEnabled, startListening, stopListening]);

  return (
    <VoiceCommandContext.Provider value={{ startListening, stopListening }}>
      {children}
    </VoiceCommandContext.Provider>
  );
}

export function useVoiceCommand() {
  const context = useContext(VoiceCommandContext);
  if (!context) {
    throw new Error('useVoiceCommand must be used within VoiceCommandProvider');
  }
  return context;
}
