import type { ReactNode } from "react";

export interface MainLayoutProps {
  children: ReactNode;
  /** Extra classes for the `.page-panel` (e.g. V2's `pd-docked` on pool detail). */
  panelClassName?: string;
}
