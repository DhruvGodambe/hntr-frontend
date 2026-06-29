import type { ElementType, ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
  as?: ElementType;
};

export function PageContainer({ children, as: Tag = "div" }: PageContainerProps) {
  return (
    <Tag className="page-container mx-auto w-full px-3 py-6 sm:px-4 lg:px-6">
      {children}
    </Tag>
  );
}
