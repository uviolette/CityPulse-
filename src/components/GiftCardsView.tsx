import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { GiftCard, UserPointsSummary } from '../../types';
import { Gift, Award, Clock, Check, X, Sparkles, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface MockGiftCard {
  id: string;
  value: number;
  code: string;
  status: 'unused' | 'redeemed' | 'expired';
  expires_at: string;
  image_color: string;
}

const MOCK_GIFT_CARDS: MockGiftCard[] = [
  {
    id: 'mock-1',
    value: 5,
    code: 'GIFT5USD',
    status: 'unused',
    expires_at: '2026-12-31',
    image_color: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'mock-2',
    value: 10,
    code: 'SAVE10NOW',
    status: 'unused',
    expires_at: '2026-12-31',
    image_color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'mock-3',
    value: 25,
    code: 'REWARD25',
    status: 'unused',
    expires_at: '2026-12-31',
    image_color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'mock-4',
    value: 10,
    code: 'USED2024',
    status: 'redeemed',
    expires_at: '2026-06-30',
    image_color: 'from-gray-400 to-gray-500'
  },
  {
    id: 'mock-5',
    value: 5,
    code: 'OLD2023',
    status: 'expired',
    expires_at: '2025-12-31',
    image_color: 'from-gray-300 to-gray-400'
  }
];

export function GiftCardsView() {
  const { user } = useAuth();
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [pointsSummary, setPointsSummary] = useState<UserPointsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [redeemCode, setRedeemCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemMessage, setRedeemMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [mockCards] = useState<MockGiftCard[]>(MOCK_GIFT_CARDS);

  useEffect(() => {
    if (user) {
      fetchGiftCards();
      fetchPointsSummary();
    }
  }, [user]);

  async function fetchGiftCards() {
    if (!user) return;

    setIsLoading(true);
    const { data } = await supabase
      .from('gift_cards')
      .select('*')
      .or(`user_id.eq.${user.id},issued_to_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (data) {
      setGiftCards(data);
    }
    setIsLoading(false);
  }

  async function fetchPointsSummary() {
    if (!user) return;

    const { data } = await supabase
      .from('user_points_summary')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setPointsSummary(data);
    }
  }

  async function handleRedeemCard() {
    if (!redeemCode.trim() || !user) return;

    setIsRedeeming(true);
    setRedeemMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setRedeemMessage({ type: 'error', text: 'Please sign in to redeem gift cards' });
        return;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/redeem-gift-card`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: redeemCode.trim().toUpperCase() }),
      });

      const result = await response.json();

      if (result.success) {
        setRedeemMessage({ type: 'success', text: `Successfully redeemed $${result.value} gift card!` });
        setRedeemCode('');
        fetchGiftCards();
        fetchPointsSummary();
      } else {
        setRedeemMessage({ type: 'error', text: result.error || 'Failed to redeem gift card' });
      }
    } catch (error) {
      console.error('Redemption error:', error);
      setRedeemMessage({ type: 'error', text: 'An error occurred while redeeming' });
    } finally {
      setIsRedeeming(false);
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never expires';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unused':
        return 'from-green-400 to-emerald-500';
      case 'redeemed':
        return 'from-blue-400 to-cyan-500';
      case 'expired':
        return 'from-gray-400 to-gray-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unused':
        return <Gift className="text-green-600" size={20} />;
      case 'redeemed':
        return <Check className="text-blue-600" size={20} />;
      case 'expired':
        return <X className="text-gray-600" size={20} />;
      default:
        return <Gift className="text-gray-600" size={20} />;
    }
  };

  return (
    <div className="pb-24 min-h-screen">
      <div className="sticky top-0 z-10 glass-effect shadow-bakery px-6 py-4 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Gift className="text-[#D88A2D]" size={28} />
            <h1 className="text-2xl font-bold text-[#8E2C3A]">Gift Cards & Rewards</h1>
          </div>
          <p className="text-sm text-[#8B4A1C]/70 font-medium">Redeem rewards for your contributions</p>
        </div>

        {pointsSummary && (
          <div className="bakery-card shadow-bakery border-2 border-[#D88A2D]/30 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D88A2D] to-[#8B4A1C] flex items-center justify-center">
                  <Award className="text-[#F5ECE3]" size={24} />
                </div>
                <div>
                  <p className="text-sm text-[#8B4A1C]/70 font-medium">Total Points</p>
                  <p className="text-2xl font-bold text-[#8E2C3A]">{pointsSummary.total_points}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#8B4A1C]/70 font-medium">Activities</p>
                <p className="text-lg font-bold text-[#D88A2D]">{pointsSummary.total_activities}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 pt-6 space-y-6">
        <div className="bakery-card shadow-bakery border-2 border-[#C77B86]/20 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-[#D88A2D]" size={20} />
            <h2 className="text-lg font-bold text-[#8E2C3A]">Redeem Gift Card</h2>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
              placeholder="Enter gift card code"
              maxLength={8}
              className="w-full px-4 py-3 bg-[#F5ECE3] border-2 border-[#C77B86]/30 rounded-2xl text-[#8E2C3A] font-bold placeholder:text-[#8B4A1C]/50 focus:outline-none focus:border-[#D88A2D] transition-colors"
            />

            {redeemMessage && (
              <div className={`p-4 rounded-2xl border-2 ${
                redeemMessage.type === 'success'
                  ? 'bg-green-50 border-green-300 text-green-700'
                  : 'bg-red-50 border-red-300 text-red-700'
              }`}>
                <p className="text-sm font-bold">{redeemMessage.text}</p>
              </div>
            )}

            <button
              onClick={handleRedeemCard}
              disabled={isRedeeming || !redeemCode.trim()}
              className="w-full py-3 bakery-gradient hover:opacity-90 disabled:opacity-50 text-[#F5ECE3] rounded-full transition-all font-bold text-sm pill-button flex items-center justify-center gap-2"
            >
              {isRedeeming ? (
                <>
                  <Sparkles className="animate-spin" size={16} />
                  Redeeming...
                </>
              ) : (
                <>
                  <Gift size={16} />
                  Redeem Card
                </>
              )}
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Gift className="text-[#D88A2D]" size={20} />
            <h2 className="text-lg font-bold text-[#8E2C3A]">Available Rewards</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-8">
            {mockCards.map((card) => (
              <div
                key={card.id}
                className="bakery-card shadow-bakery border-2 border-[#C77B86]/20 overflow-hidden hover:scale-[1.02] transition-transform"
              >
                <div className={`relative h-40 bg-gradient-to-br ${card.image_color} p-5 flex flex-col justify-between`}>
                  <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-4 right-4 w-24 h-24 rounded-full border-8 border-white" />
                    <div className="absolute bottom-4 left-4 w-32 h-32 rounded-full border-8 border-white" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                        <p className="text-white text-xs font-bold uppercase tracking-wide">Gift Card</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        card.status === 'unused' ? 'bg-white/90 text-emerald-700' :
                        card.status === 'redeemed' ? 'bg-white/90 text-blue-700' :
                        'bg-white/90 text-gray-700'
                      }`}>
                        {card.status === 'unused' ? '✓ Available' :
                         card.status === 'redeemed' ? '✓ Redeemed' :
                         '✗ Expired'}
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10">
                    <p className="text-white/80 text-sm font-medium mb-1">Value</p>
                    <p className="text-white text-5xl font-bold">${card.value}</p>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#8B4A1C]/70 font-medium">Card Code</p>
                      <p className="text-lg font-bold text-[#8E2C3A] tracking-wider">{card.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#8B4A1C]/70 font-medium">Expires</p>
                      <p className="text-sm font-bold text-[#D88A2D]">
                        {new Date(card.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {card.status === 'unused' && (
                    <button
                      onClick={() => {
                        setRedeemCode(card.code);
                        setRedeemMessage({ type: 'success', text: `Code ${card.code} copied! Click Redeem above.` });
                        setTimeout(() => setRedeemMessage(null), 3000);
                      }}
                      className="w-full py-3 bakery-gradient text-[#F5ECE3] rounded-full font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      <Gift size={16} />
                      Use This Card
                    </button>
                  )}

                  {card.status === 'redeemed' && (
                    <div className="flex items-center justify-center gap-2 py-3 bg-[#F5ECE3] rounded-full">
                      <Check className="text-blue-600" size={16} />
                      <span className="text-sm font-bold text-blue-700">Already Redeemed</span>
                    </div>
                  )}

                  {card.status === 'expired' && (
                    <div className="flex items-center justify-center gap-2 py-3 bg-[#F5ECE3] rounded-full">
                      <X className="text-gray-600" size={16} />
                      <span className="text-sm font-bold text-gray-700">Card Expired</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-[#8E2C3A]" size={20} />
            <h2 className="text-lg font-bold text-[#8E2C3A]">Your Earned Cards</h2>
          </div>

          {isLoading ? (
            <div className="py-12 text-center">
              <Sparkles className="text-[#D88A2D] animate-pulse mx-auto mb-3" size={32} />
              <p className="text-[#8E2C3A] font-medium">Loading your gift cards...</p>
            </div>
          ) : giftCards.length === 0 ? (
            <div className="py-12 text-center">
              <div className="inline-block p-4 bakery-card shadow-bakery mb-3">
                <span className="text-5xl">🎁</span>
              </div>
              <p className="text-[#8E2C3A] font-bold">No gift cards yet</p>
              <p className="text-sm text-[#8B4A1C]/70">Keep contributing to earn rewards!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {giftCards.map((card) => (
                <div
                  key={card.id}
                  className="bakery-card shadow-bakery overflow-hidden border-2 border-[#C77B86]/20"
                >
                  <div className={`h-3 bg-gradient-to-r ${getStatusColor(card.status)}`} />

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getStatusColor(card.status)} flex items-center justify-center`}>
                          {getStatusIcon(card.status)}
                        </div>
                        <div>
                          <p className="text-sm text-[#8B4A1C]/70 font-medium">
                            {card.status === 'unused' ? 'Available' : card.status === 'redeemed' ? 'Redeemed' : 'Expired'}
                          </p>
                          <p className="text-2xl font-bold text-[#8E2C3A]">${card.value.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#8B4A1C]/70 font-medium mb-1">Code</p>
                        <p className="text-lg font-bold text-[#D88A2D] tracking-wider">{card.code}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-[#8B4A1C]/70">
                        <Clock size={14} className="text-[#D88A2D]" />
                        <span className="font-medium">Issued: {formatDate(card.issued_at)}</span>
                      </div>
                      {card.expires_at && (
                        <div className="flex items-center gap-2 text-[#8B4A1C]/70">
                          <Clock size={14} className="text-[#8E2C3A]" />
                          <span className="font-medium">Expires: {formatDate(card.expires_at)}</span>
                        </div>
                      )}
                      {card.redeemed_at && (
                        <div className="flex items-center gap-2 text-[#8B4A1C]/70">
                          <Check size={14} className="text-green-600" />
                          <span className="font-medium">Used: {formatDate(card.redeemed_at)}</span>
                        </div>
                      )}
                    </div>

                    {card.notes && (
                      <div className="mt-4 p-3 bg-[#F5ECE3] rounded-xl border border-[#C77B86]/20">
                        <p className="text-xs text-[#8B4A1C] leading-relaxed">{card.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
