import Link from "next/link";
import { allNetworkActivity } from "@/features/marketplace/data/vault-data";
import { NetworkActivityTable } from "./network-activity-table";

export function NetworkActivityHome() {
  return (
    <>
      <div className="mb-4">
        <Link
          href="/marketplace"
          className="mb-2 inline-block font-mono text-caption text-t1 transition-colors hover:text-t4"
        >
          ← Back to Vault
        </Link>
        <h1 className="font-display text-heading font-bold uppercase tracking-[0.1em] text-t4">
          Network Activity
        </h1>
        <p className="mt-1 text-label text-t0">
          Full protocol transaction feed across supported marketplaces.
        </p>
      </div>

      <NetworkActivityTable rows={allNetworkActivity} />
    </>
  );
}
