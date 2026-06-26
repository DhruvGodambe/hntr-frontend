import { defaultNftImage, resolveNftImage } from "@/lib/images";

export function nftPlaceholder(seed: string, _size = 400): string {
  void _size;

  if (!seed.trim()) {
    return defaultNftImage();
  }

  return resolveNftImage(seed);
}
