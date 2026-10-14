export function shortenAddress(address?: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-3)}`;
}

/** Maps a route to its V2 panel key (used as `#panel-<key>`, which the V2 stylesheet targets). */
const PANEL_KEYS: Record<string, string> = {
  marketplace: "vault",
  "priority-line": "priority",
  "gift-codes": "gifts",
};

export function resolveCurrentPage(pathname: string) {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/pool/")) return "pooldetail";
  const key = pathname.slice(1).split("/")[0];
  return PANEL_KEYS[key] ?? key;
}
