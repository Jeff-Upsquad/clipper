const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const CLIPS_DIR = path.join(__dirname, '..', 'public', 'clips');
if (!fs.existsSync(CLIPS_DIR)) {
  fs.mkdirSync(CLIPS_DIR, { recursive: true });
}

const jobs = new Map();

function formatTimeForFilename(seconds) {
  const s = Math.floor(seconds || 0);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}_${sec.toString().padStart(2, '0')}`;
}

function sanitizeFilename(title) {
  return (title || 'clip')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 40);
}

function getJob(clipId) {
  return jobs.get(clipId);
}

function getAllJobs() {
  return Array.from(jobs.values()).sort((a, b) => b.createdAt - a.createdAt);
}

function deleteJob(clipId) {
  const job = jobs.get(clipId);
  if (job) {
    if (job.filePath && fs.existsSync(job.filePath)) {
      try {
        fs.unlinkSync(job.filePath);
      } catch (e) {
        console.error('Failed to unlink clip file:', e);
      }
    }
    jobs.delete(clipId);
    return true;
  }
  return false;
}

/**
 * Creates and runs a clip trimming job
 */
function createClipJob({
  videoId,
  startTime = 0,
  endTime = 10,
  type = 'video', // 'video' | 'audio'
  format = 'mp4', // 'mp4' | 'webm' | 'mp3' | 'm4a' | 'ogg' | 'opus' | 'wav'
  quality = '1080p',
  title = 'YouTube Clip',
  channel = ''
}) {
  const clipId = uuidv4();
  const safeFormat = (format || 'mp4').toLowerCase().replace('webm audio', 'webm');
  const ext = safeFormat;
  const startSec = Math.max(0, parseFloat(startTime) || 0);
  const endSec = Math.max(startSec + 0.1, parseFloat(endTime) || 10);
  const clipDuration = Math.round((endSec - startSec) * 100) / 100;

  const rawFilename = `${sanitizeFilename(title)}_${formatTimeForFilename(startSec)}-${formatTimeForFilename(endSec)}.${ext}`;
  const outPath = path.join(CLIPS_DIR, `${clipId}.${ext}`);

  const job = {
    clipId,
    videoId,
    title,
    channel,
    startTime: startSec,
    endTime: endSec,
    duration: clipDuration,
    type,
    format: ext.toUpperCase(),
    quality,
    status: 'downloading', // 'downloading' | 'cutting' | 'remuxing' | 'finished' | 'error'
    percentage: 5,
    eta: 'Starting...',
    fileName: rawFilename,
    filePath: outPath,
    fileSize: 0,
    formattedSize: '0 MB',
    downloadUrl: `/api/clips/download/${clipId}`,
    streamUrl: `/api/clips/stream/${clipId}`,
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    createdAt: Date.now(),
    listeners: new Set()
  };

  jobs.set(clipId, job);

  // Broadcast helper
  const notifyListeners = () => {
    const data = {
      clipId: job.clipId,
      status: job.status,
      percentage: job.percentage,
      eta: job.eta,
      fileSize: job.fileSize,
      formattedSize: job.formattedSize,
      error: job.error
    };
    job.listeners.forEach(cb => {
      try { cb(data); } catch (e) {}
    });
  };

  // Build yt-dlp arguments
  const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const args = [
    '-m', 'yt_dlp',
    '--extractor-args', 'youtube:player_client=android,ios',
    '--download-sections', `*${startSec}-${endSec}`,
    '--force-keyframes-at-cuts',
    '--no-playlist'
  ];

  if (type === 'audio') {
    args.push('-x');
    args.push('--audio-format', ext === 'opus' ? 'opus' : (ext === 'm4a' ? 'm4a' : 'mp3'));
    const bitrate = quality.replace(/[^0-9]/g, '') || '320';
    args.push('--audio-quality', `${bitrate}k`);
  } else {
    // Video format selection
    const maxH = quality.replace(/[^0-9]/g, '') || '1080';
    if (ext === 'webm') {
      args.push('-f', `bestvideo[height<=${maxH}][ext=webm]+bestaudio[ext=webm]/bestvideo[height<=${maxH}]+bestaudio/best[height<=${maxH}]/best`);
      args.push('--merge-output-format', 'webm');
    } else {
      args.push('-f', `bestvideo[height<=${maxH}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${maxH}]+bestaudio/best[height<=${maxH}]/best`);
      args.push('--merge-output-format', 'mp4');
    }
  }

  // Temporary download output template
  const tempTemplate = path.join(CLIPS_DIR, `${clipId}.%(ext)s`);
  args.push('-o', tempTemplate);
  args.push(ytUrl);

  console.log(`[TrimService] Starting job ${clipId} for ${videoId} (${startSec}s - ${endSec}s, ${type}/${ext}/${quality})`);

  const proc = spawn('python3', args);

  proc.stdout.on('data', (data) => {
    const text = data.toString();
    // Parse download progress
    const pctMatch = text.match(/(\d+\.?\d*)%/);
    if (pctMatch) {
      const pct = parseFloat(pctMatch[1]);
      job.percentage = Math.min(90, Math.max(10, Math.round(pct * 0.75)));
      job.status = 'downloading';
    }

    const etaMatch = text.match(/ETA\s+([\d:]+)/i);
    if (etaMatch) {
      job.eta = `ETA ${etaMatch[1]}`;
    }

    if (text.includes('[ExtractAudio]') || text.includes('[Merger]') || text.includes('[VideoConvertor]')) {
      job.status = 'remuxing';
      job.percentage = 85;
      job.eta = 'Finalizing clip...';
    }

    notifyListeners();
  });

  proc.stderr.on('data', (data) => {
    const text = data.toString();
    if (text.includes('ffmpeg') || text.includes('Cutting') || text.includes('frame=')) {
      job.status = 'cutting';
      if (job.percentage < 70) job.percentage = 70;
      job.eta = 'Trimming frames...';
      notifyListeners();
    }
  });

  proc.on('close', (code) => {
    if (code === 0) {
      // Find the generated file (yt-dlp might have saved as .mp4, .m4a, .mp3, etc.)
      const files = fs.readdirSync(CLIPS_DIR);
      const generated = files.find(f => f.startsWith(clipId));
      if (generated) {
        const actualPath = path.join(CLIPS_DIR, generated);
        const stats = fs.statSync(actualPath);
        job.filePath = actualPath;
        job.fileSize = stats.size;
        job.formattedSize = (stats.size / (1024 * 1024)).toFixed(2) + ' MB';
        job.status = 'finished';
        job.percentage = 100;
        job.eta = 'Completed';
        console.log(`[TrimService] Job ${clipId} completed successfully! Size: ${job.formattedSize}`);
      } else {
        job.status = 'error';
        job.error = 'Output file not found after processing';
      }
    } else {
      job.status = 'error';
      job.error = `Clipping process exited with code ${code}`;
      console.error(`[TrimService] Job ${clipId} failed with code ${code}`);
    }
    notifyListeners();
  });

  return job;
}

module.exports = {
  createClipJob,
  getJob,
  getAllJobs,
  deleteJob,
  CLIPS_DIR
};
