/**
 * Per-chain HNTRMembership + USDT/USDC deployment addresses.
 *
 * Sepolia is the current live deployment; the actual contract/token address
 * used for a purchase/upgrade/claim always comes from the backend response
 * (`prepared.contractAddress` / `prepared.tokenAddress`), so this file only
 * feeds preflight reads and the payment-token availability check.
 *
 * Mainnet addresses are provisioned via env vars and stay empty until the
 * mainnet contract is deployed and the backend is pointed at it:
 *   NEXT_PUBLIC_MAINNET_CONTRACT_ADDRESS
 *   NEXT_PUBLIC_MAINNET_USDT_ADDRESS
 *   NEXT_PUBLIC_MAINNET_USDC_ADDRESS
 *
 * Update the Sepolia values after each Sepolia redeploy (keep in sync with
 * hntr-backend CONTRACT_ADDRESS).
 */

type Address0x = `0x${string}`;

function envAddress(name: string): Address0x | "" {
  const v = process.env[name];
  return v && v.startsWith("0x") ? (v as Address0x) : "";
}

export const SEPOLIA_CONTRACT_ADDRESS: Address0x =
  "0xba7470F39C90C6ff9AEFa905382eCec69cD112c9" as const satisfies `0x${string}`;
export const SEPOLIA_USDT_ADDRESS: Address0x =
  "0xff26Bf42e258979e307B581F32A7C984BCEDA66a" as const satisfies `0x${string}`;
export const SEPOLIA_USDC_ADDRESS: Address0x =
  "0x1A1Bf3C12dc85219D2422dd9B936c5845Be899A1" as const satisfies `0x${string}`;

// Empty until the mainnet deployment lands; set via env vars above.
export const MAINNET_CONTRACT_ADDRESS: Address0x | "" = envAddress("NEXT_PUBLIC_MAINNET_CONTRACT_ADDRESS");
export const MAINNET_USDT_ADDRESS: Address0x | "" = envAddress("NEXT_PUBLIC_MAINNET_USDT_ADDRESS");
export const MAINNET_USDC_ADDRESS: Address0x | "" = envAddress("NEXT_PUBLIC_MAINNET_USDC_ADDRESS");

// Backward-compatible defaults (Sepolia) for call sites not yet chain-aware.
export const CONTRACT_ADDRESS = SEPOLIA_CONTRACT_ADDRESS;
export const USDT_ADDRESS = SEPOLIA_USDT_ADDRESS;
export const USDC_ADDRESS = SEPOLIA_USDC_ADDRESS;
