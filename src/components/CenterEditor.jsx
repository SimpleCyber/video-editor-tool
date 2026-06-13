import React from 'react';
import FramingBox from './FramingBox';
import TimelineCard from './TimelineCard';
import { btn } from '../utils';

export default function CenterEditor({
  activeVideo, duration, cropX, setCropX, isDark, t,
  timelineRef, onTimelineMouseDown, pct, trimStart, trimEnd,
  currentTime, muted, formatTime, saveClip, setTrimStart, setTrimEnd, fileInputRef
}) {
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      padding: 20, gap: 14, overflowY: "auto", background: t.bg, minWidth: 0,
    }}>
      {activeVideo && duration > 0 ? (
        <>
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

          <TimelineCard 
            t={t} isDark={isDark} timelineRef={timelineRef} onTimelineMouseDown={onTimelineMouseDown} 
            pct={pct} trimStart={trimStart} trimEnd={trimEnd} currentTime={currentTime} 
            duration={duration} muted={muted} formatTime={formatTime}
          />

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={saveClip} style={btn("primary", t)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
              Save clip
            </button>
            <button onClick={() => { setTrimStart(0); setTrimEnd(duration); setCropX(0.5); }} style={btn("outline", t)}>
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
          <button onClick={() => fileInputRef.current.click()} style={btn("primary", t)}>Upload video</button>
        </div>
      )}
    </div>
  );
}
