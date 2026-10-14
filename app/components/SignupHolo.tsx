"use client";

import { useEffect, useRef } from "react";

type Pt = { x: number; y: number; z: number; r: number };

/**
 * V2 sign-up modal left panel (`#suLeft`): a 3D particle HNTR mark over a star
 * field that tilts toward the cursor and ripples on click. Only animates while
 * the sign-up overlay is open and not in its wide (tier picker) layout.
 */
export default function SignupHolo() {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const cvRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const box = boxRef.current;
    const cv = cvRef.current;
    if (!box || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let P: Pt[] = [];
    let mx = 0.5;
    let my = 0.5;
    let tx = 0.5;
    let ty = 0.5;
    let hover = false;
    let ripples: { x: number; y: number; t: number }[] = [];
    const t0 = performance.now();
    let raf = 0;

    const im = new Image();
    im.onload = () => {
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
      const pts: Pt[] = [];
      for (let y = 0; y < hh; y += 7)
        for (let x = 0; x < w; x += 7) {
          if (d[(y * w + x) * 4 + 3] > 110) pts.push({ x: x - w / 2, y: y - hh / 2, z: (Math.random() - 0.5) * 14, r: Math.random() });
        }
      while (pts.length > 900) pts.splice(Math.floor(Math.random() * pts.length), 1);
      P = pts;
    };
    im.src = "/assets/v2/hntr-logos/hntr-mark-white.png";

    const glow = document.createElement("canvas");
    glow.width = glow.height = 32;
    const g = glow.getContext("2d");
    if (g) {
      const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
      gr.addColorStop(0, "rgba(150,210,255,.5)");
      gr.addColorStop(1, "rgba(150,210,255,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, 32, 32);
    }
    const stars = Array.from({ length: 140 }, () => ({ x: Math.random(), y: Math.random(), s: Math.random() * 1.2 + 0.3, p: Math.random() * 6 }));

    const rs = () => {
      const r = box.getBoundingClientRect();
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      W = r.width;
      H = r.height;
      cv.width = Math.max(1, W * dpr);
      cv.height = Math.max(1, H * dpr);
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
      raf = requestAnimationFrame(frame);
      const ov = document.getElementById("signupOverlay");
      if (!ov || !ov.classList.contains("open") || W < 40) return;
      if (document.getElementById("suModal")?.classList.contains("wide")) return;
      const t = (now - t0) / 1000;
      mx += (tx - mx) * 0.06;
      my += (ty - my) * 0.06;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        const a = 0.25 + 0.25 * Math.sin(t * 1.3 + s.p);
        ctx.fillStyle = `rgba(200,225,255,${a.toFixed(3)})`;
        ctx.fillRect(s.x * W + (mx - 0.5) * -12 * s.s, s.y * H + (my - 0.5) * -12 * s.s, s.s, s.s);
      }
      ctx.globalCompositeOperation = "lighter";
      const cx = W / 2;
      const cy = H * 0.47;
      const sc = Math.min(W, H) / 320;
      const ry = (mx - 0.5) * 1.0;
      const rx = (my - 0.5) * -0.7;
      const cY = Math.cos(ry);
      const sY = Math.sin(ry);
      const cX = Math.cos(rx);
      const sX = Math.sin(rx);
      const pcx = mx * W;
      const pcy = my * H;
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
        const dx = X - pcx;
        const dy = Y - pcy;
        const dd = Math.sqrt(dx * dx + dy * dy);
        let near = 0;
        if (hover && dd < 120) {
          near = 1 - dd / 120;
          const pu = near * near * 18;
          X += (dx / (dd || 1)) * pu;
          Y += (dy / (dd || 1)) * pu;
        }
        for (const rp of ripples) {
          const age = (now - rp.t) / 1000;
          const rd = age * 420;
          const ex = X - rp.x;
          const ey = Y - rp.y;
          const de = Math.sqrt(ex * ex + ey * ey);
          const band = 1 - Math.abs(de - rd) / 34;
          if (band > 0) {
            const amp = band * (1 - age / 1.4) * 12;
            X += (ex / (de || 1)) * amp;
            Y += (ey / (de || 1)) * amp;
            near = Math.max(near, band * 0.8);
          }
        }
        const fl = 0.55 + 0.45 * Math.sin(t * 3 + p.r * 12);
        const a = Math.min(1, 0.45 + fl * 0.4 + near * 0.6);
        const sz = (1.7 + near * 1.5) * pr;
        if (near > 0.05) {
          ctx.globalAlpha = near;
          const gs = sz * 8;
          ctx.drawImage(glow, X - gs / 2, Y - gs / 2, gs, gs);
          ctx.globalAlpha = 1;
        }
        ctx.fillStyle = `rgba(${Math.round(190 + near * 65)},235,255,${a.toFixed(3)})`;
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
    <div className="su-left" id="suLeft" ref={boxRef}>
      <canvas id="suHoloCv" ref={cvRef} />
      <img className="su-left-mark" src="/assets/v2/hntr-logos/hntr-wordmark-white.png" alt="HNTR" />
      <div className="su-left-tag">Your gateway to the NFT Universe</div>
    </div>
  );
}
