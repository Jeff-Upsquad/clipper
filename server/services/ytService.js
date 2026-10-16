const { execFile } = require('child_process');
const https = require('https');

const cache = new Map();
const streamCache = new Map();
let ytDlpBlockedUntil = 0;

function isYtDlpBlocked() {
  return Date.now() < ytDlpBlockedUntil;
}

function markYtDlpBlocked() {
  ytDlpBlockedUntil = Date.now() + 30 * 60 * 1000; // 30 minutes cooldown
}

/**
 * Extracts YouTube video ID from various URL formats or returns the ID if already clean
 */
function extractVideoId(urlOrId) {
  if (!urlOrId) return null;
  const str = String(urlOrId).trim();

  // If already an 11-char YouTube ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }

  // Handle URL variations
  try {
    const parsed = new URL(str.startsWith('http') ? str : `https://${str}`);
    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname === '/watch') {
        return parsed.searchParams.get('v');
      }
      if (parsed.pathname.startsWith('/shorts/')) {
        return parsed.pathname.split('/shorts/')[1].split('/')[0].split('?')[0];
      }
      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/embed/')[1].split('/')[0].split('?')[0];
      }
      if (parsed.pathname.startsWith('/cutter/')) {
        return parsed.pathname.split('/cutter/')[1].split('/')[0].split('?')[0];
      }
    }
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1).split('?')[0];
    }
  } catch (e) {
    // regex fallback
    const match = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|cutter\/))([\w-]{11})/);
    if (match) return match[1];
  }

  const rawMatch = str.match(/([a-zA-Z0-9_-]{11})/);
  return rawMatch ? rawMatch[1] : null;
}

function formatSeconds(secs) {
  const s = Math.floor(secs || 0);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const remainingSecs = s % 60;
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
}

/**
 * Fetch video metadata via yt-dlp with android/ios client fallback
 */
function fetchWithYtDlp(videoId) {
  return new Promise((resolve, reject) => {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const args = [
      '-m', 'yt_dlp',
      '--extractor-args', 'youtube:player_client=android,ios',
      '-j',
      '--skip-download',
      url
    ];

    execFile('python3', args, { maxBuffer: 10 * 1024 * 1024, timeout: 20000 }, (err, stdout, stderr) => {
      if (err) {
        return reject(new Error(`yt-dlp error: ${stderr || err.message}`));
      }
      try {
        const data = JSON.parse(stdout);
        resolve(data);
      } catch (parseErr) {
        reject(parseErr);
      }
    });
  });
}

/**
 * Fallback to Clipscutter format API if yt-dlp is slow or blocked
 */
function fetchFromClipscutterApi(videoId) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ source: '', httpDashFormats: false });
    const options = {
      hostname: 'api.clipscutter.com',
      port: 443,
      path: `/youtube/${videoId}/formats`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        'Origin': 'https://www.clipscutter.com',
        'Referer': 'https://www.clipscutter.com/'
      },
      timeout: 15000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json && json.data) {
            resolve(json.data);
          } else {
            reject(new Error('Invalid clipscutter response'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Clipscutter API timeout'));
    });
    req.write(postData);
    req.end();
  });
}

/**
 * Get a direct proxied HTTP stream URL for ffmpeg trimming
 */
async function getStreamUrl(videoId) {
  const cached = streamCache.get(videoId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }

  const apiData = await fetchFromClipscutterApi(videoId);
  const streamUrl = apiData && Array.isArray(apiData.video) && apiData.video[0]
    ? apiData.video[0].url
    : null;

  if (!streamUrl) {
    throw new Error('No playable video stream found for this video');
  }

  streamCache.set(videoId, {
    url: streamUrl,
    expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes
  });

  return streamUrl;
}

/**
 * Get video info with caching and smart fallback
 */
async function getVideoInfo(urlOrId) {
  const videoId = extractVideoId(urlOrId);
  if (!videoId) {
    throw new Error('Invalid YouTube video link or ID');
  }

  if (cache.has(videoId)) {
    return cache.get(videoId);
  }

  let info = null;

  // Try yt-dlp first unless recently blocked by YouTube bot check
  if (!isYtDlpBlocked()) {
    try {
      const raw = await fetchWithYtDlp(videoId);
      const duration = raw.duration || 0;

      // Extract available resolutions
      const resolutions = new Set();
      if (Array.isArray(raw.formats)) {
        raw.formats.forEach(f => {
          if (f.height) resolutions.add(`${f.height}p`);
        });
      }

      const availableRes = ['1080p', '720p', '480p', '360p', '240p', '144p'].map(res => ({
        name: res,
        is_available: resolutions.size === 0 || resolutions.has(res),
        premium: false
      }));

      info = {
        id: videoId,
        title: raw.title || 'YouTube Video',
        channel: raw.uploader || raw.channel || 'YouTube Creator',
        duration: duration,
        formattedDuration: formatSeconds(duration),
        thumbnail: raw.thumbnail || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
        views: raw.view_count,
        description: raw.description ? raw.description.slice(0, 300) : '',
        mp4_list: availableRes,
        webm_list: availableRes,
        audio_list: [
          { name: 'MP3', bitrates: ['320 kbps', '256 kbps', '192 kbps', '128 kbps'], ext: 'mp3' },
          { name: 'M4A', bitrates: ['256 kbps', '192 kbps', '128 kbps'], ext: 'm4a' },
          { name: 'WebM Audio', bitrates: ['160 kbps', '128 kbps', '96 kbps'], ext: 'webm' },
          { name: 'OGG', bitrates: ['192 kbps', '128 kbps'], ext: 'ogg' },
          { name: 'OPUS', bitrates: ['160 kbps', '128 kbps', '96 kbps'], ext: 'opus' },
          { name: 'WAV', bitrates: ['Lossless PCM'], ext: 'wav' }
        ]
      };
    } catch (ytErr) {
      if (ytErr.message && (ytErr.message.includes('Sign in to confirm') || ytErr.message.includes('not a bot'))) {
        markYtDlpBlocked();
      }
      console.warn(`yt-dlp fetch failed for ${videoId}, trying fallback API:`, ytErr.message);
    }
  }

  if (!info) {
    try {
      const apiData = await fetchFromClipscutterApi(videoId);
      if (apiData && Array.isArray(apiData.video) && apiData.video[0] && apiData.video[0].url) {
        streamCache.set(videoId, {
          url: apiData.video[0].url,
          expiresAt: Date.now() + 15 * 60 * 1000
        });
      }
      const duration = apiData.lengthSeconds || 0;
      info = {
        id: videoId,
        title: apiData.title || 'YouTube Video',
        channel: 'YouTube Video',
        duration: duration,
        formattedDuration: formatSeconds(duration),
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        views: null,
        description: '',
        mp4_list: apiData.mp4_list || [
          { name: '1080p', is_available: true },
          { name: '720p', is_available: true },
          { name: '480p', is_available: true },
          { name: '360p', is_available: true }
        ],
        webm_list: apiData.webm_list || [
          { name: '1080p', is_available: true },
          { name: '720p', is_available: true },
          { name: '360p', is_available: true }
        ],
        audio_list: [
          { name: 'MP3', bitrates: ['320 kbps', '256 kbps', '192 kbps', '128 kbps'], ext: 'mp3' },
          { name: 'M4A', bitrates: ['256 kbps', '192 kbps', '128 kbps'], ext: 'm4a' },
          { name: 'OGG', bitrates: ['192 kbps', '128 kbps'], ext: 'ogg' },
          { name: 'OPUS', bitrates: ['160 kbps', '128 kbps'], ext: 'opus' }
        ]
      };
    } catch (apiErr) {
      console.error('All metadata sources failed:', apiErr);
      // Minimal fallback to still allow UI to function
      info = {
        id: videoId,
        title: `YouTube Video (${videoId})`,
        channel: 'YouTube Video',
        duration: 60,
        formattedDuration: '01:00',
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        mp4_list: [{ name: '720p', is_available: true }, { name: '360p', is_available: true }],
        webm_list: [{ name: '720p', is_available: true }],
        audio_list: [{ name: 'MP3', bitrates: ['320 kbps', '192 kbps'], ext: 'mp3' }]
      };
    }
  }

  cache.set(videoId, info);
  return info;
}

module.exports = {
  extractVideoId,
  getVideoInfo,
  getStreamUrl,
  isYtDlpBlocked,
  markYtDlpBlocked,
  formatSeconds
};
