"use client";

import Link from "next/link";
import type { MouseEvent, RefObject } from "react";
import { buildNavBarPath } from "../utils";
import {
  CollectionNavIcon,
  HomeNavIcon,
  LearnNavIcon,
  MarketNavIcon,
  MembershipNavIcon,
  NetworkNavIcon,
  StrategiesNavIcon,
} from "../icons/NavIcons";

type BottomNavProps = {
  currentPage: string;
  sbTransY: number;
  sbOpacity: number;
  bottomNavRef: RefObject<HTMLDivElement>;
  navBarPathRef: RefObject<SVGPathElement>;
  onBottomNavClick: (event: MouseEvent<HTMLDivElement>) => void;
};

export default function BottomNav({
  currentPage,
  sbTransY,
  sbOpacity,
  bottomNavRef,
  navBarPathRef,
  onBottomNavClick,
}: BottomNavProps) {
  return (
    <div
      ref={bottomNavRef}
      className="sb mobile-bottom-nav"
      role="navigation"
      aria-label="Main navigation"
      onClick={onBottomNavClick}
      style={{
        transform: `translateY(${sbTransY}%)`,
        opacity: sbOpacity,
      }}
    >
      <div className="mobile-nav-bar" aria-hidden="true">
        <svg className="mobile-nav-shape" viewBox="0 0 360 64" preserveAspectRatio="none" aria-hidden="true">
          <path ref={navBarPathRef} d={buildNavBarPath(360, 180, false)} />
        </svg>
      </div>
      <div className="mobile-nav-shell">
        <div className="mobile-nav-dock">
          <div className="mobile-nav-track">
            <Link href="/" className={`si ${currentPage === "home" ? "active" : ""}`} data-page="home">
              <div className="si-icon">
                <HomeNavIcon />
              </div>
              <span className="si-label">Home</span>
            </Link>

            <Link href="/marketplace" className={`si ${currentPage === "marketplace" ? "active" : ""}`} data-page="marketplace">
              <div className="si-icon">
                <MarketNavIcon />
              </div>
              <span className="si-label si-label-full">Marketplace</span>
              <span className="si-label si-label-short">Market</span>
            </Link>

            <Link href="/pools" className={`si ${currentPage === "pools" ? "active" : ""}`} data-page="pools">
              <div className="si-icon">
                <StrategiesNavIcon />
              </div>
              <span className="si-label si-label-full">NFT Strategies</span>
              <span className="si-label si-label-short">Strategies</span>
            </Link>

            <Link href="/collection" className={`si ${currentPage === "collection" ? "active" : ""}`} data-page="collection">
              <div className="si-icon">
                <CollectionNavIcon />
              </div>
              <span className="si-label">MY NFTs</span>
            </Link>

            <Link href="/membership" className={`si si-mobile-extra ${currentPage === "membership" ? "active" : ""}`} data-page="membership">
              <div className="si-icon">
                <MembershipNavIcon />
              </div>
              <span className="si-label">Membership</span>
            </Link>

            <Link href="/network" className={`si ${currentPage === "network" ? "active" : ""}`} data-page="network">
              <div className="si-icon">
                <NetworkNavIcon />
              </div>
              <span className="si-label">Network</span>
            </Link>

            <div className="si-bot si-mobile-extra">
              <div className="si-sep" />
              <Link href="/learn" className={`si ${currentPage === "learn" ? "active" : ""}`} data-page="learn">
                <div className="si-icon">
                  <LearnNavIcon />
                </div>
                <span className="si-label">Learn</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
