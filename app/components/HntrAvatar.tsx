"use client";

import type { Types } from "connectkit";

/** Deterministic olive-toned fallback when the wallet has no ENS avatar. */
function addressGradient(address?: string) {
  if (!address) {
    return "linear-gradient(135deg, #5E6B55 0%, #262f1c 100%)";
  }
  const n = Number.parseInt(address.slice(2, 10), 16);
  const h1 = 70 + (n % 40);
  const h2 = (h1 + 28) % 360;
  return `linear-gradient(135deg, hsl(${h1} 22% 38%) 0%, hsl(${h2} 18% 16%) 100%)`;
}

export default function HntrAvatar({
  address,
  ensName,
  ensImage,
  size,
  radius,
}: Types.CustomAvatarProps) {
  return (
    <div
      style={{
        overflow: "hidden",
        borderRadius: radius,
        height: size,
        width: size,
        flexShrink: 0,
        background: ensImage ? "#212819" : addressGradient(address),
      }}
    >
      {ensImage ? (
        <img
          src={ensImage}
          alt={ensName ?? address ?? "ENS avatar"}
          width={size}
          height={size}
          style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : null}
    </div>
  );
}
