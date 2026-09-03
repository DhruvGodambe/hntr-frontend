"use client";

import { memo, useRef } from "react";
import { useBannerAnimation } from "../hooks/useBannerAnimation";

function HomeHeroBanner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useBannerAnimation("home", canvasRef);

  return (
    <div className="hero">
      <canvas id="homeRevealCv" ref={canvasRef} />
      <div className="home-reveal-shade" />
      {/* Presentation (padding / colour / text-shadow) lives in CSS:
          styles.css `#feed-home .hero .hero-left|-title|-sub`, so the mobile
          breakpoint can restyle it without fighting inline specificity. */}
      <div className="hero-left">
        <div className="hero-title">HNTR</div>
        <div className="hero-sub">Your gateaway to the NFT Universe.</div>
      </div>
      <div className="hero-right">
        <div className="hero-mosaic" id="mosaic" />
      </div>
    </div>
  );
}

export default memo(HomeHeroBanner);
