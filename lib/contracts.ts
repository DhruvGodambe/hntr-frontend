import { parseAbi } from "viem";
import { CONTRACT_ADDRESS, USDC_ADDRESS, USDT_ADDRESS } from "./constants";

export { CONTRACT_ADDRESS, USDT_ADDRESS, USDC_ADDRESS };

export const TOKEN_ADDRESSES: Record<"USDT" | "USDC", `0x${string}`> = {
  USDT: USDT_ADDRESS,
  USDC: USDC_ADDRESS,
};

/**
 * Kept in lockstep with hntr-backend/src/services/contract.service.ts and
 * hntr/src/IHNTRMembership.sol. The frontend now calls the membership writes
 * directly from the user's wallet (the contract requires msg.sender == user),
 * so both the ERC20 ABI and the HNTRMembership write ABI live here.
 */
export const erc20Abi = parseAbi([
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
]);

export const hntrMembershipAbi = parseAbi([
  // --- Core purchase/upgrade ---
  "function purchaseMembership(address user, uint8 tier, address[] uplines, uint8[] ranks, address token, uint256 deadline, bytes signature)",
  "function upgradeMembership(address user, uint8 newTier, address[] uplines, uint8[] ranks, address token, uint256 deadline, bytes signature)",
  "function purchaseMembershipWithPermit(address user, uint8 tier, address[] uplines, uint8[] ranks, address token, uint256 deadline, bytes signature, uint256 permitValue, uint256 permitDeadline, uint8 permitV, bytes32 permitR, bytes32 permitS)",
  "function upgradeMembershipWithPermit(address user, uint8 newTier, address[] uplines, uint8[] ranks, address token, uint256 deadline, bytes signature, uint256 permitValue, uint256 permitDeadline, uint8 permitV, bytes32 permitR, bytes32 permitS)",

  // --- Withdrawals ---
  "function withdrawCommissions(address user, address token)",
  "function withdrawCompanyWallet(address user, address token)",
  "function withdrawProtocolBalance(address token)",

  // --- Company free membership force ---
  "function overrideMembershipTier(address user, uint8 tier)",

  // --- Views ---
  "function companyWallet() view returns (address)",
  "function getOverdueWallets(address token) view returns (address[])",
  "function withdrawableCommissions(address user, address token) view returns (uint256)",
  "function lockedCommissions(address user, address token) view returns (uint256)",
  "function lastClaimedAt(address user, address token) view returns (uint256)",
  "function tierPrices(uint8 tier) view returns (uint256)",
  "function getUser(address user) view returns (uint8 tier, uint256 joinedAt)",
  "function tokenDecimals() view returns (uint8)",
  "function nonces(address user) view returns (uint256)",
  "function signatureEpoch() view returns (uint256)",
  "function isAuthorizedSigner(address signer) view returns (bool)",
  "function protocolBalances(address wallet, address token) view returns (uint256)",
  "function totalProtocolBalance(address token) view returns (uint256)",

  // --- Events ---
  "event MembershipPurchased(address indexed user, uint8 tier, uint256 amount, address token)",
  "event MembershipUpgraded(address indexed user, uint8 oldTier, uint8 newTier, uint256 amountPaid, address token)",
  "event MembershipTierOverriden(address indexed user, uint8 tier, uint256 joinedAt)",
  "event CommissionEarned(address indexed user, uint256 liquidAmount, uint256 lockedAmount, uint8 level, address token)",
  "event CommissionWithdrawn(address indexed user, uint256 amount, address token)",
  "event CompanyWalletWithdrawn(address indexed user, address indexed token, uint256 amount, address indexed companyWallet)",
  "event ProtocolFundsCredited(address indexed wallet, address indexed token, uint256 amount)",
  "event ProtocolFundsWithdrawn(address indexed wallet, address indexed token, uint256 amount)",
]);

export const TIERS = [
  { name: "Bronze", priceUsd: 50, levels: 4, maxDeposit: "$400" },
  { name: "Silver", priceUsd: 250, levels: 6, maxDeposit: "$1,500" },
  { name: "Gold", priceUsd: 750, levels: 9, maxDeposit: "$4,000" },
  { name: "Platinum", priceUsd: 1500, levels: 12, maxDeposit: "$8,000" },
  { name: "Diamond", priceUsd: 2500, levels: 12, maxDeposit: "$25,000" },
] as const;

export type TierName = (typeof TIERS)[number]["name"];

/** Platinum and Diamond unlock Tailor OTC Desk + NFT Lending Platform. */
export const TIERS_WITH_OTC = new Set<TierName>(["Platinum", "Diamond"]);

export const RANKS = [
  {
    name: "Scout",
    teamVolumeUsd: 1_000,
    requiredMembership: "Bronze ($50)",
    achievementBonusUsd: 25,
    leadershipShares: null as number | null,
  },
  {
    name: "Tracker",
    teamVolumeUsd: 10_000,
    requiredMembership: "Silver ($250)",
    achievementBonusUsd: 150,
    leadershipShares: null,
  },
  {
    name: "Ranger",
    teamVolumeUsd: 50_000,
    requiredMembership: "Gold ($750)",
    achievementBonusUsd: 750,
    leadershipShares: null,
  },
  {
    name: "Hunter",
    teamVolumeUsd: 250_000,
    requiredMembership: "Platinum ($1,500)",
    achievementBonusUsd: 5_000,
    leadershipShares: 1,
  },
  {
    name: "Elite Hunter",
    teamVolumeUsd: 1_000_000,
    requiredMembership: "Platinum ($1,500)",
    achievementBonusUsd: 25_000,
    leadershipShares: 3,
  },
  {
    name: "Master Hunter",
    teamVolumeUsd: 5_000_000,
    requiredMembership: "Diamond ($2,500)",
    achievementBonusUsd: 100_000,
    leadershipShares: 7,
  },
  {
    name: "Legend Hunter",
    teamVolumeUsd: 25_000_000,
    requiredMembership: "Diamond ($2,500)",
    achievementBonusUsd: 500_000,
    leadershipShares: 15,
  },
] as const;

export const PACKAGE_BENEFITS = [
  {
    title: "Educational Section (All Tiers)",
    items: [
      "NFT collections and market history",
      "Market analysis and trend forecasting",
      "How to get started in NFTs",
      "Security best practices and wallet safety",
      "Video tutorials and step-by-step guides",
      "Pool strategies and investment education",
      "Ongoing updates on blue-chip projects",
    ],
  },
  {
    title: "Pool Strategy (All Tiers — Limited by Package)",
    items: [
      "Fully on-chain, transparent, and smart contract managed",
      "Users deposit ETH (or approved assets)",
      "Once the pool target is reached, the smart contract automatically buys a floor NFT from a blue-chip collection",
      "The NFT is listed for sale at a 10% premium",
      "Upon sale, participants claim their original deposit + proportional profit (after minimal fees)",
    ],
  },
  {
    title: "Tailor OTC Desk (Platinum & Diamond Only)",
    items: [
      "Exclusive access to curated private deals, collection offers, and OTC opportunities",
      "Professionally managed by the HNTR team",
      "Profit potential: 0% to 100%+ per deal",
      "25% platform fee on profits; 75% distributed monthly to participants (pro-rated by capital)",
    ],
  },
  {
    title: "NFT Lending Platform (Platinum & Diamond Only)",
    items: [
      "Deposit ETH, USDC, or approved assets",
      "HNTR team manages lending via top protocols (Gondi, NFTfi, Bendao, etc.)",
      "100% of APR/yields passed to depositors (HNTR takes 0% cut on yields)",
      "Monthly or protocol-cycle payouts",
    ],
  },
] as const;

export const PAYMENT_RULES = [
  "All Unilevel (not rank or pool) commissions follow an 80/20 rule: 80% instantly withdrawable and 20% directed into the first available pool",
  "Membership payments: USDT / USDC",
  "Network commissions: USDT / USDC — paid instantly via smart contract",
  "Pool deposits: ETH only",
  "Pool rewards: ETH only — paid instantly via smart contract",
  "Leadership bonus: monthly (manual distribution)",
  "Rank bonuses: same-day (manual distribution)",
] as const;

/**
 * Unilevel commission structure — mirrors HNTRMembership.sol gates.
 * Deeper levels require both the listed membership tier and rank.
 */
export const COMMISSION_LEVELS = [
  { level: 1, percent: 15, requiredMembership: "Any", requiredRank: "Default" },
  { level: 2, percent: 15, requiredMembership: "Any", requiredRank: "Default" },
  { level: 3, percent: 8, requiredMembership: "Any", requiredRank: "Default" },
  { level: 4, percent: 5, requiredMembership: "Bronze ($50)", requiredRank: "Scout (1k)" },
  { level: 5, percent: 4, requiredMembership: "Silver ($250)", requiredRank: "Tracker (10k)" },
  { level: 6, percent: 4, requiredMembership: "Silver ($250)", requiredRank: "Tracker (10k)" },
  { level: 7, percent: 4, requiredMembership: "Gold ($750)", requiredRank: "Ranger (50k)" },
  { level: 8, percent: 2, requiredMembership: "Gold ($750)", requiredRank: "Ranger (50k)" },
  { level: 9, percent: 2, requiredMembership: "Gold ($750)", requiredRank: "Ranger (50k)" },
  { level: 10, percent: 2, requiredMembership: "Platinum ($1,500)", requiredRank: "Hunter (250k)" },
  { level: 11, percent: 2, requiredMembership: "Platinum ($1,500)", requiredRank: "Hunter (250k)" },
  { level: 12, percent: 2, requiredMembership: "Platinum ($1,500)", requiredRank: "Hunter (250k)" },
] as const;
