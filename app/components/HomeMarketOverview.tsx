"use client";

import { useMemo, useState } from "react";
import { Sparkline, formatPctArrow, formatUsdFull, useCoinGeckoMarketOverview } from "@/lib/coingecko";

/** Rows shown before "View more" expands the table (V2 shows six). */
const COLLAPSED_ROWS = 6;

/** Blue-chip collections V2 marks with a verified tick. */
const VERIFIED = /cryptopunks|bored ape yacht club|pudgy penguins|azuki|mutant ape yacht club|ordinal maxi biz|doodles|moonbirds/i;

function VTick() {
  return (
    <span className="vtick" title="Verified collection" aria-label="Verified">
      <svg viewBox="0 0 16 16" fill="none" preserveAspectRatio="xMidYMid meet">
        <path d="M4.6 8.3l2.3 2.4L11.5 5.6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

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
        <polyline points={spark.points} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function Thumb({ src, initials, small }: { src?: string; initials: string; small?: boolean }) {
  return (
    <div className={`mth${small ? " mth-sm" : ""}`}>
      {src ? <img src={src} alt="" referrerPolicy="no-referrer" /> : <span className="mth-ph">{initials}</span>}
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

function Name({ name }: { name: string }) {
  return (
    <>
      {name}
      {VERIFIED.test(name) && <VTick />}
    </>
  );
}

const skel = (style: React.CSSProperties) => <div className="pd-skel" style={style} />;

export default function HomeMarketOverview() {
  const [starred, setStarred] = useState<Set<string>>(() => new Set());
  const [expanded, setExpanded] = useState(false);
  const { data, isPending } = useCoinGeckoMarketOverview("24H");

  const rows = useMemo(() => {
    const list = data?.rows || [];
    return expanded ? list : list.slice(0, COLLAPSED_ROWS);
  }, [data?.rows, expanded]);

  const toggleStar = (id: string) => {
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      <div className="sh" style={{ marginTop: 36 }}>
        <div>
          <div className="st" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ flex: "none" }}>
              <path d="M3 9.5l4-3.5 3 2.5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12.5 3h3v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 18v-4M7 18v-2.5M10 18v-5M13 18v-3.5M16 18v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Market Overview
          </div>
        </div>
      </div>

      <div className="mkt">
        <div className="mov">
          <div className="mov-stats">
            <div className="mstat">
              {isPending ? (
                <>
                  <div>
                    {skel({ width: 150, height: 20, marginBottom: 8 })}
                    {skel({ width: 110, height: 10 })}
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
                    {skel({ width: 130, height: 20, marginBottom: 8 })}
                    {skel({ width: 140, height: 10 })}
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
                    {skel({ width: 20, height: 20, borderRadius: 5 })}
                    {skel({ width: "70%", height: 10 })}
                    {skel({ width: 48, height: 10 })}
                    {skel({ width: 40, height: 10 })}
                  </div>
                ))
              : (data?.trending || []).map((row) => (
                  <div className="mlist-r" key={row.id}>
                    <Thumb src={row.imageUrl} initials={row.initials} small />
                    <div className="mlist-n">
                      <Name name={row.name} />
                    </div>
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
              <a
                className="mmore"
                role="button"
                tabIndex={0}
                aria-expanded={expanded}
                onClick={() => setExpanded((v) => !v)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setExpanded((v) => !v);
                  }
                }}
              >
                {expanded ? "View less" : "View more"} <span>›</span>
              </a>
            </div>
            {isPending
              ? [0, 1, 2].map((i) => (
                  <div className="mlist-r" key={`dom-skel-${i}`}>
                    {skel({ width: 20, height: 20, borderRadius: 5 })}
                    {skel({ width: "65%", height: 10 })}
                    {skel({ width: 28, height: 10 })}
                  </div>
                ))
              : (data?.dominance || []).map((row) => (
                  <div className="mlist-r" key={row.id}>
                    <Thumb src={row.imageUrl} initials={row.initials} small />
                    <div className="mlist-n">
                      <Name name={row.name} />
                    </div>
                    <div className="mlist-v mlist-strong">{`${row.sharePct}%`}</div>
                  </div>
                ))}
          </div>
        </div>

        <div className="mkt-list">
          <div className="mtabs" />
          <div className="mpanel" data-mpanel="floor">
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
                  <div className="mcel mc-sales">24h Sales</div>
                </div>
                {isPending
                  ? Array.from({ length: COLLAPSED_ROWS }, (_, i) => (
                      <div className="mrow" key={`floor-skel-${i}`}>
                        <div className="mcel mc-star">{skel({ width: 13, height: 13 })}</div>
                        <div className="mcel mc-rank">{skel({ width: 12, height: 10 })}</div>
                        <div className="mcel mc-nft">
                          {skel({ width: 24, height: 24, borderRadius: 6 })}
                          <div className="mnw">
                            {skel({ width: 120, height: 12, marginBottom: 6 })}
                            {skel({ width: 64, height: 10 })}
                          </div>
                        </div>
                        <div className="mcel mc-buy" />
                        <div className="mcel mc-num">{skel({ width: 72, height: 12, marginLeft: "auto" })}</div>
                        <div className="mcel mc-chg">{skel({ width: 48, height: 10, marginLeft: "auto" })}</div>
                        <div className="mcel mc-chg">{skel({ width: 48, height: 10, marginLeft: "auto" })}</div>
                        <div className="mcel mc-chg">{skel({ width: 48, height: 10, marginLeft: "auto" })}</div>
                        <div className="mcel mc-spark">{skel({ width: 110, height: 30 })}</div>
                        <div className="mcel mc-num">{skel({ width: 90, height: 12, marginLeft: "auto" })}</div>
                        <div className="mcel mc-num">{skel({ width: 80, height: 12, marginLeft: "auto" })}</div>
                        <div className="mcel mc-sales">{skel({ width: 28, height: 12, marginLeft: "auto" })}</div>
                      </div>
                    ))
                  : rows.map((row) => (
                      <div className="mrow" key={row.id}>
                        <div className={`mcel mc-star${starred.has(row.id) ? " on" : ""}`} onClick={() => toggleStar(row.id)}>
                          <StarIcon filled={starred.has(row.id)} />
                        </div>
                        <div className="mcel mc-rank">{row.rank}</div>
                        <div className="mcel mc-nft">
                          <Thumb src={row.imageUrl} initials={row.initials} />
                          <div className="mnw">
                            <div className="mnn">
                              <Name name={row.name} />
                            </div>
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
                        <Spark spark={row.sparkline} viewBox="0 0 110 30" className="mcel mc-spark" />
                        <div className="mcel mc-num">
                          <div className="mfp">{row.marketCapUsd}</div>
                          <div className="mfu">{row.marketCapNative}</div>
                        </div>
                        <div className="mcel mc-num">
                          <div className="mfp">{row.volumeNative}</div>
                          <div className="mfu">{row.volumeUsd}</div>
                        </div>
                        <div className="mcel mc-sales">{row.sales24h}</div>
                      </div>
                    ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
