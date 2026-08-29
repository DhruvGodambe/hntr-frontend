"use client";

import { useMemo, useState } from "react";
import {
  MarketTimeFrame,
  Sparkline,
  formatPctArrow,
  formatUsdFull,
  useCoinGeckoMarketOverview,
} from "@/lib/coingecko";

type Tab = "floor" | "coins";

function Pct({ value, className = "mdlt" }: { value: number | null | undefined; className?: string }) {
  const { text, pos } = formatPctArrow(value);
  if (text === "—") return <span className={className}>—</span>;
  return <span className={`${className} ${pos ? "pos" : "neg"}`}>{text}</span>;
}

function Spark({ spark, viewBox, className }: { spark: Sparkline | null; viewBox: string; className?: string }) {
  if (!spark?.points) return <div className={className} />;
  return (
    <div className={`${className || ""} ${spark.pos ? "pos" : "neg"}`.trim()}>
      <svg className="msk" viewBox={viewBox} preserveAspectRatio="none">
        <polyline
          points={spark.points}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function Thumb({ src, initials, small }: { src?: string; initials: string; small?: boolean }) {
  return (
    <div className={`mth${small ? " mth-sm" : ""}`}>
      {src ? (
        <img src={src} alt="" referrerPolicy="no-referrer" />
      ) : (
        <span className="mth-ph">{initials}</span>
      )}
    </div>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 20 20" width="13" height="13" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
      <path d="M10 2.6l2.3 4.9 5.2.7-3.8 3.7.9 5.3L10 15.6 5.4 17.2l.9-5.3L2.5 8.2l5.2-.7z" />
    </svg>
  );
}

export default function HomeMarketOverview() {
  const [timeFrame, setTimeFrame] = useState<MarketTimeFrame>("24H");
  const [tab, setTab] = useState<Tab>("floor");
  const [starred, setStarred] = useState<Set<string>>(() => new Set());
  const [sortAsc, setSortAsc] = useState(false);

  const { data, isPending } = useCoinGeckoMarketOverview(timeFrame);

  const rows = useMemo(() => {
    const list = data?.rows || [];
    if (!sortAsc) return list;
    return [...list].reverse();
  }, [data?.rows, sortAsc]);

  const toggleStar = (id: string) => {
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const setHeaderRange = (tf: MarketTimeFrame) => {
    setTimeFrame(tf);
  };

  return (
    <div className="mkt">
      <div className="mh">
        <div>
          <div className="st">Market Overview</div>
          <div className="sub">Real-time NFT liquidity and floor data across major collections.</div>
        </div>
        <div className="tf">
          {(["24H", "7D", "30D"] as MarketTimeFrame[]).map((tf) => (
            <div
              key={tf}
              className={`to ${timeFrame === tf ? "active" : ""}`}
              onClick={() => setHeaderRange(tf)}
              style={{ cursor: "pointer" }}
            >
              {tf}
            </div>
          ))}
        </div>
      </div>

      <div className="mov">
        <div className="mov-stats">
          <div className="mstat">
            {isPending ? (
              <>
                <div>
                  <div className="pd-skel" style={{ width: 150, height: 20, marginBottom: 8 }} />
                  <div className="pd-skel" style={{ width: 110, height: 10 }} />
                </div>
                <div className="pd-skel mstat-sp" />
              </>
            ) : (
              <>
                <div>
                  <div className="mstat-v">{data ? formatUsdFull(data.marketCapUsd) : "—"}</div>
                  <div className="mstat-l">
                    Market Cap <Pct value={data?.marketCapChangePct} className="mrc" />
                  </div>
                </div>
                <Spark spark={data?.marketCapSparkline ?? null} viewBox="0 0 110 40" className="mstat-sp" />
              </>
            )}
          </div>
          <div className="mstat">
            {isPending ? (
              <>
                <div>
                  <div className="pd-skel" style={{ width: 130, height: 20, marginBottom: 8 }} />
                  <div className="pd-skel" style={{ width: 140, height: 10 }} />
                </div>
                <div className="pd-skel mstat-sp" />
              </>
            ) : (
              <>
                <div>
                  <div className="mstat-v">{data ? formatUsdFull(data.volumeUsd) : "—"}</div>
                  <div className="mstat-l">
                    {data?.volumeLabel ?? "24h Trading Volume"} <Pct value={data?.volumeChangePct} />
                  </div>
                </div>
                <Spark spark={data?.volumeSparkline ?? null} viewBox="0 0 110 40" className="mstat-sp" />
              </>
            )}
          </div>
        </div>

        <div className="mcard">
          <div className="mcard-h">
            <div className="mcard-t">
              <span className="mdt" /> Trending
            </div>
          </div>
          {isPending
            ? [0, 1, 2].map((i) => (
                <div className="mlist-r" key={`trend-skel-${i}`}>
                  <div className="pd-skel" style={{ width: 20, height: 20, borderRadius: 5 }} />
                  <div className="pd-skel" style={{ width: "70%", height: 10 }} />
                  <div className="pd-skel" style={{ width: 48, height: 10 }} />
                  <div className="pd-skel" style={{ width: 40, height: 10 }} />
                </div>
              ))
            : (data?.trending || []).map((row) => (
                <div className="mlist-r" key={row.id}>
                  <Thumb src={row.imageUrl} initials={row.initials} small />
                  <div className="mlist-n">{row.name}</div>
                  <div className="mlist-v">{row.floorNative}</div>
                  <Pct value={row.changePct} className="mrc" />
                </div>
              ))}
        </div>

        <div className="mcard">
          <div className="mcard-h">
            <div className="mcard-t">
              <span className="mdt" /> Top NFTs Dominance
            </div>
            <button type="button" className="mmore" onClick={() => setTab("floor")}>
              View more <span>›</span>
            </button>
          </div>
          {isPending
            ? [0, 1, 2].map((i) => (
                <div className="mlist-r" key={`dom-skel-${i}`}>
                  <div className="pd-skel" style={{ width: 20, height: 20, borderRadius: 5 }} />
                  <div className="pd-skel" style={{ width: "65%", height: 10 }} />
                  <div className="pd-skel" style={{ width: 28, height: 10 }} />
                </div>
              ))
            : (data?.dominance || []).map((row) => (
                <div className="mlist-r" key={row.id}>
                  <Thumb src={row.imageUrl} initials={row.initials} small />
                  <div className="mlist-n">{row.name}</div>
                  <div className="mlist-v mlist-strong">{`${row.sharePct}%`}</div>
                </div>
              ))}
        </div>
      </div>

      <div className="mtabs">
        <div className="mtabs-l">
          <div className={`mtab ${tab === "floor" ? "active" : ""}`} onClick={() => setTab("floor")}>
            <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
              <rect x="1" y="9" width="3" height="6" rx=".6" />
              <rect x="6.5" y="5" width="3" height="10" rx=".6" />
              <rect x="12" y="2" width="3" height="13" rx=".6" />
            </svg>
            Floor Price
          </div>
          <div className={`mtab ${tab === "coins" ? "active" : ""}`} onClick={() => setTab("coins")}>
            <svg viewBox="0 0 20 20" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <ellipse cx="10" cy="5.4" rx="6.4" ry="2.6" />
              <path d="M3.6 5.4v4.2c0 1.4 2.9 2.6 6.4 2.6s6.4-1.2 6.4-2.6V5.4" />
              <path d="M3.6 9.8v4.2c0 1.4 2.9 2.6 6.4 2.6s6.4-1.2 6.4-2.6V9.8" />
            </svg>
            Related Coins
          </div>
        </div>
        <div className="msort" onClick={() => setSortAsc((v) => !v)}>
          Market Cap{" "}
          <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d={sortAsc ? "M2.5 7.5L6 4l3.5 3.5" : "M2.5 4.5L6 8l3.5-3.5"} />
          </svg>
        </div>
      </div>

      <div className="mpanel" hidden={tab !== "floor"}>
        <div className="mtwrap">
          <div className="mtable">
            <div className="mhead">
              <div className="mcel mc-star" />
              <div className="mcel mc-rank">#</div>
              <div className="mcel mc-nft">NFT</div>
              <div className="mcel mc-buy" />
              <div className="mcel mc-num">Floor Price</div>
              <div className="mcel mc-chg">24h</div>
              <div className="mcel mc-chg">7d</div>
              <div className="mcel mc-chg">30d</div>
              <div className="mcel mc-spark">Last 7 Days</div>
              <div className="mcel mc-num">Market Cap</div>
              <div className="mcel mc-num">24h Volume</div>
            </div>
            {isPending
              ? Array.from({ length: 10 }, (_, i) => (
                  <div className="mrow" key={`floor-skel-${i}`}>
                    <div className="mcel mc-star">
                      <div className="pd-skel" style={{ width: 13, height: 13 }} />
                    </div>
                    <div className="mcel mc-rank">
                      <div className="pd-skel" style={{ width: 12, height: 10 }} />
                    </div>
                    <div className="mcel mc-nft">
                      <div className="pd-skel" style={{ width: 24, height: 24, borderRadius: 6 }} />
                      <div className="mnw">
                        <div className="pd-skel" style={{ width: 120, height: 12, marginBottom: 6 }} />
                        <div className="pd-skel" style={{ width: 64, height: 10 }} />
                      </div>
                    </div>
                    <div className="mcel mc-buy">
                      <div className="pd-skel" style={{ width: 36, height: 18, borderRadius: 5 }} />
                    </div>
                    <div className="mcel mc-num">
                      <div className="pd-skel" style={{ width: 72, height: 12, marginLeft: "auto" }} />
                    </div>
                    <div className="mcel mc-chg">
                      <div className="pd-skel" style={{ width: 48, height: 10, marginLeft: "auto" }} />
                    </div>
                    <div className="mcel mc-chg">
                      <div className="pd-skel" style={{ width: 48, height: 10, marginLeft: "auto" }} />
                    </div>
                    <div className="mcel mc-chg">
                      <div className="pd-skel" style={{ width: 48, height: 10, marginLeft: "auto" }} />
                    </div>
                    <div className="mcel mc-spark">
                      <div className="pd-skel" style={{ width: 110, height: 30 }} />
                    </div>
                    <div className="mcel mc-num">
                      <div className="pd-skel" style={{ width: 90, height: 12, marginLeft: "auto" }} />
                    </div>
                    <div className="mcel mc-num">
                      <div className="pd-skel" style={{ width: 80, height: 12, marginLeft: "auto" }} />
                    </div>
                  </div>
                ))
              : rows.map((row) => (
                  <div className="mrow" key={row.id}>
                    <div
                      className={`mcel mc-star${starred.has(row.id) ? " on" : ""}`}
                      onClick={() => toggleStar(row.id)}
                    >
                      <StarIcon filled={starred.has(row.id)} />
                    </div>
                    <div className="mcel mc-rank">{row.rank}</div>
                    <div className="mcel mc-nft">
                      <Thumb src={row.imageUrl} initials={row.initials} />
                      <div className="mnw">
                        <div className="mnn">{row.name}</div>
                        <div className="mchip">
                          <span className="mchip-d" />
                          {row.chain}
                        </div>
                      </div>
                    </div>
                    <div className="mcel mc-buy">
                      <a className="mbuy" href={row.buyUrl} target="_blank" rel="noopener noreferrer">
                        Buy
                      </a>
                    </div>
                    <div className="mcel mc-num">
                      <div className="mfp">{row.floorNative}</div>
                      <div className="mfu">{row.floorUsd}</div>
                    </div>
                    <div className="mcel mc-chg">
                      <Pct value={row.change24h} className="mrc" />
                    </div>
                    <div className="mcel mc-chg">
                      <Pct value={row.change7d} />
                    </div>
                    <div className="mcel mc-chg">
                      <Pct value={row.change30d} />
                    </div>
                    <Spark spark={row.sparkline} viewBox="0 0 110 30" className="mc-spark" />
                    <div className="mcel mc-num">
                      <div className="mfp">{row.marketCapUsd}</div>
                      <div className="mfu">{row.marketCapNative}</div>
                    </div>
                    <div className="mcel mc-num">
                      <div className="mfp">{row.volumeNative}</div>
                      <div className="mfu">{row.volumeUsd}</div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>

      <div className="mpanel" hidden={tab !== "coins"}>
        <div className="mtwrap">
          <div className="mtable mtable-coins">
            <div className="mhead">
              <div className="mcel mc-rank">#</div>
              <div className="mcel mc-nft">Coin</div>
              <div className="mcel mc-num">Price</div>
              <div className="mcel mc-chg">24h</div>
              <div className="mcel mc-chg">7d</div>
              <div className="mcel mc-spark">Last 7 Days</div>
              <div className="mcel mc-num">Market Cap</div>
              <div className="mcel mc-num">24h Volume</div>
            </div>
            {isPending
              ? Array.from({ length: 5 }, (_, i) => (
                  <div className="mrow" key={`coin-skel-${i}`}>
                    <div className="mcel mc-rank">
                      <div className="pd-skel" style={{ width: 12, height: 10 }} />
                    </div>
                    <div className="mcel mc-nft">
                      <div className="pd-skel" style={{ width: 20, height: 20, borderRadius: 5 }} />
                      <div className="pd-skel" style={{ width: 90, height: 12 }} />
                    </div>
                    <div className="mcel mc-num">
                      <div className="pd-skel" style={{ width: 72, height: 12, marginLeft: "auto" }} />
                    </div>
                    <div className="mcel mc-chg">
                      <div className="pd-skel" style={{ width: 48, height: 10, marginLeft: "auto" }} />
                    </div>
                    <div className="mcel mc-chg">
                      <div className="pd-skel" style={{ width: 48, height: 10, marginLeft: "auto" }} />
                    </div>
                    <div className="mcel mc-spark">
                      <div className="pd-skel" style={{ width: 110, height: 30 }} />
                    </div>
                    <div className="mcel mc-num">
                      <div className="pd-skel" style={{ width: 100, height: 12, marginLeft: "auto" }} />
                    </div>
                    <div className="mcel mc-num">
                      <div className="pd-skel" style={{ width: 90, height: 12, marginLeft: "auto" }} />
                    </div>
                  </div>
                ))
              : (data?.coins || []).map((coin) => (
                  <div className="mrow" key={coin.id}>
                    <div className="mcel mc-rank">{coin.rank}</div>
                    <div className="mcel mc-nft">
                      <Thumb src={coin.imageUrl} initials={coin.initials} small />
                      <div className="mnw">
                        <div className="mnn">{coin.name}</div>
                        <div className="mchip">
                          <span className="mchip-d" />
                          {coin.symbol}
                        </div>
                      </div>
                    </div>
                    <div className="mcel mc-num">
                      <div className="mfp">{coin.price}</div>
                    </div>
                    <div className="mcel mc-chg">
                      <Pct value={coin.change24h} />
                    </div>
                    <div className="mcel mc-chg">
                      <Pct value={coin.change7d} />
                    </div>
                    <Spark spark={coin.sparkline} viewBox="0 0 110 30" className="mc-spark" />
                    <div className="mcel mc-num">
                      <div className="mfp">{coin.marketCap}</div>
                    </div>
                    <div className="mcel mc-num">
                      <div className="mfp">{coin.volume}</div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
