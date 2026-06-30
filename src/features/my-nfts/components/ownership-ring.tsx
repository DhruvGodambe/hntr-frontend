type OwnershipRingProps = {
  percent: number;
};

const RADIUS = 32;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function OwnershipRing({ percent }: OwnershipRingProps) {
  const offset = CIRCUMFERENCE * (1 - percent / 100);

  return (
    <div className="absolute right-1.5 top-1.5 sm:right-2 before:absolute before:-inset-1 before:-z-10 before:rounded-full before:bg-black/45 before:backdrop-blur-[3px]">
      <svg
        viewBox="0 0 80 80"
        className="size-12 overflow-visible sm:size-14 lg:size-11"
        aria-hidden
      >
        <circle
          cx={40}
          cy={40}
          r={RADIUS}
          fill="none"
          stroke="rgba(150,150,150,0.35)"
          strokeWidth={5}
        />
        <circle
          cx={40}
          cy={40}
          r={RADIUS}
          fill="none"
          stroke="var(--dist-bayc)"
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 40 40)"
        />
        <text
          x={40}
          y={36}
          textAnchor="middle"
          fill="var(--t4)"
          fontFamily="var(--fm)"
          fontSize={11}
          fontWeight={700}
        >
          {percent}%
        </text>
        <text
          x={40}
          y={48}
          textAnchor="middle"
          fill="var(--t1)"
          fontFamily="var(--fm)"
          fontSize={7}
          letterSpacing="0.08em"
        >
          MY SHARE
        </text>
      </svg>
    </div>
  );
}
