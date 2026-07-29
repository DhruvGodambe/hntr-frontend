import type { ReactNode } from "react";

export type ActivityKind = "bid" | "sale" | "other";
export type ActivityTab = "all" | "bids" | "sales";

export type ActivityTemplate = {
  icon: string;
  name: string;
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
