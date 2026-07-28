import { TOKEN_ADDRESSES } from "./contracts";

export type PaymentToken = "USDT" | "USDC";

export const PAYMENT_TOKENS: readonly PaymentToken[] = ["USDT", "USDC"] as const;

/** Resolve a token address or symbol to USDT/USDC when known. */
export function resolveTokenSymbol(addressOrSymbol?: string | null): PaymentToken | null {
  if (!addressOrSymbol) return null;
  const raw = String(addressOrSymbol).trim();
  if (!raw) return null;

  const upper = raw.toUpperCase();
  if (upper === "USDT" || upper === "USDC") return upper;

  const lower = raw.toLowerCase();
  for (const symbol of PAYMENT_TOKENS) {
    const configured = TOKEN_ADDRESSES[symbol];
    if (configured && configured.toLowerCase() === lower) return symbol;
  }
  return null;
}

/** Display label for history/admin tables. Falls back to a short address. */
export function formatTokenLabel(addressOrSymbol?: string | null): string {
  const symbol = resolveTokenSymbol(addressOrSymbol);
  if (symbol) return symbol;
  if (!addressOrSymbol) return "—";
  const raw = String(addressOrSymbol);
  if (raw.startsWith("0x") && raw.length >= 10) return `${raw.slice(0, 6)}…${raw.slice(-4)}`;
  return raw;
}

/** Short claimable breakdown like `USDT $12.00 · USDC $3.50`. */
export function formatClaimableByToken(
  tokens: Array<{ symbol: string; claimable: number }> | null | undefined,
): string {
  if (!tokens?.length) return "";
  const parts = tokens
    .filter((t) => t.claimable > 0)
    .map((t) => `${t.symbol} $${t.claimable.toFixed(2)}`);
  return parts.join(" · ");
}
