import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Sparkles, HelpCircle } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface FAQ {
  question: string;
  answer: string;
  keywords: string[];
}

const FAQS: FAQ[] = [
  {
    question: "How do I earn points?",
    answer: "You earn points by reporting sustainability incidents, taking action on existing reports, adding comments, and participating in community activities. Each action contributes to your total points which can be redeemed for gift cards!",
    keywords: ["points", "earn", "get", "rewards", "how"]
  },
  {
    question: "How do I redeem a gift card?",
    answer: "Navigate to the Gift Cards & Rewards section from your User Account. You'll see available gift cards with codes. Click 'Use This Card' to copy the code, then enter it in the redemption field at the top and click 'Redeem Card'.",
    keywords: ["redeem", "gift card", "use", "code", "rewards"]
  },
  {
    question: "How do I report an incident?",
    answer: "Tap the + button in the bottom navigation bar. Fill out the incident form with details including location (state, county, city, zip code), category (energy, waste, water, air, etc.), description, and optionally add photos. Submit when ready!",
    keywords: ["report", "incident", "create", "submit", "new"]
  },
  {
    question: "What can I donate to?",
    answer: "You can make donations to environmental organizations at the state level or nationwide. Visit the Donations section to browse organizations, see their mission statements, and contribute via secure Stripe checkout.",
    keywords: ["donate", "donation", "contribute", "organization", "charity"]
  },
  {
    question: "How does the heat map work?",
    answer: "The heat map visualizes sustainability incidents across the United States. Darker red areas indicate more incidents. You can filter by category (energy, waste, water, etc.), severity level, and time period. Click on states or regions to see detailed breakdowns.",
    keywords: ["heat map", "map", "visualization", "filter", "incidents"]
  },
  {
    question: "How do I change my language?",
    answer: "Look for the globe icon at the top-right corner of the app. Click it to see all available languages: English, Spanish (Español), Chinese (中文), Tagalog, Vietnamese (Tiếng Việt), Arabic (العربية), French (Français), and Korean (한국어). Select your preferred language and the app will instantly update!",
    keywords: ["language", "translate", "spanish", "french", "chinese", "tagalog", "vietnamese", "arabic", "korean", "change", "preferences", "globe"]
  },
  {
    question: "What are sustainability categories?",
    answer: "We track incidents across 8 categories: Energy & Climate (solar, wind, emissions), Waste & Recycling, Water Conservation, Air Quality, Transportation, Green Spaces, Community Programs, and Policy & Advocacy. Each helps track different environmental aspects.",
    keywords: ["categories", "types", "sustainability", "environmental"]
  },
  {
    question: "Can I comment on incidents?",
    answer: "Yes! View any incident detail and scroll to the Notes & Comments section. You can add comments, share insights, or ask questions. Comments help build community discussion around sustainability issues.",
    keywords: ["comment", "notes", "discussion", "reply"]
  },
  {
    question: "What is the Activity Feed?",
    answer: "The Activity Feed shows recent actions taken by the community - new incident reports, comments, actions taken, and donations made. It helps you stay updated on what's happening in the sustainability community.",
    keywords: ["activity", "feed", "recent", "updates", "news"]
  },
  {
    question: "How do I take action on an incident?",
    answer: "View an incident detail and look for the 'Take Action' section. You can choose from actions like 'Investigating', 'Monitoring', 'Resolved', or 'Escalated'. Add a description of what you're doing and submit!",
    keywords: ["action", "take action", "investigate", "resolve", "help"]
  },
  {
    question: "What's the difference between state and nationwide donations?",
    answer: "State-level donations go to organizations focused on environmental issues in a specific state. Nationwide donations support organizations working across the entire country. Choose based on where you want your impact!",
    keywords: ["state", "nationwide", "difference", "donation", "organization"]
  },
  {
    question: "How do I use the voice assistant?",
    answer: "Look for the AI widget icon on the Action and Activity pages. Click it to activate voice interaction powered by ElevenLabs. You can ask questions and get spoken responses about sustainability actions!",
    keywords: ["voice", "assistant", "ai", "speak", "elevenlabs"]
  },
  {
    question: "Are my donations secure?",
    answer: "Absolutely! All donations are processed through Stripe, an industry-leading secure payment processor. We never store your payment information. You'll receive immediate confirmation after each donation.",
    keywords: ["secure", "safe", "payment", "stripe", "privacy"]
  },
  {
    question: "Can I see my contribution history?",
    answer: "Yes! Your User Account page shows your total points, activities count, earned gift cards, and recent actions. The Activity Feed also tracks all your contributions to the community.",
    keywords: ["history", "contributions", "my activity", "profile", "stats"]
  },
  {
    question: "What do the severity levels mean?",
    answer: "Incidents are rated 1-5: (1) Minor observation, (2) Noticeable issue, (3) Moderate concern, (4) Serious problem, (5) Critical urgent matter. This helps prioritize what needs immediate attention.",
    keywords: ["severity", "level", "priority", "urgent", "critical"]
  },
  {
    question: "How do I navigate the app?",
    answer: "Use the bottom navigation bar to access: Home (user account & feed), Activity (community updates), Action (take actions), Map (heat map visualization), and + (create new incident). Tap on any icon to switch between sections!",
    keywords: ["navigate", "navigation", "menu", "how to use", "guide"]
  },
  {
    question: "What information do I need to report an incident?",
    answer: "You'll need: Location (state, county, city, optional zip code), Category (energy, waste, water, etc.), Severity level (1-5), Description of the issue, and optionally photos. The more details you provide, the better!",
    keywords: ["information", "need", "required", "report", "details"]
  },
  {
    question: "Can I edit my profile?",
    answer: "Your profile displays your username and activity statistics. To view your profile, tap the Home icon in the bottom navigation. You'll see your points, activities, gift cards, and contribution history all in one place!",
    keywords: ["profile", "edit", "account", "settings", "username"]
  },
  {
    question: "How do I filter the heat map?",
    answer: "On the Map view, use the filter options to select specific categories (energy, waste, water, etc.), severity levels (1-5), and time periods (last 7 days, 30 days, or all time). The map updates instantly to show matching incidents!",
    keywords: ["filter", "heat map", "search", "find", "category"]
  },
  {
    question: "What are the different incident categories?",
    answer: "We have 8 categories: Energy & Climate (renewable energy, emissions), Waste & Recycling (disposal, reduction), Water Conservation (usage, quality), Air Quality (pollution, monitoring), Transportation (sustainable transit), Green Spaces (parks, urban forestry), Community Programs (education, events), and Policy & Advocacy (regulations, campaigns).",
    keywords: ["category", "categories", "types", "incident types", "what kind"]
  },
  {
    question: "How do gift card expiration dates work?",
    answer: "Gift cards show their expiration date on the card. Most cards are valid for several months to a year. Check the 'Expires' date on each card. Expired cards cannot be redeemed, so make sure to use them before they expire!",
    keywords: ["expiration", "expire", "valid", "date", "deadline"]
  },
  {
    question: "Who can see my reports?",
    answer: "All incident reports are visible to the community. This transparency helps build collective awareness and enables collaborative action on sustainability issues. Comments and actions on incidents are also public to encourage community engagement.",
    keywords: ["privacy", "public", "visible", "who can see", "sharing"]
  },
  {
    question: "How are points calculated?",
    answer: "You earn points for various contributions: Creating incidents (10-50 points based on detail), Taking actions (5-20 points), Adding helpful comments (3-10 points), and Community engagement. Higher quality, more detailed contributions earn more points!",
    keywords: ["points", "calculate", "how many", "scoring", "earn"]
  },
  {
    question: "Can I delete an incident I reported?",
    answer: "Currently, incident reports cannot be deleted to maintain data integrity and community transparency. However, you can add follow-up comments to provide updates or corrections. If there's a serious issue, contact support through this chat!",
    keywords: ["delete", "remove", "report", "incident", "cancel"]
  },
  {
    question: "What makes a good incident report?",
    answer: "A great report includes: Precise location details (including zip code), Clear category selection, Accurate severity rating, Detailed description of what you observed, Photos if available, and specific impacts or concerns. The more context, the better the community can respond!",
    keywords: ["good", "quality", "best", "tips", "how to report"]
  }
];

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage("Hi! I'm your sustainability assistant. How can I help you today?");
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addBotMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const findAnswer = (question: string): string => {
    const lowerQuestion = question.toLowerCase();

    let bestMatch: { faq: FAQ; score: number } | null = null;

    for (const faq of FAQS) {
      const keywordMatches = faq.keywords.filter(keyword =>
        lowerQuestion.includes(keyword.toLowerCase())
      );

      const score = keywordMatches.length;

      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { faq, score };
      }
    }

    if (bestMatch) {
      return bestMatch.faq.answer;
    }

    if (lowerQuestion.includes('help') || lowerQuestion.includes('hi') || lowerQuestion.includes('hello')) {
      return "Hi there! I'm here to help you navigate the sustainability app. I can answer questions about:\n\n• Earning points and redeeming rewards\n• Reporting and managing incidents\n• Using the heat map and filters\n• Making secure donations\n• Changing app settings and language\n• Taking community actions\n\nWhat would you like to know?";
    }

    if (lowerQuestion.includes('thank') || lowerQuestion.includes('thanks')) {
      return "You're welcome! Feel free to ask if you have any other questions. I'm here to help!";
    }

    return "I'm not sure about that specific question. Here are some topics I can help with:\n\n• Earning points and rewards\n• Reporting incidents\n• Using the heat map\n• Making donations\n• Changing language settings\n• Taking actions on incidents\n• Commenting and collaboration\n• Gift card redemption\n\nTry asking about any of these topics, or rephrase your question!";
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    addUserMessage(inputText);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const answer = findAnswer(inputText);
      addBotMessage(answer);
      setIsTyping(false);
    }, 800);
  };

  const handleSuggestedQuestion = (question: string) => {
    addUserMessage(question);
    setIsTyping(true);

    setTimeout(() => {
      const answer = findAnswer(question);
      addBotMessage(answer);
      setIsTyping(false);
    }, 800);
  };

  const suggestedQuestions = [
    "How do I earn points?",
    "How do I redeem a gift card?",
    "How do I report an incident?",
    "What can I donate to?",
    "How does the heat map work?",
    "How do I change my language?",
    "What makes a good incident report?"
  ];

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-24 z-40 w-14 h-14 bg-gradient-to-br from-[#D88A2D] to-[#8E2C3A] text-[#F5ECE3] rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
          aria-label="Open chat assistant"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-24 right-24 z-50 w-96 max-w-[calc(100vw-6rem)] h-[32rem] bakery-card shadow-2xl border-2 border-[#C77B86]/30 flex flex-col overflow-hidden">
          <div className="bakery-gradient p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Sparkles className="text-[#F5ECE3]" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-[#F5ECE3]">AI Assistant</h3>
                <p className="text-xs text-[#F5ECE3]/80">Here to help!</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#F5ECE3] hover:bg-white/10 p-2 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F5ECE3]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bakery-gradient text-[#F5ECE3]'
                      : 'bg-white border-2 border-[#C77B86]/20 text-[#8E2C3A]'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-[#F5ECE3]/70' : 'text-[#8B4A1C]/50'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border-2 border-[#C77B86]/20 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[#D88A2D] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-[#D88A2D] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-[#D88A2D] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {messages.length <= 1 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <HelpCircle className="text-[#D88A2D]" size={16} />
                  <p className="text-xs font-bold text-[#8E2C3A]">Suggested Questions:</p>
                </div>
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="w-full text-left px-4 py-3 bg-white hover:bg-gradient-to-r hover:from-[#D88A2D]/10 hover:to-[#8E2C3A]/10 border-2 border-[#C77B86]/20 rounded-xl text-sm text-[#8E2C3A] font-medium transition-all"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t-2 border-[#C77B86]/20">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 bg-[#F5ECE3] border-2 border-[#C77B86]/30 rounded-full text-[#8E2C3A] font-medium placeholder:text-[#8B4A1C]/50 focus:outline-none focus:border-[#D88A2D] transition-colors"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="w-10 h-10 bakery-gradient text-[#F5ECE3] rounded-full flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-all"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
