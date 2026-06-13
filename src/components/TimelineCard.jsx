import React from "react";
import { formatTime } from "../utils";

export default function TimelineCard({
  t, isDark, timelineRef, onTimelineMouseDown, pct,
  trimStart, trimEnd, currentTime, duration, muted
}) {
  return (
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
        <div style={{
          position: "absolute", top: 0, bottom: 0, left: 0, width: `${pct(trimStart)}%`,
          background: isDark ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.65)",
          borderRadius: "8px 0 0 8px", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: 0, bottom: 0, right: 0, width: `${100 - pct(trimEnd)}%`,
          background: isDark ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.65)",
          borderRadius: "0 8px 8px 0", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: 0, bottom: 0,
          left: `${pct(trimStart)}%`, width: `${pct(trimEnd) - pct(trimStart)}%`,
          border: `2px solid ${t.accent}`, borderRadius: 4, pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: 0, bottom: 0, width: 10,
          left: `calc(${pct(trimStart)}% - 5px)`,
          background: t.accent, borderRadius: "6px 0 0 6px",
          cursor: "ew-resize", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ width: 2, height: 16, background: "rgba(255,255,255,0.55)", borderRadius: 2 }} />
        </div>
        <div style={{
          position: "absolute", top: 0, bottom: 0, width: 10,
          left: `calc(${pct(trimEnd)}% - 5px)`,
          background: t.accent, borderRadius: "0 6px 6px 0",
          cursor: "ew-resize", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ width: 2, height: 16, background: "rgba(255,255,255,0.55)", borderRadius: 2 }} />
        </div>
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
  );
}
