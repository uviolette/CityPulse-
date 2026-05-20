import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Settings, X, Languages, Loader } from 'lucide-react';

interface VoiceAssistantProps {
  onClose?: () => void;
}

type Language = 'en' | 'es' | 'ar' | 'zh';

interface LanguageConfig {
  code: Language;
  name: string;
  flag: string;
}

const languages: LanguageConfig[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

const appInfo: Record<Language, any> = {
  en: {
    greeting: "Hello! I'm your CityPlus accessibility assistant. How can I help you today?",
    about: "CityPlus is a community-driven platform where you can report and track sustainability initiatives, environmental issues, and city improvements. You can view incidents on the map, join volunteer activities, and connect with local organizations.",
    howToUse: "You can navigate using the bottom menu: Home shows community updates, Activity displays volunteer opportunities, the Map shows incidents by location, and Preferences allows you to customize your experience.",
    accessibility: "I'm here to help users with special needs navigate the app. You can interact with me using voice commands, and I'll speak all responses. The app also supports high contrast mode and screen reader compatibility.",
    reporting: "To report an issue, tap the plus button on the home screen, select the type of incident, add a description and location, and optionally attach a photo. Your report helps improve your community!",
  },
  es: {
    greeting: "¡Hola! Soy tu asistente de accesibilidad de CityPlus. ¿Cómo puedo ayudarte hoy?",
    about: "CityPlus es una plataforma comunitaria donde puedes reportar y rastrear iniciativas de sostenibilidad, problemas ambientales y mejoras de la ciudad. Puedes ver incidentes en el mapa, unirte a actividades voluntarias y conectarte con organizaciones locales.",
    howToUse: "Puedes navegar usando el menú inferior: Inicio muestra actualizaciones de la comunidad, Actividad muestra oportunidades de voluntariado, el Mapa muestra incidentes por ubicación y Preferencias te permite personalizar tu experiencia.",
    accessibility: "Estoy aquí para ayudar a usuarios con necesidades especiales a navegar la aplicación. Puedes interactuar conmigo usando comandos de voz y hablaré todas las respuestas. La aplicación también admite modo de alto contraste y compatibilidad con lectores de pantalla.",
    reporting: "Para reportar un problema, toca el botón más en la pantalla de inicio, selecciona el tipo de incidente, agrega una descripción y ubicación, y opcionalmente adjunta una foto. ¡Tu reporte ayuda a mejorar tu comunidad!",
  },
  ar: {
    greeting: "مرحباً! أنا مساعد إمكانية الوصول الخاص بك في CityPlus. كيف يمكنني مساعدتك اليوم؟",
    about: "CityPlus هي منصة مجتمعية حيث يمكنك الإبلاغ عن مبادرات الاستدامة والقضايا البيئية وتحسينات المدينة وتتبعها. يمكنك عرض الحوادث على الخريطة والانضمام إلى الأنشطة التطوعية والتواصل مع المنظمات المحلية.",
    howToUse: "يمكنك التنقل باستخدام القائمة السفلية: الصفحة الرئيسية تعرض التحديثات المجتمعية، النشاط يعرض فرص التطوع، الخريطة تعرض الحوادث حسب الموقع، والتفضيلات تسمح لك بتخصيص تجربتك.",
    accessibility: "أنا هنا لمساعدة المستخدمين ذوي الاحتياجات الخاصة في التنقل في التطبيق. يمكنك التفاعل معي باستخدام الأوامر الصوتية، وسأتحدث بجميع الردود. يدعم التطبيق أيضاً وضع التباين العالي والتوافق مع قارئ الشاشة.",
    reporting: "للإبلاغ عن مشكلة، اضغط على زر الإضافة في الشاشة الرئيسية، حدد نوع الحادث، أضف وصفاً وموقعاً، وأرفق صورة اختيارياً. تقريرك يساعد في تحسين مجتمعك!",
  },
  zh: {
    greeting: "您好！我是您的 CityPlus 无障碍助手。今天我能为您做什么？",
    about: "CityPlus 是一个社区驱动的平台，您可以报告和跟踪可持续发展倡议、环境问题和城市改善。您可以在地图上查看事件、参加志愿活动并与当地组织联系。",
    howToUse: "您可以使用底部菜单导航：主页显示社区更新，活动显示志愿者机会，地图按位置显示事件，首选项允许您自定义体验。",
    accessibility: "我在这里帮助有特殊需求的用户浏览应用程序。您可以使用语音命令与我互动，我会朗读所有回复。该应用程序还支持高对比度模式和屏幕阅读器兼容性。",
    reporting: "要报告问题，请点击主屏幕上的加号按钮，选择事件类型，添加描述和位置，并可选择附加照片。您的报告有助于改善您的社区！",
  },
};

export function VoiceAssistant({ onClose }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [showSettings, setShowSettings] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event: any) => {
          const lastResult = event.results[event.results.length - 1];
          const transcriptText = lastResult[0].transcript;
          setTranscript(transcriptText);
          handleVoiceCommand(transcriptText);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    speak(appInfo[selectedLanguage].greeting);

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = getLanguageCode(selectedLanguage);
    }
  }, [selectedLanguage]);

  const getLanguageCode = (lang: Language): string => {
    const codes = {
      en: 'en-US',
      es: 'es-ES',
      ar: 'ar-SA',
      zh: 'zh-CN',
    };
    return codes[lang];
  };

  const speak = (text: string) => {
    if (!synthRef.current) return;

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLanguageCode(selectedLanguage);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      recognitionRef.current.lang = getLanguageCode(selectedLanguage);
      recognitionRef.current.start();
      setIsListening(true);
      setTranscript('');
    } catch (error) {
      console.error('Error starting recognition:', error);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleVoiceCommand = (command: string) => {
    setIsProcessing(true);
    const lowerCommand = command.toLowerCase();

    let responseText = '';

    if (lowerCommand.includes('help') || lowerCommand.includes('ayuda') || lowerCommand.includes('مساعدة') || lowerCommand.includes('帮助')) {
      responseText = appInfo[selectedLanguage].greeting;
    } else if (lowerCommand.includes('about') || lowerCommand.includes('acerca') || lowerCommand.includes('حول') || lowerCommand.includes('关于')) {
      responseText = appInfo[selectedLanguage].about;
    } else if (lowerCommand.includes('how') || lowerCommand.includes('cómo') || lowerCommand.includes('كيف') || lowerCommand.includes('如何')) {
      responseText = appInfo[selectedLanguage].howToUse;
    } else if (lowerCommand.includes('accessibility') || lowerCommand.includes('accesibilidad') || lowerCommand.includes('إمكانية') || lowerCommand.includes('无障碍')) {
      responseText = appInfo[selectedLanguage].accessibility;
    } else if (lowerCommand.includes('report') || lowerCommand.includes('reportar') || lowerCommand.includes('إبلاغ') || lowerCommand.includes('报告')) {
      responseText = appInfo[selectedLanguage].reporting;
    } else {
      responseText = appInfo[selectedLanguage].howToUse;
    }

    setResponse(responseText);
    speak(responseText);
    setIsProcessing(false);
  };

  const handleQuickAction = (action: string) => {
    const responseText = appInfo[selectedLanguage][action as keyof typeof appInfo.en];
    setResponse(responseText);
    speak(responseText);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-700"
        role="dialog"
        aria-label="Voice Assistant"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-12 h-12 rounded-full cool-gradient flex items-center justify-center ${isSpeaking ? 'animate-pulse' : ''}`}>
                  <Volume2 className="text-white" size={24} />
                </div>
                {isSpeaking && (
                  <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">CityPlus Assistant</h2>
                <p className="text-sm text-slate-400">Accessibility Helper</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
                aria-label="Settings"
              >
                <Settings className="text-slate-300" size={20} />
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
                  aria-label="Close assistant"
                >
                  <X className="text-slate-300" size={20} />
                </button>
              )}
            </div>
          </div>

          {showSettings && (
            <div className="mb-6 p-4 rounded-xl bg-slate-700/30 border border-slate-600">
              <div className="flex items-center gap-2 mb-3">
                <Languages className="text-blue-400" size={20} />
                <h3 className="font-semibold text-white">Language / Idioma / لغة / 语言</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`p-3 rounded-lg flex items-center gap-2 transition-all ${
                      selectedLanguage === lang.code
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-600/50 text-slate-300 hover:bg-slate-600'
                    }`}
                    aria-label={`Select ${lang.name}`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="font-medium">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6 min-h-[200px]">
            <div className="bg-slate-700/30 rounded-xl p-4 mb-4 border border-slate-600">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <Volume2 className="text-white" size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-400 mb-1">Assistant</p>
                  <p className="text-white leading-relaxed" dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}>
                    {response || appInfo[selectedLanguage].greeting}
                  </p>
                </div>
              </div>
            </div>

            {transcript && (
              <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full cool-gradient flex items-center justify-center flex-shrink-0 mt-1">
                    <Mic className="text-white" size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-400 mb-1">You</p>
                    <p className="text-white leading-relaxed" dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}>
                      {transcript}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="flex items-center justify-center py-4">
                <Loader className="animate-spin text-blue-500" size={24} />
              </div>
            )}
          </div>

          <div className="mb-6">
            <p className="text-sm font-medium text-slate-400 mb-3">Quick Actions</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'about', label: { en: 'About', es: 'Acerca', ar: 'حول', zh: '关于' } },
                { key: 'howToUse', label: { en: 'How to Use', es: 'Cómo usar', ar: 'كيفية الاستخدام', zh: '如何使用' } },
                { key: 'accessibility', label: { en: 'Accessibility', es: 'Accesibilidad', ar: 'إمكانية الوصول', zh: '无障碍' } },
                { key: 'reporting', label: { en: 'Reporting', es: 'Reportar', ar: 'الإبلاغ', zh: '报告' } },
              ].map((action) => (
                <button
                  key={action.key}
                  onClick={() => handleQuickAction(action.key)}
                  className="p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-white text-sm font-medium transition-colors"
                  dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
                >
                  {action.label[selectedLanguage]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`p-6 rounded-full transition-all shadow-lg ${
                isListening
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                  : 'cool-gradient hover:opacity-90'
              }`}
              aria-label={isListening ? 'Stop listening' : 'Start listening'}
            >
              {isListening ? (
                <MicOff className="text-white" size={32} />
              ) : (
                <Mic className="text-white" size={32} />
              )}
            </button>

            <button
              onClick={isSpeaking ? stopSpeaking : () => speak(response || appInfo[selectedLanguage].greeting)}
              className={`p-6 rounded-full transition-all shadow-lg ${
                isSpeaking
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-gradient-to-br from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
              }`}
              aria-label={isSpeaking ? 'Stop speaking' : 'Repeat message'}
            >
              {isSpeaking ? (
                <VolumeX className="text-white" size={32} />
              ) : (
                <Volume2 className="text-white" size={32} />
              )}
            </button>
          </div>

          <p className="text-center text-xs text-slate-500 mt-4">
            {selectedLanguage === 'en' && 'Tap the microphone to speak, or use quick actions above'}
            {selectedLanguage === 'es' && 'Toca el micrófono para hablar, o usa las acciones rápidas arriba'}
            {selectedLanguage === 'ar' && 'اضغط على الميكروفون للتحدث، أو استخدم الإجراءات السريعة أعلاه'}
            {selectedLanguage === 'zh' && '点击麦克风说话，或使用上面的快速操作'}
          </p>
        </div>
      </div>
    </div>
  );
}
