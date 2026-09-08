import "../membership/membership.css";
import { pageMetadata } from "../../lib/metadata";

export const metadata = pageMetadata(
  "Redeem a Gift Code",
  "Redeem a HNTR membership gift code — no payment, no gas.",
);

export default function RedeemLayout({ children }: { children: React.ReactNode }) {
  return children;
}
