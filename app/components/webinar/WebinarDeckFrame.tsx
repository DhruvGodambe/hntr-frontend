"use client";

import { useEffect, useRef } from "react";
import { SHELL_MOBILE_MQ } from "../layout/constants";

/**
 * The V2 business presentation (v4), copied from "About Us v4.dc.html" / "About Us v4 Dark.dc.html".
 * Like V2 the deck follows the app theme: light file in light mode, dark file in dark mode.
 */
export const WEBINAR_DECK_LIGHT = "/assets/webinar-deck-v4.html";
export const WEBINAR_DECK_DARK = "/assets/webinar-deck-v4-dark.html";

// Same tweak V2 injects into the embedded deck on phones: drop the header CTA/share/kicker
// so the slide counter and language picker fit the narrow bar.
const MOBILE_DECK_CSS =
  "#au-cta,#au-share,#au-share+*{display:none!important}#au-kicker{display:none!important}#au-count{white-space:nowrap!important;font-size:13px!important}" +
  "div:has(>#au-kicker){display:none!important}" +
  "div:has(>div>#au-lang){background:transparent!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;border:0!important;justify-content:flex-end!important;height:52px!important;padding:0 12px!important;pointer-events:none}" +
  "div:has(>#au-lang){pointer-events:auto;gap:8px!important}";

/** App theme: `body.dark` inside the app shell, saved `hntrTheme` (default dark) on shell-less pages. */
function appIsDark(): boolean {
  if (document.body.classList.contains("dark")) return true;
  if (typeof window.setHntrTheme === "function") return false;
  try {
    return localStorage.getItem("hntrTheme") !== "light";
  } catch {
    return true;
  }
}

const deckFor = (dark: boolean) => (dark ? WEBINAR_DECK_DARK : WEBINAR_DECK_LIGHT);

export default function WebinarDeckFrame({ className = "au-frame", style }: { className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    const mq = window.matchMedia(SHELL_MOBILE_MQ);
    const timers: number[] = [];

    const applyMobile = () => {
      try {
        const d = frame.contentDocument;
        if (!d?.head) return;
        const existing = d.getElementById("auMob");
        if (mq.matches && !existing) {
          const s = d.createElement("style");
          s.id = "auMob";
          s.textContent = MOBILE_DECK_CSS;
          d.head.appendChild(s);
        } else if (!mq.matches && existing) {
          existing.remove();
        }
      } catch {
        /* frame not ready */
      }
    };

    // Load the deck that matches the app theme; when the theme flips later, swap files
    // but keep the slide hash so the viewer stays on the same slide.
    const syncTheme = () => {
      const want = deckFor(appIsDark());
      let current = "";
      try {
        current = frame.contentWindow?.location.pathname ?? "";
      } catch {
        /* cross-origin / not ready */
      }
      if (current === want) return;
      const pending = frame.getAttribute("src") ?? "";
      if (pending.split("#")[0] === want) return;
      let hash = "";
      try {
        hash = current ? frame.contentWindow?.location.hash ?? "" : "";
      } catch {
        /* ignore */
      }
      frame.src = want + hash;
    };

    // The deck's own light/dark toggle navigates the frame to the other file; mirror that
    // choice into the app theme so the two never disagree.
    const mirrorToApp = () => {
      try {
        const path = frame.contentWindow?.location.pathname;
        if (path !== WEBINAR_DECK_DARK && path !== WEBINAR_DECK_LIGHT) return;
        const dark = path === WEBINAR_DECK_DARK;
        if (dark !== appIsDark() && typeof window.setHntrTheme === "function") window.setHntrTheme(dark ? "dark" : "light");
      } catch {
        /* frame not ready */
      }
    };

    // The frame may finish loading before hydration (so no load event reaches us):
    // apply now, on every load, and once more after the deck runtime has rendered.
    const onLoad = () => {
      applyMobile();
      mirrorToApp();
      timers.push(window.setTimeout(applyMobile, 800));
    };

    syncTheme();
    frame.addEventListener("load", onLoad);
    mq.addEventListener("change", applyMobile);
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => {
      frame.removeEventListener("load", onLoad);
      mq.removeEventListener("change", applyMobile);
      observer.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  return (
    <iframe
      ref={ref}
      className={className}
      title="HNTR Business Presentation"
      allow="autoplay; clipboard-write; web-share"
      style={style}
    />
  );
}
