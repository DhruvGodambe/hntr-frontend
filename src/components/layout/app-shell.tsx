import type { ReactNode } from "react";

type AppShellProps = {
  sidebar?: ReactNode;
  header?: ReactNode;
  children: ReactNode;
};

export function AppShell({ sidebar, header, children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh bg-e0">
      {sidebar}
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        {header}
        {children}
      </div>
    </div>
  );
}
