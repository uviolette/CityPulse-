import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { X, MapPin, AlertTriangle, Sparkles, Navigation } from 'lucide-react';
import { sustainabilityCategories, getCategoryInfo } from '../../utils/sustainability';
import { resolveIncidentLocation } from '../../utils/zipcode';

interface CreateIncidentProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateIncident({ onClose, onSuccess }: CreateIncidentProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('community_gardens');
  const [zipCode, setZipCode] = useState('');
  const [resolvedLocation, setResolvedLocation] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const categoryInfo = getCategoryInfo(category);
  const CategoryIcon = categoryInfo.icon;

  useEffect(() => {
    if (user) {
      fetchUserZipCode();
    }
  }, [user]);

  async function fetchUserZipCode() {
    if (!user) return;

    const { data } = await supabase
      .from('users')
      .select('zip_code, location_name')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setZipCode(data.zip_code || '');
      setResolvedLocation(data.location_name || '');
    }
  }

  async function handleZipCodeChange(newZip: string) {
    setZipCode(newZip);
    setError('');

    if (newZip.length === 5) {
      try {
        const location = await resolveIncidentLocation(newZip);
        setResolvedLocation(location.locationName);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid ZIP code');
        setResolvedLocation('');
      }
    } else {
      setResolvedLocation('');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setError('');
    setIsLoading(true);

    try {
      if (!title.trim()) {
        throw new Error('Title is required');
      }

      if (!zipCode || zipCode.length !== 5) {
        throw new Error('Please enter a valid 5-digit ZIP code');
      }

      const location = await resolveIncidentLocation(zipCode);

      const { error: insertError } = await supabase.from('incidents').insert({
        user_id: user.id,
        title,
        description,
        category,
        zip_code: zipCode,
        state: location.state,
        county: location.county,
        city: location.city,
        neighborhood: location.neighborhood,
        location_name: location.locationName,
        latitude: location.latitude,
        longitude: location.longitude,
        type: 'issue',
        severity: 'low',
        status: 'reported',
      });

      if (insertError) throw insertError;

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create initiative');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-[#8E2C3A]/40 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full bg-[#F5ECE3] rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-bakery">
        <div className="sticky top-0 bg-[#F5ECE3]/95 backdrop-blur-md border-b-2 border-[#C77B86]/20 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="text-[#D88A2D]" size={24} />
            <h2 className="text-xl font-bold text-[#8E2C3A]">Start an Initiative</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#C77B86]/20 rounded-2xl transition-colors"
          >
            <X size={24} className="text-[#8E2C3A]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 pb-24">
          {error && (
            <div className="p-4 bg-[#C77B86]/10 border-2 border-[#C77B86]/30 rounded-3xl text-[#8E2C3A] text-sm flex items-start gap-3 font-medium">
              <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className={`p-6 rounded-3xl bg-gradient-to-br ${categoryInfo.color} text-white text-center shadow-bakery`}>
            <div className="text-5xl mb-3">{categoryInfo.emoji}</div>
            <p className="font-bold text-lg">{categoryInfo.label}</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#8E2C3A] mb-3">
              Choose Category
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(sustainabilityCategories).map(([key, info]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className={`p-4 rounded-3xl border-2 transition-all ${
                    category === key
                      ? `${info.bgColor} ${info.borderColor} border-2 shadow-md`
                      : 'bg-[#F1E7D8] border-[#C77B86]/30 hover:border-[#C77B86]'
                  }`}
                >
                  <div className="text-3xl mb-2">{info.emoji}</div>
                  <p className={`text-xs font-bold ${category === key ? info.textColor : 'text-[#8B4A1C]'}`}>
                    {info.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#8E2C3A] mb-2">
              What's your initiative? *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Community Garden on Main Street"
              className="w-full px-5 py-4 bg-[#F1E7D8] border-2 border-[#C77B86]/30 rounded-full text-[#8E2C3A] placeholder-[#8E2C3A]/40 focus:outline-none focus:ring-2 focus:ring-[#8E2C3A] focus:border-transparent transition-all font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#8E2C3A] mb-2">
              Tell us more
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your initiative and how people can help..."
              className="w-full px-5 py-4 bg-[#F1E7D8] border-2 border-[#C77B86]/30 rounded-3xl text-[#8E2C3A] placeholder-[#8E2C3A]/40 focus:outline-none focus:ring-2 focus:ring-[#8E2C3A] focus:border-transparent resize-none transition-all"
              rows={5}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#8E2C3A] mb-2 flex items-center gap-2">
              <Navigation size={18} className="text-[#D88A2D]" />
              Location (ZIP Code) *
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={zipCode}
                onChange={(e) => handleZipCodeChange(e.target.value)}
                placeholder="Enter ZIP code (e.g., 11417)"
                maxLength={5}
                className="w-full px-5 py-4 bg-[#F1E7D8] border-2 border-[#C77B86]/30 rounded-full text-[#8E2C3A] placeholder-[#8E2C3A]/40 focus:outline-none focus:ring-2 focus:ring-[#D88A2D] focus:border-transparent transition-all font-medium"
                required
              />
              {resolvedLocation && (
                <div className="px-4 py-3 bg-gradient-to-r from-[#D88A2D]/10 to-[#F1E7D8] border-2 border-[#D88A2D]/30 rounded-full flex items-center gap-2">
                  <MapPin size={16} className="text-[#D88A2D]" />
                  <span className="text-sm font-bold text-[#8E2C3A]">
                    {resolvedLocation}
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bakery-gradient text-[#F5ECE3] font-bold py-5 pill-button text-lg disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Launch Initiative'}
          </button>

          <p className="text-xs text-[#8B4A1C]/70 text-center leading-relaxed font-medium">
            By creating an initiative, you're taking the first step towards a stronger community.
          </p>
        </form>
      </div>
    </div>
  );
}
