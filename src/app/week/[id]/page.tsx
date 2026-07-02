import WeekContent from './WeekContent';

// Import all week data files for SSG bundling
import archiveData from '../../../../data/archive.json';
import w20 from '../../../../data/weeks/2026-W20.json';
import w21 from '../../../../data/weeks/2026-W21.json';
import w22 from '../../../../data/weeks/2026-W22.json';
import w23 from '../../../../data/weeks/2026-W23.json';
import w24 from '../../../../data/weeks/2026-W24.json';
import w25 from '../../../../data/weeks/2026-W25.json';
import w26 from '../../../../data/weeks/2026-W26.json';
import w27 from '../../../../data/weeks/2026-W27.json';

const weekDataMap: Record<string, unknown> = {
  '2026-W20': w20,
  '2026-W21': w21,
  '2026-W22': w22,
  '2026-W23': w23,
  '2026-W24': w24,
  '2026-W25': w25,
  '2026-W26': w26,
  '2026-W27': w27,
};

export function generateStaticParams() {
  return archiveData.weeks.map((w: { week: string }) => ({
    id: w.week,
  }));
}

export default function WeekPage({ params }: { params: { id: string } }) {
  const data = weekDataMap[params.id];
  if (!data) {
    return <div className="p-8 text-center" style={{ color: 'var(--muted)' }}>Week data not available</div>;
  }
  return <WeekContent weekData={data} weekId={params.id} />;
}
