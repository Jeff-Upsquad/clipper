import React from 'react';
import { X, Trash2, Download, Eye, Film, Music, Clock, FolderOpen } from 'lucide-react';
import { formatTime } from '../utils/time';

export default function ClipsDrawer({
  isOpen,
  onClose,
  clips = [],
  onDeleteClip,
  onOpenPreview
}) {
  if (!isOpen) return null;

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
              <FolderOpen className="w-5 h-5 text-slate-900" />
              <h2 className="text-base font-black text-slate-900">
                My Clipped Videos ({clips.length})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Clips List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {clips.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                <Film className="w-10 h-10 stroke-1 text-slate-300" />
                <p className="text-sm font-bold text-slate-700">No clips created yet</p>
                <p className="text-xs text-slate-500 max-w-xs font-normal">
                  Pick your timestamps on any YouTube video and click "Trim Now" to build your clips library.
                </p>
              </div>
            ) : (
              clips.map((clip) => {
                const isFinished = clip.status === 'finished';
                const isAudio = clip.type === 'audio';

                return (
                  <div
                    key={clip.clipId}
                    className="p-3.5 bg-slate-50 hover:bg-white rounded-xl border border-slate-300 transition-all flex flex-col gap-2.5 shadow-2xs hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      {/* Thumbnail with format icon */}
                      <div className="relative w-20 h-12 bg-slate-900 rounded-lg overflow-hidden shrink-0 border border-slate-300">
                        {clip.thumbnail ? (
                          <img
                            src={clip.thumbnail}
                            alt={clip.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-900 text-[#FFFF99]">
                            {isAudio ? <Music className="w-4 h-4" /> : <Film className="w-4 h-4" />}
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/85 text-[9px] font-mono font-bold text-[#FFFF99] rounded">
                          {formatTime(clip.duration)}
                        </span>
                      </div>

                      {/* Title & Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate" title={clip.title}>
                          {clip.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span className="font-mono bg-[#FFFF99] px-1.5 py-0.5 rounded border border-amber-300 text-slate-900 font-extrabold">
                            {clip.format}
                          </span>
                          <span className="font-medium text-slate-600">{clip.formattedSize || 'Processing...'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress bar if still trimming */}
                    {!isFinished && clip.status !== 'error' && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-600 font-semibold">
                          <span className="capitalize">{clip.status}...</span>
                          <span className="font-mono font-bold">{clip.percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden border border-slate-300">
                          <div
                            className="bg-[#FFFF99] h-2 rounded-full transition-all"
                            style={{ width: `${clip.percentage}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-xs">
                      <div className="text-[11px] text-slate-500 font-mono font-semibold">
                        {clip.startTime}s → {clip.endTime}s
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isFinished && (
                          <>
                            <button
                              onClick={() => onOpenPreview(clip)}
                              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Watch preview"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Play</span>
                            </button>

                            <a
                              href={clip.downloadUrl}
                              download
                              className="px-2.5 py-1 rounded-lg bg-[#FFFF99] hover:bg-[#FFF980] text-[#0A0A0A] border border-amber-300 text-xs font-black flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
                              title="Download to computer"
                            >
                              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Download</span>
                            </a>
                          </>
                        )}

                        <button
                          onClick={() => onDeleteClip(clip.clipId)}
                          className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-md transition-colors cursor-pointer"
                          title="Delete clip"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
