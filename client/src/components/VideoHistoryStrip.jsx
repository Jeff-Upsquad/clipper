import React, { useRef } from 'react';
import { 
  ChevronLeft, ChevronRight, Clock, Play, ArrowLeft, ArrowRight, X, ExternalLink, Sparkles 
} from 'lucide-react';

export default function VideoHistoryStrip({
  history = [],
  currentVideoId,
  canGoBack = false,
  canGoForward = false,
  previousVideo = null,
  nextVideo = null,
  onGoBack,
  onGoForward,
  onSelectVideo,
  onRemoveVideo,
  onOpenDrawer
}) {
  const scrollRef = useRef(null);

  if (!history || history.length === 0) return null;

  const scroll = (direction) => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white rounded-2xl p-3.5 sm:p-4 border-2 border-slate-900 shadow-xs space-y-2.5">
      {/* Strip Header with Back / Forward controls and View All */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FFFF99] border border-amber-300 flex items-center justify-center text-slate-900 shadow-2xs">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                Previous Connected Videos
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-black bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                {history.length}
              </span>
            </div>
          </div>
        </div>

        {/* Back / Forward Quick Jump Controls */}
        <div className="flex items-center gap-1.5">
          {/* Back Button */}
          <button
            onClick={onGoBack}
            disabled={!canGoBack}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
              canGoBack
                ? 'bg-white hover:bg-[#FFFF99] text-slate-900 border-slate-900 shadow-2xs cursor-pointer active:scale-95'
                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
            }`}
            title={previousVideo ? `Jump back to: ${previousVideo.title || previousVideo.id}` : 'No previous video in stack'}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          {/* Forward Button */}
          <button
            onClick={onGoForward}
            disabled={!canGoForward}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
              canGoForward
                ? 'bg-white hover:bg-[#FFFF99] text-slate-900 border-slate-900 shadow-2xs cursor-pointer active:scale-95'
                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
            }`}
            title={nextVideo ? `Jump forward to: ${nextVideo.title || nextVideo.id}` : 'No next video in stack'}
          >
            <span className="hidden sm:inline">Forward</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* View All Drawer Trigger */}
          <button
            onClick={onOpenDrawer}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 transition-colors cursor-pointer"
            title="Open all connected videos"
          >
            <span>All ({history.length})</span>
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Carousel Cards */}
      <div className="relative group/carousel">
        <div
          ref={scrollRef}
          className="flex items-stretch gap-3 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {history.map((video) => {
            const isCurrent = video.id === currentVideoId;
            const thumb = video.thumbnail || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;

            return (
              <div
                key={video.id}
                onClick={() => {
                  if (!isCurrent) onSelectVideo(video.id);
                }}
                className={`w-64 shrink-0 rounded-xl p-2.5 border transition-all select-none flex flex-col justify-between relative group/card ${
                  isCurrent
                    ? 'bg-[#FFFF99]/25 border-slate-900 ring-2 ring-slate-900 shadow-xs cursor-default'
                    : 'bg-slate-50/80 hover:bg-white border-slate-200 hover:border-slate-800 hover:shadow-md cursor-pointer'
                }`}
              >
                {/* Thumbnail & Badges */}
                <div className="relative w-full h-28 rounded-lg overflow-hidden bg-slate-900 mb-2 border border-slate-200">
                  <img
                    src={thumb}
                    alt={video.title || video.id}
                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      e.target.src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
                    }}
                  />

                  {/* Duration Pill */}
                  {video.formattedDuration && (
                    <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/85 text-[10px] font-mono font-bold text-white leading-none">
                      {video.formattedDuration}
                    </div>
                  )}

                  {/* Active Indicator or Play overlay */}
                  {isCurrent ? (
                    <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-[#0A0A0A] text-[#FFFF99] text-[9px] font-black tracking-wider uppercase border border-slate-800 shadow-xs">
                      Active
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/card:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="w-8 h-8 rounded-full bg-[#FFFF99] border border-black flex items-center justify-center shadow-md">
                        <Play className="w-4 h-4 text-slate-900 fill-slate-900 ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Remove button */}
                  {onRemoveVideo && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveVideo(video.id);
                      }}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-md opacity-0 group-hover/card:opacity-100 transition-opacity cursor-pointer"
                      title="Remove from history"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 
                    className={`text-xs font-bold leading-snug line-clamp-2 transition-colors ${
                      isCurrent ? 'text-slate-900' : 'text-slate-800 group-hover/card:text-black'
                    }`}
                    title={video.title || video.id}
                  >
                    {video.title || `YouTube Video (${video.id})`}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-1">
                    <span className="truncate max-w-[130px]">
                      {video.channel || 'YouTube'}
                    </span>
                    {isCurrent ? (
                      <span className="text-[10px] font-black text-slate-900 bg-[#FFFF99] px-1.5 py-0.2 rounded border border-amber-300">
                        Cutting Now
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-700 group-hover/card:text-black group-hover/card:underline flex items-center gap-0.5">
                        Jump <ArrowRight className="w-2.5 h-2.5 inline" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
