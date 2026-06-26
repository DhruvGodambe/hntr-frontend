import { notFound } from "next/navigation";
import { PoolDetailHome } from "@/features/pools/components/pool-detail-home";
import { getPoolDetail } from "@/features/pools/data/pool-detail-data";

type PoolDetailPageProps = {
  params: Promise<{ poolId: string }>;
};

export default async function PoolDetailPage({ params }: PoolDetailPageProps) {
  const { poolId } = await params;
  const pool = getPoolDetail(poolId);

  if (!pool) {
    notFound();
  }

  return <PoolDetailHome pool={pool} />;
}
