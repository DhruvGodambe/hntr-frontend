import type { ReactNode } from "react";

type HeaderProps = {
  children: ReactNode;
};

export function Header({ children }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center border-b border-bd1 bg-e1 px-4 shadow-sh1 sm:px-6">
      {children}
    </header>
  );
}
