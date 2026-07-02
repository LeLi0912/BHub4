import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '…';
}

export function formatStars(stars: number): string {
  const full = Math.floor(stars);
  const half = stars - full >= 0.5;
  let s = '★'.repeat(full);
  if (half) s += '½';
  s += '☆'.repeat(5 - full - (half ? 1 : 0));
  return `${s} ${stars.toFixed(1)}`;
}

export function getDomainColor(domain: string): string {
  const colors: Record<string, string> = {
    genomics: '#3B82F6',
    'single-cell': '#8B5CF6',
    'rna-seq': '#3B82F6',
    transcriptomics: '#10B981',
    epigenomics: '#F59E0B',
    metagenomics: '#EC4899',
    proteomics: '#EF4444',
    'structural-bio': '#14B8A6',
    gwas: '#F97316',
    spatial: '#8B5CF6',
  };
  return colors[domain] || '#6B7280';
}

export function getDomainLabel(domain: string, lang: 'en' | 'zh'): string {
  const labels: Record<string, { en: string; zh: string }> = {
    genomics: { en: 'Genomics', zh: '基因组学' },
    'single-cell': { en: 'Single Cell', zh: '单细胞' },
    'rna-seq': { en: 'RNA-seq', zh: 'RNA测序' },
    transcriptomics: { en: 'Transcriptomics', zh: '转录组学' },
    epigenomics: { en: 'Epigenomics', zh: '表观基因组学' },
    metagenomics: { en: 'Metagenomics', zh: '宏基因组学' },
    proteomics: { en: 'Proteomics', zh: '蛋白质组学' },
    'structural-bio': { en: 'Structural Bio.', zh: '结构生物学' },
    gwas: { en: 'GWAS', zh: '全基因组关联分析' },
    spatial: { en: 'Spatial', zh: '空间组学' },
  };
  const label = labels[domain];
  return label ? label[lang] : domain;
}

export function getComplexityColor(color: 'green' | 'yellow' | 'red'): string {
  const map = { green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
  return map[color] || map.green;
}

export function getStarDisplay(stars: number, githubUrl?: string | null): string {
  if (!githubUrl) return '-';
  return formatStars(stars);
}

export function getAlgorithmRef(algorithm: { githubUrl?: string | null; paperUrl?: string | null }): string {
  if (algorithm.githubUrl) return 'GitHub ★';
  return 'Paper';
}
