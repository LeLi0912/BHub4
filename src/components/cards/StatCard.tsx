'use client';

import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  count: number;
  change: number;
  icon: ReactNode;
  color: string;
  onClick?: () => void;
  extra?: string;
}

export default function StatCard({ label, count, change, icon, color, onClick, extra }: StatCardProps) {
  const isUp = change > 0;
  const isDown = change < 0;

  return (
    <div
      onClick={onClick}
      className="rounded-card p-4 border transition-all duration-200 hover:shadow-md cursor-pointer"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
          {label}
        </span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold font-heading" style={{ color }}>
          {count}
        </span>
        {change !== 0 && (
          <span
            className={`text-xs font-medium flex items-center gap-0.5 ${
              isUp ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
            }`}
          >
            <span>{isUp ? '↑' : '↓'}</span>
            {Math.abs(change)}
          </span>
        )}
        {extra && (
          <span className="text-xs mt-1 block" style={{ color: 'var(--muted)' }}>
            {extra}
          </span>
        )}
      </div>
    </div>
  );
}
