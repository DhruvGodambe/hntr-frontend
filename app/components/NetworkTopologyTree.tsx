"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CustomNodeElementProps, RawNodeDatum } from "react-d3-tree";
import type { NetworkTreeNode } from "../../lib/rewards";

const Tree = dynamic(() => import("react-d3-tree"), { ssr: false });

type Point = { x: number; y: number };

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

function getCardSpec(level: number) {
  if (level === 1) return CARD_SIZE.lg;
  if (level === 2) return CARD_SIZE.sm;
  return CARD_SIZE.mini;
}

function getTreeLayout(maxDepth: number) {
  if (maxDepth <= 3) {
    return { depthFactor: 96, nodeSize: { x: 140, y: 96 }, separation: { siblings: 1.08, nonSiblings: 1.25 } };
  }
  if (maxDepth <= 6) {
    return { depthFactor: 78, nodeSize: { x: 120, y: 72 }, separation: { siblings: 1.05, nonSiblings: 1.15 } };
  }
  if (maxDepth <= 9) {
    return { depthFactor: 64, nodeSize: { x: 100, y: 58 }, separation: { siblings: 1.02, nonSiblings: 1.1 } };
  }
  return { depthFactor: 52, nodeSize: { x: 88, y: 48 }, separation: { siblings: 1, nonSiblings: 1.05 } };
}

function TopoUserCard({ attrs, level }: { attrs: TopoAttributes; level: number }) {
  const spec = getCardSpec(level);
  const { w, h, variant } = spec;
  return (
    <foreignObject x={-w / 2} y={-h / 2} width={w} height={h} className="topo-node-fo">
      <div className={`topo-node-card topo-node-card--${variant}`}>
        <div className="topo-node-card-user">{attrs.username}</div>
        <div className="topo-node-card-addr">{attrs.addr}</div>
        <div className="topo-node-card-badge">{attrs.mem?.toUpperCase()}</div>
      </div>
    </foreignObject>
  );
}

function TopoRootNode({ attrs }: { attrs: TopoAttributes }) {
  return (
    <g className="topo-root-node">
      <circle r={22} className="topo-root-halo" />
      <circle r={9} className="topo-root-core" />
      <circle r={14} className="topo-root-pulse" />
      <foreignObject x={-60} y={26} width={120} height={40} className="topo-node-fo">
        <div className="topo-root-labels">
          <div className="topo-root-label">You</div>
          {attrs.rank ? <div className="topo-root-rank">{attrs.rank}</div> : null}
        </div>
      </foreignObject>
    </g>
  );
}

function renderCustomNode({ nodeDatum }: CustomNodeElementProps) {
  const attrs = readAttrs(nodeDatum);
  const level = Number(attrs.level ?? 0);

  if (level === 0) return <TopoRootNode attrs={attrs} />;
  return <TopoUserCard attrs={attrs} level={level} />;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 320 });
  const [zoom, setZoom] = useState(1);
  const [translate, setTranslate] = useState<Point>({ x: 0, y: 50 });
  const [latencyMs, setLatencyMs] = useState(14);

  const hasRealData = treeData != null;
  const hasDownline = hasRealData && Array.isArray(treeData.children) && treeData.children.length > 0;

  const data = useMemo(() => {
    if (treeData) return toTreeDatum(treeData, 0, maxDepth);
    return rootPlaceholder(rootRank);
  }, [treeData, rootRank, maxDepth]);

  const layout = useMemo(() => getTreeLayout(maxDepth), [maxDepth]);

  const fitTree = useCallback(
    (width: number, height: number) => {
      if (width <= 0) return;
      // Root sits near the top; leave room for maxDepth generations of cards.
      const contentHeight = 56 + maxDepth * layout.depthFactor + 72;
      const fitZoom = Math.min(1, Math.max(0.3, (height - 24) / contentHeight));
      setZoom(fitZoom);
      setTranslate({ x: width / 2, y: 44 });
    },
    [layout.depthFactor, maxDepth],
  );

  const centerTree = useCallback(
    (width: number) => {
      fitTree(width, dimensions.height || 320);
    },
    [dimensions.height, fitTree],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateDimensions = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width <= 0) return;
      const nextHeight = Math.max(height, maxDepth >= 6 ? 420 : 320);
      setDimensions({ width, height: nextHeight });
    };

    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    observer.observe(el);
    window.addEventListener("resize", updateDimensions);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateDimensions);
    };
  }, [maxDepth]);

  useEffect(() => {
    if (dimensions.width > 0) fitTree(dimensions.width, dimensions.height);
  }, [treeData, maxDepth, dimensions.width, dimensions.height, fitTree]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setLatencyMs(10 + Math.floor(Math.random() * 12));
    }, 2000);
    return () => window.clearInterval(id);
  }, []);

  const onUpdate = useCallback((target: { zoom: number; translate: Point }) => {
    setZoom(target.zoom);
    setTranslate(target.translate);
  }, []);

  const pathClassFunc = useCallback((_link: unknown, orientation: string) => {
    void orientation;
    return "topo-tree-link";
  }, []);

  const showEmptyMessage = !isLoading && (!hasRealData || !hasDownline);
  const canvasMinHeight = maxDepth >= 9 ? 520 : maxDepth >= 6 ? 420 : 320;

  return (
    <div className="topo-canvas" id="topoCanvas" style={{ minHeight: canvasMinHeight }}>
      <div className="topo-tree-inner" ref={containerRef}>
        {dimensions.width > 0 ? (
          <Tree
            data={data}
            translate={translate}
            zoom={zoom}
            onUpdate={onUpdate}
            orientation="vertical"
            pathFunc="diagonal"
            pathClassFunc={pathClassFunc}
            renderCustomNodeElement={renderCustomNode}
            collapsible={false}
            zoomable
            draggable
            scaleExtent={{ min: 0.25, max: 3 }}
            nodeSize={layout.nodeSize}
            separation={layout.separation}
            depthFactor={layout.depthFactor}
            dimensions={dimensions}
            svgClassName="topo-tree-svg"
            dataKey={`${treeData?.username ?? "placeholder"}-${maxDepth}`}
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
        <button type="button" className="topo-zoom-btn" onClick={() => setZoom((z) => Math.min(z * 1.25, 3))} aria-label="Zoom in">
          +
        </button>
        <button type="button" className="topo-zoom-btn" onClick={() => setZoom((z) => Math.max(z * 0.8, 0.3))} aria-label="Zoom out">
          −
        </button>
        <button
          type="button"
          className="topo-zoom-btn topo-zoom-btn--reset"
          onClick={() => centerTree(dimensions.width || containerRef.current?.offsetWidth || 700)}
          aria-label="Reset view"
        >
          RESET
        </button>
      </div>

      <div className="topo-status">
        <span>
          System Status: <strong>Mapping Active</strong>
        </span>
        <span>
          Latency: <strong>{latencyMs}ms</strong>
        </span>
      </div>
    </div>
  );
}
