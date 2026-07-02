'use client';

import Link from 'next/link';
import { useI18n, dict } from '@/lib/i18n';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SectionHeader from '@/components/SectionHeader';
import archiveData from '../../../data/archive.json';

export default function ArchivePage() {
  const { lang, t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-content mx-auto px-4 sm:px-6 w-full py-6">
        <div className="anim-in-d1">
          <SectionHeader title={dict['archive.title'][lang]} icon="📚" />
        </div>

        {archiveData.weeks.length === 0 ? (
          <p className="text-sm mt-8" style={{ color: 'var(--muted)' }}>
            {dict['archive.empty'][lang]}
          </p>
        ) : (
          <div className="mt-6 space-y-3 anim-in-d2">
            {archiveData.weeks.map((w) => (
              <Link
                key={w.week}
                href={`/week/${w.week}?lang=${lang}`}
                className="flex items-center justify-between rounded-card p-4 border transition-all duration-200 hover:shadow-md no-underline"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border)',
                  color: 'var(--fg)',
                }}
              >
                <div>
                  <span className="font-heading text-lg font-semibold">
                    {t(w.label)}
                  </span>
                  <span className="text-sm ml-3" style={{ color: 'var(--muted)' }}>
                    {w.dateRange.start} ~ {w.dateRange.end}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--muted)' }}>
                  <span>🔧 {w.stats.tools}</span>
                  <span>📄 {w.stats.papers}</span>
                  <span>⚙️ {w.stats.algorithms}</span>
                  <span className="text-lg">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
