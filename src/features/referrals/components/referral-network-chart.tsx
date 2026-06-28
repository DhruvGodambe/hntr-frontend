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
    <div className="flex min-h-[380px] flex-col overflow-hidden rounded-md bg-e2 shadow-[var(--sh1),var(--glow)]">
      <div className="flex items-center justify-between border-b-[0.5px] border-bd0 px-4 py-3">
        <h2 className="font-mono text-[9px] uppercase tracking-[0.12em] text-t1">
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
                "h-6 rounded px-2.5 font-mono text-[8px] tracking-[0.07em] transition-colors",
                view === option.id
                  ? "bg-e3 text-t4"
                  : "bg-e3 text-t1 hover:text-t2",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative min-h-[320px] flex-1 bg-e2">
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full p-8"
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

        <div className="absolute bottom-2.5 left-3 flex flex-col gap-0.5 rounded-[5px] bg-e3 px-2.5 py-1.5 font-mono text-[8px] text-t1 shadow-sh1">
          <span>
            System Status: <strong className="text-t3">Mapping Active</strong>
          </span>
          <span>
            Latency: <strong className="text-t3">14ms</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
