"use client";

import { useEffect, useRef } from "react";

/**
 * The real escalator of Park Pobedy (founder's video, 21/09), replayed frame
 * by frame with scroll. Frames are fetched only when the scene is near.
 */
export function EscalatorSequence({
  pattern,
  count,
  width,
  height,
  progress,
  load,
  className = "",
}: {
  pattern: string;
  count: number;
  width: number;
  height: number;
  /** 0–1 */
  progress: number;
  load: boolean;
  className?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const frames = useRef<HTMLImageElement[]>([]);
  const last = useRef(-1);

  useEffect(() => {
    if (!load || frames.current.length) return;
    frames.current = Array.from({ length: count }, (_, i) => {
      const img = new Image();
      img.decoding = "async";
      img.src = pattern.replace("{i}", String(i + 1).padStart(3, "0"));
      return img;
    });
  }, [load, pattern, count]);

  useEffect(() => {
    const c = canvas.current;
    if (!c || !frames.current.length) return;
    const i = Math.min(count - 1, Math.max(0, Math.round(progress * (count - 1))));
    const draw = () => {
      const img = frames.current[i];
      if (!img?.complete || !img.naturalWidth) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      // The vertical video in full, centred, over a blurred copy filling the screen.
      const cw = c.width, ch = c.height;
      const cover = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const contain = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
      ctx.filter = "blur(28px) brightness(0.45)";
      ctx.drawImage(img, (cw - img.naturalWidth * cover) / 2, (ch - img.naturalHeight * cover) / 2, img.naturalWidth * cover, img.naturalHeight * cover);
      ctx.filter = "none";
      const w = img.naturalWidth * contain, h = img.naturalHeight * contain;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      last.current = i;
    };
    if (i !== last.current) {
      const img = frames.current[i];
      if (img && !img.complete) img.onload = draw;
      else draw();
    }
  }, [progress, count]);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const fit = () => {
      const dpr = Math.min(2, window.devicePixelRatio);
      c.width = Math.round(c.clientWidth * dpr);
      c.height = Math.round(c.clientHeight * dpr);
      last.current = -1;
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return <canvas ref={canvas} width={width} height={height} className={className} aria-hidden="true" />;
}
