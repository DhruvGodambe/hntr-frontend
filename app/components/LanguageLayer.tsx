"use client";

import { useEffect } from "react";
import { startI18n } from "../../lib/i18n";

/** Boots the site-wide translation layer once, after hydration (translating earlier would cause hydration mismatches). */
export default function LanguageLayer() {
  useEffect(() => {
    startI18n();
  }, []);
  return null;
}
