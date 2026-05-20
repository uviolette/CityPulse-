import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock, AlertTriangle, MessageCircle, History, Send, ThumbsUp, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Incident, Comment, StatusHistory } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface IncidentDetailModalProps {
  incident: Incident;
  onClose: () => void;
}

export function IncidentDetailModal({ incident, onClose }: IncidentDetailModalProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>(incident.comments || []);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>(incident.status_history || []);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'history'>('details');

  useEffect(() => {
    fetchCommentsAndHistory();
  }, [incident.id]);

  const fetchCommentsAndHistory = async () => {
    try {
      const [commentsRes, historyRes] = await Promise.all([
        supabase
          .from('comments')
          .select('*, user:users(username, display_name, avatar_url)')
          .eq('incident_id', incident.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('status_history')
          .select('*, user:users(username, display_name)')
          .eq('incident_id', incident.id)
          .order('created_at', { ascending: false })
      ]);

      if (commentsRes.data) setComments(commentsRes.data);
      if (historyRes.data) setStatusHistory(historyRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          incident_id: incident.id,
          user_id: user.id,
          content: newComment.trim(),
        })
        .select('*, user:users(username, display_name, avatar_url)')
        .single();

      if (error) throw error;

      if (data) {
        setComments([data, ...comments]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'reported': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'event': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'incident': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'issue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getResolutionTime = () => {
    if (!incident.resolved_at) return null;
    const reported = new Date(incident.created_at);
    const resolved = new Date(incident.resolved_at);
    const diffHours = Math.floor((resolved.getTime() - reported.getTime()) / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ${diffHours % 24} hour${diffHours % 24 !== 1 ? 's' : ''}`;
    }
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="cool-gradient p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{incident.title}</h2>
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(incident.type)}`}>
                  {incident.type.charAt(0).toUpperCase() + incident.type.slice(1)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(incident.status)}`}>
                  {incident.status.charAt(0).toUpperCase() + incident.status.replace('_', ' ')}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(incident.severity)}`}>
                  {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)} Severity
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <ThumbsUp size={16} />
              <span className="text-sm">{incident.upvote_count} Upvotes</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span className="text-sm">{incident.volunteer_count} Volunteers</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle size={16} />
              <span className="text-sm">{comments.length} Comments</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span className="text-sm">{formatTimestamp(incident.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'details'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'comments'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Comments ({comments.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            History ({statusHistory.length})
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin size={16} />
                  Location
                </h3>
                <p className="text-gray-900">{incident.location_name}</p>
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                  {incident.zip_code && (
                    <p className="font-semibold text-blue-700">ZIP Code: {incident.zip_code}</p>
                  )}
                  {incident.state && <p>State: {incident.state}</p>}
                  {incident.county && <p>County: {incident.county}</p>}
                  {incident.city && <p>City: {incident.city}</p>}
                  {incident.neighborhood && <p>Neighborhood: {incident.neighborhood}</p>}
                  <p>Coordinates: {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}</p>
                </div>
              </div>

              {incident.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-900 whitespace-pre-wrap">{incident.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Category</h3>
                  <p className="text-gray-900 capitalize">{incident.category.replace('_', ' ')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Reported By</h3>
                  <p className="text-gray-900">{incident.user?.display_name || incident.user?.username || 'Anonymous'}</p>
                </div>
              </div>

              {incident.type === 'event' && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Clock size={16} />
                    Event Timeline
                  </h3>
                  <div className="space-y-2 text-sm">
                    {incident.start_time && (
                      <p className="text-blue-800">
                        <span className="font-medium">Starts:</span> {formatTimestamp(incident.start_time)}
                      </p>
                    )}
                    {incident.end_time && (
                      <p className="text-blue-800">
                        <span className="font-medium">Ends:</span> {formatTimestamp(incident.end_time)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {incident.status === 'resolved' && incident.resolved_at && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h3 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    Resolution Info
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-green-800">
                      <span className="font-medium">Resolved At:</span> {formatTimestamp(incident.resolved_at)}
                    </p>
                    {getResolutionTime() && (
                      <p className="text-green-800">
                        <span className="font-medium">Resolution Time:</span> {getResolutionTime()}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              {user && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleAddComment}
                      disabled={loading || !newComment.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send size={16} />
                      <span>Post Comment</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full cool-gradient flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {comment.user?.display_name?.[0] || comment.user?.username?.[0] || '?'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">
                            {comment.user?.display_name || comment.user?.username || 'Anonymous'}
                          </span>
                          <span className="text-xs text-gray-500">{formatTimestamp(comment.created_at)}</span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {comments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle size={48} className="mx-auto mb-3 opacity-50" />
                    <p>No comments yet</p>
                    <p className="text-sm">Be the first to comment!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {statusHistory.map((entry, index) => (
                <div key={entry.id} className="relative">
                  {index < statusHistory.length - 1 && (
                    <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-200" />
                  )}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 relative z-10">
                      <History size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1 bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          {entry.old_status && (
                            <p className="text-sm text-gray-600">
                              Changed from <span className="font-semibold">{entry.old_status}</span> to{' '}
                              <span className="font-semibold">{entry.new_status}</span>
                            </p>
                          )}
                          {!entry.old_status && (
                            <p className="text-sm text-gray-600">
                              Status set to <span className="font-semibold">{entry.new_status}</span>
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{formatTimestamp(entry.created_at)}</span>
                      </div>
                      {entry.user && (
                        <p className="text-xs text-gray-500">
                          by {entry.user.display_name || entry.user.username}
                        </p>
                      )}
                      {entry.comment && (
                        <p className="text-sm text-gray-700 mt-2 italic">{entry.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {statusHistory.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <History size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No status history available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
