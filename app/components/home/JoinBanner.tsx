"use client";

import { useEffect, useRef } from "react";

type Props = {
  /** Wallet connected + signed up, but no membership yet (V2 `su-pending`). */
  pending: boolean;
  onJoin: () => void;
  onBuyMembership: () => void;
};

type Pt = { x: number; y: number; z: number; r: number };

/**
 * V2 "Become a member" banner (`#mJoin`): a 3D particle HNTR mark that follows
 * the pointer and ripples on click. Hidden by CSS for members; switches to the
 * orange "You're in. The seat is not." variant for signed-up non-members.
 */
export default function JoinBanner({ pending, onJoin, onBuyMembership }: Props) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const cvRef = useRef<HTMLCanvasElement | null>(null);
  const pendingRef = useRef(pending);
  pendingRef.current = pending;

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
    let P: Pt[] = [];
    let ripples: { x: number; y: number; t: number }[] = [];
    const t0 = performance.now();
    let raf = 0;

    const im = new Image();
    im.onload = () => {
      const NP: Pt[] = [];
      const S = 220;
      const ar = im.naturalHeight / im.naturalWidth;
      let w = S;
      let hh = Math.round(S * ar);
      if (hh > S) {
        hh = S;
        w = Math.round(S / ar);
      }
      const o = document.createElement("canvas");
      o.width = w;
      o.height = hh;
      const oc = o.getContext("2d");
      if (!oc) return;
      oc.drawImage(im, 0, 0, w, hh);
      const d = oc.getImageData(0, 0, w, hh).data;
      for (let y = 0; y < hh; y += 7)
        for (let x = 0; x < w; x += 7) {
          const q = (y * w + x) * 4;
          if (d[q + 3] > 110) NP.push({ x: x - w / 2, y: y - hh / 2, z: (Math.random() - 0.5) * 14, r: Math.random() });
        }
      while (NP.length > 900) NP.splice(Math.floor(Math.random() * NP.length), 1);
      P = NP;
    };
    im.src = "/assets/v2/hntr-logos/hntr-mark-white.png";

    const stars = Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random(), s: Math.random() * 1.2 + 0.3, p: Math.random() * 6 }));
    const rs = () => {
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      W = box.offsetWidth;
      H = box.offsetHeight;
      cv.width = Math.max(1, W * dpr);
      cv.height = Math.max(1, H * dpr);
    };
    const ro = new ResizeObserver(rs);
    ro.observe(box);
    rs();

    let mx = 0.5;
    let my = 0.5;
    let tx = 0.5;
    let ty = 0.5;
    let hx = -1;
    let hy = -1;
    let hover = false;
    const glow = document.createElement("canvas");
    glow.width = glow.height = 32;
    const gctx = glow.getContext("2d");
    if (gctx) {
      const gr = gctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gr.addColorStop(0, "rgba(150,210,255,.5)");
      gr.addColorStop(1, "rgba(150,210,255,0)");
      gctx.fillStyle = gr;
      gctx.fillRect(0, 0, 32, 32);
    }

    const onMove = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      const k = box.offsetWidth / r.width;
      hx = (e.clientX - r.left) * k;
      hy = (e.clientY - r.top) * k;
      tx = (e.clientX - r.left) / r.width;
      ty = (e.clientY - r.top) / r.height;
      hover = true;
    };
    const onLeave = () => {
      hover = false;
      tx = 0.5;
      ty = 0.5;
    };
    const onDown = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      const k = box.offsetWidth / r.width;
      ripples.push({ x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k, t: performance.now() });
    };
    box.addEventListener("pointermove", onMove);
    box.addEventListener("pointerleave", onLeave);
    box.addEventListener("pointerdown", onDown);

    const frame = (now: number) => {
      if (!reduced) raf = requestAnimationFrame(frame);
      if (W < 40 || document.hidden || !box.offsetParent) return;
      const pend = pendingRef.current;
      const t = (now - t0) / 1000;
      if (!hover) {
        tx = 0.5 + Math.sin(t * 0.5) * 0.18;
        ty = 0.5 + Math.cos(t * 0.4) * 0.12;
      }
      mx += (tx - mx) * 0.06;
      my += (ty - my) * 0.06;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        const a = 0.25 + 0.25 * Math.sin(t * 1.3 + s.p);
        ctx.fillStyle = (pend ? "rgba(255,200,170," : "rgba(200,225,255,") + a.toFixed(3) + ")";
        ctx.fillRect(s.x * W, s.y * H, s.s, s.s);
      }
      ctx.globalCompositeOperation = "lighter";
      const cx = W * 0.76;
      const cy = H * 0.5;
      const sc = Math.min(W * 0.5, H) / 300;
      const ry = (mx - 0.5) * 1.0;
      const rx = (my - 0.5) * -0.7;
      const cY = Math.cos(ry);
      const sY = Math.sin(ry);
      const cX = Math.cos(rx);
      const sX = Math.sin(rx);
      for (const p of P) {
        const w = Math.sin(Math.sqrt(p.x * p.x + p.y * p.y) * 0.06 - t * 2.4) * 7;
        const x = p.x;
        const y = p.y + Math.sin(t * 1.1) * 3;
        const z = p.z + w;
        const x1 = x * cY + z * sY;
        const z1 = -x * sY + z * cY;
        const y1 = y * cX - z1 * sX;
        const z2 = y * sX + z1 * cX;
        const pr = 520 / (520 + z2);
        let X = cx + x1 * pr * sc;
        let Y = cy + y1 * pr * sc;
        let near = 0;
        if (hover) {
          const dx = X - hx;
          const dy = Y - hy;
          const dd = Math.sqrt(dx * dx + dy * dy);
          if (dd < 90) {
            near = 1 - dd / 90;
            const pu = near * near * 16;
            X += (dx / (dd || 1)) * pu;
            Y += (dy / (dd || 1)) * pu;
          }
        }
        for (const rp of ripples) {
          const age = (now - rp.t) / 1000;
          const rd = age * 320;
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
        const al = Math.min(1, 0.45 + fl * 0.4 + near * 0.6);
        const sz = (1.5 + near * 1.3) * pr;
        if (near > 0.05) {
          ctx.globalAlpha = near;
          const gs = sz * 8;
          ctx.drawImage(glow, X - gs / 2, Y - gs / 2, gs, gs);
          ctx.globalAlpha = 1;
        }
        ctx.fillStyle = pend
          ? `rgba(255,${Math.round(130 + near * 80)},${Math.round(80 + near * 60)},${al.toFixed(3)})`
          : `rgba(${Math.round(190 + near * 65)},235,255,${al.toFixed(3)})`;
        ctx.fillRect(X - sz / 2, Y - sz / 2, sz, sz);
      }
      ripples = ripples.filter((r) => now - r.t < 1400);
      ctx.globalCompositeOperation = "source-over";
    };
    raf = requestAnimationFrame(frame);
    // Reduced motion: draw once the logo points are loaded.
    const still = reduced ? window.setTimeout(() => requestAnimationFrame(frame), 600) : 0;

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(still);
      ro.disconnect();
      box.removeEventListener("pointermove", onMove);
      box.removeEventListener("pointerleave", onLeave);
      box.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <div id="mJoin" ref={boxRef}>
      <canvas ref={cvRef} />
      <div className="mj-t">
        <div className="mj-h">{pending ? "You're in. The seat is not." : "Become a member"}</div>
        <div className="mj-s">
          {pending ? "Buy your membership to unlock the full HNTR Strategy." : "Buy your membership. Join every strategy, with no limit."}
        </div>
        <button className="mj-b" type="button" onClick={pending ? onBuyMembership : onJoin}>
          {pending ? "BUY MEMBERSHIP" : "JOIN NOW"}
        </button>
      </div>
    </div>
  );
}
