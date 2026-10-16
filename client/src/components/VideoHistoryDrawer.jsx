import React, { useState } from 'react';
import { X, Trash2, Clock, Play, Search, ExternalLink, Film, ArrowRight } from 'lucide-react';

export default function VideoHistoryDrawer({
  isOpen,
  onClose,
  history = [],
  currentVideoId,
  onSelectVideo,
  onRemoveVideo,
  onClearHistory
}) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.channel && item.channel.toLowerCase().includes(q)) ||
      (item.id && item.id.toLowerCase().includes(q))
    );
  });

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Recently';
    const elapsed = Math.floor((Date.now() - timestamp) / 1000);
    if (elapsed < 60) return 'Just now';
    const mins = Math.floor(elapsed / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l-2 border-slate-900">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-[#FFFF99]/30">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-900" />
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Connected Videos History
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">
                  {history.length} {history.length === 1 ? 'video' : 'videos'} connected
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar & Actions */}
          {history.length > 0 && (
            <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by title, channel, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 focus:border-black focus:ring-1 focus:ring-[#FFFF99] outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {history.length > 1 && (
                <button
                  onClick={() => {
                    if (window.confirm('Clear all connected video history?')) {
                      onClearHistory();
                    }
                  }}
                  className="px-2.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors cursor-pointer shrink-0"
                  title="Clear video history"
                >
                  Clear All
                </button>
              )}
            </div>
          )}

          {/* History List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {history.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                <Film className="w-10 h-10 stroke-1 text-slate-300" />
                <p className="text-sm font-bold text-slate-700">No previous videos yet</p>
                <p className="text-xs text-slate-500 max-w-xs font-normal">
                  As you paste and connect YouTube videos to clip, they will appear here so you can jump back anytime.
                </p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-center p-4 text-slate-400">
                <p className="text-xs font-semibold">No videos match "{searchQuery}"</p>
              </div>
            ) : (
              filteredHistory.map((video) => {
                const isCurrent = video.id === currentVideoId;
                const thumb = video.thumbnail || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;

                return (
                  <div
                    key={video.id}
                    className={`p-3 rounded-2xl border transition-all flex flex-col gap-2.5 relative group ${
                      isCurrent
                        ? 'bg-[#FFFF99]/20 border-slate-900 shadow-sm ring-1 ring-slate-900/10'
                        : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-400 shadow-2xs hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Thumbnail with duration badge */}
                      <div 
                        onClick={() => {
                          if (!isCurrent) {
                            onSelectVideo(video.id);
                            onClose();
                          }
                        }}
                        className="relative w-24 h-16 rounded-xl overflow-hidden bg-slate-900 shrink-0 cursor-pointer group/thumb border border-slate-300 shadow-2xs"
                      >
                        <img
                          src={thumb}
                          alt={video.title || video.id}
                          className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            e.target.src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
                          }}
                        />
                        {video.formattedDuration && (
                          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono font-bold text-white leading-none">
                            {video.formattedDuration}
                          </div>
                        )}
                        {!isCurrent && (
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                            <Play className="w-5 h-5 text-[#FFFF99] fill-[#FFFF99]" />
                          </div>
                        )}
                      </div>

                      {/* Video Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          {isCurrent ? (
                            <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-[#0A0A0A] text-[#FFFF99] rounded border border-slate-800">
                              Current
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-slate-400">
                              {formatRelativeTime(video.connectedAt)}
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-slate-400 truncate">
                            ID: {video.id}
                          </span>
                        </div>

                        <h3 
                          onClick={() => {
                            if (!isCurrent) {
                              onSelectVideo(video.id);
                              onClose();
                            }
                          }}
                          className={`text-xs font-bold leading-snug line-clamp-2 cursor-pointer transition-colors ${
                            isCurrent ? 'text-slate-900' : 'text-slate-800 hover:text-black hover:underline'
                          }`}
                          title={video.title || video.id}
                        >
                          {video.title || `YouTube Video (${video.id})`}
                        </h3>

                        {video.channel && (
                          <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                            {video.channel}
                          </p>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveVideo(video.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0 opacity-80 sm:opacity-0 group-hover:opacity-100"
                        title="Remove from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Quick Jump Action Bar */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                      <a
                        href={`https://youtube.com/watch?v=${video.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1 font-medium"
                      >
                        <span>Open on YouTube</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>

                      {isCurrent ? (
                        <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          Currently Active
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            onSelectVideo(video.id);
                            onClose();
                          }}
                          className="px-3 py-1 bg-[#FFFF99] hover:bg-[#FFF980] text-[#0A0A0A] font-bold text-xs rounded-lg border border-amber-300 flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer"
                        >
                          <span>Jump to Video</span>
                          <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
