import type { ReactNode } from "react";

export type ActivityKind = "bid" | "sale" | "join" | "other";
export type ActivityTab = "all" | "bids" | "sales";

export type ActivityTemplate = {
  icon: string;
  name: string;
  /** ISO 3166-1 alpha-2 country code, when known — rendered as a flag beside the name. */
  country?: string;
  action: string;
  val: string;
  pos: boolean;
  kind: ActivityKind;
};

export type ActivityEntry = ActivityTemplate & {
  id: string;
  ts: number;
  fresh: boolean;
};

export interface MainLayoutProps {
  children: ReactNode;
  sbTransY?: number;
  sbOpacity?: number;
  railTransX?: number;
  railOpacity?: number;
}
