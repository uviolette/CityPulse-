import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, RotateCcw, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const STORAGE_KEY = 'novaPosition';
const DEFAULT_POSITION = { x: window.innerWidth - 120, y: window.innerHeight - 120 };

interface Position {
  x: number;
  y: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function NovaMascot() {
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

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Nova, your AI assistant. How can I help you today?"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const mascotRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const chatContentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = mascotRef.current?.getBoundingClientRect();
    if (rect) {
      dragStartRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setIsDragging(true);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current || !mascotRef.current) return;

      const elementWidth = mascotRef.current.offsetWidth;
      const elementHeight = mascotRef.current.offsetHeight;

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

  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [messages]);

  const handleResetPosition = () => {
    setPosition(DEFAULT_POSITION);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_POSITION));
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nova-chat`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message || "Sorry, I'm having trouble responding right now."
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage: Message = {
        role: 'assistant',
        content: "Sorry, I'm having trouble responding right now. Please try again!"
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <div
        ref={mascotRef}
        className="fixed z-50"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
      >
        <div
          className={`nova-mascot ${isDragging ? 'dragging' : ''}`}
          onClick={(e) => {
            if (!isDragging) {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }
          }}
        >
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="nova-svg"
          >
            <circle
              cx="40"
              cy="28"
              r="12"
              stroke="#4F7DF3"
              strokeWidth="3"
              fill="white"
              className="nova-head"
            />

            <path
              d="M40 40 L40 55"
              stroke="#4F7DF3"
              strokeWidth="3"
              strokeLinecap="round"
              className="nova-body"
            />

            <path
              d="M40 45 L30 50"
              stroke="#4F7DF3"
              strokeWidth="3"
              strokeLinecap="round"
              className="nova-arm-left"
            />

            <path
              d="M40 45 L50 50"
              stroke="#4F7DF3"
              strokeWidth="3"
              strokeLinecap="round"
              className="nova-arm-right"
            />

            <path
              d="M40 55 L33 68"
              stroke="#4F7DF3"
              strokeWidth="3"
              strokeLinecap="round"
              className="nova-leg-left"
            />

            <path
              d="M40 55 L47 68"
              stroke="#4F7DF3"
              strokeWidth="3"
              strokeLinecap="round"
              className="nova-leg-right"
            />

            <ellipse
              cx="40"
              cy="75"
              rx="20"
              ry="3"
              fill="#4F7DF3"
              opacity="0.1"
              className="nova-shadow"
            />
          </svg>

          <div className="nova-chat-bubble">
            <MessageCircle size={16} />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="nova-chat-panel">
          <div className="nova-chat-header">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                N
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Nova</h3>
                <p className="text-xs text-gray-500">AI Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <X size={18} className="text-gray-600" />
            </button>
          </div>

          <div ref={chatContentRef} className="nova-chat-content">
            {messages.map((message, index) => (
              <div key={index} className={`nova-message ${message.role === 'user' ? 'nova-message-user' : 'nova-message-ai'}`}>
                {message.role === 'assistant' && (
                  <div className="nova-message-avatar">N</div>
                )}
                <div className="nova-message-bubble">
                  <p>{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="nova-message-avatar-user">U</div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="nova-message nova-message-ai">
                <div className="nova-message-avatar">N</div>
                <div className="nova-message-bubble">
                  <div className="nova-typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="nova-chat-input-container">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Nova anything..."
              className="nova-chat-input"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="nova-send-button"
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>

          <div className="nova-chat-footer">
            <button
              onClick={handleResetPosition}
              className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <RotateCcw size={12} />
              Reset Position
            </button>
          </div>
        </div>
      )}

      <style>{`
        .nova-mascot {
          position: relative;
          width: 80px;
          height: 80px;
          transition: transform 0.2s ease;
        }

        .nova-mascot:not(.dragging) {
          animation: nova-float 3s ease-in-out infinite;
        }

        .nova-mascot:hover {
          transform: scale(1.05);
        }

        .nova-mascot.dragging {
          filter: drop-shadow(0 8px 16px rgba(79, 125, 243, 0.3));
        }

        .nova-svg {
          filter: drop-shadow(0 2px 8px rgba(79, 125, 243, 0.15));
          transition: filter 0.2s ease;
        }

        .nova-mascot:hover .nova-svg {
          filter: drop-shadow(0 4px 12px rgba(79, 125, 243, 0.25));
        }

        .nova-chat-bubble {
          position: absolute;
          bottom: -4px;
          right: -4px;
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #4F7DF3 0%, #3E6AE1 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 2px 8px rgba(79, 125, 243, 0.3);
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .nova-chat-bubble:hover {
          transform: scale(1.1);
        }

        @keyframes nova-float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .nova-chat-panel {
          position: fixed;
          top: 0;
          right: 0;
          width: 380px;
          height: 100vh;
          background: var(--background-card);
          box-shadow: -4px 0 24px rgba(79, 125, 243, 0.12);
          z-index: 40;
          display: flex;
          flex-direction: column;
          animation: slide-in 0.3s ease-out;
        }

        @media (max-width: 640px) {
          .nova-chat-panel {
            width: 100%;
          }
        }

        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .nova-chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid var(--color-border);
          background: var(--background-card);
        }

        .nova-chat-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background-color: var(--background-main);
        }

        .nova-chat-input-container {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          padding: 16px 20px;
          border-top: 1px solid var(--color-border);
          background: var(--background-card);
        }

        .nova-chat-input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid var(--color-border);
          border-radius: 12px;
          resize: none;
          font-size: 14px;
          color: var(--color-text-primary);
          background-color: var(--background-main);
          outline: none;
          max-height: 100px;
          font-family: inherit;
        }

        .nova-chat-input:focus {
          border-color: #4F7DF3;
          box-shadow: 0 0 0 3px rgba(79, 125, 243, 0.1);
        }

        .nova-chat-input:disabled {
          background-color: #F9FAFB;
          cursor: not-allowed;
        }

        .nova-send-button {
          padding: 10px;
          background: linear-gradient(135deg, #4F7DF3 0%, #3E6AE1 100%);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .nova-send-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(79, 125, 243, 0.3);
        }

        .nova-send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .nova-chat-footer {
          padding: 12px 20px;
          border-top: 1px solid var(--color-border);
          background: var(--background-card);
        }

        .nova-message {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .nova-message-user {
          flex-direction: row-reverse;
        }

        .nova-message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4F7DF3 0%, #3E6AE1 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
          flex-shrink: 0;
        }

        .nova-message-avatar-user {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
          flex-shrink: 0;
        }

        .nova-message-bubble {
          background: var(--background-card);
          padding: 12px 16px;
          border-radius: 16px;
          border: 1px solid var(--color-border);
          box-shadow: 0 2px 8px rgba(79, 125, 243, 0.06);
          max-width: 75%;
        }

        .nova-message-user .nova-message-bubble {
          background: linear-gradient(135deg, #4F7DF3 0%, #3E6AE1 100%);
          border-color: transparent;
        }

        .nova-message-bubble p {
          margin: 0;
          color: var(--color-text-primary);
          font-size: 14px;
          line-height: 1.5;
        }

        .nova-message-user .nova-message-bubble p {
          color: white;
        }

        .nova-typing-indicator {
          display: flex;
          gap: 4px;
          align-items: center;
          padding: 4px 0;
        }

        .nova-typing-indicator span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4F7DF3;
          animation: typing-bounce 1.4s infinite;
        }

        .nova-typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .nova-typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing-bounce {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-8px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .nova-mascot {
            animation: none;
          }
          .nova-chat-panel {
            animation: none;
          }
          .nova-typing-indicator span {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
