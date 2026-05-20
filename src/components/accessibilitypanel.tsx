import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sun,
  Type,
  Minimize2,
  Maximize2,
  RotateCcw,
  Brain,
  LifeBuoy,
  Eye,
} from 'lucide-react';

export function AccessibilityPanel() {
  const { t } = useTranslation();
  const {
    voiceNavigationEnabled,
    setVoiceNavigationEnabled,
    textToSpeechEnabled,
    setTextToSpeechEnabled,
    highContrastMode,
    setHighContrastMode,
    fontScale,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    simpleMode,
    setSimpleMode,
    helpMode,
    setHelpMode,
    speak,
    isListening,
  } = useAccessibility();

  useEffect(() => {
    if (textToSpeechEnabled) {
      speak(t('preferences.title'));
    }
  }, []);

  const handleVoiceNavigationToggle = () => {
    const newValue = !voiceNavigationEnabled;
    setVoiceNavigationEnabled(newValue);
    if (textToSpeechEnabled) {
      speak(newValue ? t('accessibility.voiceEnabled') : t('accessibility.voiceDisabled'));
    }
  };

  const handleTextToSpeechToggle = () => {
    const newValue = !textToSpeechEnabled;
    setTextToSpeechEnabled(newValue);
    if (newValue) {
      speak(t('accessibility.ttsEnabled'));
    }
  };

  const handleHighContrastToggle = () => {
    const newValue = !highContrastMode;
    setHighContrastMode(newValue);
    if (textToSpeechEnabled) {
      speak(newValue ? t('accessibility.highContrastEnabled') : t('accessibility.highContrastDisabled'));
    }
  };

  const handleSimpleModeToggle = () => {
    const newValue = !simpleMode;
    setSimpleMode(newValue);
    if (textToSpeechEnabled) {
      speak(newValue ? t('accessibility.simpleModeEnabled') : t('accessibility.simpleModeDisabled'));
    }
  };

  const handleHelpModeToggle = () => {
    const newValue = !helpMode;
    setHelpMode(newValue);
    if (textToSpeechEnabled) {
      speak(
        newValue
          ? t('accessibility.helpModeEnabled')
          : t('accessibility.helpModeDisabled')
      );
    }
  };

  const handleIncreaseFontSize = () => {
    increaseFontSize();
    if (textToSpeechEnabled) {
      speak(t('accessibility.fontIncreased'));
    }
  };

  const handleDecreaseFontSize = () => {
    decreaseFontSize();
    if (textToSpeechEnabled) {
      speak(t('accessibility.fontDecreased'));
    }
  };

  const handleResetFontSize = () => {
    resetFontSize();
    if (textToSpeechEnabled) {
      speak(t('accessibility.fontReset'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bakery-card shadow-bakery border-2 border-[#C77B86]/20 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="text-[#D88A2D]" size={24} />
          <h2 className="text-xl font-bold text-[#8E2C3A]">{t('accessibility.title')}</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#F5ECE3] rounded-2xl border-2 border-[#C77B86]/30">
            <div className="flex items-center gap-3">
              {voiceNavigationEnabled ? (
                <Mic className="text-[#D88A2D]" size={20} />
              ) : (
                <MicOff className="text-[#8B4A1C]/50" size={20} />
              )}
              <div>
                <p className="font-bold text-[#8E2C3A]">{t('accessibility.voiceNavigation')}</p>
                <p className="text-xs text-[#8B4A1C]/70">{t('accessibility.voiceNavigationDesc')}</p>
              </div>
            </div>
            <button
              onClick={handleVoiceNavigationToggle}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                voiceNavigationEnabled ? 'bg-[#D88A2D]' : 'bg-gray-300'
              }`}
              aria-label="Toggle voice navigation"
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  voiceNavigationEnabled ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
              {isListening && voiceNavigationEnabled && (
                <span className="absolute inset-0 rounded-full animate-pulse bg-red-400 opacity-50" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#F5ECE3] rounded-2xl border-2 border-[#C77B86]/30">
            <div className="flex items-center gap-3">
              {textToSpeechEnabled ? (
                <Volume2 className="text-[#D88A2D]" size={20} />
              ) : (
                <VolumeX className="text-[#8B4A1C]/50" size={20} />
              )}
              <div>
                <p className="font-bold text-[#8E2C3A]">{t('accessibility.textToSpeech')}</p>
                <p className="text-xs text-[#8B4A1C]/70">{t('accessibility.textToSpeechDesc')}</p>
              </div>
            </div>
            <button
              onClick={handleTextToSpeechToggle}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                textToSpeechEnabled ? 'bg-[#D88A2D]' : 'bg-gray-300'
              }`}
              aria-label="Toggle text to speech"
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  textToSpeechEnabled ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#F5ECE3] rounded-2xl border-2 border-[#C77B86]/30">
            <div className="flex items-center gap-3">
              <Sun className="text-[#D88A2D]" size={20} />
              <div>
                <p className="font-bold text-[#8E2C3A]">{t('accessibility.highContrast')}</p>
                <p className="text-xs text-[#8B4A1C]/70">{t('accessibility.highContrastDesc')}</p>
              </div>
            </div>
            <button
              onClick={handleHighContrastToggle}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                highContrastMode ? 'bg-[#D88A2D]' : 'bg-gray-300'
              }`}
              aria-label="Toggle high contrast mode"
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  highContrastMode ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="p-4 bg-[#F5ECE3] rounded-2xl border-2 border-[#C77B86]/30">
            <div className="flex items-center gap-3 mb-3">
              <Type className="text-[#D88A2D]" size={20} />
              <div>
                <p className="font-bold text-[#8E2C3A]">{t('accessibility.textSize')}</p>
                <p className="text-xs text-[#8B4A1C]/70">{t('accessibility.textSizeDesc')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDecreaseFontSize}
                className="flex items-center justify-center w-10 h-10 bakery-card border-2 border-[#C77B86]/30 rounded-xl hover:border-[#D88A2D] transition-colors"
                aria-label="Decrease font size"
              >
                <Minimize2 size={18} className="text-[#8E2C3A]" />
              </button>
              <div className="flex-1 text-center">
                <span className="text-lg font-bold text-[#8E2C3A]">
                  {Math.round(fontScale * 100)}%
                </span>
              </div>
              <button
                onClick={handleIncreaseFontSize}
                className="flex items-center justify-center w-10 h-10 bakery-card border-2 border-[#C77B86]/30 rounded-xl hover:border-[#D88A2D] transition-colors"
                aria-label="Increase font size"
              >
                <Maximize2 size={18} className="text-[#8E2C3A]" />
              </button>
              <button
                onClick={handleResetFontSize}
                className="flex items-center justify-center w-10 h-10 bakery-card border-2 border-[#C77B86]/30 rounded-xl hover:border-[#D88A2D] transition-colors"
                aria-label="Reset font size"
              >
                <RotateCcw size={18} className="text-[#8E2C3A]" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#F5ECE3] rounded-2xl border-2 border-[#C77B86]/30">
            <div className="flex items-center gap-3">
              <Brain className="text-[#D88A2D]" size={20} />
              <div>
                <p className="font-bold text-[#8E2C3A]">{t('accessibility.simpleMode')}</p>
                <p className="text-xs text-[#8B4A1C]/70">{t('accessibility.simpleModeDesc')}</p>
              </div>
            </div>
            <button
              onClick={handleSimpleModeToggle}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                simpleMode ? 'bg-[#D88A2D]' : 'bg-gray-300'
              }`}
              aria-label="Toggle simple mode"
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  simpleMode ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#F5ECE3] rounded-2xl border-2 border-[#C77B86]/30">
            <div className="flex items-center gap-3">
              <LifeBuoy className="text-[#D88A2D]" size={20} />
              <div>
                <p className="font-bold text-[#8E2C3A]">{t('accessibility.helpMode')}</p>
                <p className="text-xs text-[#8B4A1C]/70">{t('accessibility.helpModeDesc')}</p>
              </div>
            </div>
            <button
              onClick={handleHelpModeToggle}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                helpMode ? 'bg-[#D88A2D]' : 'bg-gray-300'
              }`}
              aria-label="Toggle help mode"
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  helpMode ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {voiceNavigationEnabled && (
        <div className="bakery-card shadow-bakery border-2 border-[#D88A2D]/30 p-5">
          <h3 className="font-bold text-[#8E2C3A] mb-3">{t('accessibility.voiceCommands')}</h3>
          <div className="space-y-2 text-sm text-[#8B4A1C]">
            <p className="font-medium">{t('voiceCommands.navigationTitle')}</p>
            <ul className="list-disc list-inside space-y-1 text-xs ml-2">
              <li>{t('voiceCommands.goToPage')}</li>
              <li>{t('voiceCommands.openPage')}</li>
              <li>{t('voiceCommands.scrollUpDown')}</li>
              <li>{t('voiceCommands.back')}</li>
            </ul>
            <p className="font-medium mt-3">{t('voiceCommands.languageTitle')}</p>
            <ul className="list-disc list-inside space-y-1 text-xs ml-2">
              <li>{t('voiceCommands.switchLanguage')}</li>
            </ul>
            <p className="font-medium mt-3">{t('voiceCommands.actionsTitle')}</p>
            <ul className="list-disc list-inside space-y-1 text-xs ml-2">
              <li>{t('voiceCommands.submit')}</li>
              <li>{t('voiceCommands.cancel')}</li>
            </ul>
            <p className="font-medium mt-3">{t('voiceCommands.helpTitle')}</p>
            <ul className="list-disc list-inside space-y-1 text-xs ml-2">
              <li>{t('voiceCommands.needHelp')}</li>
              <li>{t('voiceCommands.dontUnderstand')}</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
