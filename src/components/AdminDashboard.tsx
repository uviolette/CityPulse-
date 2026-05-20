import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { GiftCard, Donation } from '../../types';
import { Shield, Gift, Heart, Plus, Calendar, DollarSign, Users, Download, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface CreateGiftCardForm {
  value: string;
  issued_to_user_id: string;
  expires_at: string;
  notes: string;
}

export function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'gift-cards' | 'donations'>('gift-cards');
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateGiftCardForm>({
    value: '',
    issued_to_user_id: '',
    expires_at: '',
    notes: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (activeTab === 'gift-cards') {
      fetchGiftCards();
    } else {
      fetchDonations();
    }
  }, [activeTab]);

  async function fetchGiftCards() {
    setIsLoading(true);
    const { data } = await supabase
      .from('gift_cards')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setGiftCards(data);
    }
    setIsLoading(false);
  }

  async function fetchDonations() {
    setIsLoading(true);
    const { data } = await supabase
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setDonations(data);
    }
    setIsLoading(false);
  }

  async function handleCreateGiftCard() {
    const value = parseFloat(formData.value);

    if (!value || value <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid gift card value' });
      return;
    }

    setIsCreating(true);
    setMessage(null);

    try {
      const { data: codeData, error: codeError } = await supabase.rpc('generate_gift_card_code');

      if (codeError || !codeData) {
        throw new Error('Failed to generate gift card code');
      }

      const { error } = await supabase.from('gift_cards').insert({
        code: codeData,
        value,
        status: 'unused',
        issued_to_user_id: formData.issued_to_user_id || null,
        expires_at: formData.expires_at || null,
        created_by: user?.id || null,
        notes: formData.notes || null,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: `Gift card created successfully! Code: ${codeData}` });
      setFormData({ value: '', issued_to_user_id: '', expires_at: '', notes: '' });
      setShowCreateForm(false);
      fetchGiftCards();
    } catch (error) {
      console.error('Error creating gift card:', error);
      setMessage({ type: 'error', text: 'Failed to create gift card' });
    } finally {
      setIsCreating(false);
    }
  }

  async function handleExpireCard(cardId: string) {
    try {
      const { error } = await supabase
        .from('gift_cards')
        .update({ status: 'expired' })
        .eq('id', cardId);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Gift card expired successfully' });
      fetchGiftCards();
    } catch (error) {
      console.error('Error expiring card:', error);
      setMessage({ type: 'error', text: 'Failed to expire gift card' });
    }
  }

  async function exportDonations() {
    const csv = [
      ['Date', 'Amount', 'Currency', 'Status', 'Donor Name', 'Donor Email', 'Anonymous'].join(','),
      ...donations.map((d) =>
        [
          new Date(d.created_at).toLocaleDateString(),
          d.amount,
          d.currency,
          d.status,
          d.donor_name || '',
          d.donor_email || '',
          d.is_anonymous,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalDonations = donations.filter((d) => d.status === 'completed').reduce((sum, d) => sum + d.amount, 0);
  const unusedCards = giftCards.filter((c) => c.status === 'unused').length;
  const totalCardValue = giftCards.filter((c) => c.status === 'unused').reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="pb-24 min-h-screen">
      <div className="sticky top-0 z-10 glass-effect shadow-cool px-6 py-4 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="text-blue-500" size={28} />
            <h1 className="text-2xl font-bold text-blue-600">Admin Dashboard</h1>
          </div>
          <p className="text-sm text-gray-600 font-medium">Manage gift cards and donations</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="cool-card shadow-cool border-2 border-blue-100 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Gift className="text-blue-500" size={16} />
              <p className="text-xs text-gray-600 font-medium">Unused Cards</p>
            </div>
            <p className="text-xl font-bold text-blue-600">{unusedCards}</p>
          </div>
          <div className="cool-card shadow-cool border-2 border-blue-100 p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="text-blue-500" size={16} />
              <p className="text-xs text-gray-600 font-medium">Card Value</p>
            </div>
            <p className="text-xl font-bold text-blue-600">${totalCardValue}</p>
          </div>
          <div className="cool-card shadow-cool border-2 border-blue-100 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="text-blue-500" size={16} />
              <p className="text-xs text-gray-600 font-medium">Donations</p>
            </div>
            <p className="text-xl font-bold text-blue-600">${totalDonations}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('gift-cards')}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${
              activeTab === 'gift-cards'
                ? 'cool-gradient text-white shadow-md'
                : 'bg-white text-blue-600 border-2 border-gray-200 hover:border-blue-300'
            }`}
          >
            Gift Cards
          </button>
          <button
            onClick={() => setActiveTab('donations')}
            className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${
              activeTab === 'donations'
                ? 'cool-gradient text-white shadow-md'
                : 'bg-white text-blue-600 border-2 border-gray-200 hover:border-blue-300'
            }`}
          >
            Donations
          </button>
        </div>
      </div>

      <div className="px-6 pt-6 space-y-4">
        {message && (
          <div
            className={`p-4 rounded-2xl border-2 ${
              message.type === 'success'
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'bg-red-50 border-red-300 text-red-700'
            }`}
          >
            <p className="text-sm font-bold">{message.text}</p>
          </div>
        )}

        {activeTab === 'gift-cards' && (
          <>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="w-full py-3 cool-gradient hover:opacity-90 text-white rounded-full transition-all font-bold text-sm pill-button flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Create Gift Card
            </button>

            {showCreateForm && (
              <div className="cool-card shadow-cool border-2 border-gray-100 p-5 space-y-4">
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="Gift card value ($)"
                  min="1"
                  step="1"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-800 font-bold placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                />

                <input
                  type="text"
                  value={formData.issued_to_user_id}
                  onChange={(e) => setFormData({ ...formData, issued_to_user_id: e.target.value })}
                  placeholder="User ID (optional)"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-800 font-bold placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                />

                <input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  placeholder="Expiration date (optional)"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-800 font-bold placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                />

                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes (optional)"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-800 font-bold placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="py-3 bg-white border-2 border-gray-200 hover:border-blue-300 text-blue-600 rounded-full transition-all font-bold text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateGiftCard}
                    disabled={isCreating}
                    className="py-3 cool-gradient hover:opacity-90 disabled:opacity-50 text-white rounded-full transition-all font-bold text-sm pill-button flex items-center justify-center gap-2"
                  >
                    {isCreating ? (
                      <>
                        <Sparkles className="animate-spin" size={16} />
                        Creating...
                      </>
                    ) : (
                      'Create'
                    )}
                  </button>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="py-12 text-center">
                <Sparkles className="text-blue-500 animate-pulse mx-auto mb-3" size={32} />
                <p className="text-blue-600 font-medium">Loading gift cards...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {giftCards.map((card) => (
                  <div key={card.id} className="cool-card shadow-cool border-2 border-gray-100 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">${card.value.toFixed(2)}</p>
                        <p className="text-sm font-bold text-blue-500 tracking-wider">{card.code}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
                          card.status === 'unused'
                            ? 'bg-green-100 text-green-700 border-green-300'
                            : card.status === 'redeemed'
                            ? 'bg-blue-100 text-blue-700 border-blue-300'
                            : 'bg-gray-100 text-gray-700 border-gray-300'
                        }`}
                      >
                        {card.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <p>
                        <span className="font-bold">Created:</span> {formatDate(card.created_at)}
                      </p>
                      <p>
                        <span className="font-bold">Expires:</span> {formatDate(card.expires_at)}
                      </p>
                      {card.redeemed_at && (
                        <p className="col-span-2">
                          <span className="font-bold">Redeemed:</span> {formatDate(card.redeemed_at)}
                        </p>
                      )}
                    </div>

                    {card.notes && (
                      <p className="mt-3 text-xs text-gray-600 p-3 bg-gray-50 rounded-xl">{card.notes}</p>
                    )}

                    {card.status === 'unused' && (
                      <button
                        onClick={() => handleExpireCard(card.id)}
                        className="mt-3 w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full transition-all font-bold text-xs"
                      >
                        Mark as Expired
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'donations' && (
          <>
            <button
              onClick={exportDonations}
              disabled={donations.length === 0}
              className="w-full py-3 bakery-gradient hover:opacity-90 disabled:opacity-50 text-[#F5ECE3] rounded-full transition-all font-bold text-sm pill-button flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Export Donations CSV
            </button>

            {isLoading ? (
              <div className="py-12 text-center">
                <Sparkles className="text-blue-500 animate-pulse mx-auto mb-3" size={32} />
                <p className="text-blue-600 font-medium">Loading donations...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {donations.map((donation) => (
                  <div key={donation.id} className="cool-card shadow-cool border-2 border-gray-100 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">${donation.amount.toFixed(2)}</p>
                        <p className="text-xs text-gray-600 font-medium">{formatDate(donation.created_at)}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
                          donation.status === 'completed'
                            ? 'bg-green-100 text-green-700 border-green-300'
                            : donation.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                            : donation.status === 'failed'
                            ? 'bg-red-100 text-red-700 border-red-300'
                            : 'bg-gray-100 text-gray-700 border-gray-300'
                        }`}
                      >
                        {donation.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-gray-600">
                      {donation.donor_name && (
                        <p>
                          <span className="font-bold">Name:</span> {donation.donor_name}
                        </p>
                      )}
                      {donation.donor_email && (
                        <p>
                          <span className="font-bold">Email:</span> {donation.donor_email}
                        </p>
                      )}
                      <p>
                        <span className="font-bold">Anonymous:</span> {donation.is_anonymous ? 'Yes' : 'No'}
                      </p>
                      {donation.stripe_payment_intent_id && (
                        <p className="font-mono text-xs">
                          <span className="font-bold">Payment ID:</span> {donation.stripe_payment_intent_id}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
