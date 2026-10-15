import React, { useState, useRef, useEffect } from 'react';
import { 
  Scissors, Play, Square, Download, Share2, Eye, Plus, 
  Sparkles, CheckCircle, RefreshCw, AlertCircle, Film, Music, Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import VideoPlayer from './VideoPlayer';
import DualRangeSlider from './DualRangeSlider';
import { formatTime, parseTime } from '../utils/time';

export default function Cutter({
  videoData,
  onReset,
  onClipCreated,
  onOpenPreview
}) {
  const playerRef = useRef(null);

  const duration = videoData.duration || 19;
  const initialEnd = Math.min(duration, Math.max(1, Math.min(10, duration)));

  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(initialEnd);
  const [currentTime, setCurrentTime] = useState(0);

  // Formats state
  const [activeTab, setActiveTab] = useState('video'); // 'video' | 'audio'
  const [selectedFormat, setSelectedFormat] = useState('mp4'); // 'mp4' | 'webm' | 'mp3' | 'm4a' | 'ogg' | 'opus'
  const [selectedQuality, setSelectedQuality] = useState('1080p');

  // Input string state
  const [startInput, setStartInput] = useState(formatTime(0, true));
  const [endInput, setEndInput] = useState(formatTime(initialEnd, true));

  // Trimming Job state
  const [isTrimming, setIsTrimming] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [trimError, setTrimError] = useState('');
  const [isPreviewing, setIsPreviewing] = useState(false);

  useEffect(() => {
    setStartInput(formatTime(startTime, true));
  }, [startTime]);

  useEffect(() => {
    setEndInput(formatTime(endTime, true));
  }, [endTime]);

  const nudgeStart = (delta) => {
    const next = Math.max(0, Math.min(endTime - 0.2, Math.round((startTime + delta) * 10) / 10));
    setStartTime(next);
    if (playerRef.current) playerRef.current.seekTo(next);
  };

  const nudgeEnd = (delta) => {
    const next = Math.min(duration, Math.max(startTime + 0.2, Math.round((endTime + delta) * 10) / 10));
    setEndTime(next);
    if (playerRef.current) playerRef.current.seekTo(next);
  };

  const handleStartInputChange = (val) => {
    setStartInput(val);
    const parsed = parseTime(val);
    if (!isNaN(parsed) && parsed >= 0 && parsed < endTime) {
      setStartTime(parsed);
      if (playerRef.current) playerRef.current.seekTo(parsed);
    }
  };

  const handleEndInputChange = (val) => {
    setEndInput(val);
    const parsed = parseTime(val);
    if (!isNaN(parsed) && parsed > startTime && parsed <= duration) {
      setEndTime(parsed);
      if (playerRef.current) playerRef.current.seekTo(parsed);
    }
  };

  const setStartToPlayhead = () => {
    const cur = Math.round(currentTime * 10) / 10;
    if (cur < endTime) {
      setStartTime(cur);
    }
  };

  const setEndToPlayhead = () => {
    const cur = Math.round(currentTime * 10) / 10;
    if (cur > startTime) {
      setEndTime(cur);
    }
  };

  const handleTogglePreview = () => {
    if (!playerRef.current) return;
    if (isPreviewing) {
      playerRef.current.stopPreview();
      setIsPreviewing(false);
    } else {
      playerRef.current.previewClip(startTime, endTime);
      setIsPreviewing(true);
    }
  };

  const clipDuration = Math.max(0.1, endTime - startTime);
  const estimatedSizeMb = activeTab === 'video' 
    ? ((clipDuration * (selectedQuality.includes('1080') ? 4 : (selectedQuality.includes('720') ? 2.2 : 1.2))) / 8).toFixed(1)
    : ((clipDuration * 320) / (8 * 1024)).toFixed(2);

  const handleCreateClip = async () => {
    if (isTrimming) return;
    setIsTrimming(true);
    setTrimError('');
    setCurrentJob(null);

    try {
      const res = await fetch('/api/clips/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: videoData.id,
          title: videoData.title,
          channel: videoData.channel,
          startTime,
          endTime,
          type: activeTab,
          format: selectedFormat,
          quality: selectedQuality
        })
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to start clipping');
      }

      const job = data.data;
      setCurrentJob(job);
      if (onClipCreated) onClipCreated(job);

      const eventSource = new EventSource(`/api/clips/progress/${job.clipId}`);
      eventSource.onmessage = (e) => {
        try {
          const update = JSON.parse(e.data);
          setCurrentJob(prev => ({ ...prev, ...update }));

          if (update.status === 'finished') {
            eventSource.close();
            setIsTrimming(false);
            try {
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 }
              });
            } catch (err) {}
          } else if (update.status === 'error') {
            eventSource.close();
            setIsTrimming(false);
            setTrimError(update.error || 'Trimming error occurred');
          }
        } catch (parseErr) {
          console.error(parseErr);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        pollJobStatus(job.clipId);
      };

    } catch (err) {
      console.error(err);
      setIsTrimming(false);
      setTrimError(err.message || 'Error creating clip');
    }
  };

  const pollJobStatus = (clipId) => {
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/clips/status/${clipId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setCurrentJob(prev => ({ ...prev, ...data.data }));
          if (data.data.status === 'finished') {
            clearInterval(timer);
            setIsTrimming(false);
          } else if (data.data.status === 'error') {
            clearInterval(timer);
            setIsTrimming(false);
            setTrimError(data.data.error || 'Error trimming clip');
          }
        }
      } catch (e) {
        clearInterval(timer);
        setIsTrimming(false);
      }
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
      {/* Video Info Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-[#FFFF99] text-[#0A0A0A] rounded-md border border-amber-300">
              YouTube Video
            </span>
            <span className="text-xs font-mono text-slate-400">ID: {videoData.id}</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug line-clamp-1">
            {videoData.title}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {videoData.channel} · Duration: <span className="font-mono font-bold text-slate-800">{videoData.formattedDuration}</span>
          </p>
        </div>

        {/* Change Video Button */}
        <button
          onClick={onReset}
          className="self-start sm:self-center px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-[#FFFF99] text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 border border-slate-300"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Change Video</span>
        </button>
      </div>

      {/* Video Player */}
      <VideoPlayer
        ref={playerRef}
        videoId={videoData.id}
        duration={duration}
        startTime={startTime}
        endTime={endTime}
        onTimeUpdate={(t) => {
          setCurrentTime(t);
        }}
      />

      {/* Interactive Dual-Range Timeline Slider */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-slate-900 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-[#0A0A0A]" />
            <span className="text-sm font-black text-slate-900">Timeline Trimmer</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Drag handles or use precise inputs below</span>
        </div>

        <DualRangeSlider
          duration={duration}
          startTime={startTime}
          endTime={endTime}
          currentTime={currentTime}
          onStartTimeChange={(t) => {
            setStartTime(t);
            if (playerRef.current) playerRef.current.seekTo(t);
          }}
          onEndTimeChange={(t) => {
            setEndTime(t);
            if (playerRef.current) playerRef.current.seekTo(t);
          }}
          onSeek={(t) => {
            if (playerRef.current) playerRef.current.seekTo(t, true);
          }}
        />

        {/* Precision Start / End Time Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 items-center">
          {/* Start Time Box */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Start Time (IN)</span>
              <button
                onClick={setStartToPlayhead}
                className="text-[11px] font-bold text-[#0A0A0A] bg-[#FFFF99] px-2 py-0.5 rounded border border-amber-300 hover:bg-[#FFF980] cursor-pointer"
                title="Set start to current playhead"
              >
                Set to Playhead
              </button>
            </div>
            <input
              type="text"
              value={startInput}
              onChange={(e) => handleStartInputChange(e.target.value)}
              className="w-full bg-white text-center font-mono font-black text-base py-1.5 rounded-lg border-2 border-slate-300 text-slate-900 focus:outline-none focus:border-black"
            />
            <div className="flex items-center justify-between gap-1">
              <button onClick={() => nudgeStart(-1)} className="flex-1 py-1 text-[11px] font-mono font-bold bg-white hover:bg-[#FFFF99] rounded border border-slate-300 text-slate-800">-1s</button>
              <button onClick={() => nudgeStart(-0.1)} className="flex-1 py-1 text-[11px] font-mono font-bold bg-white hover:bg-[#FFFF99] rounded border border-slate-300 text-slate-800">-0.1s</button>
              <button onClick={() => nudgeStart(0.1)} className="flex-1 py-1 text-[11px] font-mono font-bold bg-white hover:bg-[#FFFF99] rounded border border-slate-300 text-slate-800">+0.1s</button>
              <button onClick={() => nudgeStart(1)} className="flex-1 py-1 text-[11px] font-mono font-bold bg-white hover:bg-[#FFFF99] rounded border border-slate-300 text-slate-800">+1s</button>
            </div>
          </div>

          {/* Center Duration Badge & Preview Action */}
          <div className="flex flex-col items-center justify-center space-y-2 text-center py-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Selected Clip Duration</span>
            <div className="font-mono text-2xl font-black text-[#0A0A0A] bg-[#FFFF99] px-4 py-1 rounded-xl border-2 border-slate-900 shadow-xs tracking-tight">
              {formatTime(clipDuration, true)}
            </div>
            <button
              onClick={handleTogglePreview}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer border ${
                isPreviewing 
                  ? 'bg-amber-400 hover:bg-amber-500 text-black border-black shadow-md animate-pulse'
                  : 'bg-[#FFFF99] hover:bg-[#FFF980] text-black border-amber-300'
              }`}
            >
              {isPreviewing ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Preview</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Preview Clip</span>
                </>
              )}
            </button>
          </div>

          {/* End Time Box */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">End Time (OUT)</span>
              <button
                onClick={setEndToPlayhead}
                className="text-[11px] font-bold text-[#0A0A0A] bg-[#FFFF99] px-2 py-0.5 rounded border border-amber-300 hover:bg-[#FFF980] cursor-pointer"
                title="Set end to current playhead"
              >
                Set to Playhead
              </button>
            </div>
            <input
              type="text"
              value={endInput}
              onChange={(e) => handleEndInputChange(e.target.value)}
              className="w-full bg-white text-center font-mono font-black text-base py-1.5 rounded-lg border-2 border-slate-300 text-slate-900 focus:outline-none focus:border-black"
            />
            <div className="flex items-center justify-between gap-1">
              <button onClick={() => nudgeEnd(-1)} className="flex-1 py-1 text-[11px] font-mono font-bold bg-white hover:bg-[#FFFF99] rounded border border-slate-300 text-slate-800">-1s</button>
              <button onClick={() => nudgeEnd(-0.1)} className="flex-1 py-1 text-[11px] font-mono font-bold bg-white hover:bg-[#FFFF99] rounded border border-slate-300 text-slate-800">-0.1s</button>
              <button onClick={() => nudgeEnd(0.1)} className="flex-1 py-1 text-[11px] font-mono font-bold bg-white hover:bg-[#FFFF99] rounded border border-slate-300 text-slate-800">+0.1s</button>
              <button onClick={() => nudgeEnd(1)} className="flex-1 py-1 text-[11px] font-mono font-bold bg-white hover:bg-[#FFFF99] rounded border border-slate-300 text-slate-800">+1s</button>
            </div>
          </div>
        </div>
      </div>

      {/* Format & Resolution Selection */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-slate-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-[#0A0A0A]" />
            <span className="text-sm font-black text-slate-900">Export Format & Quality</span>
          </div>

          {/* Video / Audio Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-0.5 text-xs font-bold border border-slate-200">
            <button
              onClick={() => {
                setActiveTab('video');
                setSelectedFormat('mp4');
                setSelectedQuality('1080p');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'video' ? 'bg-[#FFFF99] text-black border border-amber-300 shadow-xs' : 'text-slate-500 hover:text-black'
              }`}
            >
              Video (MP4 / WebM)
            </button>
            <button
              onClick={() => {
                setActiveTab('audio');
                setSelectedFormat('mp3');
                setSelectedQuality('320 kbps');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'audio' ? 'bg-[#FFFF99] text-black border border-amber-300 shadow-xs' : 'text-slate-500 hover:text-black'
              }`}
            >
              Audio (MP3 / M4A)
            </button>
          </div>
        </div>

        {/* Options Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800">Container Format</label>
            <div className="grid grid-cols-3 gap-2">
              {activeTab === 'video' ? (
                <>
                  <button
                    onClick={() => setSelectedFormat('mp4')}
                    className={`p-2.5 rounded-xl border-2 text-center transition-all cursor-pointer ${
                      selectedFormat === 'mp4' 
                        ? 'border-slate-900 bg-[#FFFF99] text-[#0A0A0A] font-black shadow-xs' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold'
                    }`}
                  >
                    <div className="text-xs font-black">MP4</div>
                    <div className="text-[10px] text-slate-500">Universal</div>
                  </button>
                  <button
                    onClick={() => setSelectedFormat('webm')}
                    className={`p-2.5 rounded-xl border-2 text-center transition-all cursor-pointer ${
                      selectedFormat === 'webm' 
                        ? 'border-slate-900 bg-[#FFFF99] text-[#0A0A0A] font-black shadow-xs' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold'
                    }`}
                  >
                    <div className="text-xs font-black">WebM</div>
                    <div className="text-[10px] text-slate-500">VP9 / High Eff</div>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setSelectedFormat('mp3')}
                    className={`p-2 rounded-xl border-2 text-center transition-all cursor-pointer ${
                      selectedFormat === 'mp3' 
                        ? 'border-slate-900 bg-[#FFFF99] text-[#0A0A0A] font-black shadow-xs' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold'
                    }`}
                  >
                    <div className="text-xs font-black">MP3</div>
                    <div className="text-[10px] text-slate-500">Most Popular</div>
                  </button>
                  <button
                    onClick={() => setSelectedFormat('m4a')}
                    className={`p-2 rounded-xl border-2 text-center transition-all cursor-pointer ${
                      selectedFormat === 'm4a' 
                        ? 'border-slate-900 bg-[#FFFF99] text-[#0A0A0A] font-black shadow-xs' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold'
                    }`}
                  >
                    <div className="text-xs font-black">M4A</div>
                    <div className="text-[10px] text-slate-500">Apple Native</div>
                  </button>
                  <button
                    onClick={() => setSelectedFormat('opus')}
                    className={`p-2 rounded-xl border-2 text-center transition-all cursor-pointer ${
                      selectedFormat === 'opus' 
                        ? 'border-slate-900 bg-[#FFFF99] text-[#0A0A0A] font-black shadow-xs' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold'
                    }`}
                  >
                    <div className="text-xs font-black">Opus</div>
                    <div className="text-[10px] text-slate-500">Low Bitrate</div>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Quality / Resolution Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                {activeTab === 'video' ? 'Resolution' : 'Audio Quality'}
              </label>
              <span className="text-[11px] font-mono text-slate-500 font-semibold">
                Est. Size: ~{estimatedSizeMb} MB
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeTab === 'video' ? (
                ['1080p', '720p', '480p', '360p'].map(res => (
                  <button
                    key={res}
                    onClick={() => setSelectedQuality(res)}
                    className={`px-3 py-2 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                      selectedQuality === res
                        ? 'bg-[#FFFF99] text-[#0A0A0A] border-slate-900 shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {res}
                  </button>
                ))
              ) : (
                ['320 kbps', '256 kbps', '192 kbps', '128 kbps'].map(rate => (
                  <button
                    key={rate}
                    onClick={() => setSelectedQuality(rate)}
                    className={`px-3 py-2 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                      selectedQuality === rate
                        ? 'bg-[#FFFF99] text-[#0A0A0A] border-slate-900 shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {rate}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Primary Action Button: Pale Yellow #FFFF99 */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleCreateClip}
            disabled={isTrimming}
            className="w-full sm:flex-1 py-4 bg-[#FFFF99] hover:bg-[#FFF980] active:scale-98 disabled:opacity-50 text-[#0A0A0A] font-black text-base rounded-2xl border-2 border-slate-900 shadow-xl shadow-[#FFFF99]/50 hover:shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isTrimming ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Trimming Clip ({currentJob?.percentage || 0}%)...</span>
              </>
            ) : (
              <>
                <Scissors className="w-5 h-5 stroke-[2.5]" />
                <span>Trim & Download Clip Now</span>
              </>
            )}
          </button>
        </div>

        {/* Error message */}
        {trimError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{trimError}</span>
          </div>
        )}

        {/* Live Trimming Progress Card */}
        {isTrimming && currentJob && (
          <div className="p-4 bg-[#0A0A0A] text-white rounded-xl space-y-3 shadow-lg border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 capitalize flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FFFF99] animate-ping" />
                Status: {currentJob.status} ({currentJob.eta})
              </span>
              <span className="font-mono font-black text-[#FFFF99]">{currentJob.percentage}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-[#FFFF99] h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${currentJob.percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Completed Clip Success Card */}
        {currentJob && currentJob.status === 'finished' && !isTrimming && (
          <div className="p-4 bg-[#FFFF99]/30 border-2 border-slate-900 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFFF99] border border-black text-[#0A0A0A] flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">Your clip is ready!</h4>
                <p className="text-xs text-slate-600 font-medium">
                  Duration: {formatTime(currentJob.duration, true)} · Size: {currentJob.formattedSize || 'Ready'} · {currentJob.format}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => onOpenPreview(currentJob)}
                className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Watch</span>
              </button>

              <a
                href={currentJob.downloadUrl}
                download
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#FFFF99] hover:bg-[#FFF980] text-[#0A0A0A] border-2 border-slate-900 text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Download ({currentJob.format})</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
