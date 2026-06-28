import type { StaticImageData } from "next/image";

import baycLogo from "@/assets/41JMTAdSzjL._AC_UF1000,1000_QL80_ 1.png";
import bayc3202 from "@/assets/bayc-3202_Fk7cLwHAu6H6zadzH 1.png";
import bayc7159 from "@/assets/BAYC_7159 1.png";
import channelsProfile from "@/assets/channels4_profile 1.png";
import guyOsearyApe from "@/assets/Guy-oseary-ape 1.png";
import image1 from "@/assets/images 1.png";
import image2 from "@/assets/images 2.png";
import heroBackground from "@/assets/Institutional Crypto Terminal Background.png";
import nftPlaceholderImage from "@/assets/NFT Placeholder.png";

export const appImages = {
  baycLogo,
  bayc3202,
  bayc7159,
  channelsProfile,
  guyOsearyApe,
  image1,
  image2,
  heroBackground,
  nftPlaceholder: nftPlaceholderImage,
} as const;

/* ── HTML-extracted images (from HNTR Platform.html) ── */
export const htmlImages = {
  /* Listing cards – marketplace NFT images */
  listingCard: [
    "/images/html-assets/lcimg-0.png",
    "/images/html-assets/lcimg-1.png",
    "/images/html-assets/lcimg-2.png",
    "/images/html-assets/lcimg-3.png",
    "/images/html-assets/lcimg-4.png",
  ],
  /* Sale cards */
  saleCard: [
    "/images/html-assets/scimg-0.png",
    "/images/html-assets/scimg-1.png",
    "/images/html-assets/scimg-2.png",
    "/images/html-assets/scimg-3.png",
    "/images/html-assets/scimg-4.png",
  ],
  /* Featured pool cards */
  poolCard: [
    "/images/html-assets/pcimg-0.png",
    "/images/html-assets/pcimg-1.png",
  ],
  /* Vault / marketplace detail images */
  vaultCard: [
    "/images/html-assets/vc-img-0.png",
    "/images/html-assets/vc-img-1.png",
    "/images/html-assets/vc-img-2.png",
    "/images/html-assets/vc-img-3.png",
    "/images/html-assets/vc-img-4.png",
    "/images/html-assets/vc-img-5.png",
    "/images/html-assets/vc-img-6.png",
    "/images/html-assets/vc-img-7.png",
  ],
  /* Pool images */
  pool: [
    "/images/html-assets/pool-img-0.png",
    "/images/html-assets/pool-img-1.png",
    "/images/html-assets/pool-img-2.png",
  ],
  /* Pool detail banner */
  poolDetail: "/images/html-assets/pool-detail-img-0.png",
  /* Network / referral card images */
  networkCard: [
    "/images/html-assets/nc-img-0.png",
    "/images/html-assets/nc-img-1.png",
    "/images/html-assets/nc-img-2.png",
    "/images/html-assets/nc-img-3.png",
    "/images/html-assets/nc-img-4.png",
    "/images/html-assets/nc-img-5.png",
    "/images/html-assets/nc-img-6.png",
    "/images/html-assets/nc-img-7.png",
  ],
} as const;

const nftImagePool: StaticImageData[] = [
  bayc7159,
  bayc3202,
  guyOsearyApe,
  image1,
  channelsProfile,
  nftPlaceholderImage,
];

function imageSrc(image: StaticImageData): string {
  return image.src;
}

function hashSeed(seed: string): number {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

export function resolveNftImage(seed: string): string {
  const normalized = seed.toLowerCase();

  const allNftImages = [
    ...htmlImages.listingCard,
    ...htmlImages.saleCard,
    ...htmlImages.vaultCard,
  ];

  if (normalized.includes("bayc") || normalized.includes("yuga")) {
    return allNftImages[0] ?? imageSrc(bayc7159);
  }

  if (normalized.includes("punk") || normalized.includes("larva")) {
    return allNftImages[1] ?? imageSrc(image1);
  }

  if (normalized.includes("pudgy")) {
    return allNftImages[2] ?? imageSrc(channelsProfile);
  }

  if (
    normalized.includes("fidenza") ||
    normalized.includes("chromie") ||
    normalized.includes("art")
  ) {
    return allNftImages[3] ?? imageSrc(guyOsearyApe);
  }

  if (normalized.includes("azuki")) {
    return allNftImages[4] ?? imageSrc(bayc3202);
  }

  const index = hashSeed(seed) % allNftImages.length;
  return allNftImages[index] ?? imageSrc(nftImagePool[0] ?? nftPlaceholderImage);
}

export function resolvePoolCardImage(poolId: string, seed: string): string {
  const allPool = [...htmlImages.pool, ...htmlImages.poolCard];
  const h = hashSeed(poolId || seed);
  return allPool[h % allPool.length] ?? imageSrc(baycLogo);
}

export function defaultNftImage(): string {
  return htmlImages.listingCard[0] ?? imageSrc(nftPlaceholderImage);
}

export function heroBackgroundImage(): string {
  return imageSrc(heroBackground);
}

export function partnerLogoImage(index: number): string {
  const logos = [image2, channelsProfile, image1, bayc3202];
  return imageSrc(logos[index % logos.length] ?? image2);
}
