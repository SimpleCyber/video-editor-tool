import React from "react";
import { iconBtn } from "../utils";

export default function PhonePreview({
  activeVideo, videos, activeVideoIdx, switchVideo, removeVideo,
  videoRef, onLoadedMetadata, duration, currentTime, trimStart, trimEnd,
  fileInputRef, playing, togglePlay, muted, toggleMute, volume, handleVolumeChange, setCurrentTime, formatTime, t, isDark, cropX,
  brightness, contrast, vignette, setBrightness, setContrast, setVignette
}) {
  const SliderControl = ({ label, val, setVal, min, max, step }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: t.textSub, fontWeight: 500 }}>
        <span>{label}</span>
        <span style={{ fontVariantNumeric: "tabular-nums" }}>{Math.round(val * 100)}%</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={val} onChange={(e) => setVal(parseFloat(e.target.value))} style={{ accentColor: t.accent }} />
    </div>
  );
  return (
    <div style={{
      width: 260, flexShrink: 0, borderRight: `1px solid ${t.border}`,
      background: t.bgPanel, display: "flex", flexDirection: "column",
      alignItems: "center", padding: "18px 14px 14px", gap: 12, overflowY: "auto",
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: t.textMuted, alignSelf: "flex-start" }}>
        Preview · 9:16
      </div>
      
      <div style={{
        width: 200, height: 356, borderRadius: 20,
        border: `2px solid ${t.borderStrong}`, background: "#000",
        overflow: "hidden", position: "relative", flexShrink: 0,
        boxShadow: isDark ? "0 0 40px rgba(124,111,239,0.12), 0 4px 24px rgba(0,0,0,0.6)" : "0 4px 20px rgba(0,0,0,0.15)",
      }}>
        {activeVideo ? (
          <>
            <video
              ref={videoRef}
              key={activeVideo.url}
              src={activeVideo.url}
              onLoadedMetadata={onLoadedMetadata}
              muted={muted}
              onCanPlay={() => {
                if (videoRef.current) {
                  videoRef.current.muted = muted;
                  videoRef.current.volume = volume;
                }
              }}
              style={{ 
                width: "100%", height: "100%", objectFit: "cover", objectPosition: `${(cropX ?? 0.5) * 100}% center`,
                filter: `brightness(${brightness ?? 1}) contrast(${contrast ?? 1})`
              }}
              playsInline
            />
            {vignette > 0 && (
              <div style={{
                position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none",
                background: `radial-gradient(circle, transparent ${100 - vignette * 70}%, rgba(0,0,0,${vignette * 0.9}) 100%)`
              }} />
            )}
          </>
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

      {videos.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {videos.length > 1 && (
            <>
              <button
                onClick={() => switchVideo(Math.max(0, activeVideoIdx - 1))}
                disabled={activeVideoIdx === 0}
                style={{ ...iconBtn(t), opacity: activeVideoIdx === 0 ? 0.3 : 1 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <span style={{ fontSize: 11, color: t.textMuted, minWidth: 40, textAlign: "center" }}>
                {activeVideoIdx + 1} / {videos.length}
              </span>
              <button
                onClick={() => switchVideo(Math.min(videos.length - 1, activeVideoIdx + 1))}
                disabled={activeVideoIdx === videos.length - 1}
                style={{ ...iconBtn(t), opacity: activeVideoIdx === videos.length - 1 ? 0.3 : 1 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </>
          )}
          <button 
            onClick={() => removeVideo(activeVideoIdx)} 
            style={{ ...iconBtn(t), color: t.danger, marginLeft: videos.length > 1 ? 8 : 0 }} 
            title="Remove Video"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      )}

      {activeVideo && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            onClick={() => { if (videoRef.current) { videoRef.current.currentTime = trimStart; setCurrentTime(trimStart); } }}
            style={iconBtn(t)} title="Back to start"
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
          <button onClick={toggleMute} style={iconBtn(t)}>
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

      {activeVideo && (
        <div style={{
          width: "100%", padding: 14, background: t.bgPanel,
          borderRadius: 12, border: `1px solid ${t.border}`, marginTop: 6,
          boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.3)" : "none"
        }}>
          <div style={{ display: "flex", gap: 14, flexDirection: "column" }}>
            <SliderControl label="Brightness" val={brightness} setVal={setBrightness} min={0} max={2} step={0.05} />
            <SliderControl label="Contrast" val={contrast} setVal={setContrast} min={0} max={2} step={0.05} />
            <SliderControl label="Vignette" val={vignette} setVal={setVignette} min={0} max={1} step={0.05} />
          </div>
        </div>
      )}
    </div>
  );
}
