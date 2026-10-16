import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Cutter from './components/Cutter';
import StatsSection from './components/StatsSection';
import FeaturesSection from './components/FeaturesSection';
import HowItWorksSection from './components/HowItWorksSection';
import ComparisonSection from './components/ComparisonSection';
import BeforeAfterSection from './components/BeforeAfterSection';
import FormatsSection from './components/FormatsSection';
import UseCasesSection from './components/UseCasesSection';
import FaqSection from './components/FaqSection';
import Footer from './components/Footer';
import ClipsDrawer from './components/ClipsDrawer';
import VideoHistoryDrawer from './components/VideoHistoryDrawer';
import ClipPreviewModal from './components/ClipPreviewModal';
import { useVideoHistory } from './hooks/useVideoHistory';
import { extractYouTubeId } from './utils/time';
import { Loader2, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [videoError, setVideoError] = useState('');

  // Clips list and drawer
  const [clips, setClips] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activePreviewClip, setActivePreviewClip] = useState(null);

  // Video History & Navigation Stack
  const {
    history,
    recordVideo,
    canGoBack,
    canGoForward,
    previousVideo,
    nextVideo,
    goBack,
    goForward,
    pushNav,
    syncNavIndex,
    removeVideo,
    clearHistory
  } = useVideoHistory();

  const loadVideo = useCallback(async (urlOrId, options = {}) => {
    const { pushUrl = true, isNavigating = false } = options;
    if (!urlOrId) return;

    const videoId = extractYouTubeId(urlOrId);
    if (!videoId) {
      setVideoError('Invalid YouTube video link or ID');
      return;
    }

    setCurrentVideoId(videoId);
    setLoadingVideo(true);
    setVideoError('');
    if (pushUrl) {
      window.history.pushState(null, '', `/cutter/${videoId}`);
    }

    // Update navigation stack & initial history entry
    if (!isNavigating) {
      pushNav(videoId);
    } else {
      syncNavIndex(videoId);
    }
    recordVideo({ id: videoId });

    try {
      const res = await fetch(`/api/youtube/${videoId}/info`);
      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.error || 'Failed to fetch video details');
      }
      setVideoData(json.data);
      recordVideo(json.data);
    } catch (err) {
      console.error(err);
      setVideoError(err.message || 'Error loading video');
    } finally {
      setLoadingVideo(false);
    }
  }, [pushNav, syncNavIndex, recordVideo]);

  // Back / Forward navigation handlers
  const handleGoBack = useCallback(() => {
    const prevId = goBack();
    if (prevId) {
      loadVideo(prevId, { pushUrl: true, isNavigating: true });
    }
  }, [goBack, loadVideo]);

  const handleGoForward = useCallback(() => {
    const nextId = goForward();
    if (nextId) {
      loadVideo(nextId, { pushUrl: true, isNavigating: true });
    }
  }, [goForward, loadVideo]);

  // Keyboard shortcut listener: Alt + ArrowLeft (Back), Alt + ArrowRight (Forward)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.target.tagName === 'INPUT' || 
        e.target.tagName === 'TEXTAREA' || 
        e.target.isContentEditable
      ) {
        return;
      }
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        handleGoBack();
      } else if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        handleGoForward();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGoBack, handleGoForward]);

  // Initial URL check: support /cutter/:id or query param ?v=
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      let detectedId = null;

      if (path.startsWith('/cutter/')) {
        detectedId = path.split('/cutter/')[1].split('/')[0].split('?')[0];
      } else if (params.get('v')) {
        detectedId = params.get('v');
      }

      if (detectedId) {
        loadVideo(detectedId, { pushUrl: false, isNavigating: false });
      } else {
        // Default to AgwWYSlFCkE if requested in prompt
        const initialDefaultId = 'AgwWYSlFCkE';
        window.history.replaceState(null, '', `/cutter/${initialDefaultId}`);
        loadVideo(initialDefaultId, { pushUrl: false, isNavigating: false });
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [loadVideo]);

  // Fetch session clips on mount
  useEffect(() => {
    fetch('/api/clips')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setClips(data.data);
        }
      })
      .catch(err => console.error('Failed to load clips:', err));
  }, []);

  const handleReset = () => {
    setCurrentVideoId(null);
    setVideoData(null);
    setVideoError('');
    window.history.pushState(null, '', '/');
  };

  const handleClipCreated = (job) => {
    setClips(prev => {
      const existing = prev.findIndex(c => c.clipId === job.clipId);
      if (existing !== -1) {
        const updated = [...prev];
        updated[existing] = job;
        return updated;
      }
      return [job, ...prev];
    });
  };

  const handleDeleteClip = async (clipId) => {
    try {
      await fetch(`/api/clips/${clipId}`, { method: 'DELETE' });
      setClips(prev => prev.filter(c => c.clipId !== clipId));
    } catch (err) {
      console.error('Delete clip error:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <Navbar
        onSelectVideo={(id) => loadVideo(id)}
        currentVideoId={currentVideoId}
        clipsCount={clips.length}
        onOpenClips={() => setIsDrawerOpen(true)}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        previousVideo={previousVideo}
        nextVideo={nextVideo}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Loading Spinner */}
        {loadingVideo && (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFFF99] border-2 border-slate-900 flex items-center justify-center shadow-md">
              <Loader2 className="w-6 h-6 text-[#0A0A0A] animate-spin" />
            </div>
            <p className="text-sm font-bold text-slate-700">
              Fetching YouTube video streams & resolutions...
            </p>
          </div>
        )}

        {/* Video Load Error Banner */}
        {videoError && !loadingVideo && (
          <div className="max-w-2xl mx-auto my-8 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-rose-700 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{videoError}</span>
            </div>
            <button
              onClick={() => loadVideo(currentVideoId || 'AgwWYSlFCkE')}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Workspace: Cutter or Hero */}
        {!loadingVideo && videoData ? (
          <div className="py-4">
            <Cutter
              key={videoData.id}
              videoData={videoData}
              onReset={handleReset}
              onClipCreated={handleClipCreated}
              onOpenPreview={(clip) => setActivePreviewClip(clip)}
              history={history}
              canGoBack={canGoBack}
              canGoForward={canGoForward}
              previousVideo={previousVideo}
              nextVideo={nextVideo}
              onGoBack={handleGoBack}
              onGoForward={handleGoForward}
              onSelectVideo={(id) => loadVideo(id)}
              onRemoveVideo={removeVideo}
              onOpenHistory={() => setIsHistoryOpen(true)}
            />
          </div>
        ) : (
          !loadingVideo && (
            <Hero 
              onSelectVideo={(id) => loadVideo(id)} 
              history={history}
              onOpenHistory={() => setIsHistoryOpen(true)}
            />
          )
        )}

        {/* Informational and Conversion Sections matching Clipscutter */}
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <ComparisonSection />
        <BeforeAfterSection />
        <FormatsSection />
        <UseCasesSection />
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer onSelectVideo={(id) => loadVideo(id)} />

      {/* Side Drawer for Connected Video History */}
      <VideoHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        currentVideoId={currentVideoId}
        onSelectVideo={(id) => loadVideo(id)}
        onRemoveVideo={removeVideo}
        onClearHistory={clearHistory}
      />

      {/* Side Drawer for All Clipped Items */}
      <ClipsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        clips={clips}
        onDeleteClip={handleDeleteClip}
        onOpenPreview={(clip) => setActivePreviewClip(clip)}
      />

      {/* Video / Audio Player Preview Modal */}
      {activePreviewClip && (
        <ClipPreviewModal
          clip={activePreviewClip}
          onClose={() => setActivePreviewClip(null)}
        />
      )}
    </div>
  );
}
