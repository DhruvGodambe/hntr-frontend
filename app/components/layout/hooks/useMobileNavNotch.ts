"use client";

import { useEffect, type RefObject } from "react";
import { MOBILE_MQ } from "../constants";
import { buildNavBarPath } from "../utils";

export function useMobileNavNotch(
  bottomNavRef: RefObject<HTMLDivElement>,
  navBarPathRef: RefObject<SVGPathElement>,
  pathname: string,
  currentPage: string,
) {
  useEffect(() => {
    const updateActiveNotch = () => {
      const nav = bottomNavRef.current;
      const path = navBarPathRef.current;
      if (!nav || !path || !window.matchMedia(MOBILE_MQ).matches) return;

      const barWidth = nav.clientWidth;
      const active = nav.querySelector<HTMLElement>(".mobile-nav-track .si.active");
      const svg = nav.querySelector<SVGSVGElement>(".mobile-nav-shape");

      if (svg && barWidth > 0) {
        svg.setAttribute("viewBox", `0 0 ${barWidth} 64`);
      }

      if (!active) {
        nav.style.removeProperty("--nav-notch-x");
        path.setAttribute("d", buildNavBarPath(barWidth, barWidth / 2, false));
        return;
      }

      const navRect = nav.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();
      const x = activeRect.left + activeRect.width / 2 - navRect.left;
      nav.style.setProperty("--nav-notch-x", `${x}px`);
      path.setAttribute("d", buildNavBarPath(barWidth, x, true));
    };

    updateActiveNotch();
    window.addEventListener("resize", updateActiveNotch);
    const mq = window.matchMedia(MOBILE_MQ);
    mq.addEventListener("change", updateActiveNotch);

    return () => {
      window.removeEventListener("resize", updateActiveNotch);
      mq.removeEventListener("change", updateActiveNotch);
    };
  }, [bottomNavRef, navBarPathRef, pathname, currentPage]);
}
