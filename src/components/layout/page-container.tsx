import type { ElementType, ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
  as?: ElementType;
};

export function PageContainer({ children, as: Tag = "div" }: PageContainerProps) {
  return (
    <Tag className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {children}
    </Tag>
  );
}
