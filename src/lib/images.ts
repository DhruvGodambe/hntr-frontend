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

  if (normalized.includes("bayc") || normalized.includes("yuga")) {
    return imageSrc(bayc7159);
  }

  if (normalized.includes("punk") || normalized.includes("larva")) {
    return imageSrc(image1);
  }

  if (normalized.includes("pudgy")) {
    return imageSrc(channelsProfile);
  }

  if (
    normalized.includes("fidenza") ||
    normalized.includes("chromie") ||
    normalized.includes("art")
  ) {
    return imageSrc(guyOsearyApe);
  }

  if (normalized.includes("azuki")) {
    return imageSrc(bayc3202);
  }

  const index = hashSeed(seed) % nftImagePool.length;
  return imageSrc(nftImagePool[index] ?? nftPlaceholderImage);
}

const poolCardImages: Record<string, StaticImageData> = {
  "bayc-0291": baycLogo,
  "bayc-pool": baycLogo,
  "punk-4521": image1,
  "punk-pool": image1,
  "pudgy-1180": channelsProfile,
  "pudgy-pool": channelsProfile,
};

export function resolvePoolCardImage(poolId: string, seed: string): string {
  const mapped = poolCardImages[poolId] ?? poolCardImages[seed];

  if (mapped) {
    return imageSrc(mapped);
  }

  return resolveNftImage(seed);
}

export function defaultNftImage(): string {
  return imageSrc(nftPlaceholderImage);
}

export function heroBackgroundImage(): string {
  return imageSrc(heroBackground);
}

export function partnerLogoImage(index: number): string {
  const logos = [image2, channelsProfile, image1, bayc3202];
  return imageSrc(logos[index % logos.length] ?? image2);
}
