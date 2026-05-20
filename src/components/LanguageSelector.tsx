import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, RotateCcw } from 'lucide-react';
import { useLanguage, LANGUAGE_OPTIONS, Language } from '../../contexts/LanguageContext';

const STORAGE_KEY = 'languageSelectorPosition';
const DEFAULT_POSITION = { x: window.innerWidth - 200, y: 20 };

interface Position {
  x: number;
  y: number;
}

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<Position>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_POSITION;
      }
    }
    return DEFAULT_POSITION;
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      const rect = dropdownRef.current?.getBoundingClientRect();
      if (rect) {
        dragStartRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
        setIsDragging(true);
      }
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current || !dropdownRef.current) return;

      const elementWidth = dropdownRef.current.offsetWidth;
      const elementHeight = dropdownRef.current.offsetHeight;

      let newX = e.clientX - dragStartRef.current.x;
      let newY = e.clientY - dragStartRef.current.y;

      newX = Math.max(0, Math.min(window.innerWidth - elementWidth, newX));
      newY = Math.max(0, Math.min(window.innerHeight - elementHeight, newY));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position]);

  useEffect(() => {
    if (!isDragging) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
    }
  }, [position, isDragging]);

  const currentLanguage = LANGUAGE_OPTIONS.find(lang => lang.code === language);

  const handleLanguageSelect = (langCode: Language) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  const handleResetPosition = () => {
    setPosition(DEFAULT_POSITION);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_POSITION));
    setIsOpen(false);
  };

  return (
    <div
      className="fixed z-40"
      ref={dropdownRef}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 border-2 rounded-full transition-all ${
          isDragging
            ? 'border-blue-300 shadow-lg'
            : 'backdrop-blur-sm border-blue-200 shadow-sm'
        }`}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          backgroundColor: 'var(--background-card)'
        }}
        aria-label="Select language"
      >
        <Globe className="text-blue-500" size={18} />
        <span className="text-2xl">{currentLanguage?.flag}</span>
        <span className="text-sm font-bold text-blue-600 hidden sm:inline">{currentLanguage?.name}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 cool-card shadow-2xl border-2 border-blue-100 rounded-2xl overflow-hidden z-50 animate-fade-in">
          <div className="cool-gradient p-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe size={16} />
              Select Language
            </h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {LANGUAGE_OPTIONS.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                  language === lang.code ? 'bg-blue-50' : ''
                }`}
                style={{
                  backgroundColor: language === lang.code ? '#EFF6FF' : 'var(--background-card)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="flex-1 text-left font-bold">{lang.name}</span>
                {language === lang.code && (
                  <Check className="text-blue-500" size={18} />
                )}
              </button>
            ))}
          </div>
          <div className="border-t border-blue-100">
            <button
              onClick={handleResetPosition}
              className="w-full flex items-center gap-2 px-4 py-3 hover:bg-blue-50 transition-colors text-sm font-semibold"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <RotateCcw size={14} />
              Reset Position
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
