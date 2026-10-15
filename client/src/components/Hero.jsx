import React, { useState } from 'react';
import { Scissors, Play, Sparkles, CheckCircle2, Zap } from 'lucide-react';
import { extractYouTubeId } from '../utils/time';

export default function Hero({ onSelectVideo }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const sampleVideos = [
    { id: 'AgwWYSlFCkE', label: 'Kerala Blasters Official Crest Reveal', desc: '0:19 · Requested' },
    { id: 'dQw4w9WgXcQ', label: 'Rick Astley - Never Gonna Give You Up', desc: '3:33 · Music' },
    { id: 'jNQXAC9IVRw', label: 'Me at the zoo (First YouTube Video)', desc: '0:19 · Classic' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a YouTube video URL or ID');
      return;
    }
    const videoId = extractYouTubeId(url);
    if (!videoId) {
      setError('Could not parse a valid YouTube video ID from that link');
      return;
    }
    setError('');
    onSelectVideo(videoId);
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28 bg-linear-to-b from-slate-50 via-white to-slate-50 border-b border-slate-200/70">
      {/* Background glowing effects using #FFFF99 */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#FFFF99]/30 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Top pill badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFF99]/50 border border-amber-300 text-slate-900 text-xs font-bold uppercase tracking-wider mb-6 shadow-2xs">
          <Zap className="w-3.5 h-3.5 fill-[#0A0A0A] text-[#0A0A0A]" />
          <span>Instant Frame-Accurate Cutting · 0% Quality Loss</span>
        </div>

        {/* Main Title: Clipper */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-5">
          <span className="relative inline-block px-4 py-1 bg-[#FFFF99] text-[#0A0A0A] rounded-2xl border-3 border-slate-900 shadow-md">Clipper</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
          Cut any YouTube video to the exact clip you want, in original 4K quality with zero re-encoding. No quality loss, blazing-fast processing. Just paste a link and pick your timestamps.
        </p>

        {/* Big Input Form */}
        <div className="max-w-2xl mx-auto mb-6">
          <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row items-stretch gap-2.5 bg-white p-2 sm:p-2.5 rounded-2xl shadow-xl shadow-slate-200/60 border-2 border-slate-900">
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                autoComplete="off"
                placeholder="Paste YouTube video link here... (e.g. https://youtu.be/AgwWYSlFCkE)"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError('');
                }}
                className="w-full pl-4 pr-3 py-3.5 text-sm sm:text-base text-slate-900 placeholder-slate-400 bg-transparent outline-none font-medium"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 bg-[#FFFF99] hover:bg-[#FFF980] active:scale-98 text-[#0A0A0A] text-sm sm:text-base font-black rounded-xl border border-amber-300 shadow-md shadow-[#FFFF99]/40 hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Scissors className="w-4 h-4 stroke-[2.5]" />
              <span>Trim Now</span>
            </button>
          </form>

          {error && (
            <p className="text-rose-500 text-xs sm:text-sm mt-2 font-medium text-left px-2">
              {error}
            </p>
          )}
        </div>

        {/* Quick sample chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto mb-8 text-xs text-slate-500">
          <span className="font-semibold mr-1 text-slate-400">Try sample:</span>
          {sampleVideos.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSelectVideo(sample.id)}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#FFFF99] hover:text-black border border-slate-300 hover:border-black transition-all font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Play className="w-3 h-3 text-[#0A0A0A] fill-[#0A0A0A]" />
              <span>{sample.label}</span>
              <span className="text-[10px] text-slate-500 font-mono">({sample.desc})</span>
            </button>
          ))}
        </div>

        {/* Feature quick checkmarks */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-semibold text-slate-700">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>No Watermark</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Original 4K / HD</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Fast Millisecond Precision</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>MP4 & MP3 Formats</span>
          </div>
        </div>
      </div>
    </section>
  );
}
