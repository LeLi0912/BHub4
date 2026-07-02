'use client';

import { useI18n, dict } from '@/lib/i18n';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function AboutPage() {
  const { lang } = useI18n();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-content mx-auto px-4 sm:px-6 w-full py-12">
        <div className="max-w-3xl mx-auto space-y-8 anim-in-d1">
          <h1 className="font-heading text-3xl sm:text-[clamp(28px,3.5vw,42px)] font-semibold">
            {dict['about.title'][lang]}
          </h1>

          <p className="text-base leading-relaxed" style={{ color: 'var(--fg)' }}>
            {dict['about.desc'][lang]}
          </p>

          <section>
            <h2 className="font-heading text-xl font-semibold mb-3">
              {lang === 'zh' ? '涵盖内容' : 'What We Cover'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  icon: '🔧',
                  title: lang === 'zh' ? '工具' : 'Tools',
                  desc: lang === 'zh'
                    ? '每周精选新发布的生物信息学工具、软件和平台，涵盖从 RNA-seq 到结构生物学各领域。'
                    : 'Weekly curated bioinformatics tools, software, and platforms across all domains.',
                },
                {
                  icon: '📄',
                  title: lang === 'zh' ? '论文' : 'Papers',
                  desc: lang === 'zh'
                    ? '精选本周重要生信论文，覆盖基因组学、单细胞组学、转录组学等前沿领域。'
                    : 'Key bioinformatics papers of the week across genomics, single-cell, transcriptomics and more.',
                },
                {
                  icon: '⚙️',
                  title: lang === 'zh' ? '算法' : 'Algorithms',
                  desc: lang === 'zh'
                    ? '跟踪新算法和方法学进展，提供多维评分雷达图对比。'
                    : 'Track new algorithms and methodological advances with multi-dimensional radar comparison.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-card p-4 border"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h3 className="font-heading text-base font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold mb-3">
              {lang === 'zh' ? '技术栈' : 'Tech Stack'}
            </h2>
            <div
              className="rounded-card p-5 border text-sm leading-relaxed"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border)',
                color: 'var(--muted)',
              }}
            >
              <ul className="space-y-2">
                <li><strong>Next.js</strong> — SSG 静态生成</li>
                <li><strong>TypeScript</strong> — 类型安全</li>
                <li><strong>Tailwind CSS</strong> — 样式系统</li>
                <li><strong>Recharts + D3.js</strong> — 数据可视化</li>
                <li><strong>TanStack Table</strong> — 交互式表格</li>
                <li><strong>GitHub Pages</strong> — CDN 分发</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold mb-3">
              {lang === 'zh' ? '更新频率' : 'Update Frequency'}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
              {lang === 'zh'
                ? '每周一更新上周生物信息学前沿动态。数据来源于 PubMed、GitHub Trending、BioRxiv 等渠道的人工精选。'
                : 'Weekly updates every Monday. Data sourced from curated selections from PubMed, GitHub Trending, BioRxiv, and more.'}
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
