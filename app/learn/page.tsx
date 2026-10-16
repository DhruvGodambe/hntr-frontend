"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import MainLayout from "../components/MainLayout";

function platformTheme(): "dark" | "light" {
  return document.body.classList.contains("dark") ? "dark" : "light";
}

export default function LearnPage() {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [docsNavOpen, setDocsNavOpen] = useState(false);

  useEffect(() => {
    const iframe = iframeRef.current;
    let last = platformTheme();

    const postTheme = () => {
      const theme = platformTheme();
      last = theme;
      iframe?.contentWindow?.postMessage({ type: "hntr-docs-theme", theme }, "*");
    };

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "learn-sidebar") {
        setDocsNavOpen(Boolean(event.data.open));
        return;
      }
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
        <button
          className={`learn-back${docsNavOpen ? " is-hidden" : ""}`}
          type="button"
          onClick={() => router.push("/home")}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 3.5 5.5 8l4.5 4.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          BACK TO PLATFORM
        </button>
      </div>
    </MainLayout>
  );
}
