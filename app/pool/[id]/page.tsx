"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { formatEther } from "viem";
import { useAccount, useBalance } from "wagmi";
import MainLayout from "../../components/MainLayout";
import HntrFooter, { DISCORD_URL, TELEGRAM_URL } from "../../components/layout/shell/HntrFooter";
import { SHELL_MOBILE_MQ } from "../../components/layout/constants";
import { DEPOSITS_ENABLED, openDepositModal } from "../../../lib/deposit-modal";
import { parsePoolRouteId, poolDisplayName, useOpenSeaPoolNft, type OpenSeaPoolNft } from "@/lib/opensea";
import { usePool, poolCollectionSlug, poolProgress, type PublicPool } from "@/lib/pools";
import { useEthUsdPrice } from "@/lib/coingecko";
import { collectionArt, type CollectionArt } from "@/lib/collection-art";
import { useDashboardData } from "@/lib/rewards";
import { TIERS } from "@/lib/contracts";

/** Merged view model: admin-managed pool economics + live OpenSea art/floor. */
type PoolView = {
  collectionName: string;
  assetName: string;
  tokenId: string;
  floorEth: number;
  raisedEth: number;
  progress: number;
  participants: number;
  nftImage: string;
  openseaUrl: string;
  art: CollectionArt;
};

function buildPoolView(slug: string, pool: PublicPool | undefined, nft: OpenSeaPoolNft | null | undefined): PoolView {
  const collectionSlug = pool ? poolCollectionSlug(pool) : slug;
  const tokenId = nft?.tokenId || "";
  const collectionName = pool?.name || nft?.collectionName || poolDisplayName(slug);
  const floorEth = nft?.floorPriceEth || nft?.listingPriceEth || 0;
  const raisedEth = pool?.raisedEth ?? 0;
  const art = collectionArt(collectionSlug, pool?.imageUrl || nft?.imageUrl || "", collectionName);
  return {
    collectionName,
    assetName: tokenId ? `${collectionName} #${tokenId}` : collectionName,
    tokenId,
    floorEth,
    raisedEth,
    progress: poolProgress(raisedEth, floorEth),
    participants: pool?.participants ?? 0,
    nftImage: nft?.imageUrl || pool?.imageUrl || art.scene,
    openseaUrl: nft?.openseaUrl || `https://opensea.io/collection/${collectionSlug}`,
    art,
  };
}

const eth = (n: number) => (n > 0 ? n.toFixed(2) : "—");

const TICK = (
  <svg className="pd-tick" viewBox="0 0 16 16" aria-label="Verified">
    <path
      fill="#2f8cff"
      d="M8 .8l1.9 1.4 2.3-.1.7 2.2 1.9 1.3-.7 2.2.7 2.2-1.9 1.3-.7 2.2-2.3-.1L8 15.2l-1.9-1.4-2.3.1-.7-2.2-1.9-1.3.7-2.2-.7-2.2 1.9-1.3.7-2.2 2.3.1z"
    />
    <path d="M5.2 8.2l1.9 1.9 3.8-3.9" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function SoonBanner({ onPriorityLine, style }: { onPriorityLine: () => void; style?: React.CSSProperties }) {
  const [min, setMin] = useState(false);
  const ext = (url: string) => (url === "#" ? {} : { target: "_blank", rel: "noopener noreferrer" });
  return (
    <div className={`pd-soon${min ? " min" : ""}`} style={style}>
      <svg className="pds-ic" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10.3 3.5 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.5a2 2 0 0 0-3.4 0ZM12 9a1 1 0 0 1 1 1v4a1 1 0 1 1-2 0v-4a1 1 0 0 1 1-1Zm0 8.8a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Z" />
      </svg>
      <div className="pds-t">NFT Strategy goes live soon</div>
      <button className="pds-x" type="button" aria-label={min ? "Expand" : "Collapse"} aria-expanded={!min} onClick={() => setMin((m) => !m)}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 9l4-4 4 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="pds-b">
        <p>
          Pools for this collection are not open yet. Contributions, co-ownership and rewards will unlock at launch. Your membership
          already secures your seat, and you will be notified the moment it goes live.
        </p>
        <div className="pds-a">
          <a
            href="/priority-line"
            onClick={(e) => {
              e.preventDefault();
              onPriorityLine();
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Join the Priority Line
          </a>
          <a href={TELEGRAM_URL} {...ext(TELEGRAM_URL)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.9 4.3 18.7 19.4c-.2 1.1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-5 9.2-8.3c.4-.4-.1-.6-.6-.2L6.2 13.1l-4.9-1.5c-1.1-.3-1.1-1.1.2-1.6L20.6 2.7c.9-.3 1.6.2 1.3 1.6Z" />
            </svg>
            Get notified on Telegram
          </a>
          <a href={DISCORD_URL} {...ext(DISCORD_URL)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.6 5.3A17.6 17.6 0 0 0 15.3 4l-.5 1.1a16.3 16.3 0 0 0-5 0L9.3 4a17.5 17.5 0 0 0-4.3 1.3C2.3 9.4 1.6 13.4 1.9 17.3a17.7 17.7 0 0 0 5.4 2.7l1.1-1.8a11.4 11.4 0 0 1-1.8-.9l.4-.3a12.6 12.6 0 0 0 10.8 0l.4.3c-.6.4-1.2.7-1.8.9l1.1 1.8a17.6 17.6 0 0 0 5.4-2.7c.4-4.5-.7-8.5-3.3-12ZM8.7 14.9c-1 0-1.9-1-1.9-2.2s.8-2.2 1.9-2.2 1.9 1 1.9 2.2-.8 2.2-1.9 2.2Zm6.6 0c-1 0-1.9-1-1.9-2.2s.8-2.2 1.9-2.2 1.9 1 1.9 2.2-.8 2.2-1.9 2.2Z" />
            </svg>
            Join Discord
          </a>
        </div>
      </div>
    </div>
  );
}

/** V2 deposit panel docked into the pool page (`#pdDepHost > #depositModal.dm-split`). */
function DockedDeposit({ pool }: { pool: PoolView }) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address, query: { enabled: !!address } });
  const { data: ethUsd } = useEthUsdPrice();
  const { summary } = useDashboardData();
  const [amount, setAmount] = useState("");
  const [fillW, setFillW] = useState(0);

  useEffect(() => {
    const t = window.setTimeout(() => setFillW(pool.progress), 80);
    return () => window.clearTimeout(t);
  }, [pool.progress]);

  const balanceEth = balance ? Number(formatEther(balance.value)) : 0;
  const num = parseFloat(amount) || 0;
  const usd = ethUsd ? (num * ethUsd).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";
  const tier = TIERS.find((t) => t.name === summary?.tier);
  const canProceed = DEPOSITS_ENABLED && num > 0 && num <= balanceEth;

  const setPct = (pct: number) => setAmount(balanceEth > 0 ? String(pct === 100 ? balanceEth : +((balanceEth * pct) / 100).toFixed(4)) : "0");

  return (
    <div id="pdDepHost">
      <div className="deposit-modal dm-split" id="depositModal">
        <div className="dm-left">
          <img className="dm-left-bg" id="dmLeftBg" src={pool.art.scene} alt="" />
          <div className="dm-left-shade" />
          <div className="dm-left-top">
            <div className="dm-left-logo tgt-logo">
              <svg className="tgt-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                <circle cx="12" cy="12" r="8.5" />
                <circle cx="12" cy="12" r="4.5" />
                <circle cx="12" cy="12" r="1.2" fill="currentColor" />
                <path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3" />
              </svg>
            </div>
            <div>
              <div className="dm-left-coll">Target NFT</div>
              <div className="dm-left-k">Cheapest NFT for sale</div>
            </div>
            <a className="dm-os-btn" href={pool.openseaUrl} target="_blank" rel="noopener noreferrer">
              View on OpenSea
            </a>
          </div>
          <div className="dm-left-nft">
            <img id="dmLeftImg" alt={pool.assetName} src={pool.nftImage} />
          </div>
          <div className="dm-left-info">
            <div className="dm-left-row">
              <div>
                <div className="dm-left-k">NFT Price</div>
                <div className="dm-left-v" id="dmLeftPrice">
                  {eth(pool.floorEth)} ETH
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="dm-left-k">Pool Raised</div>
                <div className="dm-left-v" id="dmLeftRaised">
                  {pool.raisedEth.toFixed(2)} ETH
                </div>
              </div>
            </div>
            <div className="dm-left-prog">
              <div className="dm-left-pb">
                <i id="dmLeftFill" style={{ width: `${fillW}%`, transition: "width 1.5s cubic-bezier(.22,1,.36,1)" }} />
              </div>
              <span id="dmLeftPct">{pool.progress}% raised</span>
            </div>
            <div className="dm-left-users">
              <div className="dm-av">
                <i style={{ background: "#F25623" }} />
                <i style={{ background: "#2081e2" }} />
                <i style={{ background: "#34d399" }} />
                <i style={{ background: "#a78bfa" }} />
              </div>
              <span>
                <b id="dmLeftUsers">{pool.participants.toLocaleString()}</b> users already deposited
              </span>
            </div>
          </div>
        </div>

        <div className="dm-right">
          {!isConnected && (
            <div className="dm-guest">
              <div className="dm-guest-ic">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="6" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="16.5" cy="14.5" r="1.4" fill="currentColor" />
                  <path d="M7 6V5a2 2 0 0 1 2-2h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <div className="dm-guest-t">Connect your wallet</div>
              <div className="dm-guest-s">Connect a wallet to deposit into this pool and co-own the target NFT.</div>
              <div className="dm-guest-asset">
                <div>
                  <div className="dm-guest-k">Pool Asset</div>
                  <div className="dm-guest-v">{pool.assetName}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="dm-guest-k">Collection Floor</div>
                  <div className="dm-guest-v">{eth(pool.floorEth)} ETH</div>
                </div>
              </div>
              <div className="dm-guest-acts">
                <button className="dm-guest-connect" type="button" onClick={() => window.openSignup?.()}>
                  CONNECT WALLET
                </button>
                <button className="dm-guest-member" type="button" onClick={() => router.push("/membership")}>
                  VIEW MEMBERSHIPS
                </button>
              </div>
              <div className="dm-guest-note">A membership is required to deposit. Your tier sets your max deposit.</div>
            </div>
          )}
          <div className="dm-header">
            <div className="dm-title">ENTER DEPOSIT AMOUNT</div>
          </div>
          <div className="dm-body">
            <div className="dm-asset-box">
              <div className="dm-asset-col">
                <div className="dm-asset-lbl">Pool Asset</div>
                <div className="dm-asset-val" id="dm-asset-name">
                  {pool.assetName}
                </div>
              </div>
              <div className="dm-asset-col dm-asset-col-right">
                <div className="dm-asset-lbl">Collection Floor</div>
                <div className="dm-asset-val" id="dm-floor">
                  {eth(pool.floorEth)} <span className="eth-ic" />
                </div>
              </div>
            </div>
            <div className="dm-amount-hdr">
              <div className="dm-amount-lbl">Amount to Deposit</div>
              <div className="dm-balance">
                Available Balance:{" "}
                <span>
                  {balanceEth.toFixed(balanceEth >= 1 ? 2 : 4)} <span className="eth-ic" />
                </span>
              </div>
            </div>
            <div className="dm-input-wrap">
              <input
                className="dm-eth-input"
                id="dm-eth-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="dm-eth-unit">ETH</div>
            </div>
            <div className="dm-usd-row">
              <div className="dm-usd-val" id="dm-usd-val">
                ≈ ${usd} USD
              </div>
              <div className="dm-pct-btns">
                {[25, 50, 75, 100].map((p) => (
                  <button key={p} className="dm-pct-btn" type="button" onClick={() => setPct(p)}>
                    {p === 100 ? "MAX" : `${p}%`}
                  </button>
                ))}
              </div>
            </div>
            <div className="dm-divider" />
            <div className="dm-actions">
              <button className="dm-cancel-btn" type="button" onClick={() => setAmount("")}>
                CANCEL
              </button>
              <button
                className={`dm-proceed-btn${DEPOSITS_ENABLED ? "" : " au-soon"}`}
                id="dm-proceed-btn"
                type="button"
                disabled={!canProceed}
                onClick={() => openDepositModal(pool.assetName, eth(pool.floorEth))}
              >
                {DEPOSITS_ENABLED ? "DEPOSIT" : "Opens soon"}
              </button>
            </div>
            <div className="dm-membership-info">
              <div className="dm-mem-rows">
                <div className="dm-mem-row">
                  <span className="dm-mem-lbl">My Membership</span>
                  <span className="dm-mem-val">
                    {tier ? `${tier.name.toUpperCase()} ($${tier.priceUsd.toLocaleString("en-US")})` : "NONE"}
                  </span>
                </div>
                <div className="dm-mem-row">
                  <span className="dm-mem-lbl">My Cap Deposit</span>
                  <span className="dm-mem-val">$0 / {tier ? tier.maxDeposit : "$0"}</span>
                </div>
              </div>
              <button className="dm-upgrade-btn" type="button" onClick={() => router.push("/membership")}>
                {tier ? "UPGRADE" : "BUY"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StrategyMechanics() {
  return (
    <div id="pdMechWrap" style={{ margin: "0px 0px 22px" }}>
      <div className="pd-mech-h">Strategy Mechanics</div>
      <div className="pd-card pd-how">
        <div className="pd-card-h">
          <span className="pd-tag">How it works</span>An always-on buying engine
        </div>
        <p>
          NFT Strategies are automated smart contracts, each focused on one blue-chip collection. A strategy opens a pool, the community
          deposits ETH, and the pool buys the cheapest NFT available. That NFT is listed for sale at a premium, and a new pool opens to buy the
          next cheapest one.
        </p>
        <p>The cycle repeats on its own, fully decentralized and automated.</p>
      </div>
      <div className="pd-mech">
        <div className="pd-card">
          <div className="pd-card-h">
            <span className="pd-tag buy">Buy</span>How the pool buys
          </div>
          <ol>
            <li>
              <b>Users deposit ETH</b>Members deposit ETH into the pool. Your membership sets how much you can deposit.
            </li>
            <li>
              <b>Target reached</b>When total raised hits the target needed, the pool is closed.
            </li>
            <li>
              <b>Floor NFT is bought</b>The pool instantly buys the lowest-priced NFT from the collection listed on OpenSea. The NFT is owned by
              everyone who deposited.
            </li>
          </ol>
        </div>
        <div className="pd-card">
          <div className="pd-card-h">
            <span className="pd-tag sell">Sell</span>How the pool sells
          </div>
          <ol>
            <li>
              <b>NFT listing</b>Right after the purchase, the NFT is listed for sale at a premium, on average 10–25% higher.
            </li>
            <li>
              <b>Sale completes</b>When the NFT is sold on OpenSea, the sale settles on-chain.
            </li>
            <li>
              <b>Profit sharing</b>After the sale, the ETH goes back to depositors, plus profit, split by the size of each seat in the pool.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function PoolDetailView({ pool }: { pool: PoolView }) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(SHELL_MOBILE_MQ);
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const { art } = pool;
  const toPriorityLine = () => router.push("/priority-line");

  return (
    <MainLayout panelClassName="pd-docked">
      <div className="feed" id="feed-pooldetail">
        <div className="pd">
          <div className="pd-hero">
            <img className="pd-bg" src={art.scene} alt="" />
            <div className="pd-shade" />
            <div className="pd-in">
              {/* V2 moves the "goes live soon" banner below the hero on mobile. */}
              {!isMobile && <SoonBanner onPriorityLine={toPriorityLine} />}
              <div className="pd-left">
                <div className="pd-idrow">
                  <div className="pd-id">
                    <img className="pd-logo" src={art.logo} alt="" />
                    <div>
                      <div className="pd-name">
                        {pool.collectionName}
                        {TICK}
                      </div>
                      <div className="pd-sub">
                        <span>Strategy</span>
                        {art.x && (
                          <a href={art.x} target="_blank" rel="noopener noreferrer" aria-label="X">
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                              <path d="M17.8 3h3.1l-6.8 7.8 8 10.2h-6.3l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.8 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z" />
                            </svg>
                          </a>
                        )}
                        {art.web && (
                          <a href={art.web} target="_blank" rel="noopener noreferrer" aria-label="Website">
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <circle cx="12" cy="12" r="9" />
                              <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" />
                            </svg>
                          </a>
                        )}
                        <a href={pool.openseaUrl} target="_blank" rel="noopener noreferrer" aria-label="OpenSea">
                          <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                            <path d="M4 14.5 9.6 5.8l2.6 7.1-1.1 1.6zM13 17h7.6c-.6 2.3-2.4 3.5-4.7 3.5H6.4C4.9 20.5 4 19 4 17.6V17h6.6l1-1.6h1.4z" />
                          </svg>
                        </a>
                        {art.creator && (
                          <div className="pd-meta">
                            <span>
                              <em className="pd-meta-by">By {art.creator}</em>
                              {art.creatorVerified && (
                                <svg viewBox="0 0 16 16">
                                  <path
                                    fill="currentColor"
                                    d="M8 .8l1.9 1.4 2.3-.1.7 2.2 1.9 1.3-.7 2.2.7 2.2-1.9 1.3-.7 2.2-2.3-.1L8 15.2l-1.9-1.4-2.3.1-.7-2.2-1.9-1.3.7-2.2-.7-2.2 1.9-1.3.7-2.2 2.3.1z"
                                  />
                                  <path d="M5.2 8.2l1.9 1.9 3.8-3.9" fill="none" className="pd-meta-ck" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </span>
                            {art.supply && (
                              <span>
                                <svg viewBox="0 0 16 16" fill="currentColor">
                                  <path d="M8 1 1 4.5 8 8l7-3.5z" />
                                  <path d="M2.6 7.2 1 8l7 3.5L15 8l-1.6-.8L8 9.9z" />
                                  <path d="M2.6 10.7 1 11.5 8 15l7-3.5-1.6-.8L8 13.4z" />
                                </svg>
                                {art.supply}
                              </span>
                            )}
                            {art.since && <span>{art.since}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {isMobile && <SoonBanner onPriorityLine={toPriorityLine} style={{ margin: "14px 0 4px" }} />}

          <DockedDeposit pool={pool} />
          <StrategyMechanics />
        </div>

        <div className="section-hdr">
          <div className="section-title">Transaction Activity</div>
        </div>
        <div className="tx-table-wrap">
          <table className="tx-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Type</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="txTable">
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "28px 16px" }}>
                  Transaction activity will appear here once the pool goes live.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <HntrFooter />
      </div>
    </MainLayout>
  );
}

function PoolDetailSkeleton() {
  return (
    <MainLayout panelClassName="pd-docked">
      <div className="feed" id="feed-pooldetail">
        <div className="pd">
          <div className="pd-skel" style={{ height: 150, borderRadius: 14, marginBottom: 18 }} />
          <div className="pd-skel" style={{ height: 72, width: "50%", borderRadius: 12, marginBottom: 22 }} />
          <div className="pd-skel" style={{ height: 560, borderRadius: 18 }} />
        </div>
      </div>
    </MainLayout>
  );
}

export default function PoolDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const parsed = parsePoolRouteId(id);

  const { data: poolRecord, isLoading: poolLoading } = usePool(parsed.slug || null);
  const collectionSlug = poolRecord ? poolCollectionSlug(poolRecord) : parsed.slug;
  const { data: nft, isLoading: nftLoading, error } = useOpenSeaPoolNft(collectionSlug || null, parsed.tokenId);
  const view = useMemo(() => buildPoolView(parsed.slug, poolRecord, nft), [parsed.slug, poolRecord, nft]);

  if (poolLoading || nftLoading) return <PoolDetailSkeleton />;

  if (!poolRecord && (error || !nft)) {
    return (
      <MainLayout>
        <div className="feed pd-error" id="feed-pooldetail">
          <div className="pd-error-title">Pool not found</div>
          <div className="pd-error-sub">This strategy pool is not available. Go back to Pools and pick one.</div>
        </div>
      </MainLayout>
    );
  }

  return <PoolDetailView pool={view} key={`${parsed.slug}-${view.tokenId}`} />;
}
