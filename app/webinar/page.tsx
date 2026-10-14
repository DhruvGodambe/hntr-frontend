"use client";

import MainLayout from "../components/MainLayout";
import WebinarDeckFrame from "../components/webinar/WebinarDeckFrame";

/** V2 "Live Webinar": the business presentation, embedded full-panel inside the app shell. */
export default function WebinarPage() {
  return (
    <MainLayout>
      <div className="feed au-host" id="feed-webinar">
        <WebinarDeckFrame />
      </div>
    </MainLayout>
  );
}
