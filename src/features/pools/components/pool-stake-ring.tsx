type PoolStakeRingProps = {
  value: number;
};

const RADIUS = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function PoolStakeRing({ value }: PoolStakeRingProps) {
  const offset = CIRCUMFERENCE - (value / 100) * CIRCUMFERENCE;

  return (
    <svg className="size-[52px]" viewBox="0 0 52 52" aria-hidden>
      <circle
        className="fill-none stroke-white/20"
        cx="26"
        cy="26"
        r={RADIUS}
        strokeWidth="4"
      />
      <circle
        className="fill-none stroke-white"
        cx="26"
        cy="26"
        r={RADIUS}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
      />
      <text
        className="fill-white font-mono text-[10px] font-bold"
        x="26"
        y="23"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {value}%
      </text>
      <text
        className="fill-white/60 font-mono text-[6px]"
        x="26"
        y="33"
        textAnchor="middle"
        dominantBaseline="central"
      >
        Stake
      </text>
    </svg>
  );
}
