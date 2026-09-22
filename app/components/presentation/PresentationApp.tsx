"use client";

import { useEffect, useState } from "react";
import { PRESENTATION_MARKUP } from "./presentationMarkup";
import PresentationLang from "./PresentationLang";
import { usePresentationRuntime } from "./usePresentationRuntime";

export default function PresentationApp() {
  const [ready, setReady] = useState(false);
  const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    document.body.dataset.page = "presentation";
    document.body.classList.remove("dark");
    setScrollRoot(document.getElementById("au-scroll"));
    setReady(true);
    return () => {
      delete document.body.dataset.page;
      document.getElementById("au-bidi")?.remove();
      document.documentElement.removeAttribute("dir");
    };
  }, []);

  usePresentationRuntime(ready);

  return (
    <div className="au-root">
      <div className="au-scroll-host" dangerouslySetInnerHTML={{ __html: PRESENTATION_MARKUP }} />
      <PresentationLang scrollRoot={scrollRoot} />
    </div>
  );
}
