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
    <DashboardShell showRightPanel={showRightPanel}>{children}</DashboardShell>
  );
}
