import { useState, useRef, useEffect, useCallback } from "react";

const formatTime = (s) => {
  if (!s || isNaN(s)) return "0:00.0";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  const ms = Math.floor((s % 1) * 10);
  return `${m}:${sec.toString().padStart(2, "0")}.${ms}`;
};

const themes = {
  dark: {
    bg: "#111113", bgPanel: "#18181b", bgCard: "#1c1c1f", bgInput: "#232326",
    border: "#2e2e33", borderStrong: "#3a3a42",
    accent: "#7c6fef", accentHover: "#9488f5", accentMuted: "rgba(124,111,239,0.15)",
    text: "#f0f0f3", textSub: "#9898a8", textMuted: "#55555f",
    success: "#22c55e", danger: "#ef4444", pink: "#f472b6", timelineBg: "#232326",
  },
  light: {
    bg: "#f4f4f6", bgPanel: "#ffffff", bgCard: "#f9f9fb", bgInput: "#f0f0f3",
    border: "#e0e0e8", borderStrong: "#c8c8d4",
    accent: "#6858e8", accentHover: "#7c6fef", accentMuted: "rgba(104,88,232,0.1)",
    text: "#18181b", textSub: "#55555f", textMuted: "#9898a8",
    success: "#16a34a", danger: "#dc2626", pink: "#db2777", timelineBg: "#e4e4ec",
  },
};

// ─── Framing Box Component ────────────────────────────────────────────────────
// Shows video in a wide container; user drags a 9:16 crop window left/right
function FramingBox({ videoSrc, cropX, setCropX, isDark, t }) {
  const containerRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartCrop, setDragStartCrop] = useState(0);
  const [vidAR, setVidAR] = useState(16 / 9);

  // cropX is 0..1 representing left edge of the 9:16 window relative to the video width

  const containerH = 320;
  const containerW = containerH * vidAR; // natural video width in display px
  const cropWDisplay = containerH * (9 / 16); // how wide the crop box is on screen

  const maxCropX = containerW - cropWDisplay; // max left px offset

  const handleMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    setDragStartX(e.clientX);
    setDragStartCrop(cropX);
  };

  const handleMouseMove = useCallback((e) => {
    if (!dragging) return;
    const dx = e.clientX - dragStartX;
    const pxOffset = dragStartCrop * maxCropX + dx;
    const clamped = Math.max(0, Math.min(maxCropX, pxOffset));
    setCropX(clamped / (maxCropX || 1));
  }, [dragging, dragStartX, dragStartCrop, maxCropX, setCropX]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const boxLeft = cropX * maxCropX;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{
        fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
        color: t.textMuted, alignSelf: "flex-start",
      }}>
        Framing · drag to reposition crop
      </div>

      {/* Outer scroll container — fixed height, scrollable if video very wide */}
      <div style={{
        width: "100%", overflowX: "auto", overflowY: "hidden",
        borderRadius: 10, border: `1px solid ${t.border}`,
        background: "#000",
        cursor: dragging ? "grabbing" : "default",
      }}>
        <div style={{ position: "relative", height: containerH, width: containerW, minWidth: "100%" }}>
          {/* The actual video, full width */}
          {videoSrc ? (
            <video
              src={videoSrc}
              style={{ width: "100%", height: containerH, objectFit: "fill", display: "block", pointerEvents: "none" }}
              muted
              onLoadedMetadata={(e) => {
                const ar = e.target.videoWidth / e.target.videoHeight;
                setVidAR(ar || 16 / 9);
              }}
            />
          ) : (
            <div style={{ width: "100%", height: containerH, background: "#222" }} />
          )}

          {/* Dark overlay left of crop */}
          <div style={{
            position: "absolute", top: 0, left: 0, width: boxLeft, height: containerH,
            background: "rgba(0,0,0,0.6)", pointerEvents: "none",
          }} />
          {/* Dark overlay right of crop */}
          <div style={{
            position: "absolute", top: 0, left: boxLeft + cropWDisplay, right: 0, height: containerH,
            background: "rgba(0,0,0,0.6)", pointerEvents: "none",
          }} />

          {/* Crop window — draggable */}
          <div
            onMouseDown={handleMouseDown}
            style={{
              position: "absolute", top: 0, left: boxLeft,
              width: cropWDisplay, height: containerH,
              border: `2px solid ${t.accent}`,
              cursor: dragging ? "grabbing" : "grab",
              boxSizing: "border-box",
              borderRadius: 4,
            }}
          >
            {/* Corner handles */}
            {[["0%","0%"],["100%","0%"],["0%","100%"],["100%","100%"]].map(([l,tp], i) => (
              <div key={i} style={{
                position: "absolute", left: l, top: tp,
                width: 10, height: 10,
                border: `2px solid ${t.accent}`,
                background: t.bgPanel,
                transform: "translate(-50%,-50%)",
                borderRadius: 2,
                pointerEvents: "none",
              }} />
            ))}
            {/* Center drag label */}
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%,-50%)",
              background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
              borderRadius: 6, padding: "4px 10px",
              fontSize: 10, color: "#fff", fontWeight: 600,
              letterSpacing: "0.04em", whiteSpace: "nowrap",
              pointerEvents: "none",
            }}>
              ← drag →
            </div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 10, color: t.textMuted, alignSelf: "flex-end" }}>
        Position: {Math.round(cropX * 100)}%
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ClipForge() {
  const videoRef = useRef(null);
  const timelineRef = useRef(null);
  const fileInputRef = useRef(null);
  const animRef = useRef(null);

  const [isDark, setIsDark] = useState(true);
  const t = themes[isDark ? "dark" : "light"];

  const [videos, setVideos] = useState([]);
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [cropX, setCropX] = useState(0.5); // 0..1 horizontal crop position
  const [clips, setClips] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [activeClip, setActiveClip] = useState(null);
  const [toast, setToast] = useState(null);
  const [downloading, setDownloading] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const activeVideo = videos[activeVideoIdx] || null;

  // tick for playhead animation
  const tick = useCallback(() => {
    if (!videoRef.current) return;
    const ct = videoRef.current.currentTime;
    setCurrentTime(ct);
    if (ct >= trimEnd && trimEnd > 0) {
      videoRef.current.pause();
      videoRef.current.currentTime = trimStart;
      setPlaying(false);
    }
    animRef.current = requestAnimationFrame(tick);
  }, [trimEnd, trimStart]);

  useEffect(() => {
    if (playing) animRef.current = requestAnimationFrame(tick);
    else cancelAnimationFrame(animRef.current);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, tick]);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newVideos = files.map((f) => ({ name: f.name, url: URL.createObjectURL(f), file: f }));
    setVideos((prev) => {
      const updated = [...prev, ...newVideos];
      setActiveVideoIdx(updated.length - newVideos.length);
      return updated;
    });
    setActiveClip(null);
    setCurrentTime(0);
    setPlaying(false);
    setCropX(0.5);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const switchVideo = (idx) => {
    if (videoRef.current) { videoRef.current.pause(); setPlaying(false); }
    setActiveVideoIdx(idx);
    setCurrentTime(0);
    setCropX(0.5);
  };

  const removeVideo = (idx) => {
    setVideos((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      const newIdx = activeVideoIdx >= updated.length ? Math.max(0, updated.length - 1) : activeVideoIdx;
      setActiveVideoIdx(newIdx);
      return updated;
    });
  };

  const onLoadedMetadata = () => {
    const d = videoRef.current.duration;
    setDuration(d);
    setTrimStart(0);
    setTrimEnd(d);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); setPlaying(false); }
    else {
      if (videoRef.current.currentTime >= trimEnd) videoRef.current.currentTime = trimStart;
      videoRef.current.play();
      setPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) {
      videoRef.current.volume = v;
      if (v === 0) { videoRef.current.muted = true; setMuted(true); }
      else if (muted) { videoRef.current.muted = false; setMuted(false); }
    }
  };

  const getTimeFromX = (clientX) => {
    const rect = timelineRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * duration;
  };

  const onTimelineMouseDown = (e) => {
    if (!duration) return;
    const time = getTimeFromX(e.clientX);
    const rect = timelineRef.current.getBoundingClientRect();
    const clickPx = e.clientX - rect.left;
    const startPx = (trimStart / duration) * rect.width;
    const endPx = (trimEnd / duration) * rect.width;
    const threshold = 12;
    if (Math.abs(clickPx - startPx) < threshold) setDragging("start");
    else if (Math.abs(clickPx - endPx) < threshold) setDragging("end");
    else {
      setDragging("playhead");
      const newT = Math.max(trimStart, Math.min(trimEnd, time));
      if (videoRef.current) videoRef.current.currentTime = newT;
      setCurrentTime(newT);
    }
  };

  const onMouseMove = useCallback((e) => {
    if (!dragging || !duration) return;
    const time = getTimeFromX(e.clientX);
    if (dragging === "start") {
      const ns = Math.max(0, Math.min(time, trimEnd - 0.5));
      setTrimStart(ns);
      if (videoRef.current) videoRef.current.currentTime = ns;
      setCurrentTime(ns);
    } else if (dragging === "end") {
      const ne = Math.max(trimStart + 0.5, Math.min(time, duration));
      setTrimEnd(ne);
    } else if (dragging === "playhead") {
      const nt = Math.max(trimStart, Math.min(trimEnd, time));
      if (videoRef.current) videoRef.current.currentTime = nt;
      setCurrentTime(nt);
    }
  }, [dragging, duration, trimStart, trimEnd]);

  const onMouseUp = useCallback(() => setDragging(null), []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const saveClip = () => {
    if (!activeVideo || trimEnd <= trimStart) return;
    const clip = {
      id: Date.now(),
      videoUrl: activeVideo.url,
      videoName: activeVideo.name,
      start: trimStart,
      end: trimEnd,
      muted,
      cropX,
      label: `Clip ${clips.length + 1}`,
      duration: trimEnd - trimStart,
    };
    setClips((prev) => [...prev, clip]);
    showToast(`Clip saved — ${formatTime(trimStart)} → ${formatTime(trimEnd)}`);
  };

  const deleteClip = (id) => {
    setClips((prev) => prev.filter((c) => c.id !== id));
    if (activeClip?.id === id) setActiveClip(null);
  };

  const previewClip = (clip) => {
    const vIdx = videos.findIndex((v) => v.url === clip.videoUrl);
    if (vIdx !== -1 && vIdx !== activeVideoIdx) switchVideo(vIdx);
    setActiveClip(clip);
    setTrimStart(clip.start);
    setTrimEnd(clip.end);
    setCropX(clip.cropX ?? 0.5);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = clip.start;
        videoRef.current.muted = clip.muted;
        setMuted(clip.muted);
        videoRef.current.play();
        setPlaying(true);
      }
    }, 50);
  };

  const downloadClip = async (clip) => {
    setDownloading(clip.id);
    showToast("Preparing download…", "info");
    try {
      const vid = document.createElement("video");
      vid.src = clip.videoUrl;
      vid.muted = clip.muted;
      vid.crossOrigin = "anonymous";
      await new Promise((res, rej) => { vid.onloadedmetadata = res; vid.onerror = rej; });

      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d");
      const stream = canvas.captureStream(30);

      let audioCtx = null;
      if (!clip.muted) {
        try {
          audioCtx = new AudioContext();
          const src = audioCtx.createMediaElementSource(vid);
          const dest = audioCtx.createMediaStreamDestination();
          src.connect(dest);
          src.connect(audioCtx.destination);
          dest.stream.getAudioTracks().forEach((tr) => stream.addTrack(tr));
        } catch {}
      }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus" : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 });
      const chunks = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      recorder.start(100);
      vid.currentTime = clip.start;
      await new Promise((r) => { vid.onseeked = r; });
      vid.play();

      const cX = clip.cropX ?? 0.5;
      const drawLoop = () => {
        if (vid.currentTime >= clip.end || vid.paused || vid.ended) {
          vid.pause(); recorder.stop(); return;
        }
        // Crop: 9:16 window positioned at cX across the video width
        const vw = vid.videoWidth, vh = vid.videoHeight;
        const cropH = vh;
        const cropW = vh * (9 / 16);
        const maxSx = vw - cropW;
        const sx = cX * maxSx;
        ctx.drawImage(vid, sx, 0, cropW, cropH, 0, 0, 1080, 1920);
        requestAnimationFrame(drawLoop);
      };
      requestAnimationFrame(drawLoop);

      await new Promise((res) => { recorder.onstop = res; });
      if (audioCtx) await audioCtx.close();

      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${clip.label.replace(/\s+/g, "_")}.webm`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`${clip.label} downloaded!`);
    } catch (err) {
      console.error(err);
      showToast("Download failed — try a shorter clip", "error");
    } finally {
      setDownloading(null);
    }
  };

  const pct = (time) => (duration ? (time / duration) * 100 : 0);

  // ── Styles ──────────────────────────────────────────────────────────────────
  const iconBtn = {
    width: 32, height: 32, borderRadius: 8,
    border: `1px solid ${t.border}`, background: t.bgInput,
    color: t.textSub, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  };
  const btn = (variant = "default", extra = {}) => ({
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "8px 14px", borderRadius: 8,
    border: variant === "outline" ? `1px solid ${t.border}` : "none",
    background: variant === "primary" ? t.accent : variant === "outline" ? "transparent" : t.bgInput,
    color: variant === "primary" ? "#fff" : t.text,
    fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
    ...extra,
  });

  return (
    <div style={{
      height: "100vh", background: t.bg, color: t.text,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      display: "flex", flexDirection: "column", fontSize: 13, overflow: "hidden",
    }}>
      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
          zIndex: 9999,
          background: toast.type === "error" ? t.danger : toast.type === "info" ? t.accent : t.success,
          color: "#fff", borderRadius: 10, padding: "9px 18px",
          fontSize: 12, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          pointerEvents: "none", whiteSpace: "nowrap",
        }}>{toast.msg}</div>
      )}

      {/* ── Topbar ── */}
      <div style={{
        height: 52, padding: "0 20px", flexShrink: 0,
        borderBottom: `1px solid ${t.border}`, background: t.bgPanel,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
          background: `linear-gradient(135deg, ${t.accent}, ${t.accentHover})`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
        </div>
        <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em" }}>ClipForge</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={() => setIsDark((d) => !d)} style={iconBtn} title="Toggle theme">
            {isDark
              ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>
          <button onClick={() => fileInputRef.current.click()} style={btn("primary")}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add videos
          </button>
        </div>
      </div>

      {/* ── Video tabs ── */}
      {videos.length > 1 && (
        <div style={{
          display: "flex", gap: 4, padding: "6px 16px",
          background: t.bgPanel, borderBottom: `1px solid ${t.border}`,
          overflowX: "auto", flexShrink: 0,
        }}>
          {videos.map((v, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "4px 10px", borderRadius: 7, cursor: "pointer", flexShrink: 0,
              background: i === activeVideoIdx ? t.accentMuted : "transparent",
              border: `1px solid ${i === activeVideoIdx ? t.accent : t.border}`,
              color: i === activeVideoIdx ? t.accent : t.textSub,
              fontSize: 11, fontWeight: 500,
            }} onClick={() => switchVideo(i)}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
              {v.name.length > 18 ? v.name.slice(0, 16) + "…" : v.name}
              <span onClick={(e) => { e.stopPropagation(); removeVideo(i); }}
                style={{ color: t.textMuted, marginLeft: 2, fontSize: 14, lineHeight: 1 }}>×</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Body: left phone | center editor | right clips ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>

        {/* ── Left: phone preview ── */}
        <div style={{
          width: 260, flexShrink: 0, borderRight: `1px solid ${t.border}`,
          background: t.bgPanel, display: "flex", flexDirection: "column",
          alignItems: "center", padding: "18px 14px 14px", gap: 12, overflowY: "auto",
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: t.textMuted, alignSelf: "flex-start" }}>
            Preview · 9:16
          </div>
          {/* Phone frame */}
          <div style={{
            width: 200, height: 356, borderRadius: 20,
            border: `2px solid ${t.borderStrong}`, background: "#000",
            overflow: "hidden", position: "relative", flexShrink: 0,
            boxShadow: isDark ? "0 0 40px rgba(124,111,239,0.12), 0 4px 24px rgba(0,0,0,0.6)" : "0 4px 20px rgba(0,0,0,0.15)",
          }}>
            {activeVideo ? (
              <video
                ref={videoRef}
                key={activeVideo.url}
                src={activeVideo.url}
                onLoadedMetadata={onLoadedMetadata}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                playsInline
              />
            ) : (
              <div onClick={() => fileInputRef.current.click()} style={{
                width: "100%", height: "100%", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", color: "#555",
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                <span style={{ fontSize: 11, color: "#666", textAlign: "center" }}>Tap to upload</span>
              </div>
            )}
            {activeVideo && duration > 0 && (
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                padding: "20px 10px 8px",
                display: "flex", justifyContent: "space-between",
                fontSize: 10, color: "rgba(255,255,255,0.8)",
                fontVariantNumeric: "tabular-nums",
              }}>
                <span>{formatTime(currentTime)}</span>
                <span style={{ opacity: 0.6 }}>{formatTime(trimEnd - trimStart)}</span>
              </div>
            )}
          </div>

          {/* Chevron nav */}
          {videos.length > 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={() => switchVideo(Math.max(0, activeVideoIdx - 1))}
                disabled={activeVideoIdx === 0}
                style={{ ...iconBtn, opacity: activeVideoIdx === 0 ? 0.3 : 1 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <span style={{ fontSize: 11, color: t.textMuted, minWidth: 40, textAlign: "center" }}>
                {activeVideoIdx + 1} / {videos.length}
              </span>
              <button
                onClick={() => switchVideo(Math.min(videos.length - 1, activeVideoIdx + 1))}
                disabled={activeVideoIdx === videos.length - 1}
                style={{ ...iconBtn, opacity: activeVideoIdx === videos.length - 1 ? 0.3 : 1 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          )}

          {/* Playback controls */}
          {activeVideo && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button
                onClick={() => { if (videoRef.current) { videoRef.current.currentTime = trimStart; setCurrentTime(trimStart); } }}
                style={iconBtn} title="Back to start"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
              </button>
              <button onClick={togglePlay} style={{
                width: 38, height: 38, borderRadius: 10, border: "none",
                background: t.accent, color: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {playing
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  : <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,3 20,12 6,21"/></svg>
                }
              </button>
              <button onClick={toggleMute} style={iconBtn}>
                {muted
                  ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                  : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                }
              </button>
              <input type="range" min="0" max="1" step="0.05"
                value={muted ? 0 : volume} onChange={handleVolumeChange}
                style={{ width: 56, accentColor: t.accent }} />
            </div>
          )}
        </div>

        {/* ── Center: editor + framing ── */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          padding: 20, gap: 14, overflowY: "auto", background: t.bg, minWidth: 0,
        }}>
          {activeVideo && duration > 0 ? (
            <>
              {/* Framing tool */}
              <div style={{
                background: t.bgPanel, borderRadius: 12,
                border: `1px solid ${t.border}`, padding: 16,
              }}>
                <FramingBox
                  videoSrc={activeVideo?.url}
                  cropX={cropX}
                  setCropX={setCropX}
                  isDark={isDark}
                  t={t}
                />
              </div>

              {/* Timeline card */}
              <div style={{
                background: t.bgPanel, borderRadius: 12,
                border: `1px solid ${t.border}`, padding: 16,
              }}>
                <div style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
                  textTransform: "uppercase", color: t.textMuted, marginBottom: 12,
                }}>
                  Timeline — drag handles to trim
                </div>

                <div
                  ref={timelineRef}
                  onMouseDown={onTimelineMouseDown}
                  style={{
                    position: "relative", height: 44, borderRadius: 8,
                    background: t.timelineBg, cursor: "col-resize", userSelect: "none",
                  }}
                >
                  {/* Dimmed out-of-trim areas */}
                  <div style={{
                    position: "absolute", top: 0, bottom: 0, left: 0,
                    width: `${pct(trimStart)}%`,
                    background: isDark ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.65)",
                    borderRadius: "8px 0 0 8px", pointerEvents: "none",
                  }} />
                  <div style={{
                    position: "absolute", top: 0, bottom: 0, right: 0,
                    width: `${100 - pct(trimEnd)}%`,
                    background: isDark ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.65)",
                    borderRadius: "0 8px 8px 0", pointerEvents: "none",
                  }} />
                  {/* Active trim border */}
                  <div style={{
                    position: "absolute", top: 0, bottom: 0,
                    left: `${pct(trimStart)}%`, width: `${pct(trimEnd) - pct(trimStart)}%`,
                    border: `2px solid ${t.accent}`, borderRadius: 4, pointerEvents: "none",
                  }} />
                  {/* Start handle */}
                  <div style={{
                    position: "absolute", top: 0, bottom: 0, width: 10,
                    left: `calc(${pct(trimStart)}% - 5px)`,
                    background: t.accent, borderRadius: "6px 0 0 6px",
                    cursor: "ew-resize", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{ width: 2, height: 16, background: "rgba(255,255,255,0.55)", borderRadius: 2 }} />
                  </div>
                  {/* End handle */}
                  <div style={{
                    position: "absolute", top: 0, bottom: 0, width: 10,
                    left: `calc(${pct(trimEnd)}% - 5px)`,
                    background: t.accent, borderRadius: "0 6px 6px 0",
                    cursor: "ew-resize", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{ width: 2, height: 16, background: "rgba(255,255,255,0.55)", borderRadius: 2 }} />
                  </div>
                  {/* Playhead */}
                  <div style={{
                    position: "absolute", top: -4, bottom: -4, width: 2,
                    left: `${pct(currentTime)}%`,
                    background: t.pink, borderRadius: 2, pointerEvents: "none", zIndex: 2,
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.pink, position: "absolute", top: 0, left: -3 }} />
                  </div>
                  {Array.from({ length: 9 }, (_, i) => (
                    <div key={i} style={{
                      position: "absolute", bottom: 0, left: `${(i + 1) * 10}%`,
                      width: 1, height: 6, background: t.borderStrong, opacity: 0.4,
                    }} />
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: t.textMuted, marginTop: 5, marginBottom: 14 }}>
                  <span>0:00.0</span>
                  <span>{formatTime(duration / 2)}</span>
                  <span>{formatTime(duration)}</span>
                </div>

                {/* Info chips */}
                <div style={{ display: "flex", gap: 8 }}>
                  {[
                    { label: "In", value: formatTime(trimStart), color: t.accent },
                    { label: "Out", value: formatTime(trimEnd), color: t.accent },
                    { label: "Duration", value: formatTime(trimEnd - trimStart), color: t.pink },
                    { label: "Audio", value: muted ? "Muted" : "On", color: muted ? t.danger : t.success },
                  ].map((item) => (
                    <div key={item.label} style={{
                      flex: 1, background: t.bgInput, borderRadius: 8,
                      padding: "8px 10px", display: "flex", flexDirection: "column", gap: 2, minWidth: 0,
                    }}>
                      <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: t.textMuted }}>{item.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: item.color, fontVariantNumeric: "tabular-nums" }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action row */}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={saveClip} style={btn("primary")}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
                  Save clip
                </button>
                <button onClick={() => { setTrimStart(0); setTrimEnd(duration); setCropX(0.5); }} style={btn("outline")}>
                  Reset
                </button>
              </div>
            </>
          ) : (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 16,
              color: t.textMuted, minHeight: 400,
            }}>
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8"><rect x="2" y="2" width="20" height="20" rx="3"/><polygon points="10,8 16,12 10,16"/></svg>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: t.textSub, marginBottom: 4 }}>No video loaded</div>
                <div style={{ fontSize: 12 }}>Upload a video to start trimming</div>
              </div>
              <button onClick={() => fileInputRef.current.click()} style={btn("primary")}>Upload video</button>
            </div>
          )}
        </div>

        {/* ── Right: saved clips sidebar — INDEPENDENTLY SCROLLABLE ── */}
        <div style={{
          width: 250, flexShrink: 0, borderLeft: `1px solid ${t.border}`,
          background: t.bgPanel, display: "flex", flexDirection: "column",
          overflow: "hidden", /* sidebar itself does not scroll */
        }}>
          {/* Sticky header */}
          <div style={{
            padding: "12px 16px", borderBottom: `1px solid ${t.border}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexShrink: 0, background: t.bgPanel,
          }}>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: t.textMuted }}>
              Saved clips
            </span>
            {clips.length > 0 && (
              <span style={{
                background: t.accent, color: "#fff", borderRadius: 20,
                padding: "1px 7px", fontSize: 10, fontWeight: 700,
              }}>{clips.length}</span>
            )}
          </div>

          {/* Scrollable clip list */}
          <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
            {clips.length === 0 ? (
              <div style={{ color: t.textMuted, fontSize: 12, textAlign: "center", marginTop: 48, lineHeight: 2 }}>
                No clips yet.<br />
                Trim a region and<br />
                tap "Save clip".
              </div>
            ) : clips.map((clip) => {
              const isActive = activeClip?.id === clip.id;
              return (
                <div
                  key={clip.id}
                  onClick={() => previewClip(clip)}
                  style={{
                    background: isActive ? t.accentMuted : t.bgCard,
                    border: `1px solid ${isActive ? t.accent : t.border}`,
                    borderRadius: 10, padding: "10px 12px", marginBottom: 7,
                    cursor: "pointer", transition: "border-color 0.15s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{clip.label}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteClip(clip.id); }}
                      style={{ background: "none", border: "none", color: t.textMuted, cursor: "pointer", padding: 0, fontSize: 16, lineHeight: 1 }}
                    >×</button>
                  </div>
                  <div style={{ fontSize: 11, color: t.textSub, lineHeight: 1.6 }}>
                    <div style={{ fontVariantNumeric: "tabular-nums" }}>{formatTime(clip.start)} → {formatTime(clip.end)}</div>
                    <div style={{ display: "flex", gap: 5, marginTop: 5, flexWrap: "wrap" }}>
                      <span style={{ background: t.bgInput, padding: "2px 7px", borderRadius: 20, fontSize: 10, color: t.accent, fontWeight: 500 }}>
                        {formatTime(clip.duration)}
                      </span>
                      {clip.muted && (
                        <span style={{
                          background: isDark ? "#2a1010" : "#fee2e2",
                          color: t.danger, padding: "2px 7px", borderRadius: 20, fontSize: 10,
                        }}>muted</span>
                      )}
                      <span style={{ background: t.bgInput, padding: "2px 7px", borderRadius: 20, fontSize: 10, color: t.textSub }}>
                        crop {Math.round((clip.cropX ?? 0.5) * 100)}%
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); downloadClip(clip); }}
                    disabled={downloading === clip.id}
                    style={{
                      ...btn("outline"),
                      width: "100%", marginTop: 8, justifyContent: "center",
                      opacity: downloading === clip.id ? 0.6 : 1,
                      fontSize: 11, padding: "6px 10px",
                    }}
                  >
                    {downloading === clip.id ? (
                      <>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                        Exporting…
                      </>
                    ) : (
                      <>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Download .webm
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Sticky footer */}
          {clips.length > 0 && (
            <div style={{ padding: "10px 14px", borderTop: `1px solid ${t.border}`, flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: t.textMuted }}>
                {clips.length} clip{clips.length > 1 ? "s" : ""} · {formatTime(clips.reduce((a, c) => a + c.duration, 0))} total
              </div>
            </div>
          )}
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="video/*" multiple onChange={handleFiles} style={{ display: "none" }} />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.borderStrong}; border-radius: 4px; }
        button:active { opacity: 0.8 !important; }
      `}</style>
    </div>
  );
}