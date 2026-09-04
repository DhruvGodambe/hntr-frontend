export interface WebinarLanguage {
  code: string;
  flag: string;
  name: string;
  native: string;
}

export interface WebinarMessage {
  id: string;
  user: string;
  text: string;
  time: string;
  me?: boolean;
}

export type WebinarArticleBlock = string | { h: string } | { q: string };

export interface WebinarArticle {
  issue: string;
  readTime: string;
  title: string;
  subtitle: string;
  img: string;
  when: string;
  body: WebinarArticleBlock[];
}

export const WEBINAR_LANGUAGES: WebinarLanguage[] = [
  { code: "en", flag: "🇬🇧", name: "English", native: "English" },
  { code: "es", flag: "🇪🇸", name: "Spanish", native: "Español" },
  { code: "zh", flag: "🇨🇳", name: "Chinese", native: "中文" },
  { code: "hi", flag: "🇮🇳", name: "Hindi", native: "हिन्दी" },
  { code: "ar", flag: "🇸🇦", name: "Arabic", native: "العربية" },
  { code: "pt", flag: "🇵🇹", name: "Portuguese", native: "Português" },
  { code: "fr", flag: "🇫🇷", name: "French", native: "Français" },
  { code: "de", flag: "🇩🇪", name: "German", native: "Deutsch" },
  { code: "ru", flag: "🇷🇺", name: "Russian", native: "Русский" },
  { code: "ja", flag: "🇯🇵", name: "Japanese", native: "日本語" },
  { code: "ko", flag: "🇰🇷", name: "Korean", native: "한국어" },
  { code: "tr", flag: "🇹🇷", name: "Turkish", native: "Türkçe" },
];

export const INITIAL_WEBINAR_MESSAGES: WebinarMessage[] = [
  {
    id: "1",
    user: "sarah.eth",
    text: "How does the hedging mechanism account for sudden liquidity drops in the underlying pools?",
    time: "14:42",
  },
  {
    id: "2",
    user: "alpha_cap",
    text: "The ZK-bridge tech looks promising for these specific vaults.",
    time: "14:44",
  },
  {
    id: "3",
    user: "whale_watcher",
    text: "Are we expecting the new v3 pools next week?",
    time: "14:45",
  },
];

export const WEBINAR_CHAT_REPLIES = [
  "Great question — the hedging desk covers that.",
  "Agreed, the vault architecture is solid.",
  "v3 pools are on track for next week.",
  "Watching this closely 👀",
  "The floor-price derivatives model is elegant.",
];

export const WEBINAR_CHAT_USERS = [
  "0xdegen",
  "vault_max",
  "nftpilot",
  "base_bull",
  "quiet_lp",
];

export const WEBINAR_ARTICLES: WebinarArticle[] = [
  {
    issue: "ISSUE #47 · 6 MIN READ",
    readTime: "6",
    title: "The 80/20 Rule: Where Your Commissions Really Come From",
    subtitle:
      "A breakdown of instant payouts and how the 20% redirect quietly fuels your next position.",
    img: "/assets/images/strategyGears.jpg",
    when: "Published 3 days ago · Commissions",
    body: [
      "Every referral commission on HNTR splits the same way: 80% lands in your wallet the moment the transaction clears, and 20% is redirected into the pool layer on your behalf.",
      { h: "Why the split exists" },
      "The redirected share is not a fee. It buys pool exposure in your name, which means each payout leaves you with a slightly larger position than the one you started with.",
      {
        q: "Instant liquidity for the part you want to spend, compounding exposure for the part you would have reinvested anyway.",
      },
      "Over a full cycle the difference is visible: hunters who let the redirect run end the period holding stakes they never had to fund separately.",
      { h: "What to watch" },
      "Track the redirect column in your Network panel. It reports the cumulative value routed into pools, separately from realised commission, so both halves stay legible.",
    ],
  },
  {
    issue: "ISSUE #46 · 4 MIN READ",
    readTime: "4",
    title: "Inside HNTR Pools: How Co-Ownership Compounds",
    subtitle:
      "Why fractionalized NFT vaults tend to outperform solo buys across a full market cycle.",
    img: "/assets/images/collectionVr.jpg",
    when: "Published 1 week ago · Pools",
    body: [
      "A pool buys one asset with many wallets. The mechanics are simple; the consequences are not.",
      { h: "Entry price stops being the constraint" },
      "A blue-chip floor that prices out an individual buyer is reachable by a group, so pools sit in assets with deeper liquidity and steadier bid support than the mid-market alternatives a solo buyer can afford.",
      {
        q: "Fractional ownership does not lower risk. It changes which assets are available to take risk in.",
      },
      "Exits are handled at the vault level, which removes the worst part of solo NFT trading: finding a buyer for a specific token at a specific moment.",
      { h: "The compounding part" },
      "Realised profit is distributed pro rata and can be redeployed into the next pool in one step, so capital rarely sits idle between positions.",
    ],
  },
  {
    issue: "ISSUE #45 · 5 MIN READ",
    readTime: "5",
    title: "Referral Mechanics Explained for New Hunters",
    subtitle:
      "From first invite to Elite Platinum — the numbers behind the HNTR network effect.",
    img: "/assets/images/collectionMosaic.png",
    when: "Published 2 weeks ago · Network",
    body: [
      "Your referral link is the whole system. Everything downstream — tier, rate, redirect — is derived from what it produces.",
      { h: "Tiers are thresholds, not rankings" },
      "Each tier unlocks at a fixed volume of qualified activity in your network. Nothing is discretionary, and nothing decays as long as the network stays active.",
      {
        q: "A first-level invite pays immediately. A second-level invite pays because the first one stayed.",
      },
      "That is the reason retention matters more than reach: depth in the network outperforms width once you pass the first tier.",
      { h: "Getting to Elite" },
      "Most hunters reach Elite Platinum through a handful of active branches rather than a long list of dormant ones. Support the people you bring in and the tier follows.",
    ],
  },
];

export const WEBINAR_BASE_VIEWERS = 14891;
