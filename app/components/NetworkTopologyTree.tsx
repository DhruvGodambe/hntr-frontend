"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CustomNodeElementProps, RawNodeDatum } from "react-d3-tree";
import type { NetworkTreeNode } from "../../lib/rewards";

const Tree = dynamic(() => import("react-d3-tree"), { ssr: false });

type Point = { x: number; y: number };
type View = { zoom: number; translate: Point };

type TopoAttributes = {
  level?: string;
  username?: string;
  addr?: string;
  mem?: string;
  rank?: string;
};

function readAttrs(nodeDatum: RawNodeDatum): TopoAttributes {
  const raw = nodeDatum.attributes;
  if (!raw) return { level: "0" };
  return {
    level: String(raw.level ?? "0"),
    username: raw.username != null ? String(raw.username) : undefined,
    addr: raw.addr != null ? String(raw.addr) : undefined,
    mem: raw.mem != null ? String(raw.mem) : undefined,
    rank: raw.rank != null ? String(raw.rank) : undefined,
  };
}

function shortAddr(addr: string) {
  if (!addr || addr.length < 10) return addr || "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function toTreeDatum(node: NetworkTreeNode, depth = 0, maxDepth = 12): RawNodeDatum {
  const isRoot = depth === 0;
  const canExpand = depth < maxDepth;
  return {
    name: isRoot ? "You" : node.username,
    attributes: {
      level: String(depth),
      username: node.username,
      addr: shortAddr(node.walletAddress),
      mem: node.tier || "None",
      rank: node.rank || "Unranked",
    },
    children:
      canExpand && node.children?.length
        ? node.children.map((child) => toTreeDatum(child, depth + 1, maxDepth))
        : undefined,
  };
}

function rootPlaceholder(rank = "Unranked"): RawNodeDatum {
  return {
    name: "You",
    attributes: { level: "0", rank },
    children: undefined,
  };
}

const CARD_SIZE: Record<"lg" | "sm" | "mini", { w: number; h: number; variant: "lg" | "sm" | "mini" }> = {
  lg: { w: 118, h: 52, variant: "lg" },
  sm: { w: 78, h: 44, variant: "sm" },
  mini: { w: 68, h: 38, variant: "mini" },
};

const CARD_TYPO = {
  lg: { user: 10, addr: 8.5, badge: 8, userY: 14, addrY: 26, badgeY: 36, badgeH: 13 },
  sm: { user: 9, addr: 8, badge: 7.5, userY: 12, addrY: 23, badgeY: 32, badgeH: 12 },
  mini: { user: 8.5, addr: 7.5, badge: 7, userY: 11, addrY: 20, badgeY: 28, badgeH: 11 },
} as const;

const MIN_NODE_GAP = 16;
const MAX_CARD_WIDTH = Math.max(CARD_SIZE.lg.w, CARD_SIZE.sm.w, CARD_SIZE.mini.w);
const SCALE_EXTENT = { min: 0.15, max: 3 };

function getCardSpec(level: number) {
  if (level === 1) return CARD_SIZE.lg;
  if (level === 2) return CARD_SIZE.sm;
  return CARD_SIZE.mini;
}

function ellipsize(text: string, fontSize: number, maxWidth: number) {
  const value = text.trim();
  if (!value) return "";
  const avg = fontSize * 0.62;
  const maxChars = Math.max(1, Math.floor(maxWidth / avg));
  if (value.length <= maxChars) return value;
  if (maxChars <= 1) return "…";
  return `${value.slice(0, maxChars - 1)}…`;
}

type TreeLayout = {
  depthFactor: number;
  nodeSize: { x: number; y: number };
  separation: { siblings: number; nonSiblings: number };
};

function getTreeLayout(maxDepth: number): TreeLayout {
  const nodeSizeX = MAX_CARD_WIDTH + MIN_NODE_GAP;
  const nodeSizeY = CARD_SIZE.lg.h + 24;
  const depthFactor =
    maxDepth <= 3 ? 88 : maxDepth <= 6 ? 76 : maxDepth <= 9 ? 68 : 60;

  return {
    depthFactor,
    nodeSize: { x: nodeSizeX, y: nodeSizeY },
    separation: { siblings: 1.14, nonSiblings: 1.24 },
  };
}

function countTreeLeaves(datum: RawNodeDatum): number {
  if (!datum.children?.length) return 1;
  return datum.children.reduce((sum, child) => sum + countTreeLeaves(child), 0);
}

function estimateTreeContentSize(datum: RawNodeDatum, layout: TreeLayout, maxDepth: number) {
  const leaves = Math.max(1, countTreeLeaves(datum));
  const width = Math.max(
    MAX_CARD_WIDTH + 32,
    leaves * layout.nodeSize.x * layout.separation.siblings,
  );
  const height = 72 + Math.max(1, maxDepth) * layout.depthFactor + CARD_SIZE.lg.h + 16;
  return { width, height, leaves };
}

function canvasHeightForDepth(maxDepth: number) {
  if (maxDepth >= 12) return 560;
  if (maxDepth >= 9) return 480;
  if (maxDepth >= 6) return 400;
  return 320;
}

function clampZoom(zoom: number) {
  return Math.min(SCALE_EXTENT.max, Math.max(SCALE_EXTENT.min, zoom));
}

function viewsEqual(a: View, b: View) {
  return a.zoom === b.zoom && a.translate.x === b.translate.x && a.translate.y === b.translate.y;
}

/** Native SVG cards — HTML inside foreignObject does not paint reliably on iOS WebKit. */
function TopoUserCard({ attrs, level }: { attrs: TopoAttributes; level: number }) {
  const spec = getCardSpec(level);
  const { w, h, variant } = spec;
  const typo = CARD_TYPO[variant];
  const x0 = -w / 2;
  const y0 = -h / 2;
  const textX = x0 + 10;
  const textWidth = w - 18;
  const username = ellipsize(attrs.username || "", typo.user, textWidth);
  const addr = ellipsize(attrs.addr || "", typo.addr, textWidth);
  const badgeLabel = ellipsize((attrs.mem || "NONE").toUpperCase(), typo.badge, textWidth - 4);
  const badgeW = Math.min(textWidth, Math.max(22, badgeLabel.length * typo.badge * 0.62 + 10));
  const isLg = variant === "lg";

  return (
    <g className={`topo-node-card-svg topo-node-card-svg--${variant}`} pointerEvents="none">
      <rect
        x={x0}
        y={y0}
        width={w}
        height={h}
        rx={6}
        ry={6}
        className={`topo-node-card-bg${isLg ? " topo-node-card-bg--lg" : ""}`}
      />
      <rect
        x={x0}
        y={y0}
        width={3}
        height={h}
        className={`topo-node-card-accent${isLg ? " topo-node-card-accent--lg" : ""}`}
      />
      <text
        x={textX}
        y={y0 + typo.userY}
        className="topo-node-card-user"
        fontSize={typo.user}
      >
        {username}
      </text>
      <text
        x={textX}
        y={y0 + typo.addrY}
        className="topo-node-card-addr topo-text-muted"
        fontSize={typo.addr}
      >
        {addr}
      </text>
      <rect
        x={textX}
        y={y0 + typo.badgeY}
        width={badgeW}
        height={typo.badgeH}
        rx={3}
        ry={3}
        className="topo-node-card-badge-bg"
      />
      <text
        x={textX + 5}
        y={y0 + typo.badgeY + typo.badgeH * 0.72}
        className="topo-node-card-badge"
        fontSize={typo.badge}
      >
        {badgeLabel}
      </text>
    </g>
  );
}

function TopoRootNode({ attrs }: { attrs: TopoAttributes }) {
  const rank = ellipsize(attrs.rank || "", 9, 112);
  return (
    <g className="topo-root-node" pointerEvents="none">
      <circle r={22} className="topo-root-halo" />
      <circle r={9} className="topo-root-core" />
      <circle r={14} className="topo-root-pulse" />
      <text x={0} y={38} className="topo-root-label" textAnchor="middle" fontSize={10}>
        You
      </text>
      {rank ? (
        <text x={0} y={51} className="topo-root-rank topo-text-muted" textAnchor="middle" fontSize={9}>
          {rank}
        </text>
      ) : null}
    </g>
  );
}

function renderCustomNode({ nodeDatum }: CustomNodeElementProps) {
  const attrs = readAttrs(nodeDatum);
  const level = Number(attrs.level ?? 0);

  if (level === 0) return <TopoRootNode attrs={attrs} />;
  return <TopoUserCard attrs={attrs} level={level} />;
}

function TopoStatus() {
  const [latencyMs, setLatencyMs] = useState(14);

  useEffect(() => {
    const id = window.setInterval(() => {
      setLatencyMs(10 + Math.floor(Math.random() * 12));
    }, 2000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="topo-status">
      <span>
        System Status: <strong>Mapping Active</strong>
      </span>
      <span>
        Latency: <strong>{latencyMs}ms</strong>
      </span>
    </div>
  );
}

interface NetworkTopologyTreeProps {
  treeData?: NetworkTreeNode | null;
  isLoading?: boolean;
  rootRank?: string;
  maxDepth?: number;
}

export default function NetworkTopologyTree({
  treeData,
  isLoading = false,
  rootRank = "Unranked",
  maxDepth = 3,
}: NetworkTopologyTreeProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<View>({ zoom: 1, translate: { x: 0, y: 50 } });
  const lastFitKeyRef = useRef("");
  const [dimensions, setDimensions] = useState({ width: 0, height: 320 });
  const [view, setView] = useState<View>(viewRef.current);

  const hasRealData = treeData != null;
  const hasDownline = hasRealData && Array.isArray(treeData.children) && treeData.children.length > 0;

  const data = useMemo(() => {
    if (treeData) return toTreeDatum(treeData, 0, maxDepth);
    return rootPlaceholder(rootRank);
  }, [treeData, rootRank, maxDepth]);

  const layout = useMemo(() => getTreeLayout(maxDepth), [maxDepth]);
  const canvasMinHeight = canvasHeightForDepth(maxDepth);

  const commitView = useCallback((next: View) => {
    const committed: View = {
      zoom: clampZoom(next.zoom),
      translate: { x: next.translate.x, y: next.translate.y },
    };
    viewRef.current = committed;
    setView((prev) => (viewsEqual(prev, committed) ? prev : committed));
  }, []);

  const fitTree = useCallback(
    (width: number, height: number, datum: RawNodeDatum) => {
      if (width <= 0) return;
      const { width: contentWidth, height: contentHeight } = estimateTreeContentSize(
        datum,
        layout,
        maxDepth,
      );
      const padX = 48;
      const padY = 44;
      const zoomW = (width - padX) / contentWidth;
      const zoomH = (height - padY) / contentHeight;
      const fitZoom = Math.min(1, Math.max(0.18, Math.min(zoomW, zoomH)));
      commitView({ zoom: fitZoom, translate: { x: width / 2, y: 48 } });
    },
    [commitView, layout, maxDepth],
  );

  const centerTree = useCallback(() => {
    const width = dimensions.width || canvasRef.current?.clientWidth || 700;
    const height = dimensions.height || canvasRef.current?.clientHeight || canvasMinHeight;
    fitTree(width, height, data);
  }, [canvasMinHeight, data, dimensions.height, dimensions.width, fitTree]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let raf = 0;
    let tries = 0;

    const readSize = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.round(canvas.clientWidth || rect.width);
      const minHeight = canvasHeightForDepth(maxDepth);
      const height = Math.round(Math.max(canvas.clientHeight || rect.height, minHeight));
      return { width, height };
    };

    const updateDimensions = () => {
      const { width, height } = readSize();
      if (width <= 0) {
        if (tries < 40) {
          tries += 1;
          raf = window.requestAnimationFrame(updateDimensions);
        }
        return;
      }
      tries = 0;
      setDimensions((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
    };

    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    observer.observe(canvas);
    window.addEventListener("resize", updateDimensions);
    window.visualViewport?.addEventListener("resize", updateDimensions);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", updateDimensions);
      window.visualViewport?.removeEventListener("resize", updateDimensions);
    };
  }, [maxDepth]);

  useEffect(() => {
    if (dimensions.width <= 0) return;
    const fitKey = `${Math.round(dimensions.width)}x${Math.round(dimensions.height / 8) * 8}-${treeData?.username ?? "placeholder"}-${maxDepth}`;
    if (lastFitKeyRef.current === fitKey) return;
    lastFitKeyRef.current = fitKey;
    fitTree(dimensions.width, dimensions.height, data);
  }, [data, dimensions.height, dimensions.width, fitTree, maxDepth, treeData?.username]);

  const onUpdate = useCallback((target: { zoom: number; translate: Point }) => {
    viewRef.current = {
      zoom: target.zoom,
      translate: { x: target.translate.x, y: target.translate.y },
    };
  }, []);

  const bumpZoom = useCallback(
    (factor: number) => {
      const current = viewRef.current;
      commitView({ zoom: current.zoom * factor, translate: current.translate });
    },
    [commitView],
  );

  const pathClassFunc = useCallback((_link: unknown, orientation: string) => {
    void orientation;
    return "topo-tree-link";
  }, []);

  const showEmptyMessage = !isLoading && (!hasRealData || !hasDownline);
  const depthClass = `topo-canvas--depth-${maxDepth}`;
  const treeReady = dimensions.width > 0 && dimensions.height > 0;

  return (
    <div
      ref={canvasRef}
      className={`topo-canvas ${depthClass}`}
      id="topoCanvas"
      style={{ minHeight: canvasMinHeight }}
    >
      <div
        className="topo-tree-inner"
        style={
          treeReady
            ? { width: dimensions.width, height: dimensions.height }
            : undefined
        }
      >
        {treeReady ? (
          <Tree
            data={data}
            translate={view.translate}
            zoom={view.zoom}
            onUpdate={onUpdate}
            orientation="vertical"
            pathFunc="diagonal"
            pathClassFunc={pathClassFunc}
            renderCustomNodeElement={renderCustomNode}
            collapsible={false}
            zoomable
            draggable
            hasInteractiveNodes={false}
            scaleExtent={SCALE_EXTENT}
            nodeSize={layout.nodeSize}
            separation={layout.separation}
            depthFactor={layout.depthFactor}
            dimensions={dimensions}
            svgClassName="topo-tree-svg"
            dataKey={`${treeData?.username ?? "placeholder"}-${maxDepth}`}
            enableLegacyTransitions={false}
            transitionDuration={0}
          />
        ) : null}

        {isLoading ? (
          <div className="topo-empty-state">
            <p className="topo-empty-state-primary">Loading your network…</p>
          </div>
        ) : null}

        {showEmptyMessage && !isLoading ? (
          <div className="topo-empty-state">
            <p className="topo-empty-state-primary">
              {!hasRealData ? "Loading your network…" : "No referrals yet."}
            </p>
            {hasRealData ? (
              <p className="topo-empty-state-secondary">
                Share your referral link to start building your network.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="topo-zoom-controls" aria-label="Topology zoom controls">
        <button type="button" className="topo-zoom-btn" onClick={() => bumpZoom(1.25)} aria-label="Zoom in">
          +
        </button>
        <button type="button" className="topo-zoom-btn" onClick={() => bumpZoom(0.8)} aria-label="Zoom out">
          −
        </button>
        <button
          type="button"
          className="topo-zoom-btn topo-zoom-btn--reset"
          onClick={centerTree}
          aria-label="Reset view"
        >
          RESET
        </button>
      </div>

      <TopoStatus />
    </div>
  );
}
