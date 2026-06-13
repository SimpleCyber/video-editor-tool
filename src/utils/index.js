export const formatTime = (s) => {
  if (!s || isNaN(s)) return "0:00.0";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  const ms = Math.floor((s % 1) * 10);
  return `${m}:${sec.toString().padStart(2, "0")}.${ms}`;
};

export const themes = {
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

export const iconBtn = (t) => ({
  width: 32, height: 32, borderRadius: 8,
  border: `1px solid ${t.border}`, background: t.bgInput,
  color: t.textSub, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
});

export const btn = (variant = "default", t, extra = {}) => ({
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "8px 14px", borderRadius: 8,
  border: variant === "outline" ? `1px solid ${t.border}` : "none",
  background: variant === "primary" ? t.accent : variant === "outline" ? "transparent" : t.bgInput,
  color: variant === "primary" ? "#fff" : t.text,
  fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
  ...extra,
});
