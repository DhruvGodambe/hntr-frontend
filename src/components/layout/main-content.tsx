import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MainContentProps = {
  children: ReactNode;
  id?: string;
  className?: string;
};

export function MainContent({
  children,
  id = "main-content",
  className,
}: MainContentProps) {
  return (
    <main
      id={id}
      className={cn("scrollbar-thin flex-1 overflow-x-hidden overflow-y-auto", className)}
      tabIndex={-1}
    >
      {children}
    </main>
  );
}
