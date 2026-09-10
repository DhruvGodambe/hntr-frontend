/**
 * Sepolia deployment addresses for HNTRMembership + mock USDT/USDC.
 * Update these after each redeploy (keep in sync with hntr-backend CONTRACT_ADDRESS).
 * Deployed 2026-09-10: 0xba7470F39C90C6ff9AEFa905382eCec69cD112c9 (block 11670703)
 */
export const CONTRACT_ADDRESS =
  "0xba7470F39C90C6ff9AEFa905382eCec69cD112c9" as const satisfies `0x${string}`;

export const USDT_ADDRESS =
  "0xff26Bf42e258979e307B581F32A7C984BCEDA66a" as const satisfies `0x${string}`;

export const USDC_ADDRESS =
  "0x1A1Bf3C12dc85219D2422dd9B936c5845Be899A1" as const satisfies `0x${string}`;
