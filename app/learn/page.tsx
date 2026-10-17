"use client";

import { useEffect, useRef } from "react";
import MainLayout from "../components/MainLayout";

function platformTheme(): "dark" | "light" {
  return document.body.classList.contains("dark") ? "dark" : "light";
}

export default function LearnPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    let last = platformTheme();

    const postTheme = () => {
      const theme = platformTheme();
      last = theme;
      iframe?.contentWindow?.postMessage({ type: "hntr-docs-theme", theme }, "*");
    };

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== "hntr-docs-theme") return;
      const theme = event.data.theme === "dark" ? "dark" : "light";
      if (theme === platformTheme()) return;
      window.setHntrTheme?.(theme);
    };

    window.addEventListener("message", onMessage);
    iframe?.addEventListener("load", postTheme);
    const observer = new MutationObserver(() => {
      const theme = platformTheme();
      if (theme !== last) postTheme();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    postTheme();

    return () => {
      window.removeEventListener("message", onMessage);
      iframe?.removeEventListener("load", postTheme);
      observer.disconnect();
    };
  }, []);

  return (
    <MainLayout>
      <div className="feed au-host" id="feed-learn">
        <iframe
          ref={iframeRef}
          className="au-frame"
          title="HNTR Learn"
          src="/learn-content/index.html"
        />
      </div>
    </MainLayout>
  );
}
