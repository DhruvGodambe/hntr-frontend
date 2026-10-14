"use client";

import { useEffect } from "react";

type RGB = number[];

const rgb = (s: string): RGB | null => {
  const m = s.match(/[\d.]+/g);
  return m ? m.map(Number) : null;
};

const lum = (c: RGB) => {
  const a = c.slice(0, 3).map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
};

function bgOf(el: Element | null): RGB | null {
  while (el) {
    const cs = getComputedStyle(el);
    const c = rgb(cs.backgroundColor);
    if (c && (c[3] === undefined || c[3] > 0.85)) return c;
    if (cs.backgroundImage !== "none") return null;
    el = el.parentElement;
  }
  return null;
}

const isGrey = (c: RGB) => Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2]) < 28;

/**
 * V2 contrast guard: grey text on the active page that falls below 4.5:1 against
 * its background is lifted to the design's secondary colours (#a8a8b0 dark /
 * #55555c light). Same rule the V2 prototype applies at runtime.
 */
export function useContrastFix(isDark: boolean) {
  useEffect(() => {
    const theme = isDark ? "d" : "l";
    const run = () => {
      const panel = document.querySelector(".page-panel.active");
      if (!panel) return;
      panel.querySelectorAll<HTMLElement>("*").forEach((e) => {
        if (e.dataset.cfx === theme) return;
        if (e.dataset.cfx) {
          e.style.removeProperty("color");
          delete e.dataset.cfx;
        }
        if (!e.offsetWidth || e.closest(".pd-soon,.se-holo,button,.nfx,.lc,.sc,.vc,.sdc,.nc")) return;
        if (!Array.from(e.childNodes).some((x) => x.nodeType === 3 && (x.textContent ?? "").trim().length > 1)) return;
        const c = rgb(getComputedStyle(e).color);
        const b = bgOf(e);
        if (!c || !b || !isGrey(c)) return;
        const a = c[3] === undefined ? 1 : c[3];
        const fc = [0, 1, 2].map((k) => c[k] * a + b[k] * (1 - a));
        const L1 = lum(fc);
        const L2 = lum(b);
        const cr = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
        if (cr >= 4.5) return;
        e.style.setProperty("color", lum(b) < 0.3 ? "#a8a8b0" : "#55555c", "important");
        e.dataset.cfx = theme;
      });
    };
    const first = window.setTimeout(run, 1200);
    const iv = window.setInterval(run, 2000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(iv);
    };
  }, [isDark]);
}
