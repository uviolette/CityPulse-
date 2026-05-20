import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AccessibilityContextType {
  voiceNavigationEnabled: boolean;
  setVoiceNavigationEnabled: (enabled: boolean) => void;
  textToSpeechEnabled: boolean;
  setTextToSpeechEnabled: (enabled: boolean) => void;
  highContrastMode: boolean;
  setHighContrastMode: (enabled: boolean) => void;
  fontScale: number;
  setFontScale: (scale: number) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  simpleMode: boolean;
  setSimpleMode: (enabled: boolean) => void;
  helpMode: boolean;
  setHelpMode: (enabled: boolean) => void;
  speak: (text: string, options?: { rate?: number }) => void;
  cancelSpeech: () => void;
  isListening: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const MIN_FONT_SCALE = 0.8;
const MAX_FONT_SCALE = 1.5;
const FONT_SCALE_STEP = 0.1;

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [voiceNavigationEnabled, setVoiceNavigationEnabledState] = useState(() => {
    return localStorage.getItem('voice_navigation') === 'true';
  });

  const [textToSpeechEnabled, setTextToSpeechEnabledState] = useState(() => {
    return localStorage.getItem('text_to_speech') === 'true';
  });

  const [highContrastMode, setHighContrastModeState] = useState(() => {
    return localStorage.getItem('high_contrast') === 'true';
  });

  const [fontScale, setFontScaleState] = useState(() => {
    const saved = localStorage.getItem('font_scale');
    return saved ? parseFloat(saved) : 1;
  });

  const [simpleMode, setSimpleModeState] = useState(() => {
    return localStorage.getItem('simple_mode') === 'true';
  });

  const [helpMode, setHelpModeState] = useState(() => {
    return localStorage.getItem('help_mode') === 'true';
  });

  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    localStorage.setItem('voice_navigation', String(voiceNavigationEnabled));
  }, [voiceNavigationEnabled]);

  useEffect(() => {
    localStorage.setItem('text_to_speech', String(textToSpeechEnabled));
  }, [textToSpeechEnabled]);

  useEffect(() => {
    localStorage.setItem('high_contrast', String(highContrastMode));
    if (highContrastMode) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrastMode]);

  useEffect(() => {
    localStorage.setItem('font_scale', String(fontScale));
    document.documentElement.style.fontSize = `${fontScale * 16}px`;
  }, [fontScale]);

  useEffect(() => {
    localStorage.setItem('simple_mode', String(simpleMode));
    if (simpleMode) {
      document.documentElement.classList.add('simple-mode');
    } else {
      document.documentElement.classList.remove('simple-mode');
    }
  }, [simpleMode]);

  useEffect(() => {
    localStorage.setItem('help_mode', String(helpMode));
  }, [helpMode]);

  const setVoiceNavigationEnabled = useCallback((enabled: boolean) => {
    setVoiceNavigationEnabledState(enabled);
    setIsListening(enabled);
  }, []);

  const setTextToSpeechEnabled = useCallback((enabled: boolean) => {
    setTextToSpeechEnabledState(enabled);
    if (!enabled) {
      window.speechSynthesis?.cancel();
    }
  }, []);

  const setHighContrastMode = useCallback((enabled: boolean) => {
    setHighContrastModeState(enabled);
  }, []);

  const setFontScale = useCallback((scale: number) => {
    const clampedScale = Math.max(MIN_FONT_SCALE, Math.min(MAX_FONT_SCALE, scale));
    setFontScaleState(clampedScale);
  }, []);

  const increaseFontSize = useCallback(() => {
    setFontScale(fontScale + FONT_SCALE_STEP);
  }, [fontScale, setFontScale]);

  const decreaseFontSize = useCallback(() => {
    setFontScale(fontScale - FONT_SCALE_STEP);
  }, [fontScale, setFontScale]);

  const resetFontSize = useCallback(() => {
    setFontScale(1);
  }, [setFontScale]);

  const setSimpleMode = useCallback((enabled: boolean) => {
    setSimpleModeState(enabled);
  }, []);

  const setHelpMode = useCallback((enabled: boolean) => {
    setHelpModeState(enabled);
  }, []);

  const cancelSpeech = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const speak = useCallback((text: string, options?: { rate?: number }) => {
    if (!textToSpeechEnabled || !window.speechSynthesis) return;

    cancelSpeech();

    const utterance = new SpeechSynthesisUtterance(text);

    if (helpMode) {
      utterance.rate = 0.8;
    } else if (options?.rate) {
      utterance.rate = options.rate;
    } else {
      utterance.rate = 1;
    }

    const voices = window.speechSynthesis.getVoices();
    const currentLang = document.documentElement.lang || 'en';

    const matchingVoice = voices.find(voice => voice.lang.startsWith(currentLang));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.lang = currentLang;
    window.speechSynthesis.speak(utterance);
  }, [textToSpeechEnabled, helpMode, cancelSpeech]);

  useEffect(() => {
    return () => {
      cancelSpeech();
    };
  }, [cancelSpeech]);

  return (
    <AccessibilityContext.Provider
      value={{
        voiceNavigationEnabled,
        setVoiceNavigationEnabled,
        textToSpeechEnabled,
        setTextToSpeechEnabled,
        highContrastMode,
        setHighContrastMode,
        fontScale,
        setFontScale,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
        simpleMode,
        setSimpleMode,
        helpMode,
        setHelpMode,
        speak,
        cancelSpeech,
        isListening,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}
