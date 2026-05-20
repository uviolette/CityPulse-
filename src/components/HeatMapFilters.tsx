import React from 'react';
import { X, Calendar, AlertTriangle, Activity, MapPin } from 'lucide-react';
import { HeatMapFilters as Filters } from '../../types';

interface HeatMapFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClose: () => void;
}

export function HeatMapFilters({ filters, onFiltersChange, onClose }: HeatMapFiltersProps) {
  const toggleType = (type: 'issue' | 'event' | 'incident') => {
    const types = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type];

    onFiltersChange({ ...filters, types: types.length > 0 ? types : ['issue', 'event', 'incident'] });
  };

  const toggleStatus = (status: 'reported' | 'in_progress' | 'resolved') => {
    const statuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];

    onFiltersChange({ ...filters, statuses: statuses.length > 0 ? statuses : ['reported', 'in_progress', 'resolved'] });
  };

  const toggleSeverity = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    const severities = filters.severities.includes(severity)
      ? filters.severities.filter(s => s !== severity)
      : [...filters.severities, severity];

    onFiltersChange({ ...filters, severities: severities.length > 0 ? severities : ['low', 'medium', 'high', 'critical'] });
  };

  const setTimeRange = (start: Date | null, end: Date | null) => {
    onFiltersChange({ ...filters, timeRange: { start, end } });
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Activity size={18} className="text-gray-600" />
            <label className="text-sm font-medium text-gray-700">Type</label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => toggleType('issue')}
              className={`px-4 py-2 rounded-full transition-all font-bold ${
                filters.types.includes('issue')
                  ? 'status-critical-solid text-white shadow-sm'
                  : 'bg-[#F1E7D8] text-[#8E2C3A] border-2 border-[#C77B86]/30 hover:border-[#C77B86]'
              }`}
            >
              Issues
            </button>
            <button
              onClick={() => toggleType('event')}
              className={`px-4 py-2 rounded-full transition-all font-bold ${
                filters.types.includes('event')
                  ? 'status-active-solid text-white shadow-sm'
                  : 'bg-[#F1E7D8] text-[#8E2C3A] border-2 border-[#C77B86]/30 hover:border-[#C77B86]'
              }`}
            >
              Events
            </button>
            <button
              onClick={() => toggleType('incident')}
              className={`px-4 py-2 rounded-full transition-all font-bold ${
                filters.types.includes('incident')
                  ? 'status-warning-solid text-white shadow-sm'
                  : 'bg-[#F1E7D8] text-[#8E2C3A] border-2 border-[#C77B86]/30 hover:border-[#C77B86]'
              }`}
            >
              Major Incidents
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={18} className="text-gray-600" />
            <label className="text-sm font-medium text-gray-700">Status</label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => toggleStatus('reported')}
              className={`px-4 py-2 rounded-full transition-all font-bold ${
                filters.statuses.includes('reported')
                  ? 'status-critical-solid text-white shadow-sm'
                  : 'bg-[#F1E7D8] text-[#8E2C3A] border-2 border-[#C77B86]/30 hover:border-[#C77B86]'
              }`}
            >
              Reported
            </button>
            <button
              onClick={() => toggleStatus('in_progress')}
              className={`px-4 py-2 rounded-full transition-all font-bold ${
                filters.statuses.includes('in_progress')
                  ? 'status-active-solid text-white shadow-sm'
                  : 'bg-[#F1E7D8] text-[#8E2C3A] border-2 border-[#C77B86]/30 hover:border-[#C77B86]'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => toggleStatus('resolved')}
              className={`px-4 py-2 rounded-full transition-all font-bold ${
                filters.statuses.includes('resolved')
                  ? 'status-resolved-solid text-white shadow-sm'
                  : 'bg-[#F1E7D8] text-[#8E2C3A] border-2 border-[#C77B86]/30 hover:border-[#C77B86]'
              }`}
            >
              Resolved
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-gray-600" />
            <label className="text-sm font-medium text-gray-700">Severity</label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => toggleSeverity('low')}
              className={`px-4 py-2 rounded-full transition-all font-bold ${
                filters.severities.includes('low')
                  ? 'bg-[#8B4A1C] text-white shadow-sm'
                  : 'bg-[#F1E7D8] text-[#8E2C3A] border-2 border-[#C77B86]/30 hover:border-[#C77B86]'
              }`}
            >
              Low
            </button>
            <button
              onClick={() => toggleSeverity('medium')}
              className={`px-4 py-2 rounded-full transition-all font-bold ${
                filters.severities.includes('medium')
                  ? 'status-warning-solid text-white shadow-sm'
                  : 'bg-[#F1E7D8] text-[#8E2C3A] border-2 border-[#C77B86]/30 hover:border-[#C77B86]'
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => toggleSeverity('high')}
              className={`px-4 py-2 rounded-full transition-all font-bold ${
                filters.severities.includes('high')
                  ? 'bakery-gradient text-white shadow-sm'
                  : 'bg-[#F1E7D8] text-[#8E2C3A] border-2 border-[#C77B86]/30 hover:border-[#C77B86]'
              }`}
            >
              High
            </button>
            <button
              onClick={() => toggleSeverity('critical')}
              className={`px-4 py-2 rounded-full transition-all font-bold ${
                filters.severities.includes('critical')
                  ? 'status-critical-solid text-white shadow-sm'
                  : 'bg-[#F1E7D8] text-[#8E2C3A] border-2 border-[#C77B86]/30 hover:border-[#C77B86]'
              }`}
            >
              Critical
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={18} className="text-gray-600" />
            <label className="text-sm font-medium text-gray-700">Time Range</label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Start Date</label>
              <input
                type="date"
                value={filters.timeRange.start?.toISOString().split('T')[0] || ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  setTimeRange(date, filters.timeRange.end);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">End Date</label>
              <input
                type="date"
                value={filters.timeRange.end?.toISOString().split('T')[0] || ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  setTimeRange(filters.timeRange.start, date);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              onFiltersChange({
                types: ['issue', 'event', 'incident'],
                statuses: ['reported', 'in_progress', 'resolved'],
                severities: ['low', 'medium', 'high', 'critical'],
                timeRange: { start: null, end: null },
                state: null,
                city: null,
              });
            }}
            className="flex-1 px-4 py-2 bg-[#F1E7D8] text-[#8E2C3A] rounded-full border-2 border-[#C77B86]/30 hover:border-[#C77B86] transition-all font-bold"
          >
            Reset All
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bakery-gradient text-white rounded-full hover:shadow-bakery transition-all font-bold"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
