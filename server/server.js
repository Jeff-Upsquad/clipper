const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const { getVideoInfo, extractVideoId } = require('./services/ytService');
const { createClipJob, getJob, getAllJobs, deleteJob, CLIPS_DIR } = require('./services/trimService');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Public static files
app.use('/clips-files', express.static(CLIPS_DIR));

// 1. Fetch YouTube Video Info & Available Formats
app.get('/api/youtube/:id/info', async (req, res) => {
  try {
    const rawId = req.params.id;
    const info = await getVideoInfo(rawId);
    res.json({ success: true, data: info });
  } catch (error) {
    console.error('Failed to get video info:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 2. Create a new Clip Trimming Job
app.post('/api/clips/create', (req, res) => {
  try {
    const { videoId, startTime, endTime, type, format, quality, title, channel } = req.body;
    if (!videoId) {
      return res.status(400).json({ success: false, error: 'videoId is required' });
    }

    const job = createClipJob({
      videoId,
      startTime,
      endTime,
      type,
      format,
      quality,
      title,
      channel
    });

    res.json({
      success: true,
      data: {
        clipId: job.clipId,
        status: job.status,
        percentage: job.percentage,
        eta: job.eta,
        title: job.title,
        duration: job.duration,
        format: job.format,
        quality: job.quality,
        downloadUrl: job.downloadUrl,
        streamUrl: job.streamUrl,
        thumbnail: job.thumbnail
      }
    });
  } catch (error) {
    console.error('Failed to create clip job:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Poll Clip Status
app.get('/api/clips/status/:clipId', (req, res) => {
  const job = getJob(req.params.clipId);
  if (!job) {
    return res.status(404).json({ success: false, error: 'Clip not found' });
  }

  res.json({
    success: true,
    data: {
      clipId: job.clipId,
      videoId: job.videoId,
      title: job.title,
      duration: job.duration,
      format: job.format,
      quality: job.quality,
      status: job.status,
      percentage: job.percentage,
      eta: job.eta,
      fileSize: job.fileSize,
      formattedSize: job.formattedSize,
      downloadUrl: job.downloadUrl,
      streamUrl: job.streamUrl,
      error: job.error
    }
  });
});

// 4. Server-Sent Events (SSE) for Real-Time Progress
app.get('/api/clips/progress/:clipId', (req, res) => {
  const job = getJob(req.params.clipId);
  if (!job) {
    return res.status(404).send('Clip not found');
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial state
  res.write(`data: ${JSON.stringify({
    clipId: job.clipId,
    status: job.status,
    percentage: job.percentage,
    eta: job.eta,
    formattedSize: job.formattedSize
  })}\n\n`);

  if (job.status === 'finished' || job.status === 'error') {
    res.end();
    return;
  }

  const listener = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    if (data.status === 'finished' || data.status === 'error') {
      res.end();
    }
  };

  job.listeners.add(listener);

  req.on('close', () => {
    job.listeners.delete(listener);
  });
});

// 5. Download Trimmed Clip File
app.get('/api/clips/download/:clipId', (req, res) => {
  const job = getJob(req.params.clipId);
  if (!job || !job.filePath || !fs.existsSync(job.filePath)) {
    return res.status(404).send('File not ready or expired');
  }

  res.download(job.filePath, job.fileName, (err) => {
    if (err && !res.headersSent) {
      console.error('Download error:', err);
      res.status(500).send('Error downloading file');
    }
  });
});

// 6. Stream Clip for in-browser playback preview
app.get('/api/clips/stream/:clipId', (req, res) => {
  const job = getJob(req.params.clipId);
  if (!job || !job.filePath || !fs.existsSync(job.filePath)) {
    return res.status(404).send('Clip file not available');
  }

  const filePath = job.filePath;
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.m4a': 'audio/mp4',
    '.ogg': 'audio/ogg',
    '.opus': 'audio/opus',
    '.wav': 'audio/wav'
  };
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// 7. Get All Clips in History
app.get('/api/clips', (req, res) => {
  const all = getAllJobs().map(job => ({
    clipId: job.clipId,
    videoId: job.videoId,
    title: job.title,
    channel: job.channel,
    startTime: job.startTime,
    endTime: job.endTime,
    duration: job.duration,
    type: job.type,
    format: job.format,
    quality: job.quality,
    status: job.status,
    percentage: job.percentage,
    eta: job.eta,
    formattedSize: job.formattedSize,
    downloadUrl: job.downloadUrl,
    streamUrl: job.streamUrl,
    thumbnail: job.thumbnail,
    createdAt: job.createdAt
  }));
  res.json({ success: true, data: all });
});

// 8. Delete a Clip
app.delete('/api/clips/:clipId', (req, res) => {
  const deleted = deleteJob(req.params.clipId);
  res.json({ success: deleted });
});

// Serve frontend build in production
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`Clipper Server running on http://localhost:${PORT}`);
  console.log(`Theme: Pale Yellow (#FFFF99) | brand.accent`);
  console.log(`===============================================`);
});
