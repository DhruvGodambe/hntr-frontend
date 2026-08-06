/**
 * Sepolia deployment addresses for HNTRMembership + mock USDT/USDC.
 * Update these after each redeploy (keep in sync with hntr-backend CONTRACT_ADDRESS).
 * Deployed 2026-08-06: 0x96CAc40334EB407B596E44a535674d32f24eB30B (block ~11433519)
 */
export const CONTRACT_ADDRESS =
  "0x96CAc40334EB407B596E44a535674d32f24eB30B" as const satisfies `0x${string}`;

export const USDT_ADDRESS =
  "0xff26Bf42e258979e307B581F32A7C984BCEDA66a" as const satisfies `0x${string}`;

export const USDC_ADDRESS =
  "0x1A1Bf3C12dc85219D2422dd9B936c5845Be899A1" as const satisfies `0x${string}`;
