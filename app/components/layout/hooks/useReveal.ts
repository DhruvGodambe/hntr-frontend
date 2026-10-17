"use client";

import { useEffect } from "react";

/**
 * V2 scroll-reveal: blocks in the active page feed fade/slide in (`.rv` → `.rv-in`)
 * as they enter the viewport. Tall containers are descended into so their children
 * reveal individually. Ported from the V2 prototype; `prefers-reduced-motion` is
 * handled in CSS.
 */
export function useReveal(routeKey: string) {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          const siblings = Array.from(el.parentNode?.children ?? []).filter(
            (c) => c.classList.contains("rv") && !c.classList.contains("rv-in"),
          );
          el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 3) * 70}ms`;
          el.classList.add("rv-in");
          io.unobserve(el);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );

    const walk = (container: Element, depth: number) => {
      Array.from(container.children).forEach((child) => {
        const el = child as HTMLElement;
        if (/^(STYLE|SCRIPT|TEMPLATE)$/.test(el.tagName) || el.classList.contains("hf") || el.closest(".modal,[id$=Modal],[id$=Overlay]")) return;
        const h = el.getBoundingClientRect().height;
        if (!h) return;
        const kids = Array.from(el.children).filter((k) => !/^(STYLE|SCRIPT)$/.test(k.tagName));
        if (depth < 5 && kids.length > 1 && h > window.innerHeight * 0.9) {
          el.classList.remove("rv", "rv-in");
          walk(el, depth + 1);
        } else if (!el.classList.contains("rv")) {
          el.classList.add("rv");
          io.observe(el);
        }
      });
    };

    // Let the page paint its first data before arming, like V2 does after `go()`.
    const raf = requestAnimationFrame(() => {
      const panel = document.querySelector(".page-panel.active");
      if (!panel) return;
      walk(panel.querySelector(".feed") || panel, 0);
    });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      // Anything left un-revealed must not stay invisible after unmount/re-arm.
      document.querySelectorAll(".page-panel .rv:not(.rv-in)").forEach((el) => el.classList.add("rv-in"));
    };
  }, [routeKey]);
}
