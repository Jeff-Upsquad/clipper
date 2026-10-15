import React, { useState } from 'react';
import { Scissors, Film, Sparkles, FolderDown, ArrowRight } from 'lucide-react';
import { extractYouTubeId } from '../utils/time';

export default function Navbar({ onSelectVideo, currentVideoId, clipsCount = 0, onOpenClips }) {
  const [inputUrl, setInputUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = extractYouTubeId(inputUrl);
    if (id) {
      onSelectVideo(id);
      setInputUrl('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo: YT clipper */}
        <div 
          onClick={() => onSelectVideo(null)}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0 select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0A0A0A] border-2 border-[#FFFF99] flex items-center justify-center text-[#FFFF99] shadow-md shadow-black/10 group-hover:scale-105 transition-transform">
            <Scissors className="w-5 h-5 -rotate-45" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-slate-900">
                <span className="bg-[#FFFF99] text-[#0A0A0A] px-2.5 py-0.5 rounded-lg border border-amber-300 font-black tracking-tight">Clipper</span>
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#0A0A0A] text-[#FFFF99] px-2 py-0.5 rounded-md border border-slate-800">
                4K RAW
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium -mt-0.5 hidden sm:inline">Lossless YouTube Trimmer</span>
          </div>
        </div>

        {/* Quick URL Input (visible if video is loaded or desktop) */}
        {currentVideoId && (
          <form onSubmit={handleSubmit} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full flex items-center">
              <input
                type="text"
                placeholder="Paste another YouTube link..."
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="w-full text-xs sm:text-sm pl-3.5 pr-20 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 focus:bg-white border border-transparent focus:border-black focus:ring-2 focus:ring-[#FFFF99] outline-none transition-all"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-3 bg-[#FFFF99] hover:bg-[#FFF980] text-[#0A0A0A] border border-amber-300 text-xs font-bold rounded-lg flex items-center gap-1 transition-all shadow-xs cursor-pointer"
              >
                <span>Load</span>
                <ArrowRight className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>
          </form>
        )}

        {/* Navigation Items */}
        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <a href="#how-it-works" className="hover:text-black hover:bg-[#FFFF99]/50 px-2 py-1 rounded-md transition-colors">How It Works</a>
            <a href="#features" className="hover:text-black hover:bg-[#FFFF99]/50 px-2 py-1 rounded-md transition-colors">Features</a>
            <a href="#formats" className="hover:text-black hover:bg-[#FFFF99]/50 px-2 py-1 rounded-md transition-colors">Formats</a>
            <a href="#faq" className="hover:text-black hover:bg-[#FFFF99]/50 px-2 py-1 rounded-md transition-colors">FAQ</a>
          </nav>

          {/* My Clips Button / Counter */}
          <button
            onClick={onOpenClips}
            className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FFFF99]/40 active:scale-95 text-slate-800 text-sm font-bold transition-all border border-slate-300 shadow-2xs cursor-pointer"
            title="View downloaded & active clips"
          >
            <FolderDown className="w-4 h-4 text-slate-800" />
            <span className="hidden sm:inline">My Clips</span>
            {clipsCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-black leading-none text-[#0A0A0A] bg-[#FFFF99] border border-amber-300 rounded-full">
                {clipsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
