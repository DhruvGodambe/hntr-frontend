"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { NetworkTreeNode } from "../../lib/rewards";

/** Avatar colour per membership tier (V2 palette); members without a tier get a neutral grey. */
const TIER_COLORS: Record<string, string> = {
  Bronze: "#f5c26b",
  Silver: "#c4b5fd",
  Gold: "#93c5fd",
  Platinum: "#fca5a5",
  Diamond: "#e5e7eb",
};
const NO_TIER_COLOR = "#a1a1aa";
const MAX_SEARCH_RESULTS = 30;

type FlatNode = { node: NetworkTreeNode; depth: number; /** Ancestors from the root down to the parent. */ path: NetworkTreeNode[] };

type ViewState = {
  /** Root username this state belongs to; a different root starts fresh. */
  root: string | null;
  /** Usernames of the expanded rows. */
  open: Set<string>;
  hit: string | null;
  query: string;
};

function flatten(root: NetworkTreeNode): FlatNode[] {
  const out: FlatNode[] = [];
  const walk = (node: NetworkTreeNode, depth: number, path: NetworkTreeNode[]) => {
    out.push({ node, depth, path });
    node.children?.forEach((child) => walk(child, depth + 1, [...path, node]));
  };
  walk(root, 0, []);
  return out;
}

function Chevron() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <path d="M3.5 2l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type RowProps = {
  node: NetworkTreeNode;
  depth: number;
  maxDepth: number;
  open: Set<string>;
  hit: string | null;
  onToggle: (node: NetworkTreeNode, force?: "open" | "close") => void;
};

function NodeRow({ node, depth, maxDepth, open, hit, onToggle }: RowProps) {
  const kids = node.children ?? [];
  const isRoot = depth === 0;
  const leaf = kids.length === 0;
  // The backend stops at the chosen depth (and at 200 members), so a member on the last loaded level
  // may still have people below: say so instead of claiming "No downline".
  const unknownBelow = leaf && depth >= maxDepth;
  const expanded = !leaf && open.has(node.username);
  const tier = node.tier || "None";

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (leaf) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle(node);
    } else if (e.key === "ArrowRight" && !expanded) {
      e.preventDefault();
      onToggle(node, "open");
    } else if (e.key === "ArrowLeft" && expanded) {
      e.preventDefault();
      onToggle(node, "close");
    }
  };

  return (
    <>
      <div
        className={`tn-row${expanded ? " open" : ""}${leaf ? " leaf" : ""}${isRoot ? " tn-root" : ""}${hit === node.username ? " hit" : ""}`}
        data-un={node.username}
        role="treeitem"
        aria-level={depth + 1}
        aria-expanded={leaf ? undefined : expanded}
        tabIndex={leaf ? -1 : 0}
        onClick={() => !leaf && onToggle(node)}
        onKeyDown={onKeyDown}
      >
        <div className="tn-chev">
          <Chevron />
        </div>
        <div className="tn-av" style={{ background: TIER_COLORS[tier] ?? NO_TIER_COLOR }} aria-hidden="true">
          {node.username.charAt(0).toUpperCase()}
        </div>
        <div className="tn-name">
          <b title={node.username}>{isRoot ? `${node.username} (you)` : node.username}</b>
          <span>Level {depth}</span>
        </div>
        <div className="tn-tier">{tier}</div>
        <div className="tn-cnt" title={unknownBelow ? "Increase the levels to see further down" : undefined}>
          {leaf ? (unknownBelow ? "—" : "No downline") : `${kids.length} first line`}
        </div>
      </div>
      {expanded && (
        <div className="tn-kids" role="group">
          {kids.map((child) => (
            <NodeRow key={child.username} node={child} depth={depth + 1} maxDepth={maxDepth} open={open} hit={hit} onToggle={onToggle} />
          ))}
        </div>
      )}
    </>
  );
}

type Props = {
  treeData?: NetworkTreeNode | null;
  isLoading?: boolean;
  /** Levels the tree was fetched with (3/6/9/12). */
  maxDepth: number;
  /** Matches the 2D canvas so switching views does not resize the card. */
  minHeight: number;
  /** Kept mounted while hidden so the expanded rows and search survive switching views. */
  hidden?: boolean;
};

/**
 * "Node View" of the Topology Matrix: the member's downline as a collapsible list with
 * username search (expands the path to the match and highlights it) and Collapse all.
 * Reuses the V2 `tn-*` styles. Works on the same tree the 2D plane draws.
 */
export default function NetworkNodeView({ treeData, isLoading = false, maxDepth, minHeight, hidden = false }: Props) {
  const rootName = treeData?.username ?? null;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [vs, setVs] = useState<ViewState>({ root: null, open: new Set(), hit: null, query: "" });
  const [resOpen, setResOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [pickTick, setPickTick] = useState(0);

  // A different root (another account) starts with only the root expanded.
  const fresh = useMemo<ViewState>(
    () => ({ root: rootName, open: new Set(rootName ? [rootName] : []), hit: null, query: "" }),
    [rootName],
  );
  const state = vs.root === rootName ? vs : fresh;
  const update = (fn: (s: ViewState) => ViewState) => setVs((prev) => fn(prev.root === rootName ? prev : fresh));

  const flat = useMemo(() => (treeData ? flatten(treeData) : []), [treeData]);

  const matches = useMemo(() => {
    const q = state.query.trim().toLowerCase();
    if (!q) return [];
    return flat.filter((x) => x.node.username.toLowerCase().includes(q)).slice(0, MAX_SEARCH_RESULTS);
  }, [flat, state.query]);

  const onToggle = (node: NetworkTreeNode, force?: "open" | "close") => {
    update((s) => {
      const open = new Set(s.open);
      const shouldClose = force ? force === "close" : open.has(node.username);
      if (shouldClose) {
        // Closing a row also closes everything below it.
        const drop = (n: NetworkTreeNode) => {
          open.delete(n.username);
          n.children?.forEach(drop);
        };
        drop(node);
      } else {
        open.add(node.username);
      }
      return { ...s, open };
    });
  };

  const collapseAll = () => update((s) => ({ ...s, open: new Set(rootName ? [rootName] : []), hit: null }));

  const pick = (x: FlatNode) => {
    update((s) => {
      const open = new Set(s.open);
      x.path.forEach((p) => open.add(p.username));
      return { ...s, open, hit: x.node.username, query: x.node.username };
    });
    setResOpen(false);
    setPickTick((t) => t + 1);
  };

  // After a pick, scroll the highlighted row to the middle of the list.
  useEffect(() => {
    if (!state.hit || !pickTick) return;
    const box = scrollRef.current;
    const el = box?.querySelector<HTMLElement>(`[data-un="${CSS.escape(state.hit)}"]`);
    if (!box || !el) return;
    const top = el.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
    box.scrollTop = Math.max(0, top - box.clientHeight / 2);
  }, [pickTick]); // eslint-disable-line

  const onSearchKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setResOpen(false);
    } else if (e.key === "ArrowDown" && matches.length) {
      e.preventDefault();
      setResOpen(true);
      setActive((i) => Math.min(matches.length - 1, i + 1));
    } else if (e.key === "ArrowUp" && matches.length) {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" && resOpen && matches[active]) {
      e.preventDefault();
      pick(matches[active]);
    }
  };

  const showResults = resOpen && state.query.trim().length > 0;
  const noDownline = !!treeData && (treeData.children?.length ?? 0) === 0;

  return (
    <div className="topo-canvas tn-canvas" style={{ minHeight }} hidden={hidden}>
      <div className="tn-wrap" ref={scrollRef} style={isLoading && treeData ? { opacity: 0.55 } : undefined}>
        {!treeData ? (
          <div className="tn-msg">{isLoading ? "Loading your network…" : "Connect your wallet to view your network."}</div>
        ) : (
          <>
            <div className="tn-bar">
              <div className="tn-search">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  placeholder="Search username"
                  autoComplete="off"
                  aria-label="Search username"
                  value={state.query}
                  onChange={(e) => {
                    const query = e.target.value;
                    update((s) => ({ ...s, query }));
                    setResOpen(true);
                    setActive(0);
                  }}
                  onFocus={() => setResOpen(true)}
                  onBlur={() => setResOpen(false)}
                  onKeyDown={onSearchKey}
                />
                <div className={`tn-res${showResults ? " on" : ""}`} role="listbox">
                  {matches.length ? (
                    matches.map((x, i) => (
                      <div
                        key={x.node.username}
                        role="option"
                        aria-selected={i === active}
                        className={i === active ? "is-active" : undefined}
                        // mouse-down (not click) so the input's blur doesn't close the list first
                        onMouseDown={(e) => {
                          e.preventDefault();
                          pick(x);
                        }}
                        // mousemove, not mouseenter: a pointer resting under the list must not override the arrow keys
                        onMouseMove={() => active !== i && setActive(i)}
                      >
                        {x.node.username}
                        <span>
                          Level {x.depth}
                          {x.path.length > 1 ? ` · via ${x.path[x.path.length - 1].username}` : ""}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="tn-none">No users found</div>
                  )}
                </div>
              </div>
              <button type="button" onClick={collapseAll}>
                Collapse all
              </button>
            </div>
            <div className="tn-tree" role="tree" aria-label="Your downline">
              <NodeRow node={treeData} depth={0} maxDepth={maxDepth} open={state.open} hit={state.hit} onToggle={onToggle} />
            </div>
            {noDownline && (
              <div className="tn-msg">No referrals yet. Share your referral link to start building your network.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
