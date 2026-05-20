import React from 'react';
import { TrendingUp, TrendingDown, CheckCircle, AlertCircle, RefreshCw, Target } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'improvement' | 'warning' | 'milestone' | 'update';
  message: string;
  state?: string;
  change?: number;
  timestamp: Date;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'improvement':
        return <TrendingUp style={{ color: 'var(--status-resolved)' }} size={16} />;
      case 'warning':
        return <TrendingDown style={{ color: 'var(--status-critical)' }} size={16} />;
      case 'milestone':
        return <Target style={{ color: 'var(--status-resolved)' }} size={16} />;
      case 'update':
        return <RefreshCw style={{ color: 'var(--status-active)' }} size={16} />;
      default:
        return <AlertCircle className="text-gray-600" size={16} />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'improvement':
        return 'status-resolved-light border-2';
      case 'warning':
        return 'status-critical-light border-2';
      case 'milestone':
        return 'status-resolved-light border-2';
      case 'update':
        return 'status-active-light border-2';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <div className="space-y-2">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className={`p-3 rounded-2xl ${getBgColor(activity.type)} transition-all hover:shadow-sm`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#8E2C3A] leading-snug">
                {activity.message}
              </p>
              <p className="text-xs text-[#8B4A1C]/70 font-medium mt-1">{formatTime(activity.timestamp)}</p>
            </div>
            {activity.change && (
              <div className="text-sm font-bold" style={{ color: activity.change > 0 ? 'var(--status-resolved)' : 'var(--status-critical)' }}>
                {activity.change > 0 ? '+' : ''}{activity.change}%
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
