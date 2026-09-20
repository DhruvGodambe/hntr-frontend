/**
 * Per-chain HNTRMembership + USDT/USDC deployment addresses and RPC URLs.
 *
 * Active network is controlled by `NEXT_PUBLIC_NETWORK` (see NETWORK_SWITCHER):
 *   - sepolia / testnet  → Sepolia mocks (local / preview)
 *   - mainnet / main / prod / production → Ethereum mainnet (live)
 *
 * Set that env per branch/deploy (e.g. main branch → mainnet, develop → sepolia).
 * Addresses below are still the SSOT for each chain; only which set is "active"
 * comes from the env.
 */

type Address0x = `0x${string}`;

export type AppNetwork = "sepolia" | "mainnet";

/**
 * Parse NEXT_PUBLIC_NETWORK into a canonical app network.
 * Accepts: sepolia | testnet | mainnet | main | prod | production
 */
function parseAppNetwork(raw: string | undefined): AppNetwork {
  const v = (raw || "").trim().toLowerCase();
  if (v === "mainnet" || v === "main" || v === "prod" || v === "production" || v === "ethereum") {
    return "mainnet";
  }
  if (v === "sepolia" || v === "testnet" || v === "dev" || v === "development") {
    return "sepolia";
  }
  // Default: production builds → mainnet; local next dev → sepolia.
  return process.env.NODE_ENV === "production" ? "mainnet" : "sepolia";
}

/**
 * Flip this via env to pick the app network for the whole frontend.
 * Example (.env.local / Vercel):
 *   NEXT_PUBLIC_NETWORK=sepolia   # develop / preview
 *   NEXT_PUBLIC_NETWORK=mainnet   # main / production
 */
export const NETWORK_SWITCHER: AppNetwork = parseAppNetwork(process.env.NEXT_PUBLIC_NETWORK);

export const IS_MAINNET = NETWORK_SWITCHER === "mainnet";
export const IS_SEPOLIA = NETWORK_SWITCHER === "sepolia";

export const SEPOLIA_RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
export const MAINNET_RPC_URL = "https://ethereum-rpc.publicnode.com";

export const SEPOLIA_CONTRACT_ADDRESS: Address0x =
  "0x25D9a3670891C2349E8606a2Ea736A160f3A495c" as const satisfies `0x${string}`;
export const SEPOLIA_USDT_ADDRESS: Address0x =
  "0xff26Bf42e258979e307B581F32A7C984BCEDA66a" as const satisfies `0x${string}`;
export const SEPOLIA_USDC_ADDRESS: Address0x =
  "0x1A1Bf3C12dc85219D2422dd9B936c5845Be899A1" as const satisfies `0x${string}`;

export const MAINNET_CONTRACT_ADDRESS: Address0x =
  "0x6AF160Ed0B4be74B3E94d7849624934F65C889a7" as const satisfies `0x${string}`;
/** Tether USD (Ethereum mainnet). */
export const MAINNET_USDT_ADDRESS: Address0x =
  "0xdAC17F958D2ee523a2206206994597C13D831ec7" as const satisfies `0x${string}`;
/** USD Coin (Ethereum mainnet). */
export const MAINNET_USDC_ADDRESS: Address0x =
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as const satisfies `0x${string}`;

/** Active deployment addresses — driven by NETWORK_SWITCHER / NEXT_PUBLIC_NETWORK. */
export const CONTRACT_ADDRESS: Address0x = IS_MAINNET
  ? MAINNET_CONTRACT_ADDRESS
  : SEPOLIA_CONTRACT_ADDRESS;
export const USDT_ADDRESS: Address0x = IS_MAINNET ? MAINNET_USDT_ADDRESS : SEPOLIA_USDT_ADDRESS;
export const USDC_ADDRESS: Address0x = IS_MAINNET ? MAINNET_USDC_ADDRESS : SEPOLIA_USDC_ADDRESS;
export const APP_RPC_URL = IS_MAINNET ? MAINNET_RPC_URL : SEPOLIA_RPC_URL;
