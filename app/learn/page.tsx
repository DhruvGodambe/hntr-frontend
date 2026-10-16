"use client";

import { useEffect, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import MainLayout from "../components/MainLayout";

export default function LearnPage() {
  const router = useRouter();
  const [docsNavOpen, setDocsNavOpen] = useState(false);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "learn-sidebar") {
        setDocsNavOpen(Boolean(event.data.open));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <MainLayout>
      <div className="feed au-host" id="feed-learn">
        <iframe className="au-frame" title="HNTR Learn" src="/learn-content/index.html" />
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
