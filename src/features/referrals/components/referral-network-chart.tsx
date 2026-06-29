"use client";

import * as React from "react";
import { buildNetworkTree, type TreeNode } from "@/features/referrals/lib/build-network-tree";
import { cn } from "@/lib/utils";

const MIN_HEIGHT = 320;

function TreeNodeGraphic({
  node,
  showLabels,
  index,
}: {
  node: TreeNode;
  showLabels: boolean;
  index: number;
}) {
  const mono = "var(--fm)";

  if (node.level === 0) {
    return (
      <g
        className="topo-node"
        style={{
          animationDelay: `${0.08 + index * 0.025}s`,
          transformOrigin: `${node.x}px ${node.y}px`,
        }}
      >
        <circle cx={node.x} cy={node.y} r={22} fill="var(--topo-node)" opacity={0.1} />
        <circle cx={node.x} cy={node.y} r={9} fill="var(--topo-node)" />
        <circle
          className="topo-pulse"
          cx={node.x}
          cy={node.y}
          r={14}
          fill="none"
          strokeWidth={1.4}
          opacity={0.35}
        />
        {showLabels && node.label && (
          <text
            className="topo-label"
            x={node.x}
            y={node.y + 26}
            textAnchor="middle"
            fontFamily={mono}
            fontSize={9}
            fontWeight={700}
          >
            {node.label}
          </text>
        )}
        {showLabels && node.sub && (
          <text
            className="topo-label-sub"
            x={node.x}
            y={node.y + 38}
            textAnchor="middle"
            fontFamily={mono}
            fontSize={7}
          >
            {node.sub}
          </text>
        )}
      </g>
    );
  }

  if (node.level === 1) {
    return (
      <g
        className="topo-node"
        style={{
          animationDelay: `${0.08 + index * 0.025}s`,
          transformOrigin: `${node.x}px ${node.y}px`,
        }}
      >
        <circle cx={node.x} cy={node.y} r={7} fill="var(--topo-node)" />
        <circle
          cx={node.x}
          cy={node.y}
          r={11}
          fill="none"
          stroke="var(--topo-node)"
          strokeWidth={1}
          opacity={0.28}
        />
        {showLabels && node.label && (
          <text
            className="topo-label"
            x={node.x}
            y={node.y + 20}
            textAnchor="middle"
            fontFamily={mono}
            fontSize={8}
          >
            {node.label}
          </text>
        )}
        {showLabels && node.sub && (
          <text
            className="topo-label-sub"
            x={node.x}
            y={node.y + 30}
            textAnchor="middle"
            fontFamily={mono}
            fontSize={7}
          >
            {node.sub}
          </text>
        )}
      </g>
    );
  }

  if (node.level === 2) {
    return (
      <g
        className="topo-node"
        style={{
          animationDelay: `${0.08 + index * 0.025}s`,
          transformOrigin: `${node.x}px ${node.y}px`,
        }}
      >
        <circle
          cx={node.x}
          cy={node.y}
          r={4.5}
          fill="none"
          stroke="var(--topo-node-sub)"
          strokeWidth={1.5}
        />
        {showLabels && node.label && (
          <text
            className="topo-label-sub"
            x={node.x}
            y={node.y + 14}
            textAnchor="middle"
            fontFamily={mono}
            fontSize={6}
          >
            {node.label}
          </text>
        )}
      </g>
    );
  }

  return (
    <g
      className="topo-node"
      style={{
        animationDelay: `${0.08 + index * 0.025}s`,
        transformOrigin: `${node.x}px ${node.y}px`,
      }}
    >
      <circle cx={node.x} cy={node.y} r={2.5} fill="var(--topo-leaf)" />
    </g>
  );
}

export function ReferralNetworkChart() {
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const [view, setView] = React.useState<"2d" | "node">("2d");
  const [size, setSize] = React.useState({ width: 700, height: MIN_HEIGHT });
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [latency, setLatency] = React.useState(14);
  const dragRef = React.useRef<{ active: boolean; lastX: number; lastY: number }>({
    active: false,
    lastX: 0,
    lastY: 0,
  });

  const tree = React.useMemo(
    () => buildNetworkTree(size.width),
    [size.width],
  );
  const showLabels = view === "2d";

  React.useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const update = () => {
      setSize({
        width: el.offsetWidth || 700,
        height: Math.max(el.offsetHeight, MIN_HEIGHT),
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setLatency(10 + Math.floor(Math.random() * 12));
    }, 2000);
    return () => window.clearInterval(interval);
  }, []);

  const applyTransform = React.useCallback(() => {
    return `translate(${pan.x},${pan.y}) scale(${zoom})`;
  }, [pan.x, pan.y, zoom]);

  React.useEffect(() => {
    const el = canvasRef.current?.querySelector("svg");
    if (!el) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaY > 0 ? 0.85 : 1.18;
      const rect = el.getBoundingClientRect();
      const mx = event.clientX - rect.left;
      const my = event.clientY - rect.top;
      setPan((prev) => ({
        x: mx - delta * (mx - prev.x),
        y: my - delta * (my - prev.y),
      }));
      setZoom((prev) => Math.max(0.3, Math.min(prev * delta, 3)));
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    dragRef.current = { active: true, lastX: event.clientX, lastY: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.style.cursor = "grabbing";
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current.active) return;
    const dx = event.clientX - dragRef.current.lastX;
    const dy = event.clientY - dragRef.current.lastY;
    dragRef.current.lastX = event.clientX;
    dragRef.current.lastY = event.clientY;
    setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const endDrag = (event: React.PointerEvent<SVGSVGElement>) => {
    dragRef.current.active = false;
    event.currentTarget.style.cursor = "grab";
  };

  const edgeStroke = (level: number) => {
    if (level === 3) return "var(--topo-edge-l3)";
    if (level === 2) return "var(--topo-edge-l2)";
    return "var(--topo-edge-l1)";
  };

  const edgeWidth = (level: number) => {
    if (level === 3) return 0.8;
    if (level === 2) return 1;
    return 1.4;
  };

  return (
    <div className="flex min-h-[380px] flex-col overflow-hidden rounded-[var(--r)] bg-e2 shadow-[var(--sh1),var(--glow)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-bd0 px-4 py-3">
        <h2 className="font-mono text-caption uppercase tracking-[0.12em] text-t1">
          Topology Matrix Mapping
        </h2>
        <div className="flex gap-1">
          {(
            [
              { id: "2d" as const, label: "2D Plane" },
              { id: "node" as const, label: "Node View" },
            ] as const
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setView(option.id)}
              className={cn(
                "h-6 rounded px-2.5 font-mono text-caption tracking-[0.07em] transition-colors",
                view === option.id
                  ? "net-topo-vbtn-active"
                  : "bg-e3 text-t1 hover:bg-[var(--sage-faint)] hover:text-t4",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={canvasRef} className="relative min-h-[320px] flex-1 bg-e2">
        <svg
          viewBox={`0 0 ${size.width} ${size.height}`}
          width="100%"
          height="100%"
          className="absolute inset-0 cursor-grab touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          aria-label="Referral network topology"
        >
          <g transform={applyTransform()}>
            {tree.edges.map(([from, to], index) => {
              const a = tree.nodes[from];
              const b = tree.nodes[to];
              return (
                <line
                  key={`${from}-${to}`}
                  className="topo-edge"
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={edgeStroke(b.level)}
                  strokeWidth={edgeWidth(b.level)}
                  style={{ animationDelay: `${index * 0.022}s` }}
                />
              );
            })}
            {tree.nodes.map((node, index) => (
              <TreeNodeGraphic
                key={node.id}
                node={node}
                showLabels={showLabels}
                index={index}
              />
            ))}
          </g>
        </svg>

        <div className="absolute bottom-2.5 right-3 flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className="flex h-[26px] items-center rounded-[5px] border border-[var(--sage-faint)] bg-e2 px-2 font-mono text-caption text-t2 shadow-sh1 transition-colors hover:bg-[var(--sage-faint)]"
          >
            RESET
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(z * 1.25, 3))}
            className="flex size-[26px] items-center justify-center rounded-[5px] border border-[var(--sage-faint)] bg-e2 font-mono text-body-sm text-t4 shadow-sh1 transition-colors hover:bg-[var(--sage-faint)]"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(z * 0.8, 0.3))}
            className="flex size-[26px] items-center justify-center rounded-[5px] border border-[var(--sage-faint)] bg-e2 font-mono text-body-sm text-t4 shadow-sh1 transition-colors hover:bg-[var(--sage-faint)]"
            aria-label="Zoom out"
          >
            −
          </button>
        </div>

        <div className="pointer-events-none absolute bottom-2.5 left-3 flex flex-col gap-0.5 rounded-[5px] bg-e3 px-2.5 py-1.5 font-mono text-caption text-t1 shadow-sh1">
          <span>
            System Status: <strong className="text-green">Mapping Active</strong>
          </span>
          <span>
            Latency: <strong className="text-t3">{latency}ms</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
