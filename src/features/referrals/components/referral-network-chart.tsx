"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const nodes = [
  { cx: 50, cy: 50, r: 8 },
  { cx: 50, cy: 22, r: 5 },
  { cx: 74, cy: 38, r: 5 },
  { cx: 68, cy: 68, r: 5 },
  { cx: 32, cy: 68, r: 5 },
  { cx: 26, cy: 38, r: 5 },
];

export function ReferralNetworkChart() {
  const [view, setView] = React.useState<"2d" | "node">("2d");

  return (
    <div className="flex h-full min-h-[280px] flex-col rounded-md border border-border bg-e2 p-4 shadow-sh1">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-display text-[10px] font-bold uppercase tracking-[0.08em] text-t4">
          Topology Matrix Mapping
        </h2>
        <div className="flex overflow-hidden rounded-[3px] border border-border">
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
                "px-2 py-1 font-mono text-[7px] uppercase tracking-[0.04em] transition-colors",
                view === option.id
                  ? "bg-t4 text-e2"
                  : "bg-e2 text-t2 hover:bg-e3",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center rounded-md border border-border bg-e3">
        <svg
          viewBox="0 0 100 100"
          className="h-full max-h-[200px] w-full max-w-[200px]"
          aria-hidden
        >
          {nodes.slice(1).map((node) => (
            <line
              key={`line-${node.cx}-${node.cy}`}
              x1={nodes[0].cx}
              y1={nodes[0].cy}
              x2={node.cx}
              y2={node.cy}
              stroke="currentColor"
              strokeWidth="0.8"
              className="text-bd2"
            />
          ))}
          {nodes.map((node, index) => (
            <circle
              key={`node-${index}`}
              cx={node.cx}
              cy={node.cy}
              r={node.r}
              fill="currentColor"
              className={index === 0 ? "text-t4" : "text-t1"}
            />
          ))}
        </svg>

        <div className="absolute bottom-2 left-2 rounded-[3px] border border-border bg-e2 px-2 py-1">
          <p className="font-mono text-[7px] uppercase tracking-[0.04em] text-t2">
            System Status: Mapping Active
          </p>
          <p className="font-mono text-[7px] text-t0">Latency: 14ms</p>
        </div>
      </div>
    </div>
  );
}
