'use client';

import { useEffect } from 'react';
import { Algorithm } from '@/types';
import RadarCompare from '@/components/charts/RadarCompare';

interface CompareModalProps {
  algorithms: Algorithm[];
  onClose: () => void;
}

export default function CompareModal({ algorithms, onClose }: CompareModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl rounded-xl p-6 shadow-xl border"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-semibold">Algorithm Comparison</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border text-sm transition-colors hover:bg-[var(--border)]"
            style={{ borderColor: 'var(--border)' }}
          >
            ✕
          </button>
        </div>

        {/* Radar Chart */}
        <RadarCompare algorithms={algorithms} />

        {/* Data table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: 'var(--muted)' }}>
                <th className="text-left py-2 px-2 font-medium">Metric</th>
                {algorithms.map((a) => (
                  <th key={a.id} className="text-center py-2 px-2 font-medium">{a.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { key: 'accuracy', label: 'Accuracy' },
                { key: 'speed', label: 'Speed' },
                { key: 'memory', label: 'Memory' },
                { key: 'scalability', label: 'Scalability' },
                { key: 'usability', label: 'Usability' },
                { key: 'community', label: 'Community' },
              ].map((metric) => (
                <tr key={metric.key} style={{ borderColor: 'var(--border)' }}>
                  <td className="py-1.5 px-2 font-medium">{metric.label}</td>
                  {algorithms.map((a) => (
                    <td key={a.id} className="text-center py-1.5 px-2">
                      {(a.metrics as any)[metric.key] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
