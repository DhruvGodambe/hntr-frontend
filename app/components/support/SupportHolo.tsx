"use client";

import { useEffect, useRef } from "react";

type Pt = { x: number; y: number; z: number; r: number };

/** V2 support banner: particle headset over a scrolling dot floor, reacting to the cursor (`#spHolo`). */
export default function SupportHolo() {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const cvRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const box = boxRef.current;
    const cv = cvRef.current;
    if (!box || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let raf = 0;

    // Rasterise a headset silhouette once and sample it into particles.
    const S = 320;
    const off = document.createElement("canvas");
    off.width = off.height = S;
    const o = off.getContext("2d");
    const P: Pt[] = [];
    if (o) {
      o.strokeStyle = o.fillStyle = "#fff";
      o.lineCap = "round";
      o.lineWidth = 26;
      o.beginPath();
      o.arc(160, 170, 104, Math.PI * 1.04, Math.PI * 1.96);
      o.stroke();
      const rr = (x: number, y: number, w: number, h: number, r: number) => {
        o.beginPath();
        o.moveTo(x + r, y);
        o.arcTo(x + w, y, x + w, y + h, r);
        o.arcTo(x + w, y + h, x, y + h, r);
        o.arcTo(x, y + h, x, y, r);
        o.arcTo(x, y, x + w, y, r);
        o.fill();
      };
      rr(36, 150, 58, 104, 24);
      rr(226, 150, 58, 104, 24);
      o.lineWidth = 10;
      o.beginPath();
      o.moveTo(70, 250);
      o.quadraticCurveTo(80, 292, 140, 292);
      o.stroke();
      rr(132, 280, 44, 22, 11);
      const d = o.getImageData(0, 0, S, S).data;
      for (let y = 0; y < S; y += 6)
        for (let x = 0; x < S; x += 6) {
          if (d[(y * S + x) * 4 + 3] > 120) {
            const cup = (x < 100 || x > 220) && y > 140 && y < 260;
            P.push({ x: x - 160, y: y - 190, z: cup ? (Math.random() - 0.5) * 30 : (Math.random() - 0.5) * 10, r: Math.random() });
          }
        }
    }
    const F: { x: number; z: number }[] = [];
    for (let gz = 0; gz < 22; gz++) for (let gx = -30; gx <= 30; gx++) F.push({ x: gx * 22, z: gz * 26 });

    let mx = 0.5;
    let my = 0.5;
    let tx = 0.5;
    let ty = 0.5;
    let hover = false;
    const t0 = performance.now();
    let ripples: { x: number; y: number; t: number }[] = [];

    const rs = () => {
      const r = box.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width;
      H = r.height;
      cv.width = W * dpr;
      cv.height = H * dpr;
    };
    const ro = new ResizeObserver(rs);
    ro.observe(box);
    rs();

    const onMove = (e: MouseEvent) => {
      const r = box.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width;
      ty = (e.clientY - r.top) / r.height;
      hover = true;
    };
    const onLeave = () => {
      hover = false;
      tx = 0.5;
      ty = 0.5;
    };
    const onClick = (e: MouseEvent) => {
      const r = box.getBoundingClientRect();
      ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() });
    };
    box.addEventListener("mousemove", onMove);
    box.addEventListener("mouseleave", onLeave);
    box.addEventListener("click", onClick);

    const frame = (now: number) => {
      if (!reduced) raf = requestAnimationFrame(frame);
      if (!box.offsetParent || !W) return;
      const t = (now - t0) / 1000;
      mx += (tx - mx) * 0.06;
      my += (ty - my) * 0.06;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      const cx = W / 2;
      const cy = H * 0.52;
      const sc = Math.min(1, H / 340) * 1.05;
      const ry = (mx - 0.5) * 0.9;
      const rx = (my - 0.5) * -0.5;
      const cY = Math.cos(ry);
      const sY = Math.sin(ry);
      const cX = Math.cos(rx);
      const sX = Math.sin(rx);
      const pcx = mx * W;
      const pcy = my * H;
      const hz = H * 0.62;
      for (const f of F) {
        const zz = f.z + ((t * 18) % 26);
        const wave = Math.sin(f.x * 0.02 + zz * 0.03 - t * 1.6) * 6;
        const pz = 1 / (1 + zz * 0.006);
        const X = cx + (f.x - (mx - 0.5) * 60) * pz * 1.4;
        const Y = hz + (40 + wave) * pz + zz * pz * 0.9;
        if (Y > H || X < 0 || X > W) continue;
        const a = (1 - zz / 600) * 0.35;
        ctx.fillStyle = `rgba(40,170,255,${a.toFixed(3)})`;
        ctx.fillRect(X, Y, 1.4 * pz + 0.4, 1.4 * pz + 0.4);
      }
      for (const p of P) {
        const w = Math.sin(p.y * 0.045 + t * 2.2) * 5 + Math.sin(p.x * 0.05 - t * 1.5) * 3;
        const x = p.x;
        const y = p.y + Math.sin(t * 1.2) * 4;
        const z = p.z + w;
        const x1 = x * cY + z * sY;
        const z1 = -x * sY + z * cY;
        const y1 = y * cX - z1 * sX;
        const z2 = y * sX + z1 * cX;
        const pr = 500 / (500 + z2);
        let X = cx + x1 * pr * sc;
        let Y = cy + y1 * pr * sc;
        const dx = X - pcx;
        const dy = Y - pcy;
        const dd = Math.sqrt(dx * dx + dy * dy);
        let near = 0;
        if (hover && dd < 110) {
          near = 1 - dd / 110;
          const push = near * near * 16;
          X += (dx / (dd || 1)) * push;
          Y += (dy / (dd || 1)) * push;
        }
        for (const rp of ripples) {
          const age = (now - rp.t) / 1000;
          const rd = age * 380;
          const ex = X - rp.x;
          const ey = Y - rp.y;
          const de = Math.sqrt(ex * ex + ey * ey);
          const band = 1 - Math.abs(de - rd) / 30;
          if (band > 0) {
            const amp = band * (1 - age / 1.4) * 10;
            X += (ex / (de || 1)) * amp;
            Y += (ey / (de || 1)) * amp;
            near = Math.max(near, band * 0.8);
          }
        }
        const fl = 0.55 + 0.45 * Math.sin(t * 3 + p.r * 12);
        const a = Math.min(1, 0.5 + fl * 0.4 + near * 0.6);
        const sz = (1.6 + near * 1.4) * pr;
        ctx.fillStyle = `rgba(${Math.round(60 + near * 160)},${Math.round(200 + near * 55)},255,${(a * 0.18).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(X, Y, sz * 3.2, 0, 6.283);
        ctx.fill();
        ctx.fillStyle = `rgba(${Math.round(120 + near * 135)},230,255,${a.toFixed(3)})`;
        ctx.fillRect(X - sz / 2, Y - sz / 2, sz, sz);
      }
      ripples = ripples.filter((r) => now - r.t < 1400);
      ctx.globalCompositeOperation = "source-over";
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      box.removeEventListener("mousemove", onMove);
      box.removeEventListener("mouseleave", onLeave);
      box.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div
      id="spHolo"
      ref={boxRef}
      style={{
        position: "relative",
        height: 198,
        borderRadius: "var(--r)",
        boxShadow: "var(--sh2)",
        overflow: "hidden",
        marginBottom: 18,
        background: "radial-gradient(60% 90% at 50% 45%,rgba(0,170,255,.14),transparent 70%),#03070b",
        border: "1px solid rgba(80,200,255,.14)",
        cursor: "crosshair",
      }}
    >
      <canvas ref={cvRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
