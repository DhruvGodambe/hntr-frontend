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

function toTreeDatum(node: NetworkTreeNode, depth = 0): RawNodeDatum {
  const isRoot = depth === 0;
  return {
    name: isRoot ? "You" : node.username,
    attributes: {
      level: String(depth),
      username: node.username,
      addr: shortAddr(node.walletAddress),
      mem: node.tier || "None",
      rank: node.rank || "Unranked",
    },
    children: node.children?.length
      ? node.children.map((child) => toTreeDatum(child, depth + 1))
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

const CARD_SIZE: Record<number, { w: number; h: number; variant: "lg" | "sm" | "mini" }> = {
  1: { w: 118, h: 52, variant: "lg" },
  2: { w: 78, h: 44, variant: "sm" },
  3: { w: 72, h: 40, variant: "mini" },
};

function TopoUserCard({ attrs, level }: { attrs: TopoAttributes; level: number }) {
  const spec = CARD_SIZE[level];
  if (!spec) return null;

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
  if (level >= 1 && level <= 3) return <TopoUserCard attrs={attrs} level={level} />;
  return <circle r={4} className="topo-root-core" />;
}

interface NetworkTopologyTreeProps {
  treeData?: NetworkTreeNode | null;
  isLoading?: boolean;
  rootRank?: string;
}

export default function NetworkTopologyTree({
  treeData,
  isLoading = false,
  rootRank = "Unranked",
}: NetworkTopologyTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 320 });
  const [zoom, setZoom] = useState(1);
  const [translate, setTranslate] = useState<Point>({ x: 0, y: 50 });
  const [latencyMs, setLatencyMs] = useState(14);

  const hasRealData = treeData != null;
  const hasDownline = hasRealData && Array.isArray(treeData.children) && treeData.children.length > 0;

  const data = useMemo(() => {
    if (treeData) return toTreeDatum(treeData);
    return rootPlaceholder(rootRank);
  }, [treeData, rootRank]);

  const centerTree = useCallback((width: number) => {
    setTranslate({ x: width / 2, y: 50 });
    setZoom(1);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateDimensions = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width <= 0) return;
      setDimensions({ width, height: Math.max(height, 320) });
      setTranslate((prev) => (prev.x === 0 && prev.y === 50 ? { x: width / 2, y: 50 } : prev));
    };

    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    observer.observe(el);
    window.addEventListener("resize", updateDimensions);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  useEffect(() => {
    if (dimensions.width > 0) centerTree(dimensions.width);
  }, [treeData, dimensions.width, centerTree]);

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

  return (
    <div className="topo-canvas" id="topoCanvas">
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
            scaleExtent={{ min: 0.3, max: 3 }}
            nodeSize={{ x: 140, y: 96 }}
            separation={{ siblings: 1.08, nonSiblings: 1.25 }}
            depthFactor={96}
            dimensions={dimensions}
            svgClassName="topo-tree-svg"
            dataKey={treeData?.username ?? "placeholder"}
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
