export type ReferralProfile = {
  username: string;
  rank: string;
  progress: number;
  progressStart: string;
  progressEnd: string;
};

export type ReferralStat = {
  label: string;
  value: string;
  subtext?: string;
  delta?: string;
};

export type ActiveReward = {
  id: string;
  title: string;
  tag: string;
  description: string;
  amount: string;
  icon: "referral" | "leadership" | "rank" | "nft" | "otc" | "liquidity";
};

export type ReferralTransaction = {
  id: string;
  dateTime: string;
  type: string;
  source: string;
  amount: string;
  status: "completed";
};

export const referralProfile: ReferralProfile = {
  username: "username",
  rank: "ELITE HUNTER",
  progress: 74,
  progressStart: "Hunter Elite",
  progressEnd: "Hunter Legend",
};

export const referralStats: ReferralStat[] = [
  {
    label: "Total Rewarded",
    value: "$119,551.44",
    delta: "+4.2% This Month",
  },
  {
    label: "HNTR Points",
    value: "6,913,586",
    subtext: "Available to Bridge",
  },
  {
    label: "Membership",
    value: "RANGER",
  },
  {
    label: "Total Network Users",
    value: "12,482",
    delta: "+1.8% Growth",
  },
];

export const activeRewards: ActiveReward[] = [
  {
    id: "referral",
    title: "Referral Commissions",
    tag: "REAL-TIME",
    description: "Collect rewards earned through your referrals.",
    amount: "$42,301.12",
    icon: "referral",
  },
  {
    id: "leadership",
    title: "Leadership Bonus",
    tag: "DAILY",
    description: "Leadership rewards are ready to claim.",
    amount: "$18,442.80",
    icon: "leadership",
  },
  {
    id: "rank",
    title: "Rank Bonus",
    tag: "WEEKLY",
    description: "Bonus earned for reaching a new rank.",
    amount: "$31,005.00",
    icon: "rank",
  },
  {
    id: "nft",
    title: "NFT Strategy Rewards",
    tag: "EVENT",
    description: "Claim profits from your NFT Strategy participation.",
    amount: "$25,000.00",
    icon: "nft",
  },
  {
    id: "otc",
    title: "OTC Desk",
    tag: "MONTHLY",
    description: "Claim earnings from OTC Desk operations.",
    amount: "$2,500.00",
    icon: "otc",
  },
  {
    id: "liquidity",
    title: "Liquidity Provider",
    tag: "SPECIAL",
    description: "Claim earnings from Providing Liquidity operations.",
    amount: "$302.52",
    icon: "liquidity",
  },
];

export const referralLink = {
  display: "hntr.net/ref/0x71c...492",
  url: "https://hntr.net/ref/0x71c492",
};

export const referralTransactions: ReferralTransaction[] = [
  {
    id: "tx-1",
    dateTime: "2024-05-12 14:32:01",
    type: "POOL_REWARD",
    source: "Global Liquidity Pool A",
    amount: "+$142.50",
    status: "completed",
  },
  {
    id: "tx-2",
    dateTime: "2024-05-12 11:15:44",
    type: "RANK_REWARD",
    source: "Monthly Elite Stipend",
    amount: "+$2,500.00",
    status: "completed",
  },
  {
    id: "tx-3",
    dateTime: "2024-05-11 09:02:18",
    type: "NETWORK_COMM",
    source: "Direct Referral Volume",
    amount: "+$840.00",
    status: "completed",
  },
  {
    id: "tx-4",
    dateTime: "2024-05-10 22:48:33",
    type: "DISCRETIONARY",
    source: "Institutional Bonus Pool",
    amount: "+$125.00",
    status: "completed",
  },
];

export const transactionPagination = {
  from: 1,
  to: 4,
  total: 1244,
};
