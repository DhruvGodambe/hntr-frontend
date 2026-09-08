export type CodeStatus = "active" | "redeemed" | "expired" | "pending";

export type GiftCode = {
  code: string;
  amt: number;
  note: string;
  created: string;
  exp: string;
  status: CodeStatus;
  by: string;
  used?: string;
};

export type Tier = { n: string; v: number };

export type FilterKey = "all" | "active" | "redeemed" | "expired";

export const TIERS: Tier[] = [
  { n: "Bronze", v: 50 },
  { n: "Silver", v: 250 },
  { n: "Gold", v: 750 },
  { n: "Platinum", v: 1500 },
  { n: "Diamond", v: 2500 },
];

export const FILTERS: FilterKey[] = ["all", "active", "redeemed", "expired"];

/** Mock seed — swap for API in GiftCodesPanel (see gift-code-sample README). */
export const INITIAL_CODES: GiftCode[] = [
  {
    code: "HNTR-8QK2-M4VD",
    amt: 250,
    note: "m.ruiz",
    created: "2026-08-12",
    exp: "2026-08-19",
    status: "redeemed",
    by: "m.ruiz",
    used: "2026-08-14",
  },
  {
    code: "HNTR-3TZP-9WLA",
    amt: 250,
    note: "d.alvarez",
    created: "2026-08-21",
    exp: "2026-08-28",
    status: "active",
    by: "—",
  },
  {
    code: "HNTR-VC7N-2KRE",
    amt: 750,
    note: "k.oyelaran",
    created: "2026-07-04",
    exp: "2026-07-11",
    status: "redeemed",
    by: "k.oyelaran",
    used: "2026-07-08",
  },
  {
    code: "HNTR-6JD4-XB1S",
    amt: 50,
    note: "s.novak",
    created: "2026-06-18",
    exp: "2026-06-25",
    status: "expired",
    by: "—",
  },
  {
    code: "HNTR-Z5MW-QP8T",
    amt: 1500,
    note: "t.ibarra",
    created: "2026-08-29",
    exp: "2026-09-05",
    status: "active",
    by: "—",
  },
  {
    code: "HNTR-LN9G-4HYU",
    amt: 2500,
    note: "j.whitmore",
    created: "2026-09-01",
    exp: "2026-09-08",
    status: "active",
    by: "—",
  },
];

export function money(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function newGiftCode() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = () => {
    let out = "";
    for (let i = 0; i < 4; i += 1) out += a[Math.floor(Math.random() * a.length)];
    return out;
  };
  return `HNTR-${part()}-${part()}`;
}

export function tierName(v: number) {
  return TIERS.find((t) => t.v === v)?.n ?? "custom";
}
