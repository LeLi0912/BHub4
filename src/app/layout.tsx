import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'BioinfoHub — Weekly Bioinformatics Intelligence',
  description: 'Weekly frontier bioinformatics intelligence, bringing you the latest tools, papers, and algorithms.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('bioinfohub-theme') || 'light';
                  var lang = localStorage.getItem('bioinfohub-lang') || 'zh';
                  if (theme === 'dark') document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.lang = lang;
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-[var(--bg)] text-[var(--fg)] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
