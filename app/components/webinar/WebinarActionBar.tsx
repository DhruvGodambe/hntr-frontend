"use client";

import { useState } from "react";
import Link from "next/link";
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
        {/* Reference (HNTR.art Desktop.html:5689): PRESENTATION DECK was
            replaced with LEARN MORE, opening the Docs page. */}
        <Link href="/learn" className="web-deck">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path
              d="M2.5 3.5h4A2 2 0 0 1 8 4.6 2 2 0 0 1 9.5 3.5h4v9h-4A2 2 0 0 0 8 13.6a2 2 0 0 0-1.5-1.1h-4v-9z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <path d="M8 4.6v9" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          LEARN MORE
        </Link>
      </div>

      <WebinarShareSheet open={shareOpen} onClose={() => setShareOpen(false)} />
    </>
  );
}
