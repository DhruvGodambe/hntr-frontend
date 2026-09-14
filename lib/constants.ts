/**
 * Per-chain HNTRMembership + USDT/USDC deployment addresses, and the RPC URL used
 * for each chain. This file is the single source of truth for all of these — no
 * env vars involved, so switching the active deployment (e.g. going live on
 * mainnet) means editing the values below, not per-environment .env files.
 *
 * The actual contract/token address used for a purchase/upgrade/claim always
 * comes from the backend response (`prepared.contractAddress` / `prepared.tokenAddress`),
 * so the addresses below only feed preflight reads and the payment-token
 * availability check.
 *
 * Update the Sepolia values after each Sepolia redeploy (keep in sync with
 * hntr-backend CONTRACT_ADDRESS/RPC_URL).
 */

type Address0x = `0x${string}`;

export const SEPOLIA_RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
export const MAINNET_RPC_URL = "https://ethereum-rpc.publicnode.com";

export const SEPOLIA_CONTRACT_ADDRESS: Address0x =
  "0xba7470F39C90C6ff9AEFa905382eCec69cD112c9" as const satisfies `0x${string}`;
export const SEPOLIA_USDT_ADDRESS: Address0x =
  "0xff26Bf42e258979e307B581F32A7C984BCEDA66a" as const satisfies `0x${string}`;
export const SEPOLIA_USDC_ADDRESS: Address0x =
  "0x1A1Bf3C12dc85219D2422dd9B936c5845Be899A1" as const satisfies `0x${string}`;

export const MAINNET_CONTRACT_ADDRESS: Address0x | "" = "0x6AF160Ed0B4be74B3E94d7849624934F65C889a7";
export const MAINNET_USDT_ADDRESS: Address0x | "" = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
export const MAINNET_USDC_ADDRESS: Address0x | "" = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

// Backward-compatible defaults (Sepolia) for call sites not yet chain-aware.
export const CONTRACT_ADDRESS = SEPOLIA_CONTRACT_ADDRESS;
export const USDT_ADDRESS = SEPOLIA_USDT_ADDRESS;
export const USDC_ADDRESS = SEPOLIA_USDC_ADDRESS;
