'use client';

import { ReactNode, useEffect } from 'react';
import { I18nProvider } from '@/lib/i18n';

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    const theme = localStorage.getItem('bioinfohub-theme') || 'light';
    const lang = localStorage.getItem('bioinfohub-lang') || 'zh';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.lang = lang;
  }, []);

  return <I18nProvider>{children}</I18nProvider>;
}
