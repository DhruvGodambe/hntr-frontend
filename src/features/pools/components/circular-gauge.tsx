import { cn } from "@/lib/utils";

type CircularGaugeProps = {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
};

export function CircularGauge({
  value,
  size = 52,
  strokeWidth = 4,
  label,
  className,
}: CircularGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      role="img"
      aria-label={label ? `${value}% ${label}` : `${value}%`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-e4"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-t4 transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-[13px] font-bold leading-none text-t4">
          {value}%
        </span>
        {label && (
          <span className="mt-0.5 text-[8px] leading-none text-t1">{label}</span>
        )}
      </div>
    </div>
  );
}
