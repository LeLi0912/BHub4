'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SectionHeader from '@/components/SectionHeader';
import StatCard from '@/components/cards/StatCard';
import dynamic from 'next/dynamic';
import ToolsTable from '@/components/tables/ToolsTable';
import PapersTable from '@/components/tables/PapersTable';
import AlgorithmsTable from '@/components/tables/AlgorithmsTable';
import CompareModal from '@/components/modals/CompareModal';
import { useI18n, dict } from '@/lib/i18n';
import { getWeekNav } from '@/lib/data';

const TrendChart = dynamic(() => import('@/components/charts/TrendChart'), { ssr: false });
const CirclePacking = dynamic(() => import('@/components/charts/CirclePacking'), { ssr: false });
const NetworkGraph = dynamic(() => import('@/components/charts/NetworkGraph'), { ssr: false });
import type { WeeklyDigest, Algorithm } from '@/types';

interface WeekContentProps {
  weekData: unknown;
  weekId: string;
}

export default function WeekContent({ weekData, weekId }: WeekContentProps) {
  const { lang, t } = useI18n();
  const [selectedAlgos, setSelectedAlgos] = useState<Algorithm[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const data = weekData as WeeklyDigest;
  const { prev: prevWeek, next: nextWeek } = getWeekNav(weekId);

  const statsCards = useMemo(
    () => [
      {
        label: dict['stat.tools'][lang],
        count: data.stats.tools.count,
        change: data.stats.tools.change,
        icon: '🔧',
        color: '#3B82F6',
      },
      {
        label: dict['stat.papers'][lang],
        count: data.stats.papers.count,
        change: data.stats.papers.change,
        icon: '📄',
        color: '#10B981',
      },
      {
        label: dict['stat.algorithms'][lang],
        count: data.stats.algorithms.count,
        change: data.stats.algorithms.change,
        icon: '⚙️',
        color: '#F59E0B',
      },
      {
        label: dict['stat.hot'][lang],
        count: data.stats.hotTopic.count,
        change: 0,
        icon: '🔥',
        color: '#EF4444',
        extra: t(data.stats.hotTopic.name),
      },
    ],
    [data, lang, t]
  );

  const handleCompare = (ids: string[]) => {
    const algos = ids
      .map((id) => data.algorithms.find((a) => a.id === id))
      .filter(Boolean) as Algorithm[];
    setSelectedAlgos(algos);
    setShowCompare(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        week={data.week}
        prevWeek={prevWeek}
        nextWeek={nextWeek}
        weekLabel={t(data.label)}
      />

      <main className="flex-1 max-w-content mx-auto px-4 sm:px-6 w-full py-6 space-y-8">
        {/* Hero */}
        <section className="anim-in-d1">
          <div className="flex items-baseline gap-3 mb-1">
            <h1 className="font-heading text-3xl sm:text-[clamp(28px,3.5vw,42px)] font-semibold m-0">
              🧬 {dict['site.title'][lang]}
            </h1>
            <span className="text-sm" style={{ color: 'var(--muted)' }}>
              {t(data.label)} · {data.dateRange.start} ~ {data.dateRange.end}
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {dict['site.desc'][lang]}
          </p>
        </section>

        {/* Stats */}
        <section className="anim-in-d2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {statsCards.map((card, i) => (
              <StatCard key={i} {...card} />
            ))}
          </div>
        </section>

        {/* Trend */}
        <section className="anim-in-d3">
          <SectionHeader title={dict['section.trends'][lang]} icon="📈" />
          <div className="rounded-card p-4 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <TrendChart trends={data.trends} />
          </div>
        </section>

        {/* Tools + Treemap */}
        <section className="anim-in-d3">
          <SectionHeader title={dict['section.tools'][lang]} count={data.tools.length} icon="🔧" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3 rounded-card p-4 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <ToolsTable tools={data.tools} />
            </div>
            <div className="lg:col-span-2 rounded-card p-4 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <h3 className="text-sm font-semibold mb-2">🔥 {dict['stat.hot'][lang]}</h3>
              <CirclePacking data={data.treemap[lang]} />
            </div>
          </div>
        </section>

        {/* Papers */}
        <section className="anim-in-d4">
          <SectionHeader title={dict['section.papers'][lang]} count={data.papers.length} icon="📄" />
          <div className="rounded-card p-4 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <PapersTable papers={data.papers} />
          </div>
        </section>

        {/* Algorithms */}
        <section className="anim-in-d4">
          <SectionHeader title={dict['section.algorithms'][lang]} count={data.algorithms.length} icon="⚙️" />
          <div className="rounded-card p-4 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <AlgorithmsTable algorithms={data.algorithms} onCompare={handleCompare} />
          </div>
        </section>

        {/* Network */}
        <section className="anim-in-d4">
          <SectionHeader title={dict['section.network'][lang]} icon="🔗" />
          <div className="rounded-card p-4 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <NetworkGraph network={data.network} tools={data.tools} papers={data.papers} algorithms={data.algorithms} />
          </div>
        </section>
      </main>

      <Footer />

      {showCompare && selectedAlgos.length >= 2 && (
        <CompareModal algorithms={selectedAlgos} onClose={() => setShowCompare(false)} />
      )}
    </div>
  );
}
