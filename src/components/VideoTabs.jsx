import React from "react";

export default function VideoTabs({ videos, activeVideoIdx, switchVideo, removeVideo, t, clips = [] }) {
  if (videos.length === 0) return null;

  return (
    <div style={{
      display: "flex", gap: 4, padding: "6px 16px",
      background: t.bgPanel, borderBottom: `1px solid ${t.border}`,
      overflowX: "auto", flexShrink: 0,
    }}>
      {videos.map((v, i) => {
        const count = clips.filter(c => c.videoUrl === v.url).length;
        const isActive = i === activeVideoIdx;
        return (
          <div key={v.id || i} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 8px", borderRadius: 7, cursor: "pointer", flexShrink: 0,
            background: isActive ? t.accentMuted : "transparent",
            border: `1px solid ${isActive ? t.accent : t.border}`,
            color: isActive ? t.accent : t.textSub,
            fontSize: 11, fontWeight: 500,
          }} onClick={() => switchVideo(i)}>
            {count > 0 ? (
              <span style={{
                background: "#2ecc71", color: "#fff",
                padding: "2px 6px", borderRadius: 4, fontSize: 9, fontWeight: 700,
                lineHeight: 1
              }}>
                {count}
              </span>
            ) : (
              <span style={{
                background: t.borderStrong, color: t.textMuted,
                padding: "2px 6px", borderRadius: 4, fontSize: 9, fontWeight: 700,
                lineHeight: 1
              }}>
                0
              </span>
            )}
            {v.name.length > 18 ? v.name.slice(0, 16) + "…" : v.name}
            <span onClick={(e) => { e.stopPropagation(); removeVideo(i); }}
              style={{ color: t.textMuted, marginLeft: 2, fontSize: 14, lineHeight: 1 }}>×</span>
          </div>
        );
      })}
    </div>
  );
}
