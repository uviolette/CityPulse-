import React from 'react';
import { Incident } from '../../types';
import { Clock, MapPin, ThumbsUp, Users } from 'lucide-react';
import { getCategoryInfo } from '../../utils/sustainability';

interface FeedItemProps {
  incident: Incident;
  onTap: () => void;
}

export function FeedItem({ incident, onTap }: FeedItemProps) {
  const categoryInfo = getCategoryInfo(incident.category);
  const CategoryIcon = categoryInfo.icon;

  const timeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <button
      onClick={onTap}
      className="w-full text-left group"
    >
      <div className="cool-card shadow-cool hover:shadow-lg transition-all duration-200 overflow-hidden border-2 border-gray-100 hover:border-blue-200">
        <div className={`h-2 bg-gradient-to-r ${categoryInfo.color}`} />

        <div className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${categoryInfo.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
              <CategoryIcon className="text-white" size={22} />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-800 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {incident.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                <Clock size={11} />
                {timeAgo(incident.created_at)}
              </div>
            </div>
          </div>

          {incident.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
              {incident.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
            <MapPin size={13} className="text-blue-500" />
            <span className="truncate font-semibold">{incident.location_name || 'Unknown location'}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${categoryInfo.bgColor} ${categoryInfo.textColor} text-xs font-bold ${categoryInfo.borderColor} border-2`}>
              <CategoryIcon size={12} />
              {categoryInfo.label}
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-blue-600 font-bold">
                <ThumbsUp size={14} />
                {incident.upvote_count}
              </div>
              <div className="flex items-center gap-1 text-blue-500 font-bold">
                <Users size={14} />
                {incident.volunteer_count}
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
