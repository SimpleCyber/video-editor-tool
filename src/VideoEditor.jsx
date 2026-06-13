import React, { useState, useRef, useEffect, useCallback } from "react";
import { formatTime, themes } from "./utils";
import { saveVideo, deleteVideo, getAllVideos, saveClipToDb, deleteClipFromDb, getAllClipsFromDb } from "./utils/idb";
import { exportClip } from "./utils/exportClip";
import TopBar from "./components/TopBar";
import VideoTabs from "./components/VideoTabs";
import PhonePreview from "./components/PhonePreview";
import CenterEditor from "./components/CenterEditor";
import ClipSidebar from "./components/ClipSidebar";

export default function ClipForge() {
  const videoRef = useRef(null);
  const timelineRef = useRef(null);
  const fileInputRef = useRef(null);
  const animRef = useRef(null);

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("clipForgeTheme");
    return saved ? saved === "dark" : true;
  });
  const t = themes[isDark ? "dark" : "light"];

  useEffect(() => {
    localStorage.setItem("clipForgeTheme", isDark ? "dark" : "light");
  }, [isDark]);

  const [videos, setVideos] = useState([]);
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [cropX, setCropX] = useState(0.5); 
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [vignette, setVignette] = useState(0);
  const [clips, setClips] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [activeClip, setActiveClip] = useState(null);
  const [toast, setToast] = useState(null);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const storedVideos = await getAllVideos();
        const rehydratedVideos = storedVideos.map(v => ({ ...v, url: URL.createObjectURL(v.file) }));
        setVideos(rehydratedVideos);
        const storedClips = await getAllClipsFromDb();
        setClips(storedClips);
      } catch (err) {
        console.error("Failed to load data from IDB:", err);
      }
    };
    init();
    return () => {
      setVideos(prev => { prev.forEach(v => { if (v.url) URL.revokeObjectURL(v.url); }); return prev; });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const activeVideo = videos[activeVideoIdx] || null;

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

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    const newVideos = await Promise.all(files.map(async (f) => {
      const v = { id: Date.now().toString() + Math.random(), name: f.name, file: f };
      await saveVideo(v);
      return { ...v, url: URL.createObjectURL(f) };
    }));
    
    setVideos((prev) => {
      const updated = [...prev, ...newVideos];
      setActiveVideoIdx(updated.length - newVideos.length);
      return updated;
    });
    setActiveClip(null);
    setCurrentTime(0);
    setPlaying(false);
    setCropX(0.5);
    setBrightness(1);
    setContrast(1);
    setVignette(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const switchVideo = (idx) => {
    if (videoRef.current) { videoRef.current.pause(); setPlaying(false); }
    setActiveVideoIdx(idx);
    setCurrentTime(0);
    setCropX(0.5);
    setBrightness(1);
    setContrast(1);
    setVignette(0);
  };

  const removeVideo = async (idx) => {
    const v = videos[idx];
    if (v && v.id) {
      await deleteVideo(v.id);
      if (v.url) URL.revokeObjectURL(v.url);
    }
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

  const getTimeFromX = useCallback((clientX) => {
    if (!timelineRef.current) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * duration;
  }, [duration]);

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
  }, [dragging, duration, trimStart, trimEnd, getTimeFromX]);

  const onMouseUp = useCallback(() => setDragging(null), []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const saveClip = async () => {
    if (!activeVideo || trimEnd <= trimStart) return;
    const clip = {
      id: Date.now(), videoUrl: activeVideo.url, videoName: activeVideo.name,
      start: trimStart, end: trimEnd, muted, cropX, label: `Clip ${clips.length + 1}`,
      duration: trimEnd - trimStart, brightness, contrast, vignette
    };
    
    setClips((prev) => [...prev, clip]);
    await saveClipToDb(clip);
    showToast(`Clip saved — ${formatTime(trimStart)} → ${formatTime(trimEnd)}`);
  };

  const updateClip = async () => {
    if (!activeVideo || !activeClip || trimEnd <= trimStart) return;
    const updated = {
      ...activeClip,
      start: trimStart, end: trimEnd, muted, cropX,
      duration: trimEnd - trimStart, brightness, contrast, vignette
    };
    
    setClips((prev) => prev.map(c => c.id === activeClip.id ? updated : c));
    setActiveClip(updated);
    await saveClipToDb(updated);
    showToast(`Clip updated!`);
  };

  const deleteClip = async (id) => {
    await deleteClipFromDb(id);
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
    setBrightness(clip.brightness ?? 1);
    setContrast(clip.contrast ?? 1);
    setVignette(clip.vignette ?? 0);
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

  const downloadClip = (clip) => exportClip(clip, setDownloading, showToast);
  const pct = (time) => (duration ? (time / duration) * 100 : 0);

  return (
    <div style={{
      height: "100vh", background: t.bg, color: t.text,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      display: "flex", flexDirection: "column", fontSize: 13, overflow: "hidden",
    }}>
      {toast && (
        <div style={{
          position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 9999,
          background: toast.type === "error" ? t.danger : toast.type === "info" ? t.accent : t.success,
          color: "#fff", borderRadius: 10, padding: "9px 18px", fontSize: 12, fontWeight: 600,
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)", pointerEvents: "none", whiteSpace: "nowrap",
        }}>{toast.msg}</div>
      )}

      <TopBar isDark={isDark} setIsDark={setIsDark} FileInputTrigger={() => fileInputRef.current.click()} t={t} />

      <VideoTabs videos={videos} activeVideoIdx={activeVideoIdx} switchVideo={switchVideo} removeVideo={removeVideo} t={t} clips={clips} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
        <PhonePreview 
          activeVideo={activeVideo} videos={videos} activeVideoIdx={activeVideoIdx} switchVideo={switchVideo} removeVideo={removeVideo} 
          videoRef={videoRef} onLoadedMetadata={onLoadedMetadata} duration={duration} currentTime={currentTime} trimStart={trimStart} 
          trimEnd={trimEnd} fileInputRef={fileInputRef} playing={playing} togglePlay={togglePlay} muted={muted} toggleMute={toggleMute} 
          volume={volume} handleVolumeChange={handleVolumeChange} setCurrentTime={setCurrentTime} formatTime={formatTime} t={t} isDark={isDark}
          cropX={cropX} brightness={brightness} contrast={contrast} vignette={vignette}
          setBrightness={setBrightness} setContrast={setContrast} setVignette={setVignette}
        />

        <CenterEditor
          activeVideo={activeVideo} duration={duration} cropX={cropX} setCropX={setCropX} isDark={isDark} t={t}
          timelineRef={timelineRef} onTimelineMouseDown={onTimelineMouseDown} pct={pct} trimStart={trimStart} trimEnd={trimEnd}
          currentTime={currentTime} muted={muted} formatTime={formatTime} saveClip={saveClip} updateClip={updateClip} activeClip={activeClip} setActiveClip={setActiveClip} setTrimStart={setTrimStart} setTrimEnd={setTrimEnd} fileInputRef={fileInputRef}
        />

        <ClipSidebar 
          t={t} isDark={isDark} clips={clips} activeClip={activeClip} previewClip={previewClip} 
          deleteClip={deleteClip} downloadClip={downloadClip} downloading={downloading} activeVideo={activeVideo}
        />
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