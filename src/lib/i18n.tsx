'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Lang = 'en' | 'zh';

interface I18nContextType {
  lang: Lang;
  toggleLang: () => void;
  setLang: (l: Lang) => void;
  t: (value: { en: string; zh: string } | string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('zh');

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bioinfohub-lang', l);
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'en' ? 'zh' : 'en');
  }, [lang, setLang]);

  const t = useCallback(
    (value: { en: string; zh: string } | string): string => {
      if (typeof value === 'string') return value;
      return value[lang] || value.en;
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, toggleLang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

// Bilingual dict for UI labels
export const dict: Record<string, { en: string; zh: string }> = {
  // Header
  'site.title': { en: 'BioinfoHub', zh: 'BioinfoHub' },
  'site.subtitle': { en: 'Weekly Bioinformatics Intelligence', zh: '每周生物信息情报' },
  'site.desc': { en: 'Weekly frontier bioinformatics intelligence, bringing you the latest tools, papers, and algorithms.', zh: '每周生物信息前沿技术汇总，为您带来最新工具、论文和算法动态。' },

  // Stats
  'stat.tools': { en: 'Tools', zh: '工具' },
  'stat.papers': { en: 'Papers', zh: '论文' },
  'stat.algorithms': { en: 'Algorithms', zh: '算法' },
  'stat.hot': { en: 'Hot Topic', zh: '热门领域' },

  // Sections
  'section.trends': { en: 'Weekly Trends', zh: '每周趋势' },
  'section.tools': { en: 'New Tools', zh: '新工具' },
  'section.papers': { en: 'Papers', zh: '论文' },
  'section.algorithms': { en: 'Algorithms', zh: '算法' },
  'section.network': { en: 'Methodology Network', zh: '方法论关联网络' },

  // Table headers
  'table.name': { en: 'Name', zh: '名称' },
  'table.domain': { en: 'Domain', zh: '领域' },
  'table.summary': { en: 'Summary', zh: '汇总' },
  'table.stars': { en: 'Stars', zh: '星数' },
  'table.link': { en: 'Link', zh: '链接' },
  'table.title': { en: 'Title', zh: '标题' },
  'table.journal': { en: 'Journal', zh: '期刊' },
  'table.citations': { en: 'Citations', zh: '引用数' },
  'table.impact': { en: 'IF', zh: '影响因子' },
  'table.compare': { en: 'Compare Selected', zh: '对比选中项' },
  'table.search': { en: 'Search...', zh: '搜索...' },

  // Network
  'network.tool': { en: 'Tool', zh: '工具' },
  'network.paper': { en: 'Paper', zh: '论文' },
  'network.algo': { en: 'Algorithm', zh: '算法' },

  // Actions
  'action.copy': { en: 'Copy', zh: '复制' },
  'action.favorite': { en: 'Favorite', zh: '收藏' },
  'action.open': { en: 'Open', zh: '打开' },
  'action.rss': { en: 'RSS', zh: 'RSS' },
  'action.subscribe': { en: 'Subscribe', zh: '订阅' },

  // Archive
  'archive.title': { en: 'Past Issues', zh: '往期回顾' },
  'archive.empty': { en: 'No issues available.', zh: '暂无往期内容。' },

  // Theme
  'theme.dark': { en: 'Dark', zh: '暗色' },
  'theme.light': { en: 'Light', zh: '亮色' },

  // About
  'about.title': { en: 'About BioinfoHub', zh: '关于 BioinfoHub' },
  'about.desc': { en: 'BioinfoHub curates the latest bioinformatics tools, papers, and algorithms every week, helping researchers stay at the forefront of the field.', zh: 'BioinfoHub 每周汇总最新的生物信息学工具、论文和算法，帮助研究人员把握领域前沿动态。' },

  // Footer
  'footer.content': { en: 'Content', zh: '内容分类' },
  'footer.about': { en: 'About', zh: '关于' },
  'footer.support': { en: 'Support', zh: '支持' },
  'footer.copyright': { en: '© 2026 BioinfoHub. All rights reserved.', zh: '© 2026 BioinfoHub. 保留所有权利。' },

  // Week nav
  'week.prev': { en: 'Previous week', zh: '上一周' },
  'week.next': { en: 'Next week', zh: '下一周' },
  'week.current': { en: 'Current week', zh: '本周' },

  // Radar
  'radar.accuracy': { en: 'Accuracy', zh: '准确度' },
  'radar.speed': { en: 'Speed', zh: '速度' },
  'radar.memory': { en: 'Memory', zh: '内存效率' },
  'radar.scalability': { en: 'Scalability', zh: '可扩展性' },
  'radar.usability': { en: 'Usability', zh: '易用性' },
  'radar.community': { en: 'Community', zh: '社区活跃度' },
};
