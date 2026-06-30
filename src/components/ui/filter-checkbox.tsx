import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterCheckboxProps = {
  checked: boolean;
  className?: string;
};

export function FilterCheckbox({ checked, className }: FilterCheckboxProps) {
  return (
    <span
      className={cn(
        "filter-checkbox",
        checked && "filter-checkbox--checked",
        className,
      )}
      aria-hidden
    >
      {checked ? (
        <Check className="filter-checkbox__icon" strokeWidth={3} />
      ) : null}
    </span>
  );
}
