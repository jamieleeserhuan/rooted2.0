/**
 * AsciiField.tsx
 * --------------
 * A quiet, static version of the website's ASCII background: sage arrows
 * flowing toward the right, resting on a soil layer of D / K / T / V.
 * Drawn once (and again on resize), so it costs nothing on older phones.
 * Purely decorative: hidden from screen readers.
 */
import { useEffect, useRef } from 'react';

export default function AsciiField({ rtl = false }: { rtl?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const host = cv?.parentElement;
    if (!cv || !host) return;

    const draw = () => {
      const W = host.offsetWidth, H = host.offsetHeight;
      if (!W || !H) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      const ctx = cv.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const fs = W < 640 ? 12 : 13;
      ctx.font = `500 ${fs}px "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const cw = ctx.measureText('D').width || fs * 0.6;
      const ch = Math.round(fs * 1.25);
      const cols = Math.ceil(W / cw), rows = Math.ceil(H / ch);
      const tx = rtl ? W * 0.2 : W * 0.8, ty = H * 0.42;
      const ARROWS = ['→', '↓', '←', '↑'];
      const EDGE = 'KTV';

      for (let r = 0; r < rows; r++) {
        const y = (r + 0.5) * ch;
        for (let c = 0; c < cols; c++) {
          const x = (c + 0.5) * cw;
          const soil = H * 0.84 + 18 * Math.sin(x / 130) + 10 * Math.sin(x / 47 + 1.3);
          if (y > soil) {
            ctx.fillStyle = 'rgb(239, 230, 210)';
            ctx.globalAlpha = W < 640 ? 0.12 : 0.2;
            const edge = y - soil < ch;
            ctx.fillText(edge ? EDGE[(c * 7 + r * 3) % 3] : 'D', x, y);
          } else {
            const a = Math.atan2(ty - y, tx - x) + 0.6 * Math.sin(x * 0.01 + y * 0.005);
            const q = ((Math.round(a / (Math.PI / 2)) % 4) + 4) % 4;
            ctx.fillStyle = 'rgb(143, 166, 142)';
            ctx.globalAlpha = W < 640 ? 0.14 : 0.24;
            ctx.fillText(ARROWS[q], x, y);
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    draw();
    document.fonts?.ready.then(draw).catch(() => {});
    const ro = new ResizeObserver(() => draw());
    ro.observe(host);
    return () => ro.disconnect();
  }, [rtl]);

  // Fade the field out behind the text so the headline stays easy to read.
  const mask = `linear-gradient(${rtl ? 270 : 90}deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 45%, #000 75%)`;

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ WebkitMaskImage: mask, maskImage: mask }}
    />
  );
}
