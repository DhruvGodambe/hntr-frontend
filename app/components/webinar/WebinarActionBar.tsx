"use client";

import { useState } from "react";
import WebinarShareSheet from "./WebinarShareSheet";

export default function WebinarActionBar() {
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <>
      <div className="web-actbar">
        <button type="button" className="web-act" onClick={() => setShareOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.3" />
            <path d="M5.8 7l4.4-2.5M5.8 9l4.4 2.5" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          Share Access
        </button>
        <a
          href="/presentation"
          target="_blank"
          rel="noopener noreferrer"
          className="web-deck"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 2v8M5 7l3 3 3-3"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M3 13h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          PRESENTATION DECK
        </a>
      </div>

      <WebinarShareSheet open={shareOpen} onClose={() => setShareOpen(false)} />
    </>
  );
}
