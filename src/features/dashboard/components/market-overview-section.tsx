"use client";

import { ChevronDown, Rocket, TrendingUp, Zap } from "lucide-react";
import * as React from "react";
import {
  marketMetrics,
  topCollections,
  topMovers,
  trendingCollections,
} from "@/features/dashboard/data/home-data";
import { RankedList } from "./ranked-list";

const timeframes = ["24H", "7D", "30D"] as const;

export function MarketOverviewSection() {
  const [timeframe, setTimeframe] = React.useState<(typeof timeframes)[number]>(
    "24H",
  );

  return (
    <section className="mb-6 sm:mb-[22px]" aria-labelledby="market-heading">
      <div className="rounded-xl border border-bd0 bg-e2 p-4 shadow-sh2 sm:rounded-md sm:border-0 sm:p-[15px] sm:[box-shadow:var(--sh2),var(--glow)]">
        <div className="mb-3.5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="market-heading"
              className="font-display text-[12px] font-bold uppercase tracking-[0.1em] text-t4"
            >
              Market Overview
            </h2>
            <p className="mt-1 text-[10px] leading-snug text-t1 sm:text-label">
              Real-time NFT liquidity and floor data across major collections.
            </p>
          </div>

          <div className="shrink-0">
            <div className="relative lg:hidden">
              <label htmlFor="market-timeframe" className="sr-only">
                Timeframe
              </label>
              <select
                id="market-timeframe"
                value={timeframe}
                onChange={(event) =>
                  setTimeframe(event.target.value as (typeof timeframes)[number])
                }
                className="h-7 appearance-none rounded border border-bd1 bg-e2 py-0 pl-2.5 pr-7 font-mono text-label text-t3 shadow-sh1"
              >
                {timeframes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-t1"
                aria-hidden
              />
            </div>
            <div
              className="hidden items-center gap-1 rounded border border-bd1 bg-e3 p-0.5 shadow-sh1 lg:flex"
              role="tablist"
              aria-label="Market timeframe"
            >
              {timeframes.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="tab"
                  aria-selected={timeframe === option}
                  onClick={() => setTimeframe(option)}
                  className={
                    timeframe === option
                      ? "h-6 rounded bg-e1 px-2.5 font-mono text-micro font-bold tracking-[0.06em] text-t4"
                      : "h-6 rounded px-2.5 font-mono text-micro font-semibold tracking-[0.06em] text-t1 transition-colors hover:text-t3"
                  }
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-md bg-bd1 shadow-sh1 sm:grid-cols-2 lg:grid-cols-4">
          {marketMetrics.map((metric) => (
            <div key={metric.label} className="bg-e3 px-3 py-3 sm:py-2.5">
              <p className="mb-1 text-caption uppercase tracking-[0.06em] text-t1">
                {metric.label}
              </p>
              <p className="font-mono text-stat font-bold leading-tight text-t4">
                {metric.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-3.5 lg:grid-cols-3">
          <RankedList
            title="Top"
            icon={<TrendingUp strokeWidth={1.75} />}
            items={topCollections}
            variant="change"
          />
          <RankedList
            title="Trending"
            icon={<Zap strokeWidth={1.75} />}
            items={trendingCollections}
            variant="volume"
          />
          <RankedList
            title="Top Movers"
            icon={<Rocket strokeWidth={1.75} />}
            items={topMovers}
            variant="change"
          />
        </div>
      </div>
    </section>
  );
}
