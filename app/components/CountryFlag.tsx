"use client";

import flags from "react-phone-number-input/flags";
import type { Country } from "react-phone-number-input";

type CountryFlagProps = {
  code?: string;
  className?: string;
};

/**
 * Renders an actual SVG flag (bundled with react-phone-number-input, already a
 * dependency for the signup phone field) instead of a Unicode flag emoji — Windows
 * browsers commonly render regional-indicator emoji pairs as plain letters (e.g.
 * "IN") rather than a flag glyph, since Segoe UI Emoji doesn't reliably ship them.
 */
export default function CountryFlag({ code, className }: CountryFlagProps) {
  if (!code || code.length !== 2) return null;
  const iso = code.toUpperCase() as Country;
  const Flag = flags[iso];
  if (!Flag) return null;

  return (
    <span className={`an-flag${className ? ` ${className}` : ""}`} aria-hidden="true">
      <Flag title={iso} />
    </span>
  );
}
