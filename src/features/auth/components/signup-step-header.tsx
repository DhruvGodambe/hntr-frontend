import { cn } from "@/lib/utils";

type SignupStepHeaderProps = {
  step: 1 | 2 | 3;
  showProgress?: boolean;
  className?: string;
};

export function SignupStepHeader({
  step,
  showProgress = false,
  className,
}: SignupStepHeaderProps) {
  return (
    <div className={cn("mb-4", className)}>
      <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-t1">
        Sign Up: Step {step} of 3
      </p>
      {showProgress && (
        <div className="mt-2 flex gap-1">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className={cn(
                "h-[3px] flex-1 rounded-[2px]",
                index <= step ? "bg-t4" : "bg-e4",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
