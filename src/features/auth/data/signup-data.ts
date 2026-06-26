export type SignupTier = {
  id: string;
  name: string;
  tierLabel: string;
  price: number;
  recommended?: boolean;
  features: string[];
};

export const signupSessionId = "8R8AI...PEUE";
export const authNodeId = "AUTH_NODE_492";

export const signupTiers: SignupTier[] = [
  {
    id: "starter",
    name: "Starter",
    tierLabel: "Tier 01",
    price: 50,
    features: ["Unilevel Unlock LEVEL 1 ONLY", "Max Pool Deposits $1,000 LIMIT"],
  },
  {
    id: "basic",
    name: "Basic",
    tierLabel: "Tier 02",
    price: 250,
    features: ["Unilevel Unlock LEVELS 1-3", "Max Pool Deposits $5,000 LIMIT"],
  },
  {
    id: "pro",
    name: "Pro",
    tierLabel: "Tier 03",
    price: 750,
    recommended: true,
    features: ["Unilevel Unlock LEVELS 1-10", "Max Pool Deposits $10,000 LIMIT"],
  },
  {
    id: "institutional",
    name: "Institutional",
    tierLabel: "Tier 04",
    price: 1500,
    features: ["Unilevel Unlock LEVELS 1-25", "Max Pool Deposits $25,000 LIMIT"],
  },
  {
    id: "elite",
    name: "Elite",
    tierLabel: "Tier 05",
    price: 2500,
    features: ["Unilevel Unlock FULL UNLOCK", "Max Pool Deposits $50,000 LIMIT"],
  },
];

export const nationalityOptions = [
  "United States",
  "United Kingdom",
  "Singapore",
  "United Arab Emirates",
  "Switzerland",
  "Hong Kong",
];
