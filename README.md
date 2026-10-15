# YT clipper – YouTube Video & Audio Cutter (4K Raw Quality, No Re-Encoding)

A high-performance, full-stack clone of [Clipscutter.com](https://www.clipscutter.com) styled with the **Pale yellow** theme (`#FFFF99` / `brand.accent`), specifically pre-configured with support for `AgwWYSlFCkE` and any YouTube video, short, or stream.

---

## 🎨 Theme & Palette

- **Brand Accent**: Pale Yellow
  - **HEX**: `#FFFF99`
  - **RGB**: `255, 255, 153`
  - **Theme token**: `brand.accent` (sourced from `upsquad/client/tailwind.config.js`)
- **Monochrome Foundation**: `#0A0A0A` (dark), `#141414` (surface), `#FFFFFF` (card surfaces)
- **High Contrast**: Clean brutalist/modern typography with dark text on `#FFFF99` buttons, badges, and glowing range sliders.

---

## ⚡ Highlights & Features

- **Frame-Accurate Dual-Handle Slider**: Interactive timeline range trimmer with live playhead indicator, timestamp readouts, and draggable In/Out handles in Pale Yellow (`#FFFF99`).
- **Precision Time Adjusters**: Start & End time inputs formatted to tenths of a second (`hh:mm:ss.ms`) with `±1s` and `±0.1s` nudge buttons, plus instant "Set to Current Playhead" buttons.
- **Instant Clip Preview**: Plays exclusively between your chosen Start and End timestamps with automatic stop, without having to export or download first.
- **Multi-Format Export**:
  - **Video Formats**: MP4 (H.264 / AAC) and WebM (VP9 / Opus) in 1080p, 720p, 480p, 360p.
  - **Audio Formats**: MP3 (320kbps, 256kbps, 192kbps, 128kbps), M4A, OGG, and Opus.
- **Real-Time Progress Tracking**: Server-Sent Events (SSE) streaming live status updates (`downloading` → `cutting` → `remuxing` → `finished`) with progress percentage and ETA countdown.
- **In-Browser Playback Preview Modal**: Watch or listen to your cut clip directly in the browser before or after downloading.
- **"My Clips" Session Drawer**: Convenient slide-over panel keeping track of all clips cut during the session with one-click direct download and deletion.
- **Preloaded Video**: Default cutter loads `AgwWYSlFCkE` (*Hero ISL Team Kerala Blasters Official Crest Reveal*), and lets you paste any other YouTube URL or ID.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS v4 (`@tailwindcss/vite`), Vite, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express 5, Morgan, CORS.
- **Media Engine**: Native `ffmpeg` 9.0 and `yt-dlp` with multi-client extractor arguments (`android`, `ios`) for high-speed segment extraction and keyframe-accurate cutting.

---

## 🚀 Getting Started

### 1. Requirements
- Node.js (v18+)
- Python 3 with `yt-dlp` (`pip3 install yt-dlp`)
- `ffmpeg` (`brew install ffmpeg`)

### 2. Run the App

```bash
# In the project root (/Users/jeffzeena/Youtube clipper)

# Option A: Start production server (serves both API & Frontend on http://localhost:5001)
npm start

# Option B: Start development servers with hot reload (Vite on :3000, Express on :5001)
npm run dev
```

Open your browser to:
- **`http://localhost:5001/cutter/AgwWYSlFCkE`** (Direct Cutter for Kerala Blasters Crest Reveal)
- **`http://localhost:5001`** (Homepage)

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/youtube/:id/info` | Fetch video title, duration, thumbnail, and format options |
| `POST` | `/api/clips/create` | Start an async trimming job |
| `GET` | `/api/clips/status/:clipId` | Poll trimming progress & details |
| `GET` | `/api/clips/progress/:clipId`| Server-Sent Events (SSE) live progress stream |
| `GET` | `/api/clips/download/:clipId`| Direct file download with `Content-Disposition` |
| `GET` | `/api/clips/stream/:clipId`  | HTTP 206 range streaming for browser playback |
| `GET` | `/api/clips`                 | List all clipped videos in session |
| `DELETE` | `/api/clips/:clipId`      | Remove a clip and its media file |
