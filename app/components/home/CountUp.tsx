"use client";

import { useEffect, useRef } from "react";

/** V2 count-up: eases a number from 0 to `value` over 1.5s whenever `runKey` changes. */
export default function CountUp({
  value,
  decimals = 0,
  suffix = "",
  runKey,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  runKey?: unknown;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = fmt(value);
      return;
    }
    let raf = 0;
    let t0: number | null = null;
    const step = (ts: number) => {
      if (t0 == null) t0 = ts;
      const k = Math.min(1, (ts - t0) / 1500);
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(value * e);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    el.textContent = fmt(0);
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, decimals, suffix, runKey]);

  return <em ref={ref}>{fmt(value)}</em>;
}
