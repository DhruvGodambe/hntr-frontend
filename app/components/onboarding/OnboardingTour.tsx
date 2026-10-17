"use client";

import "./onboarding.css";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type MutableRefObject, type RefObject } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";

declare global {
  interface Window {
    obOpen?: () => void;
    obClose?: () => void;
  }
}

/** Set by "Don't show this again" — the tour never auto-opens while it is "1". */
const HIDE_KEY = "hntr_onboarding_hide";
/** The tour opens each time the visitor arrives on the app home page. */
const HOME_PATH = "/home";
const OPEN_DELAY_MS = 1800;
const STEPS = 3;

const A = "/assets/about";
const V2 = "/assets/v2";
const MARK = `${V2}/hntr-logos/hntr-mark-white.png`;

// Five scrolling columns of the step-1 NFT wall; each column repeats so the loop is seamless.
const WALL: { up: boolean; imgs: string[] }[] = [
  { up: false, imgs: ["punk-01", "ape-02", "pudgy-03", "azuki-04", "mayc-05", "punk-06"] },
  { up: true, imgs: ["azuki-01", "mayc-02", "ape-03", "punk-04", "pudgy-05", "ape-06"] },
  { up: false, imgs: ["pudgy-01", "punk-02", "mayc-03", "ape-04", "azuki-05", "pudgy-06"] },
  { up: true, imgs: ["mayc-01", "azuki-02", "punk-03", "pudgy-04", "ape-05", "mayc-06"] },
  { up: false, imgs: ["ape-07", "pudgy-07", "azuki-07", "mayc-07", "punk-07", "ape-08"] },
];

const TOKENS = [
  { cls: "ob-t1", img: "punk-03" },
  { cls: "ob-t2", img: "azuki-02" },
  { cls: "ob-t3", img: "pudgy-04" },
  { cls: "ob-t4", img: "mayc-05" },
];

const NODES = [
  { left: "50%", top: "0%", img: "ape-04" },
  { left: "93%", top: "25%", img: "azuki-05" },
  { left: "93%", top: "75%", img: "punk-06" },
  { left: "50%", top: "100%", img: "pudgy-02" },
  { left: "7%", top: "75%", img: "mayc-08" },
  { left: "7%", top: "25%", img: "ape-09" },
];

const EARNS = [
  { left: "62%", top: "-4%", delay: undefined },
  { left: "78%", top: "52%", delay: "-1s" },
  { left: "-12%", top: "46%", delay: "-2s" },
];

const LOGOS = [
  { src: `${V2}/hntr-dark/e4b5d835.png`, name: "Bored Ape Yacht Club", label: "BAYC" },
  { src: `${V2}/hntr-dark/83f5f39e.webp`, name: "CryptoPunks", label: "CryptoPunks" },
  { src: `${V2}/hntr-dark/82dcbcda.png`, name: "Pudgy Penguins", label: "Pudgy" },
  { src: `${V2}/hntr-dark/2a770aed.jpg`, name: "Azuki", label: "Azuki" },
  { src: `${A}/card-art-mayc.avif`, name: "Mutant Ape Yacht Club", label: "MAYC" },
];

const avif = (name: string) => `${A}/${name}.avif`;

const VerifiedTick = () => (
  <svg className="ob-tick" width="12" height="12" viewBox="0 0 24 24" aria-label="Verified">
    <path
      d="M12 1l2.6 2.2 3.4-.3.9 3.3 3 1.7-1.2 3.2 1.2 3.2-3 1.7-.9 3.3-3.4-.3L12 23l-2.6-2.2-3.4.3-.9-3.3-3-1.7L3.3 12 2.1 8.9l3-1.7.9-3.3 3.4.3z"
      fill="#e8b84a"
    />
    <path d="M7.5 12.2l3 3 6-6.2" fill="none" stroke="#1a1408" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function readHidden() {
  try {
    return localStorage.getItem(HIDE_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Particle hologram of the HNTR mark behind the tour's visual panel: follows the
 * pointer, ripples on click, and dims on steps 2–3. Mirrors the design's `holo()`.
 */
function useHolo(
  boxRef: RefObject<HTMLDivElement | null>,
  cvRef: RefObject<HTMLCanvasElement | null>,
  stepRef: MutableRefObject<number>,
) {
  useEffect(() => {
    const box = boxRef.current;
    const cv = cvRef.current;
    const ctx = cv?.getContext("2d");
    if (!box || !cv || !ctx) return;

    const RM = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    type P = { x: number; y: number; z: number; r: number };
    const P: P[] = [];
    let W = 0;
    let H = 0;
    let dpr = 1;
    let mx = 0.5;
    let my = 0.5;
    let tx = 0.5;
    let ty = 0.5;
    let hover = false;
    let ripples: { x: number; y: number; t: number }[] = [];
    const t0 = performance.now();
    let raf = 0;
    let disposed = false;

    const glow = document.createElement("canvas");
    glow.width = glow.height = 32;
    {
      const g = glow.getContext("2d")!;
      const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
      gr.addColorStop(0, "rgba(150,210,255,.5)");
      gr.addColorStop(1, "rgba(150,210,255,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, 32, 32);
    }

    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random(),
      y: Math.random(),
      s: Math.random() * 1.2 + 0.3,
      p: Math.random() * 6,
    }));

    const draw = (now: number) => {
      const t = RM ? 0 : (now - t0) / 1000;
      const i = stepRef.current;
      mx += (tx - mx) * 0.06;
      my += (ty - my) * 0.06;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        const al = 0.25 + 0.25 * Math.sin(t * 1.3 + s.p);
        ctx.fillStyle = `rgba(200,225,255,${al.toFixed(3)})`;
        ctx.fillRect(s.x * W + (mx - 0.5) * -12 * s.s, s.y * H + (my - 0.5) * -12 * s.s, s.s, s.s);
      }
      ctx.globalCompositeOperation = "lighter";
      const dim = i === 0 ? 1 : 0.35;
      const cx = W / 2;
      const cy = H * 0.47;
      const sc = Math.min(W, H) / (i === 0 ? 300 : 420);
      const ry = (mx - 0.5) * 1.0 + Math.sin(t * 0.5) * 0.25;
      const rx = (my - 0.5) * -0.7;
      const cY = Math.cos(ry);
      const sY = Math.sin(ry);
      const cX = Math.cos(rx);
      const sX = Math.sin(rx);
      const pcx = mx * W;
      const pcy = my * H;
      for (const p of P) {
        const wv = Math.sin(Math.sqrt(p.x * p.x + p.y * p.y) * 0.06 - t * 2.4) * 7;
        const x = p.x;
        const y = p.y + Math.sin(t * 1.1) * 3;
        const z = p.z + wv;
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
        const al2 = Math.min(1, (0.45 + fl * 0.4 + near * 0.6) * dim);
        const sz = (1.7 + near * 1.5) * pr;
        if (near > 0.05) {
          ctx.globalAlpha = near;
          const gs = sz * 8;
          ctx.drawImage(glow, X - gs / 2, Y - gs / 2, gs, gs);
          ctx.globalAlpha = 1;
        }
        ctx.fillStyle = `rgba(${Math.round(190 + near * 65)},235,255,${al2.toFixed(3)})`;
        ctx.fillRect(X - sz / 2, Y - sz / 2, sz, sz);
      }
      ripples = ripples.filter((r) => now - r.t < 1400);
      ctx.globalCompositeOperation = "source-over";
    };

    const im = new Image();
    im.onload = () => {
      if (disposed) return;
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
      const oc = o.getContext("2d")!;
      oc.drawImage(im, 0, 0, w, hh);
      const d = oc.getImageData(0, 0, w, hh).data;
      const st = 7;
      for (let y = 0; y < hh; y += st)
        for (let x = 0; x < w; x += st) {
          if (d[(y * w + x) * 4 + 3] > 110) P.push({ x: x - w / 2, y: y - hh / 2, z: (Math.random() - 0.5) * 14, r: Math.random() });
        }
      while (P.length > 900) P.splice(Math.floor(Math.random() * P.length), 1);
      if (RM) draw(t0);
    };
    im.src = MARK;

    const rs = () => {
      const r = box.getBoundingClientRect();
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      W = r.width;
      H = r.height;
      cv.width = Math.max(1, W * dpr);
      cv.height = Math.max(1, H * dpr);
      if (RM) draw(t0);
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

    if (!RM) {
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        if (W > 40) draw(now);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      box.removeEventListener("mousemove", onMove);
      box.removeEventListener("mouseleave", onLeave);
      box.removeEventListener("click", onClick);
    };
  }, [boxRef, cvRef, stepRef]);
}

function TourDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [hidden, setHidden] = useState(readHidden);
  const stepRef = useRef(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  stepRef.current = step;
  useHolo(boxRef, cvRef, stepRef);

  const go = useCallback((d: number) => setStep((s) => Math.max(0, Math.min(STEPS - 1, s + d))), []);

  useEffect(() => {
    const t = setTimeout(() => nextRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  const toggleHidden = (v: boolean) => {
    setHidden(v);
    try {
      if (v) localStorage.setItem(HIDE_KEY, "1");
      else localStorage.removeItem(HIDE_KEY);
    } catch {
      /* storage blocked */
    }
  };

  const layer = (k: number) => `ob-layer${step === k ? " on" : ""}`;
  const pane = (k: number) => `ob-s${step === k ? " on" : ""}`;

  return (
    <div
      id="onbOv"
      className="on"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="ob" role="dialog" aria-modal="true" aria-labelledby="obH1">
        <div className="ob-vis" id="obVis" ref={boxRef} aria-hidden="true">
          <canvas id="obCv" ref={cvRef} />
          <div className="ob-scan" />
          <img className="ob-mark" src={MARK} alt="" />

          <div className={layer(0)}>
            <div className="ob-wall">
              <div className="ob-wallin">
                {WALL.map((col, ci) => (
                  <div key={ci} className={`ob-col${col.up ? " up" : ""}`}>
                    <div className="ob-colin">
                      {[...col.imgs, ...col.imgs].map((img, ii) => (
                        <img key={ii} src={avif(img)} alt="" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="ob-wallfade" />
            <div className="ob-tag">Own a share of blue chips</div>
          </div>

          <div className={layer(1)}>
            {TOKENS.map((tk) => (
              <div key={tk.cls} className={`ob-tk ${tk.cls}`}>
                <img src={avif(tk.img)} alt="" />
              </div>
            ))}
            <div className="ob-pool">
              <img src={avif("ape-01")} alt="" />
              <div className="ob-pool-h">
                TARGET NFT<span>POOLING</span>
              </div>
              <div className="ob-bar">
                <i />
              </div>
            </div>
            <div className="ob-bought">NFT BOUGHT</div>
          </div>

          <div className={layer(2)}>
            <div className="ob-net">
              <div className="ob-ring" />
              <div className="ob-ring r2" />
              <div className="ob-me">
                <img src={MARK} alt="" />
              </div>
              {NODES.map((n) => (
                <div key={n.img} className="ob-nd" style={{ left: n.left, top: n.top }}>
                  <img src={avif(n.img)} alt="" />
                </div>
              ))}
              {EARNS.map((e, k) => (
                <div key={k} className="ob-earn" style={{ left: e.left, top: e.top, animationDelay: e.delay }}>
                  + MEMBERSHIP
                </div>
              ))}
            </div>
            <div className="ob-tag">Your network, your earnings</div>
          </div>
        </div>

        <div className="ob-body">
          <div className="ob-top">
            <div className="ob-dots" aria-hidden="true">
              {Array.from({ length: STEPS }, (_, k) => (
                <i key={k} className={k === step ? "on" : k < step ? "done" : undefined}>
                  {k + 1}
                </i>
              ))}
            </div>
            <button className="ob-skip" type="button" onClick={onClose}>
              Skip
            </button>
          </div>

          <div className="ob-steps">
            <div className={pane(0)}>
              <div className="ob-k">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2l2.6 6.6L21 9.3l-5 4.6 1.4 6.8L12 17.3 6.6 20.7 8 13.9l-5-4.6 6.4-.7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>
                Step 1 of 3 · Welcome
              </div>
              <h2 id="obH1">Welcome to HNTR</h2>
              <p className="ob-p">
                A place where you can own blue-chip NFTs. Hold a share of collections like BAYC, CryptoPunks and Pudgy Penguins without buying the whole asset.
              </p>
              <div className="ob-list">
                <div className="ob-li">
                  <span className="ob-ic">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                      <path d="M4 7.5l8 4.5 8-4.5M12 12v9" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <div>
                    <b>Real blue-chip assets</b>Every NFT is a verified, on-chain asset.
                  </div>
                </div>
                <div className="ob-li">
                  <span className="ob-ic">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 3v9l6.4 6.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div>
                    <b>Fractional ownership</b>Own your share from a small entry.
                  </div>
                </div>
              </div>
              <div className="ob-logos">
                {LOGOS.map((l) => (
                  <div key={l.label} className="ob-logo">
                    <img src={l.src} alt={l.name} title={l.name} />
                    <span>
                      {l.label}
                      <VerifiedTick />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={pane(1)}>
              <div className="ob-k">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Step 2 of 3 · NFT Strategies
              </div>
              <h2>How strategies work</h2>
              <p className="ob-p">A unique opportunity to access assets that are usually out of reach.</p>
              <div className="ob-list">
                <div className="ob-li">
                  <span className="ob-ic">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="8" cy="9" r="3" stroke="currentColor" strokeWidth="2" />
                      <circle cx="16" cy="9" r="3" stroke="currentColor" strokeWidth="2" />
                      <path d="M3 19c.6-2.6 2.6-4 5-4s4.4 1.4 5 4M11 19c.6-2.6 2.6-4 5-4s4.4 1.4 5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div>
                    <b>Pool together</b>Members pool ETH towards a target blue-chip NFT.
                  </div>
                </div>
                <div className="ob-li">
                  <span className="ob-ic">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M13 2L4 14h7l-1 8 9-12h-7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <div>
                    <b>Bought instantly</b>When the target is reached, the NFT is bought.
                  </div>
                </div>
                <div className="ob-li">
                  <span className="ob-ic">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M3 17l6-6 4 4 8-8M15 7h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <div>
                    <b>Sold at a premium</b>Listed above cost, profit shared by your stake.
                  </div>
                </div>
              </div>
            </div>

            <div className={pane(2)}>
              <div className="ob-k">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" />
                  <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                  <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" />
                  <path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4" stroke="currentColor" strokeWidth="2" />
                </svg>
                Step 3 of 3 · Share &amp; earn
              </div>
              <h2>Share it and earn</h2>
              <div className="ob-big">
                <b>75%</b>
                <span>commission</span>
              </div>
              <p className="ob-p">Earn up to 75% on all memberships sold in your network.</p>
              <div className="ob-ctas">
                <div className="ob-row">
                  <button
                    className="ob-btn ob-pri"
                    type="button"
                    onClick={() => {
                      onClose();
                      window.openSignup?.();
                    }}
                  >
                    Join now
                    <Arrow />
                  </button>
                  <button
                    className="ob-btn ob-sec"
                    type="button"
                    onClick={() => {
                      onClose();
                      router.push("/learn");
                    }}
                  >
                    Learn more
                  </button>
                </div>
                <Link className="ob-live" href="/webinar" onClick={onClose}>
                  <span />
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="6" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M15 10.5l6-3.5v10l-6-3.5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                  Listen to a live presentation<em>LIVE</em>
                </Link>
                <button className="ob-btn ob-sec" type="button" onClick={onClose}>
                  Close
                </button>
              </div>
            </div>
          </div>

          <div className="ob-nav" id="obNav" style={{ display: step === STEPS - 1 ? "none" : "flex" }}>
            <button
              className="ob-btn ob-sec ob-back"
              type="button"
              onClick={() => go(-1)}
              aria-label="Back"
              style={{ visibility: step ? "visible" : "hidden" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button ref={nextRef} className="ob-btn ob-pri" type="button" onClick={() => go(1)}>
              Next
              <Arrow />
            </button>
          </div>
          <label className="ob-hide">
            <input type="checkbox" checked={hidden} onChange={(e) => toggleHidden(e.target.checked)} />
            <span className="ob-hide-box">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6.2 5 8.6l4.5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            Don&apos;t show this again
          </label>
        </div>
      </div>
    </div>
  );
}

/**
 * Home "quick go-through" tour (3 steps: Welcome · NFT Strategies · Share & earn).
 * Opens each time the visitor arrives on /home, until they tick "Don't show this again".
 * `window.obOpen()` reopens it on demand.
 */
export default function OnboardingTour() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    window.obOpen = () => setOpen(true);
    window.obClose = close;
    return () => {
      delete window.obOpen;
      delete window.obClose;
    };
  }, [close]);

  useEffect(() => {
    if (pathname !== HOME_PATH || readHidden()) return;
    let poll: ReturnType<typeof setInterval> | undefined;
    const show = () => setOpen(true);
    const timer = setTimeout(() => {
      // Wait out the Turnstile human gate if it is still up.
      if (!document.documentElement.hasAttribute("data-human-pending")) return show();
      poll = setInterval(() => {
        if (document.documentElement.hasAttribute("data-human-pending")) return;
        clearInterval(poll);
        show();
      }, 500);
    }, OPEN_DELAY_MS);
    return () => {
      clearTimeout(timer);
      clearInterval(poll);
    };
  }, [pathname]);

  return open ? <TourDialog onClose={close} /> : null;
}
