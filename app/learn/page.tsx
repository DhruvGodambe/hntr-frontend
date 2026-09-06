"use client";

import { useLayoutEffect } from "react";
import { useRouter } from "nextjs-toploader/app";

export default function LearnPage() {
  const router = useRouter();

  useLayoutEffect(() => {
    document.body.dataset.page = "learn";

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "learn-sidebar") {
        document.body.classList.toggle("learn-sidebar-open", Boolean(event.data.open));
        return;
      }
      // The docs iframe has its own independent theme toggle/localStorage;
      // it broadcasts its choice here (on load and on every toggle) so
      // "BACK TO PLATFORM" can follow it instead of staying stuck on
      // whatever the outer app's theme happened to be.
      if (event.data?.type === "hntr-docs-theme") {
        document.body.classList.toggle("dark", event.data.theme === "dark");
      }
    };

    window.addEventListener("message", onMessage);

    return () => {
      delete document.body.dataset.page;
      document.body.classList.remove("learn-sidebar-open", "dark");
      window.removeEventListener("message", onMessage);
    };
  }, []);

  const goBack = () => {
    router.push("/");
  };

  return (
    <>
      <button className="learn-back" type="button" onClick={goBack}>
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
      <iframe className="learn-frame" title="HNTR Learn" src="/learn-content/index.html" />
    </>
  );
}
