interface ProgressRingProps {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  color?: string;
}

export function ProgressRing({
  value,
  size = 64,
  stroke = 5,
  label,
  color = 'var(--accent)',
}: ProgressRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  return (
    <div className="progress-ring" style={{ width: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          opacity={0.15}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          fill="currentColor"
          fontSize={size * 0.22}
          fontWeight={700}
        >
          {Math.round(value)}%
        </text>
      </svg>
      {label ? <span className="progress-ring__label">{label}</span> : null}
    </div>
  );
}
