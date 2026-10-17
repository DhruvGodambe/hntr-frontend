"use client";

import WebinarDeckFrame from "../components/webinar/WebinarDeckFrame";

/** Standalone business presentation (same V2 deck as Live Webinar, full screen, for shared links). */
export default function PresentationPage() {
  return (
    <WebinarDeckFrame
      className="presentation-frame"
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100dvh", border: 0, display: "block", background: "#fbfbfd", zIndex: 1 }}
    />
  );
}
