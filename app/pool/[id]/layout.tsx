import type { Metadata } from "next";
import { parsePoolRouteId } from "../../../lib/opensea";
import { fetchPool } from "../../../lib/pools";
import { SITE_NAME } from "../../../lib/metadata";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Pick<LayoutProps, "params">): Promise<Metadata> {
  const { id } = await params;
  const { slug } = parsePoolRouteId(id);

  try {
    const pool = await fetchPool(slug);
    return {
      title: pool.name,
      description: `${pool.name} — co-ownership strategy pool on ${SITE_NAME}. Target tracks the live OpenSea floor price; ${pool.raisedEth} ETH raised so far.`,
    };
  } catch {
    return {
      title: "Strategy Pool",
      description: `Co-ownership strategy pool on ${SITE_NAME}.`,
    };
  }
}

export default function PoolDetailLayout({ children }: LayoutProps) {
  return children;
}
