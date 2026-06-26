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
    }
  | {
      id: string;
      label: string;
      type: "boolean";
      values: boolean[];
    };

export const membershipTiers: MembershipTier[] = [
  {
    id: "scout",
    name: "Scout",
    tierLabel: "Tier 01",
    price: 50,
    features: [
      "3 Unilevel Levels",
      "Public Pool Access",
      "$400 Max Deposit",
      "1 Pool / Month",
      "Standard Support",
    ],
  },
  {
    id: "tracker",
    name: "Tracker",
    tierLabel: "Tier 02",
    price: 250,
    features: [
      "6 Unilevel Levels",
      "Priority Pool Access",
      "$1,000 Max Deposit",
      "2 Pools / Month",
      "Priority Support",
    ],
  },
  {
    id: "ranger",
    name: "Ranger",
    tierLabel: "Tier 03",
    price: 750,
    recommended: true,
    features: [
      "9 Unilevel Levels",
      "Premium Pool Access",
      "$2,500 Max Deposit",
      "3 Pools / Month",
      "Dedicated Support",
    ],
  },
  {
    id: "hunter",
    name: "Hunter",
    tierLabel: "Tier 04",
    price: 1500,
    features: [
      "12 Unilevel Levels",
      "Exclusive Pool Access",
      "$10,000 Max Deposit",
      "4 Pools / Month",
      "OTC Desk Access",
    ],
  },
  {
    id: "apex",
    name: "Apex",
    tierLabel: "Tier 05",
    price: 2500,
    features: [
      "15 Unilevel Levels",
      "Private / Custom Pools",
      "$25,000 Max Deposit",
      "6 Pools / Month",
      "Full OTC & NFT Lending",
    ],
  },
];

export const comparisonRows: ComparisonRow[] = [
  {
    id: "unilevel",
    label: "Unilevel Levels",
    type: "text",
    values: ["3", "6", "9", "12", "15"],
  },
  {
    id: "pool-access",
    label: "Pool Access",
    type: "text",
    values: ["Public", "Priority", "Premium", "Exclusive", "Private / Custom"],
  },
  {
    id: "max-deposit",
    label: "Max Deposit Limit",
    type: "text",
    values: ["$400", "$1,000", "$2,500", "$10,000", "$25,000"],
  },
  {
    id: "max-pools",
    label: "Max Pools",
    type: "text",
    values: ["1 / Month", "2 / Month", "3 / Month", "4 / Month", "6 / Month"],
  },
  {
    id: "otc-desk",
    label: "Tailor OTC Desk & NFT Lending Platform",
    type: "boolean",
    values: [false, false, false, true, true],
  },
];

export const membershipInfoCards = [
  {
    id: "assurance",
    title: "Institutional Assurance",
    description:
      "All membership funds are securely locked in audited smart contracts with multi-sig governance and on-chain transparency.",
    icon: "shield" as const,
  },
  {
    id: "compliance",
    title: "Compliance Ready",
    description:
      "HNTR adheres to strict institutional standards with real-time auditing, KYC verification, and regulatory reporting.",
    icon: "file" as const,
  },
];
