"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import MainLayout from "../components/MainLayout";
import HomeMarketOverview from "../components/HomeMarketOverview";
import HntrFooter from "../components/layout/shell/HntrFooter";
import StrategyCarousel, { type StrategyCardData } from "../components/home/StrategyCarousel";
import JoinBanner from "../components/home/JoinBanner";
import { ListingPlaceholderGrid, SalesPlaceholderTrack } from "../components/home/NftPlaceholders";
import { SHELL_MOBILE_MQ } from "../components/layout/constants";
import { DEPOSITS_ENABLED } from "../../lib/deposit-modal";
import { toPoolRouteId, useOpenSeaListingsForSlugs } from "@/lib/opensea";
import { usePools, poolCollectionSlug, poolProgress } from "@/lib/pools";
import { collectionArt } from "@/lib/collection-art";
import { useDashboardData } from "@/lib/rewards";

function strategySub(tags: string[] | undefined, by: string): string {
  const series = tags?.find((t) => /series/i.test(t))?.replace(/series\s*/i, "");
  const maker = (tags?.[0] && !/series/i.test(tags[0]) ? tags[0] : by).replace(/\s+/g, "").toUpperCase();
  return series ? `${maker} · ${series}` : maker;
}

export default function HomePage() {
  const router = useRouter();
  const [loaderOut, setLoaderOut] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { isConnected, summary } = useDashboardData();
  const pending = isConnected && !!summary && (!summary.tier || summary.tier === "None");

  useEffect(() => {
    const t = window.setTimeout(() => setLoaderOut(true), 1150);
    const mq = window.matchMedia(SHELL_MOBILE_MQ);
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => {
      window.clearTimeout(t);
      mq.removeEventListener("change", apply);
    };
  }, []);

  const { data: pools, isLoading: poolsLoading } = usePools();
  const openPools = useMemo(() => (pools ?? []).filter((p) => p.status !== "CLOSED").slice(0, 8), [pools]);
  const collectionSlugs = useMemo(() => Array.from(new Set(openPools.map((p) => poolCollectionSlug(p)))), [openPools]);
  const { data: liveListings, isLoading: listingsLoading } = useOpenSeaListingsForSlugs(collectionSlugs, 1);
  const strategiesLoading = poolsLoading || (collectionSlugs.length > 0 && listingsLoading);

  const cards = useMemo<StrategyCardData[]>(
    () =>
      openPools.map((pool) => {
        const slug = poolCollectionSlug(pool);
        const live = liveListings?.[slug];
        const tokenId = live?.listing?.tokenId || "0";
        const targetEth = live?.floorEth ?? 0;
        const art = collectionArt(slug, pool.imageUrl, pool.name);
        return {
          key: `${pool.slug}-${tokenId}`,
          routeId: toPoolRouteId(pool.slug, tokenId),
          name: pool.name,
          art,
          live: pool.status === "OPEN" && !pool.depositsPaused,
          sub: strategySub(pool.tags, art.by),
          targetEth,
          raisedEth: pool.raisedEth,
          participants: pool.participants,
          pct: poolProgress(pool.raisedEth, targetEth),
          tokenId,
          nftImage: live?.listing?.imageUrl || pool.imageUrl,
        };
      }),
    [openPools, liveListings],
  );

  return (
    <>
      <div className={`page-loader ${loaderOut ? "out" : ""}`} id="loader">
        <div className="loader-inner">
          <span className="ll">H</span>
          <span className="ll">N</span>
          <span className="ll">T</span>
          <span className="ll">R</span>
          <span className="ls">.art</span>
          <span className="loader-cursor" />
        </div>
      </div>

      <MainLayout>
        <div className="feed" id="feed-home">
          <StrategyCarousel
            cards={cards}
            loading={strategiesLoading}
            isMobile={isMobile}
            enterLabel={DEPOSITS_ENABLED ? "ENTER STRATEGY" : "PREVIEW STRATEGY"}
            onOpen={(card) => router.push(`/pool/${card.routeId}`)}
          />

          <JoinBanner
            pending={pending}
            onJoin={() => window.openSignup?.()}
            onBuyMembership={() => router.push("/membership")}
          />

          <div className="sh">
            <div>
              <div className="st" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ flex: "none" }}>
                  <rect x="2.5" y="2.5" width="6" height="15" rx="1.6" stroke="currentColor" strokeWidth="1.8" />
                  <rect x="11.5" y="2.5" width="6" height="6" rx="1.6" stroke="currentColor" strokeWidth="1.8" />
                  <rect x="11.5" y="11.5" width="6" height="6" rx="1.6" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                HNTR LISTINGS
              </div>
              <div className="sub">All NFTs currently for sell</div>
            </div>
          </div>
          <ListingPlaceholderGrid />

          <HomeMarketOverview />

          <div className="sh">
            <div>
              <div className="st" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ flex: "none" }}>
                  <path d="M12.6 2.3A8 8 0 1 0 17.9 9.6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                  <path d="M6.4 9.6l3.2 3.2 7.6-8.6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                HNTR SALES
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }} />
          </div>
          <SalesPlaceholderTrack />

          <HntrFooter />
        </div>
      </MainLayout>
    </>
  );
}
