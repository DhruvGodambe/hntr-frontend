export type MarketplaceSource = "OpenSea" | "Blur";

type MarketplaceSourceLogoProps = {
  source: MarketplaceSource;
};

function OpenSeaIcon() {
  return (
    <svg viewBox="0 0 90 90" aria-hidden="true">
      <circle cx="45" cy="45" r="45" fill="#2081E2" />
      <path
        d="M45 18c-14.9 0-27 12.1-27 27s12.1 27 27 27 27-12.1 27-27-12.1-27-27-27zm-3.8 41.1V50.3h7.6v8.8c-2.3.8-4.9.8-7.6 0z"
        fill="#fff"
      />
    </svg>
  );
}

function BlurIcon() {
  return (
    <svg viewBox="0 0 90 90" aria-hidden="true">
      <rect width="90" height="90" rx="18" fill="#FF8700" />
      <path
        d="M28 58V32h10.2c6.8 0 11.2 3.6 11.2 9.4 0 3.4-1.6 6.2-4.4 7.6L52 58h-6.8l-5.8-7.8H34.2V58H28zm6.2-13.4h3.6c2.8 0 4.4-1.4 4.4-3.8 0-2.4-1.6-3.8-4.4-3.8h-3.6v7.6z"
        fill="#fff"
      />
    </svg>
  );
}

export function MarketplaceSourceLogo({ source }: MarketplaceSourceLogoProps) {
  return (
    <span className="src-logo" title={source}>
      {source === "OpenSea" ? <OpenSeaIcon /> : <BlurIcon />}
    </span>
  );
}
