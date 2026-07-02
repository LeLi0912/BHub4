'use client';

import { useI18n, dict } from '@/lib/i18n';
import Link from 'next/link';

interface HeaderProps {
  week?: string;
  prevWeek?: string | null;
  nextWeek?: string | null;
  weekLabel?: string;
}

export default function Header({ week, prevWeek, nextWeek, weekLabel }: HeaderProps) {
  const { lang, toggleLang, t } = useI18n();

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bioinfohub-theme', theme);
  };

  return (
    <header className="sticky top-0 z-50 border-b backdrop-blur-md bg-[var(--bg)]/90" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-content mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 no-underline hover:opacity-80 transition-opacity">
            <span className="text-2xl">🧬</span>
            <div>
              <h1 className="font-heading text-xl font-semibold m-0 leading-tight">{dict['site.title'][lang]}</h1>
              <p className="text-xs m-0" style={{ color: 'var(--muted)' }}>{dict['site.subtitle'][lang]}</p>
            </div>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Week nav */}
            {week && (
              <div className="flex items-center gap-1 mr-2">
                {prevWeek ? (
                  <Link
                    href={`/week/${prevWeek}?lang=${lang}`}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--border)] transition-colors no-underline"
                    style={{ color: 'var(--fg)' }}
                    aria-label={dict['week.prev'][lang]}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                  </Link>
                ) : (
                  <span className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ color: 'var(--muted)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                  </span>
                )}
                <span className="text-sm font-medium px-2 min-w-[100px] text-center">{weekLabel || week}</span>
                {nextWeek ? (
                  <Link
                    href={`/week/${nextWeek}?lang=${lang}`}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--border)] transition-colors no-underline"
                    style={{ color: 'var(--fg)' }}
                    aria-label={dict['week.next'][lang]}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </Link>
                ) : (
                  <span className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ color: 'var(--muted)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </span>
                )}
              </div>
            )}

            {/* Lang toggle */}
            <button
              onClick={toggleLang}
              className="h-8 px-2 rounded-lg text-sm font-medium border transition-colors hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--fg)' }}
              title={lang === 'zh' ? 'Switch to English' : '切换到中文'}
            >
              {lang === 'zh' ? 'EN' : '中'}
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--fg)' }}
              title={dict['theme.dark'][lang]}
            >
              <span className="text-sm">🌙</span>
            </button>

            {/* RSS */}
            <button className="h-8 px-3 rounded-lg text-sm font-medium border transition-colors hover:opacity-80" style={{ borderColor: 'var(--border)', color: 'var(--fg)' }}>
              {dict['action.rss'][lang]}
            </button>

            {/* Subscribe */}
            <button className="h-8 px-4 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor: 'var(--primary)' }}>
              {dict['action.subscribe'][lang]}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
