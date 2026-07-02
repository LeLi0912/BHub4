'use client';

import { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  count?: number;
  action?: ReactNode;
  icon?: string;
}

export default function SectionHeader({ title, count, action, icon }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        <h2 className="font-heading text-xl font-semibold m-0" style={{ color: 'var(--fg)' }}>
          {title}
        </h2>
        {count !== undefined && (
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: 'var(--primary)',
              color: '#fff',
            }}
          >
            {count}
          </span>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
