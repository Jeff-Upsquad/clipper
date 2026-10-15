import React, { useRef, useState, useEffect, useCallback } from 'react';
import { formatTime } from '../utils/time';

export default function DualRangeSlider({
  duration = 60,
  startTime = 0,
  endTime = 10,
  currentTime = 0,
  onStartTimeChange,
  onEndTimeChange,
  onSeek
}) {
  const trackRef = useRef(null);
  const [activeThumb, setActiveThumb] = useState(null); // 'start' | 'end' | 'playhead' | null
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverPos, setHoverPos] = useState(0);

  const safeDuration = Math.max(0.1, duration || 1);
  const startPercent = Math.min(100, Math.max(0, (startTime / safeDuration) * 100));
  const endPercent = Math.min(100, Math.max(0, (endTime / safeDuration) * 100));
  const playheadPercent = Math.min(100, Math.max(0, (currentTime / safeDuration) * 100));

  const getTimeFromEvent = useCallback((e) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return ratio * safeDuration;
  }, [safeDuration]);

  const handlePointerDown = (thumbType, e) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveThumb(thumbType);
  };

  const handleTrackClick = (e) => {
    if (activeThumb) return;
    const t = getTimeFromEvent(e);
    if (onSeek) onSeek(t);
  };

  const handleMouseMove = (e) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setHoverTime(ratio * safeDuration);
    setHoverPos(ratio * 100);
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!activeThumb) return;
      const t = getTimeFromEvent(e);
      const rounded = Math.round(t * 10) / 10;

      if (activeThumb === 'start') {
        const newStart = Math.min(Math.max(0, rounded), endTime - 0.2);
        onStartTimeChange(newStart);
      } else if (activeThumb === 'end') {
        const newEnd = Math.max(Math.min(safeDuration, rounded), startTime + 0.2);
        onEndTimeChange(newEnd);
      }
    };

    const handlePointerUp = () => {
      if (activeThumb) setActiveThumb(null);
    };

    if (activeThumb) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove);
      window.addEventListener('touchend', handlePointerUp);
    }

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [activeThumb, endTime, startTime, safeDuration, getTimeFromEvent, onStartTimeChange, onEndTimeChange]);

  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="w-full select-none py-3">
      {/* Time indicators above track */}
      <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 mb-2 px-1">
        <span>00:00</span>
        <span className="text-slate-900 font-bold bg-[#FFFF99] px-2 py-0.5 rounded border border-amber-300">
          Range: {formatTime(startTime, true)} - {formatTime(endTime, true)} ({Math.max(0, endTime - startTime).toFixed(1)}s)
        </span>
        <span>{formatTime(safeDuration)}</span>
      </div>

      {/* Main Track Container */}
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverTime(null)}
        className="relative h-12 bg-[#0A0A0A] rounded-xl cursor-pointer overflow-hidden border-2 border-slate-800 shadow-inner group"
      >
        {/* Subtle Waveform / Grid Background */}
        <div className="absolute inset-0 opacity-25 flex items-center justify-around pointer-events-none px-2">
          {Array.from({ length: 48 }).map((_, i) => (
            <div
              key={i}
              className="w-0.5 bg-slate-400 rounded-full"
              style={{ height: `${20 + (Math.sin(i * 0.8) * 40 + (i % 3) * 15)}%` }}
            />
          ))}
        </div>

        {/* Major Tick Marks */}
        {ticks.map((tRatio, idx) => (
          <div
            key={idx}
            className="absolute top-0 bottom-0 border-l border-slate-700/60 pointer-events-none"
            style={{ left: `${tRatio * 100}%` }}
          />
        ))}

        {/* Dimmed Left Area (Before Start) */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-black/75 pointer-events-none transition-all duration-75"
          style={{ width: `${startPercent}%` }}
        />

        {/* Highlighted Selected Region: Pale Yellow #FFFF99 */}
        <div
          className="absolute top-0 bottom-0 bg-[#FFFF99]/30 border-y-2 border-[#FFFF99] pointer-events-none transition-all duration-75"
          style={{
            left: `${startPercent}%`,
            width: `${Math.max(0, endPercent - startPercent)}%`
          }}
        >
          {/* Subtle striped pattern for selected slice */}
          <div className="w-full h-full bg-[linear-gradient(45deg,rgba(255,255,153,0.25)_25%,transparent_25%,transparent_50%,rgba(255,255,153,0.25)_50%,rgba(255,255,153,0.25)_75%,transparent_75%,transparent)] bg-[length:16px_16px]" />
        </div>

        {/* Dimmed Right Area (After End) */}
        <div
          className="absolute top-0 bottom-0 right-0 bg-black/75 pointer-events-none transition-all duration-75"
          style={{ width: `${100 - endPercent}%` }}
        />

        {/* Live Playhead Scrubber: Pale Yellow #FFFF99 */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-[#FFFF99] z-10 pointer-events-none shadow-[0_0_12px_rgba(255,255,153,1)]"
          style={{ left: `${playheadPercent}%` }}
        >
          <div className="w-3 h-3 bg-[#FFFF99] rotate-45 -ml-1 -mt-0.5 rounded-xs border border-black" />
        </div>

        {/* Hover Time Tooltip */}
        {hoverTime !== null && (
          <div
            className="absolute top-1 -translate-x-1/2 pointer-events-none bg-[#0A0A0A] text-[#FFFF99] text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-[#FFFF99] shadow-md z-30"
            style={{ left: `${hoverPos}%` }}
          >
            {formatTime(hoverTime, true)}
          </div>
        )}

        {/* Left (Start) Handle: Pale Yellow #FFFF99 */}
        <div
          onMouseDown={(e) => handlePointerDown('start', e)}
          onTouchStart={(e) => handlePointerDown('start', e)}
          className="absolute top-0 bottom-0 w-6 -translate-x-1/2 flex items-center justify-center cursor-ew-resize z-20 group/handle touch-none"
          style={{ left: `${startPercent}%` }}
        >
          <div className="w-4 h-full bg-[#FFFF99] hover:bg-[#FFF980] rounded-l-lg border-2 border-slate-900 shadow-xl flex flex-col items-center justify-center gap-1 transition-all">
            <div className="w-0.5 h-3.5 bg-black/70 rounded-full" />
            <span className="text-[9px] font-black text-black leading-none tracking-tighter">IN</span>
          </div>
        </div>

        {/* Right (End) Handle: Pale Yellow #FFFF99 */}
        <div
          onMouseDown={(e) => handlePointerDown('end', e)}
          onTouchStart={(e) => handlePointerDown('end', e)}
          className="absolute top-0 bottom-0 w-6 -translate-x-1/2 flex items-center justify-center cursor-ew-resize z-20 group/handle touch-none"
          style={{ left: `${endPercent}%` }}
        >
          <div className="w-4 h-full bg-[#FFFF99] hover:bg-[#FFF980] rounded-r-lg border-2 border-slate-900 shadow-xl flex flex-col items-center justify-center gap-1 transition-all">
            <div className="w-0.5 h-3.5 bg-black/70 rounded-full" />
            <span className="text-[9px] font-black text-black leading-none tracking-tighter">OUT</span>
          </div>
        </div>
      </div>
    </div>
  );
}
