/**
 * V2 design art per blue-chip collection: hero scene, round logo, creator and
 * social links. Keyed by OpenSea collection slug; unknown collections fall back
 * to the pool's own image.
 */
export interface CollectionArt {
  scene: string;
  logo: string;
  by: string;
  short: string;
  x?: string;
  web?: string;
  /** Scenes with light backgrounds get V2's darker shade (`.nfx-light`). */
  light?: boolean;
  /** Pool detail meta row: on-chain creator, supply and mint month. */
  creator?: string;
  creatorVerified?: boolean;
  supply?: string;
  since?: string;
}

const V2 = "/assets/v2";

const ART: Record<string, CollectionArt> = {
  boredapeyachtclub: {
    scene: `${V2}/hntr-dark/bayc-scene-hq.webp`,
    logo: `${V2}/hntr-dark/bayc-logo-ape.webp`,
    by: "Yuga Labs",
    short: "BAYC",
    x: "https://x.com/BoredApeYC",
    web: "https://boredapeyachtclub.com",
    creator: "Yugalabs",
    creatorVerified: true,
    supply: "9,996",
    since: "Apr 2021",
  },
  "mutant-ape-yacht-club": {
    scene: `${V2}/collections/mayc-scene.png`,
    logo: `${V2}/hntr-dark/mayc-logo.png`,
    by: "Yuga Labs",
    short: "MAYC",
    x: "https://x.com/BoredApeYC",
    web: "https://boredapeyachtclub.com/mutants",
    creator: "Yugalabs",
    creatorVerified: true,
    supply: "19,569",
    since: "Aug 2021",
  },
  pudgypenguins: {
    scene: `${V2}/collections/pudgy-scene.png`,
    logo: `${V2}/hntr-dark/56197c28.jpg`,
    by: "Igloo Inc",
    short: "PPG",
    x: "https://x.com/pudgypenguins",
    web: "https://pudgypenguins.com",
    light: true,
    creator: "TheIglooCompany",
    creatorVerified: true,
    supply: "8,888",
    since: "Jul 2021",
  },
  cryptopunks: {
    scene: `${V2}/hntr-dark/punks-banner.jpg`,
    logo: `${V2}/hntr-dark/3a09f6f3.jpg`,
    by: "Yuga Labs",
    short: "PUNK",
    x: "https://x.com/cryptopunksnfts",
    web: "https://cryptopunks.app",
    creator: "C352B5",
    creatorVerified: false,
    supply: "9,993",
    since: "Jun 2017",
  },
  azuki: {
    scene: `${V2}/collections/azuki-scene.png`,
    logo: `${V2}/collections/azuki-logo.avif`,
    by: "Chiru Labs",
    short: "AZUKI",
    x: "https://x.com/Azuki",
    web: "https://www.azuki.com",
    light: true,
    creator: "Chiru Labs",
    creatorVerified: true,
    supply: "10,000",
    since: "Jan 2022",
  },
};

export function collectionArt(collectionSlug: string, fallbackImage: string, name: string): CollectionArt {
  return (
    ART[collectionSlug] ?? {
      scene: fallbackImage,
      logo: fallbackImage,
      by: name,
      short: name.split(/\s+/).map((w) => w[0]).join("").slice(0, 5).toUpperCase(),
    }
  );
}
