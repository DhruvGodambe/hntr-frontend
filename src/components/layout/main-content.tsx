import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MainContentProps = {
  children: ReactNode;
  id?: string;
  className?: string;
  centered?: boolean;
};

export function MainContent({
  children,
  id = "main-content",
  className,
  centered = true,
}: MainContentProps) {
  return (
    <main
      id={id}
      className={cn(
        "scrollbar-thin min-w-0 flex-1 overflow-x-hidden overflow-y-auto",
        className,
      )}
      tabIndex={-1}
    >
      {centered ? (
        <div className="page-container px-3 pb-10 pt-4 sm:px-4">
          {children}
        </div>
      ) : (
        children
      )}
    </main>
  );
}
