import React from 'react';
import { X, Download, Film, Music } from 'lucide-react';
import { formatTime } from '../utils/time';

export default function ClipPreviewModal({ clip, onClose }) {
  if (!clip) return null;

  const isAudio = clip.type === 'audio' || ['MP3', 'M4A', 'OGG', 'OPUS', 'WAV'].includes(clip.format);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0A0A0A] rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-800 text-white">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            {isAudio ? <Music className="w-4 h-4 text-[#FFFF99]" /> : <Film className="w-4 h-4 text-[#FFFF99]" />}
            <h3 className="text-sm font-bold truncate max-w-md">{clip.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Player */}
        <div className="bg-black flex items-center justify-center aspect-video max-h-[420px]">
          {isAudio ? (
            <div className="flex flex-col items-center justify-center p-8 space-y-4 w-full">
              <div className="w-20 h-20 rounded-2xl bg-[#FFFF99] flex items-center justify-center text-[#0A0A0A] shadow-xl border-2 border-black">
                <Music className="w-10 h-10" />
              </div>
              <div className="text-center">
                <div className="font-bold text-base text-white">{clip.title}</div>
                <div className="text-xs text-slate-400">{clip.format} · {clip.quality}</div>
              </div>
              <audio
                controls
                autoPlay
                src={clip.streamUrl}
                className="w-full max-w-md mt-4 accent-[#FFFF99]"
              />
            </div>
          ) : (
            <video
              controls
              autoPlay
              src={clip.streamUrl}
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* Footer info & Download */}
        <div className="px-5 py-4 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800/80">
          <div className="text-xs text-slate-400 space-y-0.5 text-center sm:text-left">
            <div>
              Duration: <span className="text-[#FFFF99] font-mono font-bold">{formatTime(clip.duration, true)}</span> ({clip.startTime}s - {clip.endTime}s)
            </div>
            <div>
              Size: <span className="text-white font-semibold">{clip.formattedSize || 'N/A'}</span> · Format: <span className="text-[#FFFF99] font-bold">{clip.format}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={clip.downloadUrl}
              download
              className="px-4 py-2 rounded-xl bg-[#FFFF99] hover:bg-[#FFF980] text-[#0A0A0A] border border-amber-300 text-xs font-black flex items-center gap-1.5 shadow-md shadow-[#FFFF99]/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Download File</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
