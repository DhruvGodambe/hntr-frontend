export type MembershipTier = {
  id: string;
  name: string;
  tierLabel: string;
  price: number;
  recommended?: boolean;
  features: string[];
};

export type ComparisonRow =
  | {
      id: string;
      label: string;
      type: "text";
      values: string[];
      highlight?: boolean;
    }
  | {
      id: string;
      label: string;
      type: "boolean";
      values: boolean[];
      highlight?: boolean;
    };

export const membershipHero = {
  title: "Membership Packages",
  subtitle:
    "Select a tier to unlock institutional-grade features and network commissions.",
};

export const membershipTiers: MembershipTier[] = [
  {
    id: "scout",
    name: "Scout",
    tierLabel: "Tier 01",
    price: 50,
    features: ["3 Unilevel Levels", "Basic Pools", "$400 Max Deposit"],
  },
  {
    id: "tracker",
    name: "Tracker",
    tierLabel: "Tier 02",
    price: 250,
    features: ["6 Unilevel Levels", "Priority Pools", "$1,500 Max Deposit"],
  },
  {
    id: "ranger",
    name: "Ranger",
    tierLabel: "Tier 03",
    price: 750,
    recommended: true,
    features: ["9 Unilevel Levels", "All Pools", "$4,000 Max Deposit"],
  },
  {
    id: "hunter",
    name: "Hunter",
    tierLabel: "Tier 04",
    price: 1500,
    features: ["12 Unilevel Levels", "Exclusive Pools", "$8,000 Max Deposit"],
  },
  {
    id: "apex",
    name: "Apex",
    tierLabel: "Tier 05",
    price: 2500,
    features: [
      "12 Unilevel Levels",
      "Custom Pools",
      "$25,000 Max Deposit",
      "OTC Desk & NFT Lending",
    ],
  },
];

export const comparisonRows: ComparisonRow[] = [
  {
    id: "unilevel",
    label: "Unilevel Levels",
    type: "text",
    values: ["3 Levels", "6 Levels", "9 Levels", "12 Levels", "12 Levels"],
    highlight: true,
  },
  {
    id: "pool-access",
    label: "Pool Access",
    type: "text",
    values: ["Public", "Priority", "Premium", "Exclusive", "Private/Custom"],
  },
  {
    id: "max-deposit",
    label: "Max Deposit Limit",
    type: "text",
    values: ["$400", "$1,500", "$4,000", "$8,000", "$25,000"],
  },
  {
    id: "max-pools",
    label: "Max Pools",
    type: "text",
    values: ["1/month", "2/month", "3/month", "4/month", "6/month"],
  },
  {
    id: "otc-desk",
    label: "Tailor OTC Desk & NFT Lending Platform",
    type: "boolean",
    values: [false, false, false, true, true],
    highlight: true,
  },
];

export const membershipInfoCards = [
  {
    id: "assurance",
    title: "Institutional Assurance",
    description:
      "All membership funds are securely locked in smart contracts, ensuring the integrity of the unilevel commission structure and lending liquidity pools.",
    icon: "shield" as const,
  },
  {
    id: "compliance",
    title: "Compliance Ready",
    description:
      "Our platform adheres to strict institutional standards, offering full transparency and real-time auditing for all financial transactions and staking activities.",
    icon: "star" as const,
  },
];
