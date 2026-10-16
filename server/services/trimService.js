const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { getStreamUrl, isYtDlpBlocked, markYtDlpBlocked } = require('./ytService');

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

function finalizeJobSuccess(job, actualPath, notifyListeners) {
  const stats = fs.statSync(actualPath);
  job.filePath = actualPath;
  job.fileSize = stats.size;
  job.formattedSize = (stats.size / (1024 * 1024)).toFixed(2) + ' MB';
  job.status = 'finished';
  job.percentage = 100;
  job.eta = 'Completed';
  console.log(`[TrimService] Job ${job.clipId} completed successfully! Size: ${job.formattedSize}`);
  notifyListeners();
}

/**
 * Fallback/Direct trimmer using proxied HTTP stream URL + ffmpeg
 */
async function runFfmpegStreamTrim(job, ext, notifyListeners, reencodeMp4 = false) {
  try {
    job.status = 'downloading';
    job.percentage = Math.max(job.percentage || 10, 15);
    job.eta = 'Fetching stream...';
    notifyListeners();

    const streamUrl = await getStreamUrl(job.videoId);
    const outPath = path.join(CLIPS_DIR, `${job.clipId}.${ext}`);

    const ffArgs = [
      '-y',
      '-ss', String(job.startTime),
      '-to', String(job.endTime),
      '-i', streamUrl
    ];

    if (job.type === 'audio') {
      const bitrate = (job.quality || '').replace(/[^0-9]/g, '') || '192';
      ffArgs.push('-vn');
      if (ext === 'mp3') {
        ffArgs.push('-c:a', 'libmp3lame', '-b:a', `${bitrate}k`);
      } else if (ext === 'm4a') {
        ffArgs.push('-c:a', 'aac', '-b:a', `${bitrate}k`);
      } else if (ext === 'opus' || ext === 'webm') {
        ffArgs.push('-c:a', 'libopus', '-b:a', `${bitrate}k`);
      } else if (ext === 'ogg') {
        ffArgs.push('-c:a', 'libvorbis', '-b:a', `${bitrate}k`);
      } else if (ext === 'wav') {
        ffArgs.push('-c:a', 'pcm_s16le');
      } else {
        ffArgs.push('-c:a', 'libmp3lame', '-b:a', `${bitrate}k`);
      }
    } else {
      if (ext === 'webm') {
        ffArgs.push(
          '-c:v', 'libvpx-vp9',
          '-crf', '32',
          '-b:v', '0',
          '-deadline', 'realtime',
          '-cpu-used', '5',
          '-c:a', 'libopus'
        );
      } else if (reencodeMp4) {
        ffArgs.push(
          '-c:v', 'libx264',
          '-preset', 'ultrafast',
          '-crf', '23',
          '-c:a', 'aac',
          '-movflags', '+faststart'
        );
      } else {
        ffArgs.push(
          '-c', 'copy',
          '-movflags', '+faststart'
        );
      }
    }

    ffArgs.push(outPath);

    console.log(`[TrimService] Running ffmpeg stream trim for job ${job.clipId} (${job.startTime}s - ${job.endTime}s, ${job.type}/${ext})`);
    job.status = 'cutting';
    job.percentage = 25;
    job.eta = 'Trimming stream...';
    notifyListeners();

    const ffProc = spawn('ffmpeg', ffArgs);

    ffProc.stderr.on('data', (data) => {
      const text = data.toString();
      const timeMatch = text.match(/time=(\d+):(\d+):(\d+\.?\d*)/);
      if (timeMatch) {
        const h = parseFloat(timeMatch[1]);
        const m = parseFloat(timeMatch[2]);
        const s = parseFloat(timeMatch[3]);
        const currentSec = h * 3600 + m * 60 + s;
        if (currentSec > 0 && job.duration > 0) {
          const ratio = Math.min(1, currentSec / job.duration);
          job.percentage = Math.min(95, Math.max(25, Math.round(25 + ratio * 70)));
          const rem = Math.max(1, Math.ceil((1 - ratio) * 4));
          job.eta = `~${rem}s remaining`;
          job.status = ratio > 0.85 ? 'remuxing' : 'cutting';
          notifyListeners();
        }
      }
    });

    ffProc.on('close', (code) => {
      if (code === 0 && fs.existsSync(outPath) && fs.statSync(outPath).size > 1024) {
        finalizeJobSuccess(job, outPath, notifyListeners);
      } else if (!reencodeMp4 && job.type === 'video' && ext === 'mp4') {
        console.warn(`[TrimService] Lossless copy failed for ${job.clipId}, retrying with fast re-encode...`);
        runFfmpegStreamTrim(job, ext, notifyListeners, true);
      } else {
        job.status = 'error';
        job.error = `Stream trimming failed (code ${code})`;
        console.error(`[TrimService] ffmpeg stream trim failed for job ${job.clipId} with code ${code}`);
        notifyListeners();
      }
    });
  } catch (err) {
    job.status = 'error';
    job.error = err.message || 'Failed to trim video stream';
    console.error(`[TrimService] Stream trim error for ${job.clipId}:`, err);
    notifyListeners();
  }
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

  // If yt-dlp is known to be blocked on this server IP, go directly to fast ffmpeg stream trim
  if (isYtDlpBlocked()) {
    runFfmpegStreamTrim(job, ext, notifyListeners);
    return job;
  }

  // Build yt-dlp arguments
  const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const args = [
    '-m', 'yt_dlp',
    '--extractor-args', 'youtube:player_client=android_vr,android',
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
    let maxH = 1080;
    if (quality.includes('4K') || quality.includes('2160')) {
      maxH = 2160;
    } else if (quality.includes('1440') || quality.includes('2K')) {
      maxH = 1440;
    } else {
      maxH = parseInt(quality.replace(/[^0-9]/g, ''), 10) || 1080;
    }

    if (ext === 'webm') {
      args.push('-f', `bestvideo[height<=${maxH}][ext=webm]+bestaudio[ext=webm]/bestvideo[height<=${maxH}]+bestaudio/best[height<=${maxH}]/best`);
      args.push('--merge-output-format', 'webm');
    } else {
      args.push('-f', `bestvideo[height<=${maxH}]+bestaudio[ext=m4a]/bestvideo[height<=${maxH}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${maxH}]+bestaudio/best[height<=${maxH}]/best`);
      args.push('--merge-output-format', 'mp4');
    }
  }

  // Temporary download output template
  const tempTemplate = path.join(CLIPS_DIR, `${clipId}.%(ext)s`);
  args.push('-o', tempTemplate);
  args.push(ytUrl);

  console.log(`[TrimService] Starting job ${clipId} for ${videoId} (${startSec}s - ${endSec}s, ${type}/${ext}/${quality})`);

  const proc = spawn('python3', args);
  let stderrLog = '';

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
    stderrLog += text;
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
        finalizeJobSuccess(job, actualPath, notifyListeners);
        return;
      }
    }

    if (stderrLog.includes('Sign in to confirm') || stderrLog.includes('not a bot')) {
      markYtDlpBlocked();
    }
    console.warn(`[TrimService] yt-dlp exited with code ${code} for job ${clipId}, falling back to ffmpeg stream trim...`);
    runFfmpegStreamTrim(job, ext, notifyListeners);
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
