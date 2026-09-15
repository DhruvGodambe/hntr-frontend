"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import WebinarLanguageSelector from "./WebinarLanguageSelector";

function formatClock(date: Date) {
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const monthDayYear = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("en-US", { hour12: false });
  return `${weekday}, ${monthDayYear} · ${time}`;
}

export default function WebinarHeader() {
  const [clock, setClock] = useState("—");

  useEffect(() => {
    const updateClock = () => setClock(formatClock(new Date()));
    updateClock();
    const timer = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="wv-head">
      {/* Mobile-only — the compact phone header replaces the LIVE/viewer/
          timer strip with a back button + LEARN MORE (reference:
          HNTR.art Mobile.dc.html:855-857). Hidden on desktop by default. */}
      <Link href="/" className="wv-back-btn" aria-label="Back to platform">
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <path
            d="M10 3L5 8l5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
      <div className="wv-head-left">
        <div className="wv-headbrand">
          HNTR <span>| LIVE WEBINAR</span>
        </div>
        <div className="wv-head-l">
          <span className="wv-live">
            <span className="wv-live-dot" />
            LIVE
          </span>
          <span className="wv-timer">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
              <path
                d="M8 4.6V8l2.4 1.6"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span id="wvClock">{clock}</span>
          </span>
        </div>
      </div>
      <WebinarLanguageSelector />
      <Link href="/learn" className="wv-learn-btn">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 14.5c0-1.4 1.1-2.5 2.5-2.5h3V2.5h-3C9.1 2.5 8 3.6 8 5M8 14.5c0-1.4-1.1-2.5-2.5-2.5h-3V2.5h3C6.9 2.5 8 3.6 8 5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        LEARN MORE
      </Link>
    </div>
  );
}
