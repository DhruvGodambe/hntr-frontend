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
    <section className="mb-[22px]" aria-labelledby="market-heading">
      <div className="rounded-md bg-e2 p-[15px] shadow-sh2 [box-shadow:var(--sh2),var(--glow)]">
        <div className="mb-[13px] flex items-start justify-between gap-4">
          <div>
            <h2
              id="market-heading"
              className="font-display text-[11px] font-bold uppercase tracking-[0.1em] text-t4"
            >
              Market Overview
            </h2>
            <p className="mt-0.5 text-[9px] uppercase text-t0">
              Real-time NFT liquidity and floor data across major collections.
            </p>
          </div>

          <div className="relative shrink-0">
            <label htmlFor="market-timeframe" className="sr-only">
              Timeframe
            </label>
            <select
              id="market-timeframe"
              value={timeframe}
              onChange={(event) =>
                setTimeframe(event.target.value as (typeof timeframes)[number])
              }
              className="h-5 appearance-none rounded border border-bd1 bg-e2 py-0 pl-2 pr-6 font-mono text-[9px] text-t2 shadow-sh1"
            >
              {timeframes.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-1.5 top-1/2 size-3 -translate-y-1/2 text-t1"
              aria-hidden
            />
          </div>
        </div>

        <div className="mb-[15px] grid grid-cols-2 gap-px overflow-hidden rounded-md bg-bd1 shadow-sh1 lg:grid-cols-4">
          {marketMetrics.map((metric) => (
            <div key={metric.label} className="bg-e3 px-3 py-2.5">
              <p className="mb-[3px] text-[8px] uppercase tracking-[0.06em] text-t1">
                {metric.label}
              </p>
              <p className="font-mono text-[15px] font-bold text-t4">
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
