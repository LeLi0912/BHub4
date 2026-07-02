'use client';

import { useI18n, dict } from '@/lib/i18n';

export default function Footer() {
  const { lang, t } = useI18n();

  const columns = [
    {
      title: dict['footer.content'][lang],
      links: [
        { label: dict['stat.tools'][lang], href: '#' },
        { label: dict['stat.papers'][lang], href: '#' },
        { label: dict['stat.algorithms'][lang], href: '#' },
      ],
    },
    {
      title: dict['footer.about'][lang],
      links: [
        { label: dict['about.title'][lang], href: '/about' },
        { label: dict['archive.title'][lang], href: '/archive' },
        { label: 'GitHub', href: '#' },
      ],
    },
    {
      title: dict['footer.support'][lang],
      links: [
        { label: 'Email', href: '#' },
        { label: 'Twitter / X', href: '#' },
      ],
    },
  ];

  return (
    <footer className="border-t mt-16" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
      <div className="max-w-content mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🧬</span>
              <span className="font-heading text-lg font-semibold">{dict['site.title'][lang]}</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
              {dict['site.desc'][lang]}
            </p>
          </div>
          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm no-underline transition-colors hover:opacity-80"
                      style={{ color: 'var(--muted)' }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t mt-8 pt-6 text-center text-xs" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
          {dict['footer.copyright'][lang]}
        </div>
      </div>
    </footer>
  );
}
