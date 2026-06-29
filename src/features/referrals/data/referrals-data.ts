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
  positive?: boolean;
  displayFont?: boolean;
};

export type ActiveReward = {
  id: string;
  title: string;
  tag: string;
  description: string;
  amount: string;
  icon: "referral" | "leadership" | "rank" | "nft" | "otc" | "liquidity";
  delay: string;
};

export type ReferralTransaction = {
  id: string;
  dateTime: string;
  type: string;
  source: string;
  amount: string;
  status: "completed";
};

export const networkHero = {
  title: "Network",
  subtitle: "Institutional rewards dashboard & network commissions",
};

export type ReferralPerformanceColumn = {
  name: string;
  current: string;
  target: string;
  percent: number;
  complete: boolean;
  team: string;
};

export const referralPerformance = {
  rule: [40, 40, 40] as const,
  columns: [
    {
      name: "COMPETITIVE",
      current: "10K",
      target: "10K",
      percent: 100,
      complete: true,
      team: "Vanguard",
    },
    {
      name: "COMPETITVE",
      current: "10K",
      target: "10K",
      percent: 100,
      complete: true,
      team: "Frontier",
    },
    {
      name: "WEAKEST",
      current: "1.1K",
      target: "4K",
      percent: 33,
      complete: false,
      team: "Outpost",
    },
  ] satisfies ReferralPerformanceColumn[],
};

export const referralProfile: ReferralProfile = {
  username: "masteraccount",
  rank: "Elite Hunter",
  progress: 74,
  progressStart: "Hunter Elite",
  progressEnd: "Hunter Legend",
};

export const referralStats: ReferralStat[] = [
  {
    label: "Total Rewarded",
    value: "$119,551.44",
    delta: "↗ +4.2% This Month",
    positive: true,
  },
  {
    label: "HNTR Points",
    value: "6,913,586",
    subtext: "Available to Bridge",
  },
  {
    label: "Membership",
    value: "RANGER",
    subtext: "Current Tier",
    displayFont: true,
  },
  {
    label: "Total Network Users",
    value: "12,482",
    delta: "↗ +1.8% Growth",
    positive: true,
  },
];

export const activeRewards: ActiveReward[] = [
  {
    id: "referral",
    title: "Referral Commissions",
    tag: "REAL-TIME",
    description:
      "Cumulative earnings from direct network institutional volume.",
    amount: "$42,301.12",
    icon: "referral",
    delay: ".05s",
  },
  {
    id: "leadership",
    title: "Leadership Bonus",
    tag: "DAILY",
    description:
      "Daily proportional distribution from global liquidity pools.",
    amount: "$18,442.80",
    icon: "leadership",
    delay: ".10s",
  },
  {
    id: "rank",
    title: "Rank Bonus",
    tag: "WEEKLY",
    description:
      "Bonus calculated based on organization performance metrics.",
    amount: "$31,005.00",
    icon: "rank",
    delay: ".15s",
  },
  {
    id: "nft",
    title: "NFT Strategy Rewards",
    tag: "EVENT",
    description:
      "One-time milestone incentives for achieving new Hunter tiers.",
    amount: "$25,000.00",
    icon: "nft",
    delay: ".20s",
  },
  {
    id: "otc",
    title: "OTC Desk",
    tag: "MONTHLY",
    description:
      "Recurring monthly stipend for active Hunter Elite status holders.",
    amount: "$2,500.00",
    icon: "otc",
    delay: ".25s",
  },
  {
    id: "liquidity",
    title: "Liquidity Provider",
    tag: "SPECIAL",
    description:
      "Variable rewards for beta testing and governance participation.",
    amount: "$302.52",
    icon: "liquidity",
    delay: ".30s",
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
