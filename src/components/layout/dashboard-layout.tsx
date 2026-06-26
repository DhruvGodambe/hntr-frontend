import type { ReactNode } from "react";
import { AppShell } from "./app-shell";
import { Header } from "./header";
import { MainContent } from "./main-content";
import { PageContainer } from "./page-container";
import { Sidebar } from "./sidebar";

type DashboardLayoutProps = {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
};

export function DashboardLayout({
  sidebar,
  header,
  children,
}: DashboardLayoutProps) {
  return (
    <AppShell
      sidebar={<Sidebar>{sidebar}</Sidebar>}
      header={<Header>{header}</Header>}
    >
      <MainContent>
        <PageContainer>{children}</PageContainer>
      </MainContent>
    </AppShell>
  );
}
