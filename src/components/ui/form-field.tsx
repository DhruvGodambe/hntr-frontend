import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FormFieldProps = {
  id: string;
  label: string;
  description?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
};

export function FormField({
  id,
  label,
  description,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {description && !error && (
        <p className="font-sans text-xs text-t2">{description}</p>
      )}
      {error && (
        <p className="font-sans text-xs text-red" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
