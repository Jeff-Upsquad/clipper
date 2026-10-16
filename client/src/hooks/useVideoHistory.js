import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'clipper_connected_videos_v1';
const MAX_HISTORY = 30;

export function useVideoHistory(initialVideoId = null) {
  // Load history from localStorage
  const [history, setHistory] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse video history:', e);
    }
    return [];
  });

  // Navigation stack: sequential list of video IDs visited in this session
  const [navStack, setNavStack] = useState(() => (initialVideoId ? [initialVideoId] : []));
  const [navIndex, setNavIndex] = useState(() => (initialVideoId ? 0 : -1));

  // Persist history whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save video history to localStorage:', e);
    }
  }, [history]);

  // Record a newly connected video (with metadata or partial info)
  const recordVideo = useCallback((videoData) => {
    if (!videoData || !videoData.id) return;

    setHistory((prev) => {
      const existing = prev.find((v) => v.id === videoData.id);
      const updatedItem = {
        id: videoData.id,
        title: videoData.title || (existing ? existing.title : `YouTube Video (${videoData.id})`),
        channel: videoData.channel || (existing ? existing.channel : 'YouTube Creator'),
        duration: videoData.duration || (existing ? existing.duration : 0),
        formattedDuration: videoData.formattedDuration || (existing ? existing.formattedDuration : ''),
        thumbnail: videoData.thumbnail || (existing ? existing.thumbnail : `https://i.ytimg.com/vi/${videoData.id}/hqdefault.jpg`),
        connectedAt: Date.now()
      };

      // Put the item at the front, de-duplicate
      const filtered = prev.filter((v) => v.id !== videoData.id);
      return [updatedItem, ...filtered].slice(0, MAX_HISTORY);
    });
  }, []);

  // Update navigation stack when a new video is loaded
  const pushNav = useCallback((videoId) => {
    if (!videoId) return;

    setNavStack((prev) => {
      // If same as current, don't duplicate
      if (navIndex >= 0 && prev[navIndex] === videoId) {
        return prev;
      }
      // Truncate any forward history and append new video ID
      const newStack = [...prev.slice(0, navIndex + 1), videoId];
      setNavIndex(newStack.length - 1);
      return newStack;
    });
  }, [navIndex]);

  // Navigate back
  const canGoBack = navIndex > 0;
  const canGoForward = navIndex >= 0 && navIndex < navStack.length - 1;

  const previousVideoId = canGoBack ? navStack[navIndex - 1] : null;
  const nextVideoId = canGoForward ? navStack[navIndex + 1] : null;

  const previousVideo = previousVideoId ? (history.find((v) => v.id === previousVideoId) || { id: previousVideoId }) : null;
  const nextVideo = nextVideoId ? (history.find((v) => v.id === nextVideoId) || { id: nextVideoId }) : null;

  const goBack = useCallback(() => {
    if (canGoBack) {
      const prevId = navStack[navIndex - 1];
      setNavIndex((idx) => idx - 1);
      return prevId;
    }
    return null;
  }, [canGoBack, navIndex, navStack]);

  const goForward = useCallback(() => {
    if (canGoForward) {
      const nextId = navStack[navIndex + 1];
      setNavIndex((idx) => idx + 1);
      return nextId;
    }
    return null;
  }, [canGoForward, navIndex, navStack]);

  // Synchronize navIndex if user jumped to an ID directly or from browser history
  const syncNavIndex = useCallback((videoId) => {
    if (!videoId) return;
    setNavStack((prev) => {
      const existingIdx = prev.lastIndexOf(videoId);
      if (existingIdx !== -1) {
        setNavIndex(existingIdx);
        return prev;
      }
      const newStack = [...prev.slice(0, navIndex + 1), videoId];
      setNavIndex(newStack.length - 1);
      return newStack;
    });
  }, [navIndex]);

  // Remove a video from history
  const removeVideo = useCallback((videoId) => {
    setHistory((prev) => prev.filter((v) => v.id !== videoId));
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    history,
    recordVideo,
    navStack,
    navIndex,
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
  };
}
