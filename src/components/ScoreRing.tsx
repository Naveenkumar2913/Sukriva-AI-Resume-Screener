import { motion } from 'framer-motion';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

function scoreColor(score: number): string {
  if (score >= 80) return '#34d399';
  if (score >= 65) return '#22d3ee';
  if (score >= 45) return '#fbbf24';
  return '#f87171';
}

export default function ScoreRing({
  score,
  size = 160,
  strokeWidth = 12,
  label = 'Match Score',
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 8px ${color}66)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-display text-4xl font-bold tabular-nums"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {score}
        </motion.span>
        <span className="mt-0.5 text-xs font-medium uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>
    </div>
  );
}
