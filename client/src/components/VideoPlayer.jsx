import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw, Clock } from 'lucide-react';
import { formatTime } from '../utils/time';

const VideoPlayer = forwardRef(function VideoPlayer({
  videoId,
  duration = 0,
  startTime = 0,
  endTime = 10,
  onTimeUpdate,
  onError
}, ref) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const timeUpdateInterval = useRef(null);
  const previewTimer = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Initialize YouTube IFrame Player API
  useEffect(() => {
    let isCancelled = false;

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (isCancelled || !containerRef.current) return;

      if (playerRef.current && playerRef.current.destroy) {
        try { playerRef.current.destroy(); } catch (e) {}
      }

      const playerId = `yt-player-${videoId}`;
      containerRef.current.innerHTML = `<div id="${playerId}" class="w-full h-full"></div>`;

      playerRef.current = new window.YT.Player(playerId, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 0,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (event) => {
            if (isCancelled) return;
            setIsReady(true);
            event.target.setVolume(volume);
            event.target.seekTo(startTime, true);
          },
          onStateChange: (event) => {
            if (isCancelled) return;
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              startTimeTracking();
            } else {
              setIsPlaying(false);
              stopTimeTracking();
            }
          },
          onError: (err) => {
            console.error('YouTube Player Error:', err);
            if (onError) onError(err);
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      isCancelled = true;
      stopTimeTracking();
      stopPreviewCheck();
      if (playerRef.current && playerRef.current.destroy) {
        try { playerRef.current.destroy(); } catch (e) {}
      }
    };
  }, [videoId]);

  const startTimeTracking = () => {
    stopTimeTracking();
    timeUpdateInterval.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const t = playerRef.current.getCurrentTime() || 0;
        setCurrentTime(t);
        if (onTimeUpdate) onTimeUpdate(t);
      }
    }, 100);
  };

  const stopTimeTracking = () => {
    if (timeUpdateInterval.current) {
      clearInterval(timeUpdateInterval.current);
      timeUpdateInterval.current = null;
    }
  };

  const stopPreviewCheck = () => {
    if (previewTimer.current) {
      clearInterval(previewTimer.current);
      previewTimer.current = null;
    }
    setIsPreviewing(false);
  };

  useImperativeHandle(ref, () => ({
    seekTo: (seconds, andPlay = false) => {
      if (playerRef.current && playerRef.current.seekTo) {
        playerRef.current.seekTo(seconds, true);
        setCurrentTime(seconds);
        if (andPlay) {
          playerRef.current.playVideo();
        }
      }
    },
    play: () => {
      if (playerRef.current && playerRef.current.playVideo) {
        playerRef.current.playVideo();
      }
    },
    pause: () => {
      if (playerRef.current && playerRef.current.pauseVideo) {
        playerRef.current.pauseVideo();
      }
    },
    previewClip: (start, end) => {
      if (!playerRef.current || !playerRef.current.seekTo) return;

      stopPreviewCheck();
      setIsPreviewing(true);

      const targetStart = Math.max(0, start);
      const targetEnd = Math.max(targetStart + 0.1, end);

      playerRef.current.seekTo(targetStart, true);
      playerRef.current.playVideo();

      previewTimer.current = setInterval(() => {
        if (!playerRef.current || !playerRef.current.getCurrentTime) return;
        const cur = playerRef.current.getCurrentTime();
        if (cur >= targetEnd) {
          playerRef.current.pauseVideo();
          playerRef.current.seekTo(targetStart, true);
          stopPreviewCheck();
        }
      }, 50);
    },
    stopPreview: () => {
      stopPreviewCheck();
      if (playerRef.current && playerRef.current.pauseVideo) {
        playerRef.current.pauseVideo();
      }
    },
    getCurrentTime: () => currentTime,
    isPreviewing: () => isPreviewing
  }), [currentTime, isPreviewing]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
      stopPreviewCheck();
    } else {
      playerRef.current.playVideo();
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseInt(e.target.value);
    setVolume(val);
    if (playerRef.current) {
      playerRef.current.setVolume(val);
      if (val === 0) {
        playerRef.current.mute();
        setIsMuted(true);
      } else if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      }
    }
  };

  const cycleSpeed = () => {
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackRate(nextSpeed);
    if (playerRef.current && playerRef.current.setPlaybackRate) {
      playerRef.current.setPlaybackRate(nextSpeed);
    }
  };

  const toggleFullscreen = () => {
    const el = containerRef.current?.parentElement;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen().catch(err => console.error(err));
    }
  };

  return (
    <div className="relative w-full aspect-video bg-[#0A0A0A] rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-900 group">
      {/* YouTube Player Mount */}
      <div ref={containerRef} className="w-full h-full pointer-events-none" />

      {/* Transparent Click Overlay to Play/Pause */}
      <div 
        onClick={togglePlay}
        className="absolute inset-0 cursor-pointer z-10 flex items-center justify-center"
      >
        {!isPlaying && (
          <div className="w-16 h-16 rounded-full bg-[#FFFF99] hover:bg-[#FFF980] text-[#0A0A0A] flex items-center justify-center shadow-xl border-2 border-slate-900 scale-95 group-hover:scale-105 transition-all pointer-events-auto">
            <Play className="w-7 h-7 fill-[#0A0A0A] ml-1" />
          </div>
        )}
      </div>

      {/* Floating Preview Active Banner: Pale Yellow #FFFF99 */}
      {isPreviewing && (
        <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-[#FFFF99] text-[#0A0A0A] font-black text-xs uppercase tracking-wider rounded-md border border-slate-900 shadow-lg flex items-center gap-1.5 animate-pulse">
          <Clock className="w-3.5 h-3.5" />
          <span>Clip Preview Mode</span>
        </div>
      )}

      {/* Custom Bottom Controls Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-4 py-3 bg-linear-to-t from-black/95 via-black/60 to-transparent flex items-center justify-between text-white opacity-95 transition-opacity">
        {/* Left Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer text-[#FFFF99]"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-[#FFFF99]" />
            ) : (
              <Play className="w-5 h-5 fill-[#FFFF99] ml-0.5" />
            )}
          </button>

          {/* Volume control with #FFFF99 accent */}
          <div className="flex items-center gap-1.5 group/vol">
            <button
              onClick={toggleMute}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5 text-rose-400" />
              ) : (
                <Volume2 className="w-5 h-5 text-slate-300" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1.5 bg-white/30 hover:bg-white/50 accent-[#FFFF99] rounded-lg cursor-pointer"
            />
          </div>

          {/* Digital Timer */}
          <div className="text-xs font-mono font-medium tracking-wide text-slate-300 ml-2">
            <span className="text-[#FFFF99] font-bold">{formatTime(currentTime, true)}</span>
            <span className="text-slate-500 mx-1">/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Playback speed */}
          <button
            onClick={cycleSpeed}
            className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[#FFFF99] text-[11px] font-mono font-bold transition-colors cursor-pointer"
            title="Cycle Playback Speed"
          >
            {playbackRate}x
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

export default VideoPlayer;
