"use client";

import { useEffect, useRef } from "react";

const C = "110,80,255";

type Node = { x: number; y: number; vx: number; vy: number; r: number; hub: boolean; ph: number };

/** Animated network "hologram" behind the sidebar's "Become a member" card (ported from V2). */
export default function SidebarHolo() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0;
    let H = 0;
    let N: Node[] = [];
    let raf = 0;
    let logo: HTMLCanvasElement | null = null;

    const img = new Image();
    img.src = "/assets/v2/hntr-logos/hntr-mark-white.png";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = 96;
      c.height = Math.round((96 * img.height) / img.width);
      const x = c.getContext("2d");
      if (!x) return;
      x.drawImage(img, 0, 0, c.width, c.height);
      x.globalCompositeOperation = "source-in";
      x.fillStyle = `rgb(${C})`;
      x.fillRect(0, 0, c.width, c.height);
      logo = c;
    };

    const init = () => {
      const r = cv.getBoundingClientRect();
      if (!r.width) return false;
      W = r.width;
      H = r.height;
      cv.width = W * dpr;
      cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      N = [];
      const n = Math.round((W * H) / 1400);
      for (let k = 0; k < n; k++) {
        const hub = Math.random() < 0.22;
        N.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: hub ? 7 : 1.1,
          hub,
          ph: Math.random() * 6.28,
        });
      }
      return true;
    };

    const draw = (tm: number) => {
      if (!W && !init()) {
        raf = requestAnimationFrame(draw);
        return;
      }
      ctx.clearRect(0, 0, W, H);
      const s = tm / 1000;
      if (!reduced) {
        for (const p of N) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
        }
      }
      for (let a = 0; a < N.length; a++) {
        for (let b = a + 1; b < N.length; b++) {
          const p = N[a];
          const q = N[b];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d >= 62) continue;
          const al = (1 - d / 62) * 0.45;
          ctx.strokeStyle = `rgba(${C},${al})`;
          ctx.lineWidth = 0.6;
          if ((a + b) % 3 === 0) {
            ctx.setLineDash([1.5, 3]);
            ctx.lineDashOffset = -s * 8;
          } else ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
          if ((a * 7 + b) % 5 === 0) {
            const f = (s * 0.35 + (a + b) * 0.13) % 1;
            ctx.setLineDash([]);
            ctx.fillStyle = `rgba(${C},${al * 2})`;
            ctx.beginPath();
            ctx.arc(p.x + (q.x - p.x) * f, p.y + (q.y - p.y) * f, 0.9, 0, 6.28);
            ctx.fill();
          }
        }
      }
      ctx.setLineDash([]);
      for (const p of N) {
        const pu = 0.6 + 0.4 * Math.sin(s * 1.6 + p.ph);
        if (p.hub && logo) {
          const w = p.r * 2;
          const hh = (w * logo.height) / logo.width;
          ctx.globalAlpha = 0.55 + 0.4 * pu;
          ctx.shadowColor = `rgba(${C},.9)`;
          ctx.shadowBlur = 8;
          ctx.drawImage(logo, p.x - w / 2, p.y - hh / 2, w, hh);
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
          continue;
        }
        if (p.hub) continue;
        ctx.fillStyle = `rgba(${C},${0.6 * pu})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.28);
        ctx.fill();
      }
      const sy = ((s * 22) % (H + 40)) - 20;
      const g = ctx.createLinearGradient(0, sy - 14, 0, sy + 14);
      g.addColorStop(0, `rgba(${C},0)`);
      g.addColorStop(0.5, `rgba(${C},.10)`);
      g.addColorStop(1, `rgba(${C},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, sy - 14, W, 28);
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(() => {
      W = 0;
      if (reduced) raf = requestAnimationFrame(draw);
    });
    ro.observe(cv);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="sb-holo" aria-hidden="true" />;
}
