import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const STORAGE_KEY = 'themeTogglePosition';
const DEFAULT_POSITION = { x: window.innerWidth - 70, y: 16 };

interface Position {
  x: number;
  y: number;
}

export function ThemeToggle() {
  const { theme, toggleTheme, playSound } = useTheme();
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

  const toggleRef = useRef<HTMLButtonElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = toggleRef.current?.getBoundingClientRect();
    if (rect) {
      dragStartRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setIsDragging(true);
    }
    e.preventDefault();
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current || !toggleRef.current) return;

      const elementWidth = toggleRef.current.offsetWidth;
      const elementHeight = toggleRef.current.offsetHeight;

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

  const handleToggle = () => {
    if (!isDragging) {
      playSound('click');
      toggleTheme();
    }
  };

  return (
    <button
      ref={toggleRef}
      onClick={handleToggle}
      onMouseDown={handleMouseDown}
      className="theme-toggle-button"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon size={18} className="theme-toggle-icon" />
      ) : (
        <Sun size={18} className="theme-toggle-icon" />
      )}
    </button>
  );
}
