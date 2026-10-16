import { pageMetadata } from "../../lib/metadata";
import "./pools.css";

export const metadata = pageMetadata(
  "NFT Strategies",
  "Explore active NFT co-ownership pools and deposit into blue-chip strategies."
);

export default function PoolsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
