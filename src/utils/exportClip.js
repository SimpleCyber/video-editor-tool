export const exportClip = async (clip, setDownloading, showToast) => {
  setDownloading(clip.id);
  showToast("Preparing download…", "info");
  try {
    const vid = document.createElement("video");
    vid.src = clip.videoUrl;
    vid.muted = clip.muted;
    vid.crossOrigin = "anonymous";
    await new Promise((res, rej) => { vid.onloadedmetadata = res; vid.onerror = rej; });

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    const stream = canvas.captureStream(30);

    let audioCtx = null;
    if (!clip.muted) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const src = audioCtx.createMediaElementSource(vid);
        const dest = audioCtx.createMediaStreamDestination();
        src.connect(dest);
        src.connect(audioCtx.destination);
        dest.stream.getAudioTracks().forEach((tr) => stream.addTrack(tr));
      } catch {}
    }

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus" : "video/webm";
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 });
    const chunks = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

    recorder.start(100);
    vid.currentTime = clip.start;
    await new Promise((r) => { vid.onseeked = r; });
    vid.play();

    const cX = clip.cropX ?? 0.5;
    const drawLoop = () => {
      if (vid.currentTime >= clip.end || vid.paused || vid.ended) {
        vid.pause(); recorder.stop(); return;
      }
      const vw = vid.videoWidth, vh = vid.videoHeight;
      const cropH = vh;
      const cropW = vh * (9 / 16);
      const maxSx = vw - cropW;
      const sx = cX * maxSx;
      
      const b = clip.brightness ?? 1;
      const c = clip.contrast ?? 1;
      const vig = clip.vignette ?? 0;
      
      ctx.filter = `brightness(${b}) contrast(${c})`;
      ctx.drawImage(vid, sx, 0, cropW, cropH, 0, 0, 1080, 1920);
      
      if (vig > 0) {
        ctx.filter = "none";
        const R = Math.hypot(540, 960);
        const grad = ctx.createRadialGradient(540, 960, Math.max(0, R * (1 - vig * 0.7)), 540, 960, R);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, `rgba(0,0,0,${vig * 0.9})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1080, 1920);
      }
      requestAnimationFrame(drawLoop);
    };
    requestAnimationFrame(drawLoop);

    await new Promise((res) => { recorder.onstop = res; });
    if (audioCtx) await audioCtx.close();

    const blob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${clip.label.replace(/\s+/g, "_")}.webm`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`${clip.label} downloaded!`);
  } catch (err) {
    console.error(err);
    showToast("Download failed — try a shorter clip", "error");
  } finally {
    setDownloading(null);
  }
};
