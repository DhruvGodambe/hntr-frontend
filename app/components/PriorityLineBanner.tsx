"use client";

import { memo, useEffect, useRef } from "react";

const BANNER_SRC = "/assets/images/priority-line-banner.png";

type Particle = {
  u: number;
  v: number;
  l: number;
  e: number;
  t: 0 | 2 | 3;
  s: 0 | 1;
  r: number;
  q: number;
};

type StreamDot = { o: number; sp: number; dy: number };
type Rgb = [number, number, number];

const HOLO: Rgb[] = [
  [109, 77, 255],
  [58, 109, 255],
  [61, 209, 255],
  [138, 255, 228],
];

function holo(g: number): Rgb {
  const x = Math.max(0, Math.min(1, g)) * 3;
  const i = Math.min(2, x | 0);
  const f = x - i;
  const a = HOLO[i];
  const b = HOLO[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

/** Holographic particle rendering of the gift-box art, drawn on a canvas that fills the hero. */
function startHologram(cv: HTMLCanvasElement, hero: HTMLElement): () => void {
  const ctx = cv.getContext("2d");
  if (!ctx) return () => {};

  const buf = document.createElement("canvas");
  const bx = buf.getContext("2d");
  if (!bx) return () => {};

  const img = new Image();
  const t0 = performance.now();
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const stream: StreamDot[] = [];
  for (let s = 0; s < 26; s += 1) {
    stream.push({ o: Math.random(), sp: 0.08 + Math.random() * 0.07, dy: (Math.random() - 0.5) * 60 });
  }

  let P: Particle[] = [];
  let aspect = 1;
  let W = 0;
  let H = 0;
  let DPR = 1;
  let raf = 0;
  let visible = true;
  let mx = -9999;
  let my = -9999;
  let disposed = false;

  function build() {
    const mob = window.innerWidth < 768;
    const GW = mob ? 200 : 320;
    const cx0 = 0.19;
    const cy0 = 0.19;
    const cw = 0.76;
    const ch = 0.66;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const GH = Math.round((GW * (ch * ih)) / (cw * iw));
    const c = document.createElement("canvas");
    c.width = GW;
    c.height = GH;
    const x = c.getContext("2d");
    if (!x) return;
    x.drawImage(img, cx0 * iw, cy0 * ih, cw * iw, ch * ih, 0, 0, GW, GH);
    const d = x.getImageData(0, 0, GW, GH).data;
    const L = new Float32Array(GW * GH);
    for (let i = 0; i < GW * GH; i += 1) {
      L[i] = (d[i * 4] * 0.299 + d[i * 4 + 1] * 0.587 + d[i * 4 + 2] * 0.114) / 255;
    }
    const next: Particle[] = [];
    for (let j = 1; j < GH - 1; j += 1) {
      for (let k = 1; k < GW - 1; k += 1) {
        const i = j * GW + k;
        const o = i * 4;
        const r = d[o];
        const g = d[o + 1];
        const b = d[o + 2];
        const l = L[i];
        const sat = (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
        if (l > 0.8 && sat < 0.08) continue;
        const shadow = l > 0.55 && sat < 0.08;
        if (shadow && Math.random() > 0.12) continue;
        const e = Math.abs(L[i + 1] - L[i - 1]) + Math.abs(L[i + GW] - L[i - GW]);
        const type = sat > 0.25 && r > g && g > b ? 2 : sat > 0.25 && g > r ? 3 : 0;
        next.push({
          u: k / GW,
          v: j / GH,
          l,
          e: Math.min(1, e * 3),
          t: type,
          s: shadow ? 1 : 0,
          r: Math.random(),
          q: Math.random(),
        });
      }
    }
    P = next;
    aspect = GW / GH;
  }

  function size() {
    const r = hero.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, r.width);
    H = Math.max(1, r.height);
    cv.width = buf.width = Math.round(W * DPR);
    cv.height = buf.height = Math.round(H * DPR);
  }

  function frame(now: number) {
    raf = 0;
    if (disposed || !visible || !P.length || !ctx || !bx) return;
    const t = (now - t0) / 1000;
    const bw = cv.width;
    const bh = cv.height;
    const id = bx.createImageData(bw, bh);
    const D = id.data;
    let boxH = H * 1.55;
    let boxW = boxH * aspect;
    if (boxW > W * 0.82) {
      boxW = W * 0.82;
      boxH = boxW / aspect;
    }
    const ox = W - boxW - W * 0.01;
    const oy = (H - boxH) / 2 + H * 0.04;
    const scan = ((t * 0.22) % 1.4) - 0.2;
    const glRow = Math.sin(t * 1.7) > 0.97 ? (t * 31) % 1 : -1;
    const pxs = DPR > 1.4 ? 2 : 1;

    for (let n = 0; n < P.length; n += 1) {
      const p = P[n];
      let x = ox + p.u * boxW;
      let y = oy + p.v * boxH;
      const w = Math.sin(p.u * 9 + t * 1.1) * Math.cos(p.v * 7 - t * 0.8);
      y += w * 1.2;
      x += Math.sin(t * 0.6 + p.v * 5) * 0.6;
      if (glRow >= 0 && Math.abs(p.v - glRow) < 0.03) x += (p.r - 0.5) * 26;
      const dx = x - mx;
      const dy = y - my;
      const dd = dx * dx + dy * dy;
      let inf = 0;
      if (dd < 9000) {
        const dl = Math.sqrt(dd) + 0.01;
        inf = 1 - dl / 95;
        x += (dx / dl) * inf * 14;
        y += (dy / dl) * inf * 14;
      }
      const sc = Math.exp(-Math.pow((p.v - scan) * 10, 2));
      const fl = 0.78 + 0.22 * Math.sin(t * 2.3 + p.q * 60);
      let c: Rgb;
      let a: number;
      if (p.t === 2) {
        c = [255, 196, 92];
        a = 0.75;
      } else if (p.t === 3) {
        c = [120, 255, 150];
        a = 0.95;
      } else {
        c = holo(1 - p.v * 0.9 + p.u * 0.15);
        a = p.s ? 0.14 : 0.22 + p.e * 1.1 + (p.l > 0.6 ? 0.6 : 0);
      }
      a *= fl * (1 + sc * 1.2 + inf * 1.4);
      const X = (x * DPR) | 0;
      const Y = (y * DPR) | 0;
      if (X < 0 || Y < 0 || X >= bw - pxs || Y >= bh - pxs) continue;
      for (let yy = 0; yy < pxs; yy += 1) {
        for (let xx = 0; xx < pxs; xx += 1) {
          const o = ((Y + yy) * bw + X + xx) * 4;
          D[o] += c[0] * a;
          D[o + 1] += c[1] * a;
          D[o + 2] += c[2] * a;
          D[o + 3] = 255;
        }
      }
    }

    bx.putImageData(id, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#07080d";
    ctx.fillRect(0, 0, bw, bh);
    ctx.globalCompositeOperation = "lighter";
    ctx.filter = `blur(${2.5 * DPR}px)`;
    ctx.globalAlpha = 0.4;
    ctx.drawImage(buf, 0, 0);
    ctx.filter = "none";
    ctx.globalAlpha = 1;
    ctx.drawImage(buf, 0, 0);

    // queue stream: spots flowing into the box
    const ly = oy + boxH * 0.62;
    const lx0 = W * 0.3;
    const lx1 = ox + boxW * 0.42;
    for (let s = 0; s < stream.length; s += 1) {
      const q = stream[s];
      const ph = (q.o + t * q.sp) % 1;
      const x = lx0 + (lx1 - lx0) * ph;
      const y = ly + q.dy * (1 - ph) + Math.sin(t * 2 + q.o * 9) * 1.5;
      const al = Math.sin(ph * Math.PI) * 0.9;
      ctx.fillStyle = `rgba(138,255,228,${al.toFixed(3)})`;
      ctx.fillRect(x * DPR, y * DPR, 2 * DPR, 2 * DPR);
      ctx.fillStyle = `rgba(61,209,255,${(al * 0.25).toFixed(3)})`;
      ctx.fillRect((x - 10) * DPR, y * DPR, 10 * DPR, 1 * DPR);
    }

    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = "#000";
    for (let sy = 0; sy < bh; sy += 3 * DPR) ctx.fillRect(0, sy, bw, DPR);
    ctx.globalAlpha = 1;

    if (!reduce) raf = requestAnimationFrame(frame);
  }

  function kick() {
    if (!raf && visible && !disposed) raf = requestAnimationFrame(frame);
  }

  const onMove = (e: PointerEvent) => {
    const r = cv.getBoundingClientRect();
    mx = e.clientX - r.left;
    my = e.clientY - r.top;
  };
  const onLeave = () => {
    mx = my = -9999;
  };
  hero.addEventListener("pointermove", onMove);
  hero.addEventListener("pointerleave", onLeave);

  const ro = new ResizeObserver(() => {
    size();
    kick();
  });
  ro.observe(hero);

  let io: IntersectionObserver | null = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting && entries[0].intersectionRatio > 0;
      kick();
    });
    io.observe(hero);
  }

  img.onload = () => {
    if (disposed) return;
    build();
    size();
    kick();
  };
  img.src = BANNER_SRC;

  return () => {
    disposed = true;
    if (raf) cancelAnimationFrame(raf);
    ro.disconnect();
    io?.disconnect();
    hero.removeEventListener("pointermove", onMove);
    hero.removeEventListener("pointerleave", onLeave);
  };
}

function PriorityLineBanner() {
  const heroRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const cv = canvasRef.current;
    if (!hero || !cv) return undefined;
    return startHologram(cv, hero);
  }, []);

  return (
    <div className="hero pl-hero" ref={heroRef} style={{ marginBottom: 18 }}>
      <canvas id="plBannerCv" ref={canvasRef} aria-hidden="true" />
      <div className="pl-banner-shade" />
      <div className="hero-content">
        <div className="hero-title">PRIORITY LINE</div>
        <div className="hero-sub">Book your spot in the first NFT · strategies not live yet</div>
      </div>
    </div>
  );
}

export default memo(PriorityLineBanner);
