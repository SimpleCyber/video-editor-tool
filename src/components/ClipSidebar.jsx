import React from "react";
import { formatTime, btn } from "../utils";

export default function ClipSidebar({
  t, isDark, clips, activeClip, previewClip, deleteClip, downloadClip, downloading
}) {
  return (
    <div style={{
      width: 250, flexShrink: 0, borderLeft: `1px solid ${t.border}`,
      background: t.bgPanel, display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>
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
                  ...btn("outline", t),
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

      {clips.length > 0 && (
        <div style={{ padding: "10px 14px", borderTop: `1px solid ${t.border}`, flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: t.textMuted }}>
            {clips.length} clip{clips.length > 1 ? "s" : ""} · {formatTime(clips.reduce((a, c) => a + c.duration, 0))} total
          </div>
        </div>
      )}
    </div>
  );
}
