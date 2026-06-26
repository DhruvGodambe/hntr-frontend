import type { ReactNode } from "react";

type SidebarProps = {
  children: ReactNode;
  "aria-label"?: string;
};

export function Sidebar({
  children,
  "aria-label": ariaLabel = "Main navigation",
}: SidebarProps) {
  return (
    <aside
      className="hidden w-64 shrink-0 flex-col border-r border-bd1 bg-e1 lg:flex"
      aria-label={ariaLabel}
    >
      {children}
    </aside>
  );
}
