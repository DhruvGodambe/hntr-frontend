"use client";

import { useEffect, useState } from "react";
import WebinarActionBar from "./WebinarActionBar";
import WebinarChat from "./WebinarChat";
import WebinarHeader from "./WebinarHeader";
import WebinarMeta from "./WebinarMeta";
// import WebinarNewsletter from "./WebinarNewsletter";
import WebinarPlayer from "./WebinarPlayer";
import { MOBILE_MQ } from "../layout/constants";

export default function WebinarContent() {
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => setIsMobileView(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!isMobileView) return;

    const html = document.documentElement;
    const body = document.body;
    const prev = {
      htmlOverflow: html.style.overflow,
      htmlHeight: html.style.height,
      bodyOverflow: body.style.overflow,
      bodyHeight: body.style.height,
      bodyDisplay: body.style.display,
    };

    html.style.overflow = "auto";
    html.style.height = "auto";
    body.style.overflow = "auto";
    body.style.height = "auto";
    body.style.display = "block";

    return () => {
      html.style.overflow = prev.htmlOverflow;
      html.style.height = prev.htmlHeight;
      body.style.overflow = prev.bodyOverflow;
      body.style.height = prev.bodyHeight;
      body.style.display = prev.bodyDisplay;
    };
  }, [isMobileView]);

  return (
    <>
      <div className="feed" id="feed-webinar">
        <div className="web-scroll">
          <div className="web-main" id="webinar-main">
            <WebinarHeader />
            <WebinarPlayer />
            <WebinarActionBar />
            <WebinarMeta />
            {/* <WebinarNewsletter /> */}
          </div>
        </div>
      </div>
      {!isMobileView && <WebinarChat />}
    </>
  );
}
