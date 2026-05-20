import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Donation } from '../../types';
import { Heart, DollarSign, Users, TrendingUp, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface DonationStats {
  total_donations: number;
  total_amount: number;
  average_amount: number;
  unique_donors: number;
}

const PRESET_AMOUNTS = [5, 10, 25, 50, 100];

export function DonationsView() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isDonating, setIsDonating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchDonations();
    fetchStats();

    const params = new URLSearchParams(window.location.search);
    if (params.get('donation') === 'success') {
      setTimeout(() => {
        window.history.replaceState({}, '', window.location.pathname);
        fetchDonations();
        fetchStats();
      }, 1000);
    }
  }, [user]);

  async function fetchDonations() {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const { data } = await supabase
      .from('donations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setDonations(data);
    }
    setIsLoading(false);
  }

  async function fetchStats() {
    const { data } = await supabase
      .from('donation_stats')
      .select('*')
      .maybeSingle();

    if (data) {
      setStats(data);
    }
  }

  async function handleDonate() {
    const amount = selectedAmount || parseFloat(customAmount);

    if (!amount || amount <= 0) {
      setErrorMessage(t('donation.error.invalid'));
      return;
    }

    if (amount < 1) {
      setErrorMessage(t('donation.error.minimum'));
      return;
    }

    setIsDonating(true);
    setErrorMessage('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (session) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-donation-checkout`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amount,
          donor_name: donorName || null,
          donor_email: donorEmail || null,
          is_anonymous: isAnonymous,
        }),
      });

      const result = await response.json();

      if (result.success && result.url) {
        window.location.href = result.url;
      } else if (result.setup_url) {
        setErrorMessage(t('donation.error.stripe'));
      } else {
        setErrorMessage(result.error || t('donation.error.failed'));
      }
    } catch (error) {
      console.error('Donation error:', error);
      setErrorMessage(t('donation.error.general'));
    } finally {
      setIsDonating(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-700 border-green-300',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      failed: 'bg-red-100 text-red-700 border-red-300',
      refunded: 'bg-gray-100 text-gray-700 border-gray-300',
    };

    const statusText = status === 'completed' ? t('status.completed') :
                       status === 'pending' ? t('status.pending') :
                       status === 'failed' ? t('status.failed') :
                       status === 'refunded' ? t('status.refunded') :
                       status;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${styles[status] || styles.pending}`}>
        {statusText}
      </span>
    );
  };

  return (
    <div className="pb-24 min-h-screen">
      <div className="sticky top-0 z-10 glass-effect shadow-bakery px-6 py-4 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="text-[#D88A2D]" size={28} />
            <h1 className="text-2xl font-bold text-[#8E2C3A]">{t('donation.make')}</h1>
          </div>
          <p className="text-sm text-[#8B4A1C]/70 font-medium">{t('donation.support')}</p>
        </div>

        {stats && stats.total_amount !== null && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bakery-card shadow-bakery border-2 border-[#D88A2D]/30 p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="text-[#D88A2D]" size={18} />
                <p className="text-xs text-[#8B4A1C]/70 font-medium">{t('donation.total_raised')}</p>
              </div>
              <p className="text-2xl font-bold text-[#8E2C3A]">${(stats.total_amount || 0).toLocaleString()}</p>
            </div>
            <div className="bakery-card shadow-bakery border-2 border-[#C77B86]/30 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="text-[#C77B86]" size={18} />
                <p className="text-xs text-[#8B4A1C]/70 font-medium">{t('donation.donors')}</p>
              </div>
              <p className="text-2xl font-bold text-[#8E2C3A]">{stats.unique_donors || 0}</p>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 pt-6 space-y-6">
        <div className="bakery-card shadow-bakery border-2 border-[#C77B86]/20 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-[#D88A2D]" size={20} />
            <h2 className="text-lg font-bold text-[#8E2C3A]">{t('donation.choose_amount')}</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {PRESET_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount('');
                  }}
                  className={`py-4 rounded-2xl border-2 font-bold text-lg transition-all ${
                    selectedAmount === amount
                      ? 'bakery-gradient text-[#F5ECE3] border-[#D88A2D]'
                      : 'bg-[#F5ECE3] text-[#8E2C3A] border-[#C77B86]/30 hover:border-[#C77B86]'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>

            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B4A1C]/50" size={20} />
              <input
                type="number"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                placeholder={t('donation.custom_amount')}
                min="1"
                step="1"
                className="w-full pl-12 pr-4 py-3 bg-[#F5ECE3] border-2 border-[#C77B86]/30 rounded-2xl text-[#8E2C3A] font-bold placeholder:text-[#8B4A1C]/50 focus:outline-none focus:border-[#D88A2D] transition-colors"
              />
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder={t('donation.your_name')}
                className="w-full px-4 py-3 bg-[#F5ECE3] border-2 border-[#C77B86]/30 rounded-2xl text-[#8E2C3A] font-bold placeholder:text-[#8B4A1C]/50 focus:outline-none focus:border-[#D88A2D] transition-colors"
              />

              <input
                type="email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                placeholder={t('donation.your_email')}
                className="w-full px-4 py-3 bg-[#F5ECE3] border-2 border-[#C77B86]/30 rounded-2xl text-[#8E2C3A] font-bold placeholder:text-[#8B4A1C]/50 focus:outline-none focus:border-[#D88A2D] transition-colors"
              />

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-[#C77B86]/30 text-[#D88A2D] focus:ring-[#D88A2D]"
                />
                <span className="text-sm text-[#8B4A1C] font-medium">{t('donation.anonymous')}</span>
              </label>
            </div>

            {errorMessage && (
              <div className="p-4 rounded-2xl border-2 bg-red-50 border-red-300">
                <p className="text-sm font-bold text-red-700">{errorMessage}</p>
              </div>
            )}

            <button
              onClick={handleDonate}
              disabled={isDonating || (!selectedAmount && !customAmount)}
              className="w-full py-4 bakery-gradient hover:opacity-90 disabled:opacity-50 text-[#F5ECE3] rounded-full transition-all font-bold text-lg pill-button flex items-center justify-center gap-2"
            >
              {isDonating ? (
                <>
                  <Sparkles className="animate-spin" size={20} />
                  {t('donation.processing')}
                </>
              ) : (
                <>
                  <Heart size={20} />
                  {t('donation.donate')} ${selectedAmount || customAmount || '0'}
                </>
              )}
            </button>
          </div>
        </div>

        {user && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-[#8E2C3A]" size={20} />
              <h2 className="text-lg font-bold text-[#8E2C3A]">{t('donation.history')}</h2>
            </div>

            {isLoading ? (
              <div className="py-12 text-center">
                <Sparkles className="text-[#D88A2D] animate-pulse mx-auto mb-3" size={32} />
                <p className="text-[#8E2C3A] font-medium">{t('donation.loading')}</p>
              </div>
            ) : donations.length === 0 ? (
              <div className="py-12 text-center">
                <div className="inline-block p-4 bakery-card shadow-bakery mb-3">
                  <span className="text-5xl">💝</span>
                </div>
                <p className="text-[#8E2C3A] font-bold">{t('donation.none')}</p>
                <p className="text-sm text-[#8B4A1C]/70">{t('donation.first')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {donations.map((donation) => (
                  <div
                    key={donation.id}
                    className="bakery-card shadow-bakery border-2 border-[#C77B86]/20 p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D88A2D] to-[#8B4A1C] flex items-center justify-center">
                          <Heart className="text-[#F5ECE3]" size={24} />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-[#8E2C3A]">
                            ${donation.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-[#8B4A1C]/70 font-medium">
                            {formatDate(donation.created_at)}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(donation.status)}
                    </div>

                    {donation.status === 'completed' && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200">
                        <Check className="text-green-600" size={16} />
                        <p className="text-xs text-green-700 font-bold">
                          {t('donation.thank_you')}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
