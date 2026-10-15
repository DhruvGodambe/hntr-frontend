"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TELEGRAM_URL, DISCORD_URL } from "../layout/shell/HntrFooter";
import "./landing.css";

/*
 * Public marketing landing page — a port of "HNTR Landing.dc.html".
 *
 * Markup and inline styles are carried over from the design file; its stylesheet lives in
 * landing.css, scoped under `html[data-landing]` (set while this page is mounted) so none of
 * it reaches the app shell. The animated hologram card, gears and globe are the design's own
 * custom elements (public/assets/landing/*.js).
 */

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "hntr-cardflip": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "hntr-gears": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "hntr-globe": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

type Theme = "dark" | "light";

/** Same key the app shell uses, so the theme carries over when entering the platform. */
const THEME_KEY = "hntrTheme";

// three.js and the land atlas must be in place before the widgets that read them register.
const WIDGET_SCRIPTS = [
  "/assets/landing/three.global.js",
  "/assets/landing/land-110m.js",
  "/assets/landing/hntr-cardflip.js",
  "/assets/landing/hntr-gears.js",
  "/assets/landing/hntr-globe.js",
];

function loadScript(src: string): Promise<void> {
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
  if (existing) {
    return existing.dataset.loaded
      ? Promise.resolve()
      : new Promise((resolve) => {
          existing.addEventListener("load", () => resolve());
          existing.addEventListener("error", () => resolve());
        });
  }
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = false;
    s.onload = () => {
      s.dataset.loaded = "1";
      resolve();
    };
    s.onerror = () => resolve();
    document.head.appendChild(s);
  });
}

function readTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY) || localStorage.getItem("hntr-theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* storage blocked */
  }
  return "dark";
}

// Runs during HTML parsing (before first paint) so the page never flashes the app's
// non-scrolling body or the wrong theme. The effects below keep it in sync afterwards.
const BOOT_SCRIPT = `(function(){try{var d=document.documentElement,t=localStorage.getItem("${THEME_KEY}")||localStorage.getItem("hntr-theme");d.setAttribute("data-landing","");d.setAttribute("data-theme",t==="light"?"light":"dark")}catch(e){document.documentElement.setAttribute("data-landing","")}})();`;

export default function LandingPage() {
  const [theme, setTheme] = useState<Theme>("dark");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  // Page-level state on <html>: enables the scoped stylesheet and the theme.
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-landing", "");
    return () => {
      html.removeAttribute("data-landing");
      html.removeAttribute("data-theme");
      html.classList.remove("rv-ok");
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => {
      const next: Theme = t === "light" ? "dark" : "light";
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* storage blocked */
      }
      return next;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const src of WIDGET_SCRIPTS) {
        if (cancelled) return;
        await loadScript(src);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const timers: number[] = [];
    const intervals: number[] = [];
    const cleanups: (() => void)[] = [];

    // Scroll reveal for [data-rv] blocks.
    const show = (el: HTMLElement) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    };
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            show(e.target as HTMLElement);
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
    );
    const revealEls = () => Array.from(root.querySelectorAll<HTMLElement>("[data-rv]"));
    const observe = () =>
      revealEls().forEach((el) => {
        if (el.style.opacity !== "1") io.observe(el);
      });
    observe();
    timers.push(window.setTimeout(observe, 400));
    document.documentElement.classList.add("rv-ok");
    let mq = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(mq);
      mq = requestAnimationFrame(observe);
    });
    mo.observe(root, { childList: true, subtree: true });
    const rvTick = window.setInterval(observe, 1000);
    intervals.push(rvTick);
    timers.push(window.setTimeout(() => window.clearInterval(rvTick), 15000));
    const rvScroll = () =>
      revealEls().forEach((el) => {
        if (el.style.opacity !== "1") {
          const r = el.getBoundingClientRect();
          if (r.top < window.innerHeight * 0.94 && r.bottom > 0) show(el);
        }
      });
    window.addEventListener("scroll", rvScroll, { passive: true });
    timers.push(window.setTimeout(rvScroll, 600));
    const rvPoll = window.setInterval(() => {
      rvScroll();
      if (!revealEls().some((el) => el.style.opacity !== "1")) window.clearInterval(rvPoll);
    }, 250);
    intervals.push(rvPoll);

    // 3D tilt + glow on the "We buy assets together" step cards.
    type StepCard = HTMLElement & { _b?: number };
    const bindSteps = () =>
      root.querySelectorAll<StepCard>("[data-step]").forEach((c) => {
        if (c._b || c.closest("[data-bcrow]")) return;
        c._b = 1;
        const glow = c.querySelector<HTMLElement>("[data-glow]")!;
        const line = c.querySelector<HTMLElement>("[data-line]")!;
        const num = c.querySelector<HTMLElement>("[data-num]")!;
        const z = c.querySelector<HTMLElement>("[data-z]")!;
        const mv = (e: PointerEvent) => {
          const r = c.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width;
          const y = (e.clientY - r.top) / r.height;
          c.style.transition = "transform .12s linear,border-color .4s";
          c.style.transform = `rotateX(${((0.5 - y) * 10).toFixed(2)}deg) rotateY(${((x - 0.5) * 12).toFixed(2)}deg)`;
          c.style.borderColor = "rgba(138,255,228,.35)";
          glow.style.opacity = "1";
          glow.style.background = `radial-gradient(260px circle at ${x * 100}% ${y * 100}%,rgba(138,255,228,.18),transparent 70%)`;
          line.style.width = "100%";
          num.style.transform = `translate3d(${(x - 0.5) * 10}px,${(y - 0.5) * 6}px,40px)`;
          z.style.transform = "translateZ(28px)";
        };
        const lv = () => {
          c.style.transition = "transform .6s cubic-bezier(.22,1,.36,1),border-color .4s";
          c.style.transform = "none";
          c.style.borderColor = "rgba(255,255,255,.1)";
          glow.style.opacity = "0";
          line.style.width = "28%";
          num.style.transform = "none";
          z.style.transform = "none";
        };
        c.addEventListener("pointermove", mv);
        c.addEventListener("pointerleave", lv);
        cleanups.push(() => {
          c.removeEventListener("pointermove", mv);
          c.removeEventListener("pointerleave", lv);
          delete c._b;
        });
      });
    bindSteps();
    timers.push(window.setTimeout(bindSteps, 400));

    // Blue-chip cards: 4 / 2 / 1 per row by container width.
    let bcRo: ResizeObserver | null = null;
    const fitRow = () => {
      const row = root.querySelector<HTMLElement>("[data-bcrow]");
      if (!row || bcRo) return;
      bcRo = new ResizeObserver(() =>
        requestAnimationFrame(() => {
          const w = row.clientWidth;
          const basis = w >= 1100 ? "calc(25% - 15px)" : w >= 640 ? "calc(50% - 10px)" : "100%";
          row.querySelectorAll<HTMLElement>("[data-bc]").forEach((c) => {
            if (c.style.flexBasis !== basis) c.style.flexBasis = basis;
          });
        }),
      );
      bcRo.observe(row);
    };
    fitRow();
    timers.push(window.setTimeout(fitRow, 400));

    // Frosted header once the page scrolls.
    const onScroll = () => {
      const nav = navRef.current;
      if (!nav) return;
      const s = window.scrollY > 40;
      nav.style.background = s ? "rgba(var(--bg-rgb),.82)" : "transparent";
      nav.style.backdropFilter = s ? "blur(12px)" : "none";
      nav.style.borderBottomColor = s ? "rgba(var(--fg-rgb),.08)" : "transparent";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Hero spotlight follows the pointer (eased).
    let raf = 0;
    const h = heroRef.current;
    if (h) {
      let tx = 39, ty = 46, cx = 39, cy = 46, tr = 150, cr = 150;
      const move = (e: MouseEvent) => {
        const r = h.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width) * 100;
        ty = ((e.clientY - r.top) / r.height) * 100;
        tr = 190;
      };
      const leave = () => {
        tx = 39;
        ty = 46;
        tr = 150;
      };
      h.addEventListener("mousemove", move);
      h.addEventListener("mouseleave", leave);
      cleanups.push(() => {
        h.removeEventListener("mousemove", move);
        h.removeEventListener("mouseleave", leave);
      });
      const loop = () => {
        raf = requestAnimationFrame(loop);
        cx += (tx - cx) * 0.1;
        cy += (ty - cy) * 0.1;
        cr += (tr - cr) * 0.08;
        h.style.setProperty("--mx", `${cx}%`);
        h.style.setProperty("--my", `${cy}%`);
        h.style.setProperty("--r", `${cr}px`);
      };
      loop();
    }

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      intervals.forEach((t) => window.clearInterval(t));
      cleanups.forEach((f) => f());
      io.disconnect();
      mo.disconnect();
      bcRo?.disconnect();
      cancelAnimationFrame(mq);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", rvScroll);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const isDark = theme !== "light";
  const isLight = theme === "light";
  const themeLabel = isLight ? "Dark" : "Light";
  const external = (url: string) => (url === "#" ? {} : { target: "_blank", rel: "noopener noreferrer" });

  return (
    <div className="lp-root" ref={rootRef}>
      <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      <div className="lp-ff-poppins" style={{ background: "var(--bg)", color: "var(--fg)", fontFamily: "'Poppins',sans-serif", minHeight: "100vh", overflowX: "clip" }}>
        <div aria-hidden="true" style={{ display: "none" }}>
          <img data-asset="about/card-art-bayc.avif" src="/assets/about/card-art-bayc.avif" alt="" style={{ display: "none" }} />
          <img data-asset="about/card-art-punk.avif" src="/assets/about/card-art-punk.avif" alt="" style={{ display: "none" }} />
          <img data-asset="about/card-art-pudgy.avif" src="/assets/about/card-art-pudgy.avif" alt="" style={{ display: "none" }} />
          <img data-asset="about/card-art-mayc.avif" src="/assets/about/card-art-mayc.avif" alt="" style={{ display: "none" }} />
          <img data-asset="about/beeple-everydays.jpg" src="/assets/about/beeple-everydays.jpg" alt="" style={{ display: "none" }} />
        </div>
        {" "}
        <header ref={navRef} style={{ position: "fixed", top: "0", left: "0", right: "0", zIndex: "50", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 clamp(18px,4vw,48px)", transition: "background .35s ease,border-color .35s ease", borderBottom: "1px solid transparent" }}>
          <a href="#top" style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--fg)" }}>
            <img src="/assets/v2/hntr-dark/8b857621.png" alt="" style={{ width: "26px", height: "26px", objectFit: "contain" }} />
            <span className="lp-ff-grotesk" style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "18px", letterSpacing: ".06em" }}>
              HNTR
            </span>
          </a>
          <nav style={{ display: "flex", alignItems: "center", gap: "clamp(14px,2.4vw,32px)" }}>
            <button className="lp-h1" type="button" onClick={toggleTheme} aria-label="Toggle light and dark mode" title={`${themeLabel} mode`} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", padding: "0", border: "0", background: "transparent", color: "var(--fg)", cursor: "pointer", opacity: ".8", transition: "opacity .2s" }}>
              {isDark && (
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <path d="M13 10.5A5.5 5.5 0 0 1 6.5 4a5.5 5.5 0 0 0 0 8.5A5.5 5.5 0 0 0 13 10.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"></path>
                </svg>
              )}
              {isLight && (
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4"></circle>
                  <path d="M8 1.5v1.3M8 13.2v1.3M1.5 8h1.3M13.2 8h1.3M3.4 3.4l.9.9M11.7 11.7l.9.9M12.6 3.4l-.9.9M4.3 11.7l-.9.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"></path>
                </svg>
              )}
            </button>
            <a className="lp-h2 lp-ff-grotesk" href="/home" style={{ display: "inline-flex", alignItems: "center", gap: "8px", height: "42px", padding: "0 26px", borderRadius: "10px", background: "var(--fg)", color: "var(--bg)", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "13px", letterSpacing: ".06em", textTransform: "uppercase", transition: "background .3s ease,color .3s ease,transform .3s cubic-bezier(.22,1,.36,1),box-shadow .3s ease" }}>
              Launch Platform
            </a>
          </nav>
        </header>
        {" "}
        <section id="top" data-screen-label="Hero" style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "minmax(0,42fr) minmax(0,58fr)", alignItems: "stretch", paddingTop: "64px", position: "relative" }}>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "22px", padding: "40px clamp(20px,4vw,56px)" }}>
            <h1 style={{ margin: "0", fontWeight: "600", fontSize: "clamp(24px,2.9vw,76px)", lineHeight: "1.2", letterSpacing: "-.015em", animation: "hRise 1s cubic-bezier(.22,1,.36,1) both .2s" }}>
              <span style={{ whiteSpace: "nowrap" }}>
                Discover{" "}
                <span style={{ display: "inline-flex", alignItems: "center", verticalAlign: "middle", margin: "0 .08em" }}>
                  <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="" style={{ width: ".9em", height: ".9em", borderRadius: "50%", objectFit: "cover", border: ".07em solid #3a3a3e", boxSizing: "border-box", marginLeft: "0", position: "relative" }} />
                  <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="" style={{ width: ".9em", height: ".9em", borderRadius: "50%", objectFit: "cover", border: ".07em solid #3a3a3e", boxSizing: "border-box", marginLeft: "-.28em", position: "relative" }} />
                  <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="" style={{ width: ".9em", height: ".9em", borderRadius: "50%", objectFit: "cover", border: ".07em solid #3a3a3e", boxSizing: "border-box", marginLeft: "-.28em", position: "relative" }} />
                </span>
                {" "}Co‑Own,
              </span>
              <br />
              <span style={{ whiteSpace: "nowrap" }}>
                And Sell{" "}
                <span style={{ display: "inline-block", position: "relative", width: "2.4em", height: ".9em", verticalAlign: "middle", borderRadius: "999px", background: "#0a0a0b", overflow: "hidden", marginLeft: ".04em" }}>
                  <img src="/assets/v2/hntr-dark/627f8db5.png" alt="" style={{ position: "absolute", top: ".12em", left: "0.32em", width: ".76em", height: ".76em", borderRadius: ".1em", objectFit: "cover", transform: "rotate(-8deg)", transformOrigin: "bottom left", boxShadow: "-.04em 0 .12em rgba(0,0,0,.5)", zIndex: "1" }} />
                  <img src="/assets/v2/hntr-dark/e4b5d835.png" alt="" style={{ position: "absolute", top: ".12em", left: "0.6em", width: ".76em", height: ".76em", borderRadius: ".1em", objectFit: "cover", transform: "rotate(-4deg)", transformOrigin: "bottom left", boxShadow: "-.04em 0 .12em rgba(0,0,0,.5)", zIndex: "2" }} />
                  <img src="/assets/v2/hntr-dark/82dcbcda.png" alt="" style={{ position: "absolute", top: ".12em", left: "0.88em", width: ".76em", height: ".76em", borderRadius: ".1em", objectFit: "cover", transform: "rotate(0deg)", transformOrigin: "bottom left", boxShadow: "-.04em 0 .12em rgba(0,0,0,.5)", zIndex: "3" }} />
                  <img src="/assets/v2/hntr-dark/db1b706f.png" alt="" style={{ position: "absolute", top: ".12em", left: "1.16em", width: ".76em", height: ".76em", borderRadius: ".1em", objectFit: "cover", transform: "rotate(4deg)", transformOrigin: "bottom left", boxShadow: "-.04em 0 .12em rgba(0,0,0,.5)", zIndex: "4" }} />
                  <img src="/assets/v2/hntr-dark/4239eb9f.png" alt="" style={{ position: "absolute", top: ".12em", left: "1.44em", width: ".76em", height: ".76em", borderRadius: ".1em", objectFit: "cover", transform: "rotate(8deg)", transformOrigin: "bottom left", boxShadow: "-.04em 0 .12em rgba(0,0,0,.5)", zIndex: "5" }} />
                </span>
              </span>
              <br />
              <span style={{ whiteSpace: "nowrap" }}>
                Bluechip{" "}
                <span style={{ color: "#F25623" }}>
                  NFTs.
                </span>
              </span>
            </h1>
            <div id="hero-cta" style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "6px", animation: "hRise 1s cubic-bezier(.22,1,.36,1) both .7s" }}>
              <a className="lp-h3 lp-ff-grotesk" href="/home" style={{ display: "inline-flex", alignItems: "center", height: "58px", padding: "0 34px", borderRadius: "10px", background: "var(--fg)", color: "var(--bg)", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "17px", letterSpacing: ".02em", transition: "all .3s cubic-bezier(.22,1,.36,1)" }}>
                Launch Platform
              </a>
            </div>
          </div>
          <div ref={heroRef} style={{ position: "relative", overflow: "hidden", borderRadius: "16px 0 0 16px", margin: "16px 0 56px", cursor: "crosshair", animation: "hRise 1.2s cubic-bezier(.22,1,.36,1) both .05s", "--mx": "39%", "--my": "46%", "--r": "150px" } as React.CSSProperties}>
            <img src="/assets/v2/hntr-dark/e0a309d4.jpg" alt="" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover" }} />
            {" "}
            <img src="/assets/v2/hntr-dark/1ac643a0.jpg" alt="" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", WebkitMaskImage: "radial-gradient(circle var(--r) at var(--mx) var(--my),#000 55%,transparent 100%)", maskImage: "radial-gradient(circle var(--r) at var(--mx) var(--my),#000 55%,transparent 100%)" }} />
            {" "}
            <div style={{ position: "absolute", inset: "0", background: "linear-gradient(90deg,rgba(var(--bg-rgb),.35),transparent 30%)", pointerEvents: "none" }}></div>
            {" "}
            {isDark && (
              <img src="/assets/v2/hntr-dark/hntr-wordmark-white.png" alt="HNTR" style={{ position: "absolute", right: "clamp(24px,3vw,44px)", bottom: "clamp(22px,3vw,40px)", width: "clamp(220px,26vw,420px)", height: "auto", pointerEvents: "none", zIndex: "3" }} />
            )}
            {" "}
            {isLight && (
              <img src="/assets/v2/hntr-dark/hntr-wordmark-black.png" alt="HNTR" style={{ position: "absolute", right: "clamp(24px,3vw,44px)", bottom: "clamp(22px,3vw,40px)", width: "clamp(220px,26vw,420px)", height: "auto", pointerEvents: "none", zIndex: "3" }} />
            )}
          </div>
          <a className="lp-ff-mono" href="#hntr" style={{ position: "absolute", left: "0", right: "0", bottom: "18px", textAlign: "center", fontFamily: "'Space Mono',monospace", fontSize: "10px", letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(var(--fg-rgb),.5)", animation: "hBob 1.8s ease-in-out infinite" }}>
            Scroll to explore ↓
          </a>
        </section>
        {" "}
        <section id="hntr" data-screen-label="Vision & Mission" style={{ background: "var(--bg)", minHeight: "100vh", boxSizing: "border-box", padding: "clamp(96px,12vw,160px) clamp(20px,6vw,96px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", alignItems: "center", gap: "clamp(48px,6vw,96px)", position: "relative", overflow: "hidden" }}>
          <div className="lp-ff-mono" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", fontFamily: "'Space Mono',monospace", fontSize: "clamp(14px,1.3vw,18px)", fontWeight: "700", letterSpacing: ".32em", color: "var(--fg)", position: "absolute", left: "0", right: "0", top: "clamp(36px,4.5vw,60px)", zIndex: "2", pointerEvents: "none" }}>
            <span style={{ width: "40px", height: "1px", background: "rgba(var(--fg-rgb),.5)" }}></span>
            VISION AND MISSION
            <span style={{ width: "40px", height: "1px", background: "rgba(var(--fg-rgb),.5)" }}></span>
          </div>
          <img src="/assets/v2/hntr-dark/8b857621.png" alt="" style={{ position: "absolute", right: "-6%", top: "50%", transform: "translateY(-50%)", width: "min(62vw,860px)", aspectRatio: "1", objectFit: "contain", opacity: ".06", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: "0", background: "repeating-linear-gradient(0deg,rgba(var(--fg-rgb),.02) 0 1px,transparent 1px 4px)", pointerEvents: "none" }}></div>
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(28px,3.5vw,44px)", position: "relative", maxWidth: "560px" }}>
            <h2 data-rv="" style={{ opacity: "0", transform: "translateY(28px)", transition: "opacity 1s cubic-bezier(.22,1,.36,1) 0s,transform 1s cubic-bezier(.22,1,.36,1) 0s", margin: "0", fontWeight: "600", fontSize: "clamp(36px,4.6vw,64px)", lineHeight: "1.04", letterSpacing: "-.02em", textWrap: "balance" }}>
              HNTR - Made for Normies
            </h2>
            <div data-rv="" style={{ opacity: "0", transform: "translateY(28px)", transition: "opacity 1s cubic-bezier(.22,1,.36,1) 0.12s,transform 1s cubic-bezier(.22,1,.36,1) 0.12s", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="lp-ff-mono" style={{ fontFamily: "'Space Mono',monospace", fontSize: "12px", letterSpacing: ".22em", textTransform: "uppercase", color: "#8cb8ff" }}>
                Vision
              </div>
              <p style={{ margin: "0", fontSize: "clamp(16px,1.3vw,18px)", lineHeight: "1.6", color: "rgba(var(--fg-rgb),.72)", textWrap: "pretty" }}>
                HNTR is the portal for everyone else.
              </p>
              <p style={{ margin: "0", fontSize: "clamp(16px,1.3vw,18px)", lineHeight: "1.6", color: "rgba(var(--fg-rgb),.72)", textWrap: "pretty" }}>
                Blue-chip NFTs sit behind whale prices. We open that door: a place where normal people can access and co-own high-value NFTs, one shared asset at a time.
              </p>
            </div>
            <div data-rv="" style={{ opacity: "0", transform: "translateY(28px)", transition: "opacity 1s cubic-bezier(.22,1,.36,1) 0.24s,transform 1s cubic-bezier(.22,1,.36,1) 0.24s", display: "flex", flexDirection: "column", gap: "14px", paddingTop: "clamp(24px,3vw,36px)", borderTop: "1px solid rgba(var(--fg-rgb),.1)" }}>
              <div className="lp-ff-mono" style={{ fontFamily: "'Space Mono',monospace", fontSize: "12px", letterSpacing: ".22em", textTransform: "uppercase", color: "#7ff0a8" }}>
                Mission
              </div>
              <p style={{ margin: "0", fontSize: "clamp(16px,1.3vw,18px)", lineHeight: "1.6", color: "rgba(var(--fg-rgb),.72)", textWrap: "pretty" }}>
                We bring millions onto HNTR and build the largest NFT education platform in the world, so anyone can enter, learn, and co-own.
              </p>
            </div>
          </div>
          <div data-holo="" data-rv="" style={{ opacity: "0", transform: "translateY(28px)", transition: "opacity 1s cubic-bezier(.22,1,.36,1) 0.18s,transform 1s cubic-bezier(.22,1,.36,1) 0.18s", position: "relative", display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative", width: "min(520px,100%)", aspectRatio: "420/300", animation: "hFloat 6s ease-in-out infinite" }}>
              <div style={{ position: "absolute", left: "50%", bottom: "-6%", width: "90%", height: "14%", transform: "translateX(-50%)", background: "radial-gradient(ellipse at center,rgba(138,255,228,.35),transparent 70%)", filter: "blur(8px)" }}></div>
              {" "}
              <div style={{ position: "absolute", inset: "0", animation: "hHolo 5s steps(1) infinite" }}>
                <div style={{ position: "absolute", left: "28.57%", top: "0", width: "42.86%", height: "52%", filter: "drop-shadow(0 0 14px rgba(110,170,255,.7))" }}>
                  <div style={{ position: "absolute", inset: "0", clipPath: "polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)", background: "rgba(120,180,255,.55)" }}></div>
                  {" "}
                  <div className="lp-ff-grotesk" style={{ position: "absolute", inset: "2px", clipPath: "polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)", background: "repeating-linear-gradient(0deg,rgba(150,200,255,.28) 0 2px,rgba(80,140,255,.1) 2px 4px),linear-gradient(rgba(7,12,18,.7),rgba(7,12,18,.7))", animation: "hScan 3s linear infinite", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "clamp(14px,1.6vw,22px)", letterSpacing: ".08em", color: "#dcebff", textShadow: "0 0 10px rgba(120,180,255,.9)" }}>
                    VISION
                  </div>
                </div>
                {" "}
                <div style={{ position: "absolute", left: "0", top: "46%", width: "42.86%", height: "52%", filter: "drop-shadow(0 0 14px rgba(90,240,150,.6))" }}>
                  <div style={{ position: "absolute", inset: "0", clipPath: "polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)", background: "rgba(100,240,160,.5)" }}></div>
                  {" "}
                  <div className="lp-ff-grotesk" style={{ position: "absolute", inset: "2px", clipPath: "polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)", background: "repeating-linear-gradient(0deg,rgba(120,255,170,.26) 0 2px,rgba(60,200,120,.1) 2px 4px),linear-gradient(rgba(7,12,18,.7),rgba(7,12,18,.7))", animation: "hScan 3.4s linear infinite", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "clamp(14px,1.6vw,22px)", letterSpacing: ".08em", color: "#ddffe9", textShadow: "0 0 10px rgba(90,240,150,.9)" }}>
                    MISSION
                  </div>
                </div>
                {" "}
                <div style={{ position: "absolute", left: "57.14%", top: "46%", width: "42.86%", height: "52%", filter: "drop-shadow(0 0 14px rgba(255,100,90,.6))" }}>
                  <div style={{ position: "absolute", inset: "0", clipPath: "polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)", background: "rgba(255,110,100,.5)" }}></div>
                  {" "}
                  <div className="lp-ff-grotesk" style={{ position: "absolute", inset: "2px", clipPath: "polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)", background: "repeating-linear-gradient(0deg,rgba(255,130,120,.26) 0 2px,rgba(220,70,60,.1) 2px 4px),linear-gradient(rgba(7,12,18,.7),rgba(7,12,18,.7))", animation: "hScan 2.8s linear infinite", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "clamp(14px,1.6vw,22px)", letterSpacing: ".08em", color: "#ffe2df", textShadow: "0 0 10px rgba(255,100,90,.9)" }}>
                    VALUES
                  </div>
                </div>
                {" "}
                <div style={{ position: "absolute", left: "-4%", right: "-4%", height: "8%", background: "linear-gradient(180deg,transparent,rgba(138,255,228,.18),transparent)", animation: "hSweep 4s linear infinite", pointerEvents: "none" }}></div>
              </div>
            </div>
          </div>
        </section>
        {" "}
        <section id="together" data-screen-label="Together" style={{ background: "var(--bg)", padding: "clamp(96px,12vw,140px) clamp(20px,6vw,96px) clamp(48px,6vw,80px)", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "clamp(48px,7vw,112px)", position: "relative", overflow: "hidden", minHeight: "100vh" }}>
          <div className="lp-ff-mono" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", fontFamily: "'Space Mono',monospace", fontSize: "clamp(14px,1.3vw,18px)", fontWeight: "700", letterSpacing: ".32em", color: "var(--fg)", position: "absolute", left: "0", right: "0", top: "clamp(36px,4.5vw,60px)", zIndex: "2", pointerEvents: "none" }}>
            <span style={{ width: "40px", height: "1px", background: "rgba(var(--fg-rgb),.5)" }}></span>
            WHAT WE DO
            <span style={{ width: "40px", height: "1px", background: "rgba(var(--fg-rgb),.5)" }}></span>
          </div>
          <div className="sc-host-x" style={{ position: "absolute", inset: "0" }}>
            <hntr-cardflip id="together-flip"></hntr-cardflip>
          </div>
          <div id="together-shade" style={{ position: "absolute", inset: "0", background: "linear-gradient(90deg,rgba(var(--bg-rgb),.8) 0%,rgba(var(--bg-rgb),.35) 40%,rgba(var(--bg-rgb),0) 60%),linear-gradient(180deg,var(--bg) 0%,rgba(var(--bg-rgb),0) 18%,rgba(var(--bg-rgb),0) 82%,var(--bg) 100%)", pointerEvents: "none" }}></div>
          <div id="together-copy" style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "min(620px,48vw)", position: "relative", zIndex: "1" }}>
            <h2 data-rv="" style={{ opacity: "0", transform: "translateY(28px)", transition: "opacity 1s cubic-bezier(.22,1,.36,1) 0s,transform 1s cubic-bezier(.22,1,.36,1) 0s", margin: "0", fontWeight: "600", fontSize: "clamp(36px,4.6vw,72px)", lineHeight: "1.04", letterSpacing: "-.02em", textWrap: "balance" }}>
              {"We buy assets together that we couldn't buy"}{" "}
              <span style={{ color: "#F25623" }}>
                alone.
              </span>
            </h2>
            <p data-rv="" style={{ opacity: "0", transform: "translateY(28px)", transition: "opacity 1s cubic-bezier(.22,1,.36,1) .12s,transform 1s cubic-bezier(.22,1,.36,1) .12s", margin: "0", fontSize: "clamp(16px,1.4vw,20px)", lineHeight: "1.6", color: "rgba(var(--fg-rgb),.75)", maxWidth: "560px", textWrap: "pretty" }}>
              We trade high-value, highly liquid, blue-chip NFTs together.
            </p>
          </div>
          <div id="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "clamp(10px,1.4vw,16px)", position: "relative", zIndex: "1" }}>
            <div data-rv="" style={{ opacity: "0", transform: "translateY(28px)", transition: "opacity 1s cubic-bezier(.22,1,.36,1) 0s,transform 1s cubic-bezier(.22,1,.36,1) 0s", perspective: "900px" }}>
              <div style={{ height: "100%" }}>
                <div data-step="" style={{ position: "relative", height: "100%", boxSizing: "border-box", display: "grid", gridTemplateColumns: "auto minmax(0,1fr)", columnGap: "clamp(20px,3vw,36px)", rowGap: "8px", alignItems: "baseline", padding: "clamp(16px,2vw,26px) clamp(16px,2vw,28px)", border: "1px solid rgba(var(--fg-rgb),.1)", borderRadius: "14px", background: "rgba(var(--panel-rgb),.55)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", transformStyle: "preserve-3d", transition: "transform .5s cubic-bezier(.22,1,.36,1),border-color .4s", overflow: "hidden" }}>
                  <div data-glow="" style={{ position: "absolute", inset: "0", opacity: "0", transition: "opacity .4s", pointerEvents: "none", background: "radial-gradient(260px circle at 50% 50%,rgba(var(--accent-rgb),.16),transparent 70%)" }}></div>
                  <div data-line="" style={{ position: "absolute", left: "0", top: "0", height: "2px", width: "28%", background: "linear-gradient(90deg,var(--accent),#3d6dff)", transition: "width .6s cubic-bezier(.22,1,.36,1)" }}></div>
                  <div className="lp-ff-grotesk" data-num="" style={{ gridRow: "span 2", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "500", fontSize: "clamp(30px,3.6vw,60px)", lineHeight: "1", letterSpacing: "-.02em", color: "transparent", WebkitTextStroke: "1px var(--fg)", transition: "transform .5s cubic-bezier(.22,1,.36,1)" }}>
                    01
                  </div>
                  <h3 data-z="" style={{ margin: "0", fontWeight: "600", fontSize: "clamp(22px,2vw,30px)", lineHeight: "1.1", letterSpacing: ".02em", transition: "transform .5s cubic-bezier(.22,1,.36,1)", textTransform: "uppercase" }}>
                    Buy as one
                  </h3>
                  <p style={{ margin: "0", fontSize: "15px", lineHeight: "1.65", color: "rgba(var(--fg-rgb),.72)", maxWidth: "440px", textWrap: "pretty", gridColumn: "2" }}>
                    Members pool in and buy the NFT together.
                  </p>
                </div>
              </div>
            </div>
            <div data-rv="" style={{ opacity: "0", transform: "translateY(28px)", transition: "opacity 1s cubic-bezier(.22,1,.36,1) .12s,transform 1s cubic-bezier(.22,1,.36,1) .12s", perspective: "900px" }}>
              <div style={{ height: "100%" }}>
                <div data-step="" style={{ position: "relative", height: "100%", boxSizing: "border-box", display: "grid", gridTemplateColumns: "auto minmax(0,1fr)", columnGap: "clamp(20px,3vw,36px)", rowGap: "8px", alignItems: "baseline", padding: "clamp(16px,2vw,26px) clamp(16px,2vw,28px)", border: "1px solid rgba(var(--fg-rgb),.1)", borderRadius: "14px", background: "rgba(var(--panel-rgb),.55)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", transformStyle: "preserve-3d", transition: "transform .5s cubic-bezier(.22,1,.36,1),border-color .4s", overflow: "hidden" }}>
                  <div data-glow="" style={{ position: "absolute", inset: "0", opacity: "0", transition: "opacity .4s", pointerEvents: "none", background: "radial-gradient(260px circle at 50% 50%,rgba(var(--accent-rgb),.16),transparent 70%)" }}></div>
                  <div data-line="" style={{ position: "absolute", left: "0", top: "0", height: "2px", width: "28%", background: "linear-gradient(90deg,var(--accent),#3d6dff)", transition: "width .6s cubic-bezier(.22,1,.36,1)" }}></div>
                  <div className="lp-ff-grotesk" data-num="" style={{ gridRow: "span 2", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "500", fontSize: "clamp(30px,3.6vw,60px)", lineHeight: "1", letterSpacing: "-.02em", color: "transparent", WebkitTextStroke: "1px var(--fg)", transition: "transform .5s cubic-bezier(.22,1,.36,1)" }}>
                    02
                  </div>
                  <h3 data-z="" style={{ margin: "0", fontWeight: "600", fontSize: "clamp(22px,2vw,30px)", lineHeight: "1.1", letterSpacing: ".02em", transition: "transform .5s cubic-bezier(.22,1,.36,1)", textTransform: "uppercase" }}>
                    We co-own
                  </h3>
                  <p style={{ margin: "0", fontSize: "15px", lineHeight: "1.65", color: "rgba(var(--fg-rgb),.72)", maxWidth: "440px", textWrap: "pretty", gridColumn: "2" }}>
                    Every member holds a real share of that asset.
                  </p>
                </div>
              </div>
            </div>
            <div data-rv="" style={{ opacity: "0", transform: "translateY(28px)", transition: "opacity 1s cubic-bezier(.22,1,.36,1) .24s,transform 1s cubic-bezier(.22,1,.36,1) .24s", perspective: "900px" }}>
              <div style={{ height: "100%" }}>
                <div data-step="" style={{ position: "relative", height: "100%", boxSizing: "border-box", display: "grid", gridTemplateColumns: "auto minmax(0,1fr)", columnGap: "clamp(20px,3vw,36px)", rowGap: "8px", alignItems: "baseline", padding: "clamp(16px,2vw,26px) clamp(16px,2vw,28px)", border: "1px solid rgba(var(--fg-rgb),.1)", borderRadius: "14px", background: "rgba(var(--panel-rgb),.55)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", transformStyle: "preserve-3d", transition: "transform .5s cubic-bezier(.22,1,.36,1),border-color .4s", overflow: "hidden" }}>
                  <div data-glow="" style={{ position: "absolute", inset: "0", opacity: "0", transition: "opacity .4s", pointerEvents: "none", background: "radial-gradient(260px circle at 50% 50%,rgba(var(--accent-rgb),.16),transparent 70%)" }}></div>
                  <div data-line="" style={{ position: "absolute", left: "0", top: "0", height: "2px", width: "28%", background: "linear-gradient(90deg,var(--accent),#3d6dff)", transition: "width .6s cubic-bezier(.22,1,.36,1)" }}></div>
                  <div className="lp-ff-grotesk" data-num="" style={{ gridRow: "span 2", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "500", fontSize: "clamp(30px,3.6vw,60px)", lineHeight: "1", letterSpacing: "-.02em", color: "transparent", WebkitTextStroke: "1px var(--fg)", transition: "transform .5s cubic-bezier(.22,1,.36,1)" }}>
                    03
                  </div>
                  <h3 data-z="" style={{ margin: "0", fontWeight: "600", fontSize: "clamp(22px,2vw,30px)", lineHeight: "1.1", letterSpacing: ".02em", transition: "transform .5s cubic-bezier(.22,1,.36,1)", textTransform: "uppercase" }}>
                    We sell
                  </h3>
                  <p style={{ margin: "0", fontSize: "15px", lineHeight: "1.65", color: "rgba(var(--fg-rgb),.72)", maxWidth: "440px", textWrap: "pretty", gridColumn: "2" }}>
                    Exit at a premium. Gains split with everyone in the pool.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {" "}
        <section id="bluechip" data-screen-label="Blue-chip collections" style={{ background: "var(--bg)", padding: "clamp(96px,12vw,160px) clamp(20px,6vw,96px)", display: "flex", flexDirection: "column", gap: "clamp(48px,6vw,80px)", position: "relative", overflow: "hidden" }}>
          <div className="lp-ff-mono" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", fontFamily: "'Space Mono',monospace", fontSize: "clamp(14px,1.3vw,18px)", fontWeight: "700", letterSpacing: ".32em", color: "var(--fg)", position: "absolute", left: "0", right: "0", top: "clamp(36px,4.5vw,60px)", zIndex: "2", pointerEvents: "none" }}>
            <span style={{ width: "40px", height: "1px", background: "rgba(var(--fg-rgb),.5)" }}></span>
            WHAT WE TRADE
            <span style={{ width: "40px", height: "1px", background: "rgba(var(--fg-rgb),.5)" }}></span>
          </div>
          <div style={{ position: "absolute", inset: "0", background: "linear-gradient(180deg,var(--bg) 0%,rgba(var(--bg-rgb),.85) 10%,rgba(var(--bg-rgb),0) 34%,rgba(var(--bg-rgb),0) 78%,var(--bg) 100%),linear-gradient(90deg,rgba(var(--bg-rgb),.8) 0%,rgba(var(--bg-rgb),.3) 45%,rgba(var(--bg-rgb),0) 70%)", pointerEvents: "none" }}></div>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "880px", position: "relative", zIndex: "1" }}>
            <h2 data-rv="" style={{ opacity: "0", transform: "translateY(28px)", transition: "opacity 1s cubic-bezier(.22,1,.36,1),transform 1s cubic-bezier(.22,1,.36,1)", margin: "0", fontWeight: "600", fontSize: "clamp(36px,5.4vw,80px)", lineHeight: "1.04", letterSpacing: "-.02em", textWrap: "balance" }}>
              HNTR trades only blue-chip NFT collections
            </h2>
          </div>
          <div data-bcrow="" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "20px", position: "relative", zIndex: "1" }}>
            <div data-rv="" data-bc="" style={{ opacity: "0", transform: "translateY(28px)", transition: "opacity 1s cubic-bezier(.22,1,.36,1) 0.0s,transform 1s cubic-bezier(.22,1,.36,1) 0.0s", perspective: "900px", boxSizing: "border-box", flex: "0 0 calc(33.333% - 14px)", minWidth: "0" }}>
              <div style={{ height: "100%" }}>
                <div data-step="" style={{ position: "relative", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "26px", padding: "28px 26px 30px", border: "1px solid rgba(var(--fg-rgb),.1)", borderRadius: "14px", background: "rgba(var(--panel-rgb),.55)", transformStyle: "preserve-3d", transition: "transform .5s cubic-bezier(.22,1,.36,1),border-color .4s", overflow: "hidden" }}>
                  <div data-glow="" style={{ position: "absolute", inset: "0", opacity: "0", transition: "opacity .4s", pointerEvents: "none", background: "radial-gradient(260px circle at 50% 50%,rgba(var(--accent-rgb),.16),transparent 70%)" }}></div>
                  <div data-line="" style={{ position: "absolute", left: "0", top: "0", height: "2px", width: "28%", background: "linear-gradient(90deg,var(--accent),#3d6dff)", transition: "width .6s cubic-bezier(.22,1,.36,1)" }}></div>
                  <div style={{ height: "150px", position: "relative", display: "flex", flexDirection: "column", gap: "6px", overflow: "hidden", borderRadius: "12px", maskImage: "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)" }}>
                    <div style={{ display: "flex", gap: "6px", width: "max-content", animation: "auMarquee 26s linear infinite" }}>
                      <img src="/assets/about/ape-01.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-02.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-03.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-04.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-05.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-06.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-07.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-01.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-02.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-03.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-04.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-05.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-06.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-07.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                    </div>
                    <div style={{ display: "flex", gap: "6px", width: "max-content", animation: "auMarqueeR 32s linear infinite" }}>
                      <img src="/assets/about/ape-08.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-09.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-10.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-11.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-12.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-13.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-14.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-08.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-09.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-10.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-11.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-12.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-13.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-14.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                    </div>
                    <div style={{ display: "flex", gap: "6px", width: "max-content", animation: "auMarquee 38s linear infinite" }}>
                      <img src="/assets/about/ape-15.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-16.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-17.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-18.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-19.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-20.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-01.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-15.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-16.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-17.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-18.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-19.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-20.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/ape-01.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                    </div>
                  </div>
                  <h3 data-num="" style={{ margin: "0", fontWeight: "600", fontSize: "20px", lineHeight: "1.25", textWrap: "balance" }}>
                    Bored Ape Yacht Club
                    <span aria-label="Verified" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "17px", height: "17px", borderRadius: "50%", background: "#2081e2", marginLeft: "7px", verticalAlign: "2px" }}>
                      <svg width="10" height="10" viewBox="0 0 10 10">
                        <path d="M2 5.2 L4.1 7.2 L8 2.9" fill="none" stroke="var(--fg)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </span>
                  </h3>
                  <div data-z="" style={{ display: "flex", flexDirection: "column", gap: "6px", transition: "transform .5s cubic-bezier(.22,1,.36,1)" }}>
                    <div className="lp-ff-mono" style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(var(--fg-rgb),.55)" }}>
                      Volume
                    </div>
                    <div className="lp-ff-grotesk" style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "600", fontSize: "clamp(34px,3.2vw,48px)", lineHeight: "1", letterSpacing: "-.02em", color: "var(--accent)" }}>
                      $4B
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "auto" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div className="lp-ff-mono" style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(var(--fg-rgb),.55)" }}>
                          Peak
                        </div>
                        <div style={{ fontSize: "17px", fontWeight: "600" }}>
                          $450,000
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div className="lp-ff-mono" style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(var(--fg-rgb),.55)" }}>
                          Now
                        </div>
                        <div style={{ fontSize: "17px", fontWeight: "600", color: "#F25623" }}>
                          $18,000
                        </div>
                      </div>
                    </div>
                    <div style={{ position: "relative", height: "4px", borderRadius: "2px", background: "rgba(var(--fg-rgb),.12)", overflow: "hidden" }}>
                      <div style={{ position: "absolute", left: "0", top: "0", bottom: "0", width: "4.0%", background: "#F25623", borderRadius: "2px" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div data-rv="" data-bc="" style={{ opacity: "0", transform: "translateY(28px)", transition: "opacity 1s cubic-bezier(.22,1,.36,1) 0.1s,transform 1s cubic-bezier(.22,1,.36,1) 0.1s", perspective: "900px", boxSizing: "border-box", flex: "0 0 calc(33.333% - 14px)", minWidth: "0" }}>
              <div style={{ height: "100%" }}>
                <div data-step="" style={{ position: "relative", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "26px", padding: "28px 26px 30px", border: "1px solid rgba(var(--fg-rgb),.1)", borderRadius: "14px", background: "rgba(var(--panel-rgb),.55)", transformStyle: "preserve-3d", transition: "transform .5s cubic-bezier(.22,1,.36,1),border-color .4s", overflow: "hidden" }}>
                  <div data-glow="" style={{ position: "absolute", inset: "0", opacity: "0", transition: "opacity .4s", pointerEvents: "none", background: "radial-gradient(260px circle at 50% 50%,rgba(var(--accent-rgb),.16),transparent 70%)" }}></div>
                  <div data-line="" style={{ position: "absolute", left: "0", top: "0", height: "2px", width: "28%", background: "linear-gradient(90deg,var(--accent),#3d6dff)", transition: "width .6s cubic-bezier(.22,1,.36,1)" }}></div>
                  <div style={{ height: "150px", position: "relative", display: "flex", flexDirection: "column", gap: "6px", overflow: "hidden", borderRadius: "12px", maskImage: "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)" }}>
                    <div style={{ display: "flex", gap: "6px", width: "max-content", animation: "auMarquee 28s linear infinite" }}>
                      <img src="/assets/about/pudgy-01.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-02.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-03.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-04.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-05.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-06.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-07.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-01.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-02.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-03.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-04.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-05.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-06.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-07.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                    </div>
                    <div style={{ display: "flex", gap: "6px", width: "max-content", animation: "auMarqueeR 34s linear infinite" }}>
                      <img src="/assets/about/pudgy-08.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-09.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-10.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-11.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-12.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-01.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-02.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-08.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-09.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-10.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-11.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-12.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-01.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-02.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                    </div>
                    <div style={{ display: "flex", gap: "6px", width: "max-content", animation: "auMarquee 40s linear infinite" }}>
                      <img src="/assets/about/pudgy-03.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-05.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-07.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-09.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-11.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-12.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-04.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-03.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-05.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-07.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-09.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-11.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-12.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/pudgy-04.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                    </div>
                  </div>
                  <h3 data-num="" style={{ margin: "0", fontWeight: "600", fontSize: "20px", lineHeight: "1.25", textWrap: "balance" }}>
                    Pudgy Penguins
                    <span aria-label="Verified" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "17px", height: "17px", borderRadius: "50%", background: "#2081e2", marginLeft: "7px", verticalAlign: "2px" }}>
                      <svg width="10" height="10" viewBox="0 0 10 10">
                        <path d="M2 5.2 L4.1 7.2 L8 2.9" fill="none" stroke="var(--fg)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </span>
                  </h3>
                  <div data-z="" style={{ display: "flex", flexDirection: "column", gap: "6px", transition: "transform .5s cubic-bezier(.22,1,.36,1)" }}>
                    <div className="lp-ff-mono" style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(var(--fg-rgb),.55)" }}>
                      Volume
                    </div>
                    <div className="lp-ff-grotesk" style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "600", fontSize: "clamp(34px,3.2vw,48px)", lineHeight: "1", letterSpacing: "-.02em", color: "var(--accent)" }}>
                      $1.5B
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "auto" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div className="lp-ff-mono" style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(var(--fg-rgb),.55)" }}>
                          Peak
                        </div>
                        <div style={{ fontSize: "17px", fontWeight: "600" }}>
                          $90,000
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div className="lp-ff-mono" style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(var(--fg-rgb),.55)" }}>
                          Now
                        </div>
                        <div style={{ fontSize: "17px", fontWeight: "600", color: "#F25623" }}>
                          $8,000
                        </div>
                      </div>
                    </div>
                    <div style={{ position: "relative", height: "4px", borderRadius: "2px", background: "rgba(var(--fg-rgb),.12)", overflow: "hidden" }}>
                      <div style={{ position: "absolute", left: "0", top: "0", bottom: "0", width: "8.9%", background: "#F25623", borderRadius: "2px" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div data-rv="" data-bc="" style={{ opacity: "0", transform: "translateY(28px)", transition: "opacity 1s cubic-bezier(.22,1,.36,1) 0.2s,transform 1s cubic-bezier(.22,1,.36,1) 0.2s", perspective: "900px", boxSizing: "border-box", flex: "0 0 calc(33.333% - 14px)", minWidth: "0" }}>
              <div style={{ height: "100%" }}>
                <div data-step="" style={{ position: "relative", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "26px", padding: "28px 26px 30px", border: "1px solid rgba(var(--fg-rgb),.1)", borderRadius: "14px", background: "rgba(var(--panel-rgb),.55)", transformStyle: "preserve-3d", transition: "transform .5s cubic-bezier(.22,1,.36,1),border-color .4s", overflow: "hidden" }}>
                  <div data-glow="" style={{ position: "absolute", inset: "0", opacity: "0", transition: "opacity .4s", pointerEvents: "none", background: "radial-gradient(260px circle at 50% 50%,rgba(var(--accent-rgb),.16),transparent 70%)" }}></div>
                  <div data-line="" style={{ position: "absolute", left: "0", top: "0", height: "2px", width: "28%", background: "linear-gradient(90deg,var(--accent),#3d6dff)", transition: "width .6s cubic-bezier(.22,1,.36,1)" }}></div>
                  <div style={{ height: "150px", position: "relative", display: "flex", flexDirection: "column", gap: "6px", overflow: "hidden", borderRadius: "12px", maskImage: "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)" }}>
                    <div style={{ display: "flex", gap: "6px", width: "max-content", animation: "auMarquee 27s linear infinite" }}>
                      <img src="/assets/about/punk-01.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-02.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-03.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-04.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-05.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-06.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-07.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-01.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-02.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-03.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-04.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-05.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-06.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-07.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                    </div>
                    <div style={{ display: "flex", gap: "6px", width: "max-content", animation: "auMarqueeR 33s linear infinite" }}>
                      <img src="/assets/about/punk-08.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-09.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-10.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-11.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-01.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-03.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-05.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-08.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-09.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-10.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-11.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-01.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-03.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-05.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                    </div>
                    <div style={{ display: "flex", gap: "6px", width: "max-content", animation: "auMarquee 39s linear infinite" }}>
                      <img src="/assets/about/punk-02.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-04.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-06.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-08.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-10.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-11.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-07.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-02.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-04.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-06.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-08.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-10.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-11.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                      <img src="/assets/about/punk-07.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto", imageRendering: "pixelated" }} />
                    </div>
                  </div>
                  <h3 data-num="" style={{ margin: "0", fontWeight: "600", fontSize: "20px", lineHeight: "1.25", textWrap: "balance" }}>
                    CryptoPunks
                    <span aria-label="Verified" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "17px", height: "17px", borderRadius: "50%", background: "#2081e2", marginLeft: "7px", verticalAlign: "2px" }}>
                      <svg width="10" height="10" viewBox="0 0 10 10">
                        <path d="M2 5.2 L4.1 7.2 L8 2.9" fill="none" stroke="var(--fg)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </span>
                  </h3>
                  <div data-z="" style={{ display: "flex", flexDirection: "column", gap: "6px", transition: "transform .5s cubic-bezier(.22,1,.36,1)" }}>
                    <div className="lp-ff-mono" style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(var(--fg-rgb),.55)" }}>
                      Volume
                    </div>
                    <div className="lp-ff-grotesk" style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "600", fontSize: "clamp(34px,3.2vw,48px)", lineHeight: "1", letterSpacing: "-.02em", color: "var(--accent)" }}>
                      $3.3B
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "auto" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div className="lp-ff-mono" style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(var(--fg-rgb),.55)" }}>
                          Peak
                        </div>
                        <div style={{ fontSize: "17px", fontWeight: "600" }}>
                          $500,000
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div className="lp-ff-mono" style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(var(--fg-rgb),.55)" }}>
                          Now
                        </div>
                        <div style={{ fontSize: "17px", fontWeight: "600", color: "#F25623" }}>
                          $70,000
                        </div>
                      </div>
                    </div>
                    <div style={{ position: "relative", height: "4px", borderRadius: "2px", background: "rgba(var(--fg-rgb),.12)", overflow: "hidden" }}>
                      <div style={{ position: "absolute", left: "0", top: "0", bottom: "0", width: "14.0%", background: "#F25623", borderRadius: "2px" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div data-rv="" data-bc="" style={{ opacity: "0", transform: "translateY(28px)", transition: "opacity 1s cubic-bezier(.22,1,.36,1) 0.3s,transform 1s cubic-bezier(.22,1,.36,1) 0.3s", perspective: "900px", boxSizing: "border-box", flex: "0 0 calc(33.333% - 14px)", minWidth: "0" }}>
              <div style={{ height: "100%" }}>
                <div data-step="" style={{ position: "relative", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "26px", padding: "28px 26px 30px", border: "1px solid rgba(var(--fg-rgb),.1)", borderRadius: "14px", background: "rgba(var(--panel-rgb),.55)", transformStyle: "preserve-3d", transition: "transform .5s cubic-bezier(.22,1,.36,1),border-color .4s", overflow: "hidden" }}>
                  <div data-glow="" style={{ position: "absolute", inset: "0", opacity: "0", transition: "opacity .4s", pointerEvents: "none", background: "radial-gradient(260px circle at 50% 50%,rgba(var(--accent-rgb),.16),transparent 70%)" }}></div>
                  <div data-line="" style={{ position: "absolute", left: "0", top: "0", height: "2px", width: "28%", background: "linear-gradient(90deg,var(--accent),#3d6dff)", transition: "width .6s cubic-bezier(.22,1,.36,1)" }}></div>
                  <div style={{ height: "150px", position: "relative", display: "flex", flexDirection: "column", gap: "6px", overflow: "hidden", borderRadius: "12px", maskImage: "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)" }}>
                    <div style={{ display: "flex", gap: "6px", width: "max-content", animation: "auMarquee 29s linear infinite" }}>
                      <img src="/assets/about/azuki-01.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-02.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-03.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-04.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-05.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-06.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-07.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-01.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-02.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-03.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-04.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-05.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-06.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-07.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                    </div>
                    <div style={{ display: "flex", gap: "6px", width: "max-content", animation: "auMarqueeR 35s linear infinite" }}>
                      <img src="/assets/about/azuki-08.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-09.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-10.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-11.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-01.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-03.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-05.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-08.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-09.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-10.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-11.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-01.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-03.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-05.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                    </div>
                    <div style={{ display: "flex", gap: "6px", width: "max-content", animation: "auMarquee 41s linear infinite" }}>
                      <img src="/assets/about/azuki-02.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-04.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-06.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-08.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-10.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-11.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-09.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-02.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-04.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-06.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-08.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-10.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-11.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                      <img src="/assets/about/azuki-09.avif" alt="" style={{ width: "44px", height: "44px", borderRadius: "9px", objectFit: "cover", display: "block", flex: "0 0 auto" }} />
                    </div>
                  </div>
                  <h3 data-num="" style={{ margin: "0", fontWeight: "600", fontSize: "20px", lineHeight: "1.25", textWrap: "balance" }}>
                    Azuki
                    <span aria-label="Verified" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "17px", height: "17px", borderRadius: "50%", background: "#2081e2", marginLeft: "7px", verticalAlign: "2px" }}>
                      <svg width="10" height="10" viewBox="0 0 10 10">
                        <path d="M2 5.2 L4.1 7.2 L8 2.9" fill="none" stroke="var(--fg)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </span>
                  </h3>
                  <div data-z="" style={{ display: "flex", flexDirection: "column", gap: "6px", transition: "transform .5s cubic-bezier(.22,1,.36,1)" }}>
                    <div className="lp-ff-mono" style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(var(--fg-rgb),.55)" }}>
                      Volume
                    </div>
                    <div className="lp-ff-grotesk" style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "600", fontSize: "clamp(34px,3.2vw,48px)", lineHeight: "1", letterSpacing: "-.02em", color: "var(--accent)" }}>
                      $1B
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "auto" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div className="lp-ff-mono" style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(var(--fg-rgb),.55)" }}>
                          Peak
                        </div>
                        <div style={{ fontSize: "17px", fontWeight: "600" }}>
                          $110,000
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div className="lp-ff-mono" style={{ fontFamily: "'Space Mono',monospace", fontSize: "11px", letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(var(--fg-rgb),.55)" }}>
                          Now
                        </div>
                        <div style={{ fontSize: "17px", fontWeight: "600", color: "#F25623" }}>
                          $1,800
                        </div>
                      </div>
                    </div>
                    <div style={{ position: "relative", height: "4px", borderRadius: "2px", background: "rgba(var(--fg-rgb),.12)", overflow: "hidden" }}>
                      <div style={{ position: "absolute", left: "0", top: "0", bottom: "0", width: "1.6%", background: "#F25623", borderRadius: "2px" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {" "}
        <section id="what" data-screen-label="Mechanism" style={{ position: "relative", background: "var(--bg)", padding: "clamp(96px,12vw,160px) clamp(20px,6vw,96px)", overflow: "hidden" }}>
          <div className="sc-host-x" style={{ position: "absolute", inset: "0" }}>
            <hntr-gears></hntr-gears>
          </div>
          {" "}
          <div style={{ position: "absolute", inset: "0", background: "radial-gradient(ellipse 55% 50% at 50% 55%,rgba(var(--bg-rgb),.7),rgba(var(--bg-rgb),.35) 60%,rgba(var(--bg-rgb),0) 100%),linear-gradient(180deg,var(--bg) 0%,rgba(var(--bg-rgb),0) 22%,rgba(var(--bg-rgb),0) 78%,var(--bg) 100%)", pointerEvents: "none" }}></div>
          {" "}
          <div style={{ position: "relative", maxWidth: "1240px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "clamp(36px,5vw,64px)" }}>
            <div data-rv="" style={{ opacity: "0", transform: "translateY(28px)", transition: "opacity .9s cubic-bezier(.22,1,.36,1),transform .9s cubic-bezier(.22,1,.36,1)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "20px", maxWidth: "760px", alignSelf: "center" }}>
              <div className="lp-ff-mono" style={{ display: "flex", alignItems: "center", gap: "16px", fontFamily: "'Space Mono',monospace", fontSize: "clamp(14px,1.3vw,18px)", fontWeight: "700", letterSpacing: ".32em", color: "var(--fg)" }}>
                <span style={{ width: "40px", height: "1px", background: "rgba(var(--fg-rgb),.5)" }}></span>
                MECHANISM
                <span style={{ width: "40px", height: "1px", background: "rgba(var(--fg-rgb),.5)" }}></span>
              </div>
              <h2 style={{ margin: "0", fontWeight: "600", fontSize: "clamp(40px,5.4vw,80px)", lineHeight: "1", letterSpacing: "-.015em" }}>
                NFT STRATEGY
              </h2>
              <p style={{ margin: "0", fontSize: "clamp(15px,1.25vw,18px)", lineHeight: "1.65", color: "rgba(var(--fg-rgb),.75)", maxWidth: "620px", textWrap: "pretty" }}>
                An automatic technology designed to buy NFTs, sell them for profit, and share the proceeds with the community.{" "}
                <strong style={{ color: "#f25623", fontWeight: "700" }}>
                  Decentralised and automated.
                </strong>
              </p>
            </div>
            <div id="mech-grid" data-rv="" style={{ opacity: "0", transform: "translateY(28px)", transition: "opacity 1s cubic-bezier(.22,1,.36,1) .15s,transform 1s cubic-bezier(.22,1,.36,1) .15s", display: "grid", gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr)", alignItems: "center", justifyItems: "center", gap: "clamp(16px,2.6vw,40px)" }}>
              <div></div>
              <div style={{ textAlign: "center", maxWidth: "300px", justifySelf: "center" }}>
                <div className="lp-ff-grotesk" style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "clamp(19px,1.9vw,26px)", letterSpacing: ".01em", textTransform: "uppercase", animation: "hStation 11s 0s linear infinite" }}>
                  Pool open
                </div>
                {" "}
                <div className="lp-ff-mono" style={{ fontFamily: "'Space Mono',monospace", fontSize: "12px", lineHeight: "1.55", letterSpacing: ".06em", textTransform: "uppercase", marginTop: "8px", textWrap: "pretty", animation: "hStationBody 11s 0s linear infinite" }}>
                  Members deposit ETH into the pool.
                </div>
              </div>
              <div></div>
              <div style={{ textAlign: "right", maxWidth: "300px", justifySelf: "end" }}>
                <div className="lp-ff-grotesk" style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "clamp(19px,1.9vw,26px)", letterSpacing: ".01em", textTransform: "uppercase", animation: "hStation 11s -2.75s linear infinite" }}>
                  Profit sharing
                </div>
                {" "}
                <div className="lp-ff-mono" style={{ fontFamily: "'Space Mono',monospace", fontSize: "12px", lineHeight: "1.55", letterSpacing: ".06em", textTransform: "uppercase", marginTop: "8px", textWrap: "pretty", animation: "hStationBody 11s -2.75s linear infinite" }}>
                  Deposit plus profit back to members.
                </div>
              </div>
              <div id="mech-ring" style={{ position: "relative", width: "clamp(200px,24vw,320px)", aspectRatio: "1" }}>
                <div style={{ position: "absolute", inset: "0", borderRadius: "50%", border: "1px dashed rgba(var(--accent-rgb),.35)", animation: "hRingSpin 60s linear infinite" }}></div>
                {" "}
                <div style={{ position: "absolute", inset: "14%", borderRadius: "50%", border: "1px solid rgba(var(--accent-rgb),.12)" }}></div>
                {" "}
                <div style={{ position: "absolute", inset: "0", transform: "rotate(0deg)" }}>
                  <div style={{ position: "absolute", left: "50%", top: "-6px", marginLeft: "-6px", width: "12px", height: "12px", borderRadius: "50%", background: "var(--node)", border: "1px solid rgba(var(--accent-rgb),.5)", animation: "hNode 11s 0s ease-out infinite" }}></div>
                </div>
                <div style={{ position: "absolute", inset: "0", transform: "rotate(90deg)" }}>
                  <div style={{ position: "absolute", left: "50%", top: "-6px", marginLeft: "-6px", width: "12px", height: "12px", borderRadius: "50%", background: "var(--node)", border: "1px solid rgba(var(--accent-rgb),.5)", animation: "hNode 11s 2.75s ease-out infinite" }}></div>
                </div>
                <div style={{ position: "absolute", inset: "0", transform: "rotate(180deg)" }}>
                  <div style={{ position: "absolute", left: "50%", top: "-6px", marginLeft: "-6px", width: "12px", height: "12px", borderRadius: "50%", background: "var(--node)", border: "1px solid rgba(var(--accent-rgb),.5)", animation: "hNode 11s 5.5s ease-out infinite" }}></div>
                </div>
                <div style={{ position: "absolute", inset: "0", transform: "rotate(270deg)" }}>
                  <div style={{ position: "absolute", left: "50%", top: "-6px", marginLeft: "-6px", width: "12px", height: "12px", borderRadius: "50%", background: "var(--node)", border: "1px solid rgba(var(--accent-rgb),.5)", animation: "hNode 11s 8.25s ease-out infinite" }}></div>
                </div>
                {" "}
                <div style={{ position: "absolute", inset: "0", animation: "hStep 11s cubic-bezier(.83,0,.17,1) infinite" }}>
                  <div style={{ position: "absolute", inset: "-1px", borderRadius: "50%", background: "conic-gradient(from 250deg,rgba(var(--accent-rgb),0) 0deg,rgba(var(--accent-rgb),.95) 110deg,rgba(var(--accent-rgb),0) 110.5deg)", WebkitMask: "radial-gradient(farthest-side,transparent calc(100% - 3px),#000 calc(100% - 2.5px))", mask: "radial-gradient(farthest-side,transparent calc(100% - 3px),#000 calc(100% - 2.5px))", filter: "drop-shadow(0 0 6px rgba(var(--accent-rgb),.8))" }}></div>
                  {" "}
                  <div style={{ position: "absolute", left: "50%", top: "-9px", marginLeft: "-9px", width: "18px", height: "18px", borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 0 6px rgba(var(--accent-rgb),.14),0 0 22px rgba(var(--accent-rgb),.75)" }}></div>
                </div>
                {" "}
                <div style={{ position: "absolute", inset: "26%", borderRadius: "50%", background: "radial-gradient(circle at 50% 40%,var(--core1),var(--core2))", border: "1px solid rgba(var(--accent-rgb),.25)", boxShadow: "0 0 50px rgba(61,209,255,.18),inset 0 0 30px rgba(var(--accent-rgb),.06)", display: "flex", alignItems: "center", justifyContent: "center", animation: "hCore 2.75s ease-out infinite" }}>
                  <img src="/assets/v2/hntr-dark/8b857621.png" alt="HNTR" style={{ width: "44%", height: "44%", objectFit: "contain", display: "block" }} />
                </div>
              </div>
              <div style={{ textAlign: "left", maxWidth: "300px", justifySelf: "start" }}>
                <div className="lp-ff-grotesk" style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "clamp(19px,1.9vw,26px)", letterSpacing: ".01em", textTransform: "uppercase", animation: "hStation 11s -8.25s linear infinite" }}>
                  Buy NFT
                </div>
                {" "}
                <div className="lp-ff-mono" style={{ fontFamily: "'Space Mono',monospace", fontSize: "12px", lineHeight: "1.55", letterSpacing: ".06em", textTransform: "uppercase", marginTop: "8px", textWrap: "pretty", animation: "hStationBody 11s -8.25s linear infinite" }}>
                  Target: Cheapest blue chip NFT available on OpenSea.
                </div>
              </div>
              <div></div>
              <div style={{ textAlign: "center", maxWidth: "300px", justifySelf: "center" }}>
                <div className="lp-ff-grotesk" style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "clamp(19px,1.9vw,26px)", letterSpacing: ".01em", textTransform: "uppercase", animation: "hStation 11s -5.5s linear infinite" }}>
                  Sell higher
                </div>
                {" "}
                <div className="lp-ff-mono" style={{ fontFamily: "'Space Mono',monospace", fontSize: "12px", lineHeight: "1.55", letterSpacing: ".06em", textTransform: "uppercase", marginTop: "8px", textWrap: "pretty", animation: "hStationBody 11s -5.5s linear infinite" }}>
                  Resold at a higher price.
                </div>
              </div>
              <div></div>
            </div>
          </div>
        </section>
        {" "}
        <section id="network" data-screen-label="Network" style={{ background: "var(--bg)", position: "relative", minHeight: "100vh", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,440px),1fr))", alignItems: "center", gap: "clamp(32px,5vw,72px)", overflow: "hidden", padding: "clamp(96px,12vw,160px) clamp(20px,6vw,96px)" }}>
          <div className="lp-ff-mono" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", fontFamily: "'Space Mono',monospace", fontSize: "clamp(14px,1.3vw,18px)", fontWeight: "700", letterSpacing: ".32em", color: "var(--fg)", position: "absolute", left: "0", right: "0", top: "clamp(36px,4.5vw,60px)", zIndex: "2", pointerEvents: "none" }}>
            <span style={{ width: "40px", height: "1px", background: "rgba(var(--fg-rgb),.5)" }}></span>
            NETWORK
            <span style={{ width: "40px", height: "1px", background: "rgba(var(--fg-rgb),.5)" }}></span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(20px,2.4vw,28px)", position: "relative", zIndex: "1", maxWidth: "580px" }}>
            <h2 data-rv="" style={{ opacity: "0", transform: "translateY(28px)", transition: "opacity 1s cubic-bezier(.22,1,.36,1) 0.12s,transform 1s cubic-bezier(.22,1,.36,1) 0.12s", margin: "0", fontWeight: "600", fontSize: "clamp(34px,4.4vw,64px)", lineHeight: "1.04", letterSpacing: "-.02em", textWrap: "balance" }}>
              Shared by people, not burned on ads.
            </h2>
            <p data-rv="" style={{ opacity: "0", transform: "translateY(28px)", transition: "opacity 1s cubic-bezier(.22,1,.36,1) 0.24s,transform 1s cubic-bezier(.22,1,.36,1) 0.24s", margin: "0", fontSize: "clamp(16px,1.3vw,18px)", lineHeight: "1.65", color: "rgba(var(--fg-rgb),.72)", textWrap: "pretty" }}>
              HNTR is a global movement built to bring NFTs to a mainstream audience. We educate people, then give them a fair way in: co-own high-value digital assets instead of watching from the sidelines. Share it. Grow the pool. Get rewarded for doing so.
            </p>
            <div data-rv="" style={{ opacity: "0", transform: "translateY(28px)", transition: "opacity 1s cubic-bezier(.22,1,.36,1) 0.36s,transform 1s cubic-bezier(.22,1,.36,1) 0.36s", display: "flex", marginTop: "8px" }}>
              <a className="lp-h4 lp-ff-grotesk" href="/home" style={{ display: "inline-flex", alignItems: "center", gap: "10px", height: "58px", padding: "0 36px", borderRadius: "10px", background: "#fff", color: "#000", fontFamily: "'Space Grotesk',sans-serif", fontWeight: "700", fontSize: "17px", letterSpacing: ".02em", transition: "background .2s,transform .2s" }}>
                Launch Platform →
              </a>
            </div>
          </div>
          <div style={{ position: "relative", aspectRatio: "1", width: "100%", maxWidth: "820px", justifySelf: "center" }}>
            <div className="sc-host-x" style={{ position: "absolute", inset: "0" }}>
              <hntr-globe></hntr-globe>
            </div>
          </div>
        </section>
        {" "}
        <footer style={{ borderTop: "1px solid rgba(var(--fg-rgb),.08)", padding: "clamp(48px,6vw,80px) clamp(20px,6vw,96px) clamp(36px,4vw,56px)", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "clamp(40px,6vw,72px)" }}>
          <a href="#top" style={{ display: "flex", alignItems: "center", gap: "16px", color: "var(--fg)" }}>
            <img src="/assets/v2/hntr-dark/8b857621.png" alt="" style={{ width: "clamp(44px,4vw,56px)", height: "clamp(44px,4vw,56px)", objectFit: "contain" }} />
            <span className="lp-ff-grotesk" style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: "500", fontSize: "clamp(36px,3.6vw,52px)", lineHeight: "1", letterSpacing: ".06em" }}>
              HNTR
            </span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <a className="lp-h5" href={TELEGRAM_URL} {...external(TELEGRAM_URL)} aria-label="Telegram" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", borderRadius: "50%", background: "var(--fg)", color: "var(--bg)", transition: "background .2s,color .2s" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.4 4.2 2.9 11.3c-1.3.5-1.3 1.2-.2 1.6l4.7 1.5 1.8 5.6c.2.6.1.9.8.9.5 0 .7-.2 1-.5l2.3-2.2 4.8 3.5c.9.5 1.5.2 1.7-.8l3.1-14.8c.3-1.3-.5-1.9-1.5-1.4zM8.7 14.1l9.9-6.2c.5-.3.9-.1.5.2l-8.4 7.6-.3 3.5-1.7-5.1z"></path>
              </svg>
            </a>
            <a className="lp-h6" href={DISCORD_URL} {...external(DISCORD_URL)} aria-label="Discord" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", borderRadius: "50%", background: "var(--fg)", color: "var(--bg)", transition: "background .2s,color .2s" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd">
                <path d="M19.3 5.3A16.6 16.6 0 0 0 15.2 4l-.5 1a15.4 15.4 0 0 0-5.4 0l-.5-1a16.6 16.6 0 0 0-4.1 1.3C2.1 9.2 1.4 13 1.7 16.7a16.7 16.7 0 0 0 5 2.5l1.1-1.7a10.8 10.8 0 0 1-1.7-.8l.4-.3a11.9 11.9 0 0 0 11 0l.4.3c-.5.3-1.1.6-1.7.8l1.1 1.7a16.7 16.7 0 0 0 5-2.5c.4-4.3-.7-8-2.9-11.4zM8.7 14.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm6.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z"></path>
              </svg>
            </a>
          </div>
          <div className="lp-ff-poppins" style={{ fontFamily: "'Poppins',sans-serif", fontSize: "15px", color: "rgba(var(--fg-rgb),.55)" }}>
            © 2026 HNTR.art All rights reserved
          </div>
        </footer>
      </div>
    </div>
  );
}
