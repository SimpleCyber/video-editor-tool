import React from "react";
import { iconBtn, btn } from "../utils";

export default function TopBar({ isDark, setIsDark, FileInputTrigger, t }) {
  return (
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
        <button onClick={() => setIsDark((d) => !d)} style={iconBtn(t)} title="Toggle theme">
          {isDark
            ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          }
        </button>
        <button onClick={FileInputTrigger} style={btn("primary", t)}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add videos
        </button>
      </div>
    </div>
  );
}
