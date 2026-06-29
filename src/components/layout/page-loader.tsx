"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    let hideTimer: number | undefined;

    const fadeTimer = window.setTimeout(() => {
      setFadeOut(true);
      hideTimer = window.setTimeout(() => setVisible(false), 400);
    }, 1050);

    return () => {
      window.clearTimeout(fadeTimer);
      if (hideTimer !== undefined) {
        window.clearTimeout(hideTimer);
      }
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "page-loader fixed inset-0 z-[9999] flex items-center justify-center bg-e0 transition-opacity duration-400",
        fadeOut && "pointer-events-none opacity-0",
      )}
      aria-hidden
    >
      <div className="loader-inner flex items-baseline gap-0">
        {["H", "N", "T", "R"].map((letter, i) => (
          <span
            key={letter}
            className="ll font-display text-display font-bold leading-none tracking-[0.04em]"
            style={{
              color: "var(--loader-letter)",
              animationDelay: `${0.1 + i * 0.18}s`,
            }}
          >
            {letter}
          </span>
        ))}
        <span
          className="ls ml-px font-display text-heading font-normal leading-none tracking-[0.02em]"
          style={{ color: "var(--loader-suffix)", animationDelay: "0.82s" }}
        >
          .art
        </span>
        <span
          className="loader-cursor ml-1 inline-block h-[42px] w-[3px] align-middle"
          style={{
            background: "var(--loader-cursor)",
            animationDelay: "1s",
          }}
        />
      </div>
    </div>
  );
}
