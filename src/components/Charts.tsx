import { useMemo } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  LineController,
  ArcElement,
} from 'chart.js';
import { Radar, Line } from 'react-chartjs-2';
import type { CategoryScores } from '../lib/types';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  LineController,
  ArcElement
);

interface RadarProps {
  scores: CategoryScores;
}

export function CategoryRadarChart({ scores }: RadarProps) {
  const data = useMemo(
    () => ({
      labels: [
        'Skills',
        'Projects',
        'Education',
        'Keywords',
        'Impact',
        'Formatting',
        'Campus Fit',
      ],
      datasets: [
        {
          label: 'ATS Categories',
          data: [
            scores.skills ?? 0,
            scores.experience ?? 0,
            scores.education ?? 0,
            scores.keywords ?? 0,
            scores.impact ?? 0,
            scores.formatting ?? 0,
            scores.cultureFit ?? 0,
          ],
          backgroundColor: 'rgba(99, 102, 241, 0.25)',
          borderColor: 'rgba(34, 211, 238, 0.9)',
          pointBackgroundColor: '#818cf8',
          pointBorderColor: '#fff',
          borderWidth: 2,
        },
      ],
    }),
    [scores]
  );

  return (
    <div className="mx-auto max-w-md">
      <Radar
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            r: {
              min: 0,
              max: 100,
              ticks: { display: false },
              grid: { color: 'rgba(255,255,255,0.08)' },
              angleLines: { color: 'rgba(255,255,255,0.08)' },
              pointLabels: { color: '#94a3b8', font: { size: 11 } },
            },
          },
          plugins: {
            legend: { display: false },
          },
        }}
      />
    </div>
  );
}

interface TrendProps {
  points: Array<{ label: string; score: number }>;
}

/** Fixed trend chart powered by updateTrendChart() data */
export function AtsTrendChart({ points }: TrendProps) {
  const data = useMemo(
    () => ({
      labels: points.map((p) => p.label),
      datasets: [
        {
          label: 'ATS Score',
          data: points.map((p) => p.score),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,0.15)',
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: '#22d3ee',
        },
      ],
    }),
    [points]
  );

  if (!points.length) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        Run screenings to populate the ATS trend chart.
      </p>
    );
  }

  return (
    <Line
      data={data}
      options={{
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          x: {
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(255,255,255,0.05)' },
          },
          y: {
            min: 0,
            max: 100,
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(255,255,255,0.05)' },
          },
        },
        plugins: {
          legend: { display: false },
        },
      }}
    />
  );
}
