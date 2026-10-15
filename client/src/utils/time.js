export function formatTime(totalSeconds, includeMs = false) {
  if (isNaN(totalSeconds) || totalSeconds === null || totalSeconds === undefined) {
    return includeMs ? '00:00.0' : '00:00';
  }

  const positiveSecs = Math.max(0, totalSeconds);
  const hrs = Math.floor(positiveSecs / 3600);
  const mins = Math.floor((positiveSecs % 3600) / 60);
  const secs = Math.floor(positiveSecs % 60);
  const ms = Math.floor((positiveSecs % 1) * 10);

  const mm = mins.toString().padStart(2, '0');
  const ss = secs.toString().padStart(2, '0');

  let res = '';
  if (hrs > 0) {
    const hh = hrs.toString().padStart(2, '0');
    res = `${hh}:${mm}:${ss}`;
  } else {
    res = `${mm}:${ss}`;
  }

  if (includeMs) {
    res += `.${ms}`;
  }

  return res;
}

export function parseTime(str) {
  if (!str) return 0;
  const s = String(str).trim();
  
  // If plain number
  if (!isNaN(s)) {
    return Math.max(0, parseFloat(s));
  }

  // Handle format hh:mm:ss.ms or mm:ss.ms
  const parts = s.split(':');
  if (parts.length === 3) {
    const hrs = parseFloat(parts[0]) || 0;
    const mins = parseFloat(parts[1]) || 0;
    const secs = parseFloat(parts[2]) || 0;
    return Math.max(0, hrs * 3600 + mins * 60 + secs);
  } else if (parts.length === 2) {
    const mins = parseFloat(parts[0]) || 0;
    const secs = parseFloat(parts[1]) || 0;
    return Math.max(0, mins * 60 + secs);
  } else if (parts.length === 1) {
    return Math.max(0, parseFloat(parts[0]) || 0);
  }

  return 0;
}

export function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function extractYouTubeId(urlOrId) {
  if (!urlOrId) return '';
  const str = String(urlOrId).trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }
  try {
    const parsed = new URL(str.startsWith('http') ? str : `https://${str}`);
    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname === '/watch') return parsed.searchParams.get('v') || '';
      if (parsed.pathname.startsWith('/shorts/')) return parsed.pathname.split('/shorts/')[1].split('/')[0].split('?')[0];
      if (parsed.pathname.startsWith('/embed/')) return parsed.pathname.split('/embed/')[1].split('/')[0].split('?')[0];
      if (parsed.pathname.startsWith('/cutter/')) return parsed.pathname.split('/cutter/')[1].split('/')[0].split('?')[0];
    }
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1).split('?')[0];
    }
  } catch (e) {
    const match = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|cutter\/))([\w-]{11})/);
    if (match) return match[1];
  }
  const match = str.match(/([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : '';
}
