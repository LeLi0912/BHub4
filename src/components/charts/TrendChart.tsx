'use client';

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Trend } from '@/types';
import { useI18n } from '@/lib/i18n';

interface TrendChartProps {
  trends: Trend[];
}

export default function TrendChart({ trends }: TrendChartProps) {
  const { lang } = useI18n();

  // Transform trends data into chart format
  // weeklyCounts: [8w ago, 7w ago, ..., current week]
  const weekLabels = trends[0]?.weeklyCounts.map((_, i) => {
    const offset = 8 - i;
    return `W-${offset}`;
  }) ?? [];

  // Determine if current week label exists
  const chartData = weekLabels.map((label, i) => {
    const point: Record<string, string | number> = { week: label };
    trends.forEach((t) => {
      point[t.domainKey || t.domain] = t.weeklyCounts[i] ?? 0;
    });
    return point;
  });

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 12, fill: 'var(--muted)' }}
            axisLine={{ stroke: 'var(--border)' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--muted)' }}
            axisLine={{ stroke: 'var(--border)' }}
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
          {trends.map((t) => (
            <Line
              key={t.domainKey}
              type="monotone"
              dataKey={t.domainKey}
              name={t.domain}
              stroke={t.color}
              strokeWidth={2}
              dot={{ r: 3, fill: t.color }}
              activeDot={{ r: 5, fill: t.color }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
