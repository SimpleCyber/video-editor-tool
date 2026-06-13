import React from "react";

export default function VideoTabs({ videos, activeVideoIdx, switchVideo, removeVideo, t }) {
  if (videos.length <= 1) return null;

  return (
    <div style={{
      display: "flex", gap: 4, padding: "6px 16px",
      background: t.bgPanel, borderBottom: `1px solid ${t.border}`,
      overflowX: "auto", flexShrink: 0,
    }}>
      {videos.map((v, i) => (
        <div key={v.id || i} style={{
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
  );
}
