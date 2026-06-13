import React, { useState, useEffect, useCallback } from "react";

export default function FramingBox({ videoSrc, cropX, setCropX, isDark, t }) {
  const [dragging, setDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartCrop, setDragStartCrop] = useState(0);
  const [vidAR, setVidAR] = useState(16 / 9);

  const containerH = 320;
  const containerW = containerH * vidAR; 
  const cropWDisplay = containerH * (9 / 16); 

  const maxCropX = Math.max(0, containerW - cropWDisplay);

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

      <div style={{
        width: "100%", overflowX: "auto", overflowY: "hidden",
        borderRadius: 10, border: `1px solid ${t.border}`,
        background: "transparent",
        cursor: dragging ? "grabbing" : "default",
      }}>
        <div style={{ position: "relative", height: containerH, width: Math.max(containerW, cropWDisplay), margin: "0 auto" }}>
          {videoSrc ? (
            <video
              src={videoSrc}
              style={{ width: "100%", height: containerH, objectFit: "contain", display: "block", pointerEvents: "none" }}
              muted
              onLoadedMetadata={(e) => {
                const ar = e.target.videoWidth / e.target.videoHeight;
                setVidAR(ar || 16 / 9);
              }}
            />
          ) : (
            <div style={{ width: "100%", height: containerH, background: "#222" }} />
          )}

          <div style={{
            position: "absolute", top: 0, left: 0, width: boxLeft, height: containerH,
            background: "rgba(0,0,0,0.6)", pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", top: 0, left: boxLeft + cropWDisplay, right: 0, height: containerH,
            background: "rgba(0,0,0,0.6)", pointerEvents: "none",
          }} />

          <div
            onMouseDown={handleMouseDown}
            style={{
              position: "absolute", top: 0, left: boxLeft,
              width: cropWDisplay, height: containerH,
              border: `2px solid ${t.accent}`,
              cursor: dragging ? "grabbing" : "grab",
              boxSizing: "border-box", borderRadius: 4,
            }}
          >
            {[["0%","0%"],["100%","0%"],["0%","100%"],["100%","100%"]].map(([l,tp], i) => (
              <div key={i} style={{
                position: "absolute", left: l, top: tp, width: 10, height: 10,
                border: `2px solid ${t.accent}`, background: t.bgPanel,
                transform: "translate(-50%,-50%)", borderRadius: 2, pointerEvents: "none",
              }} />
            ))}
            <div style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
              background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
              borderRadius: 6, padding: "4px 10px", fontSize: 10, color: "#fff", fontWeight: 600,
              letterSpacing: "0.04em", whiteSpace: "nowrap", pointerEvents: "none",
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
