"use client";

import { usePathname } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";

type DashboardLayoutClientProps = {
  children: React.ReactNode;
};

export function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  const pathname = usePathname();
  const showRightPanel = !pathname.startsWith("/referrals");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DashboardShell showRightPanel={showRightPanel}>{children}</DashboardShell>
    </div>
  );
}
