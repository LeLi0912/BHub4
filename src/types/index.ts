// Bilingual text pair
export interface Bilingual {
  en: string;
  zh: string;
}

// --- Stats ---
export interface CountWithChange {
  count: number;
  change: number;
}

export interface HotTopic {
  key: string;
  name: Bilingual;
  count: number;
}

export interface WeekStats {
  tools: CountWithChange;
  papers: CountWithChange;
  algorithms: CountWithChange;
  hotTopic: HotTopic;
}

// --- Week Meta ---
export interface WeekMeta {
  week: string;
  label: Bilingual;
  dateRange: { start: string; end: string };
  stats: {
    tools: number;
    papers: number;
    algorithms: number;
    hotTopic: Bilingual;
    hotTopicCount: number;
  };
}

export interface Archive {
  weeks: WeekMeta[];
}

// --- Tool ---
export interface Tool {
  id: string;
  name: string;
  version: string;
  description: Bilingual;
  domain: string;
  language: string;
  platform: string;
  stars: number;
  installCmd: string;
  githubUrl?: string | null;
  paperUrl?: string | null;
  weekAdded: string;
  dateAdded: string;
  tags: string[];
}

// --- Paper ---
export interface Paper {
  id: string;
  title: Bilingual;
  authors: string[];
  journal: string;
  impactFactor: number;
  citations: number;
  abstract: Bilingual;
  url: string;
  doi: string;
  domains: string[];
  weekAdded: string;
  dateAdded: string;
  tags: string[];
  bibtex: string;
}

// --- Algorithm ---
export interface Algorithm {
  id: string;
  name: string;
  version: string;
  task: Bilingual;
  complexity: {
    time: string;
    space?: string;
    color: 'green' | 'yellow' | 'red';
  };
  description: Bilingual;
  stars?: number | null;
  githubUrl?: string | null;
  paperUrl?: string | null;
  domains: string[];
  weekAdded: string;
  metrics: {
    accuracy: number;
    speed: number;
    memory: number;
    scalability: number;
    usability: number;
    community: number;
  };
}

// --- Trend ---
export interface Trend {
  domain: string;
  domainKey: string;
  color: string;
  weeklyCounts: number[];
}

// --- Treemap ---
export interface TreemapItem {
  name: string;
  value: number;
  color: string;
  sub: string;
}

// --- Network ---
export interface NetworkNode {
  id: string;
  group: 'tool' | 'paper' | 'algo';
  label: string;
  val: number;
  color: string;
}

export interface NetworkLink {
  source: string;
  target: string;
  value: number;
}

export interface NetworkData {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

// --- Weekly Digest ---
export interface WeeklyDigest {
  week: string;
  label: Bilingual;
  dateRange: { start: string; end: string };
  updatedAt: string;
  totalItems: number;
  stats: WeekStats;
  tools: Tool[];
  papers: Paper[];
  algorithms: Algorithm[];
  trends: Trend[];
  treemap: {
    en: TreemapItem[];
    zh: TreemapItem[];
  };
  network: NetworkData;
}

// --- Domain color map ---
export const DOMAIN_COLORS: Record<string, string> = {
  genomics: '#3B82F6',
  'single-cell': '#8B5CF6',
  transcriptomics: '#10B981',
  epigenomics: '#F59E0B',
  metagenomics: '#EC4899',
  proteomics: '#EF4444',
  'structural-bio': '#14B8A6',
  gwas: '#F97316',
  'rna-seq': '#3B82F6',
  spatial: '#8B5CF6',
};

export const DOMAIN_NAMES: Record<string, Bilingual> = {
  genomics: { en: 'Genomics', zh: '基因组学' },
  'single-cell': { en: 'Single Cell', zh: '单细胞组学' },
  transcriptomics: { en: 'Transcriptomics', zh: '转录组学' },
  epigenomics: { en: 'Epigenomics', zh: '表观基因组学' },
  metagenomics: { en: 'Metagenomics', zh: '宏基因组学' },
  proteomics: { en: 'Proteomics', zh: '蛋白质组学' },
  'structural-bio': { en: 'Structural Bio.', zh: '结构生物学' },
  gwas: { en: 'GWAS', zh: '全基因组关联分析' },
  'rna-seq': { en: 'RNA-seq', zh: 'RNA测序' },
  spatial: { en: 'Spatial', zh: '空间组学' },
};
