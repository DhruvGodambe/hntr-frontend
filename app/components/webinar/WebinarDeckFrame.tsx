"use client";

import { useEffect, useRef } from "react";
import { SHELL_MOBILE_MQ } from "../layout/constants";

/** The V2 business presentation (copied from "About Us.dc.html"; see public/assets/webinar-deck.html). */
export const WEBINAR_DECK_SRC = "/assets/webinar-deck.html";

// Same tweak V2 injects into the embedded deck on phones: drop the header CTA/share/kicker
// so the slide counter and language picker fit the narrow bar.
const MOBILE_DECK_CSS =
  "#au-cta,#au-share,#au-share+*{display:none!important}#au-kicker{display:none!important}#au-count{white-space:nowrap!important;font-size:13px!important}";

export default function WebinarDeckFrame({ className = "au-frame", style }: { className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    const mq = window.matchMedia(SHELL_MOBILE_MQ);
    const timers: number[] = [];

    const apply = () => {
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
    // The frame may finish loading before hydration (so no load event reaches us):
    // apply now, on every load, and once more after the deck runtime has rendered.
    const onLoad = () => {
      apply();
      timers.push(window.setTimeout(apply, 800));
    };
    onLoad();
    frame.addEventListener("load", onLoad);
    mq.addEventListener("change", apply);
    return () => {
      frame.removeEventListener("load", onLoad);
      mq.removeEventListener("change", apply);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  return (
    <iframe
      ref={ref}
      className={className}
      title="HNTR Business Presentation"
      allow="autoplay; clipboard-write; web-share"
      src={WEBINAR_DECK_SRC}
      style={style}
    />
  );
}
