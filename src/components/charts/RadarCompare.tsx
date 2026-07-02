'use client';

import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Algorithm } from '@/types';
import { useI18n, dict } from '@/lib/i18n';

interface RadarCompareProps {
  algorithms: Algorithm[];
}

const dimensions = [
  { key: 'accuracy', labelKey: 'radar.accuracy' },
  { key: 'speed', labelKey: 'radar.speed' },
  { key: 'memory', labelKey: 'radar.memory' },
  { key: 'scalability', labelKey: 'radar.scalability' },
  { key: 'usability', labelKey: 'radar.usability' },
  { key: 'community', labelKey: 'radar.community' },
];

const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

export default function RadarCompare({ algorithms }: RadarCompareProps) {
  const { lang } = useI18n();

  const chartData = dimensions.map((dim) => {
    const point: Record<string, string | number> = {
      dimension: dict[dim.labelKey][lang],
    };
    algorithms.forEach((algo, i) => {
      point[algo.id] = (algo.metrics as any)[dim.key] ?? 0;
    });
    return point;
  });

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar data={chartData} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: 11, fill: 'var(--fg)' }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: 'var(--muted)' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--fg)',
              fontSize: '12px',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', color: 'var(--fg)' }}
          />
          {algorithms.map((algo, i) => (
            <Radar
              key={algo.id}
              name={algo.name}
              dataKey={algo.id}
              stroke={colors[i % colors.length]}
              fill={colors[i % colors.length]}
              fillOpacity={0.1}
            />
          ))}
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
}
