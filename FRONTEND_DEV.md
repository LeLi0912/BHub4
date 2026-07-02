# BioinfoHub — 前端开发文档

> 项目：每周生物信息前沿技术汇总平台
> 版本：v1.0（Phase 2-4 实施完成）
> 日期：2026-07-02

---

## 目录

1. [项目概述](#1-项目概述)
2. [设计系统](#2-设计系统)
3. [信息架构](#3-信息架构)
4. [页面布局](#4-页面布局)
5. [交互功能清单](#5-交互功能清单)
6. [组件树](#6-组件树)
7. [数据模型](#7-数据模型)
8. [技术选型](#8-技术选型)
9. [开发路线图](#9-开发路线图)
10. [UX 检查清单](#10-ux-检查清单)

---

## 1. 项目概述

### 1.1 产品定位

BioinfoHub 是一个**内容策展型平台**，每周汇总生物信息学领域的前沿动态，面向研究人员和计算生物学家提供三类核心信息：

| 分类 | 内容 | 目标用户价值 |
|------|------|-------------|
| 🔧 **工具** | 新发布的生信工具、软件、平台 | 快速了解可用工具，减少重复造轮子 |
| 📄 **论文** | 本周重要生信论文 | 跟进前沿研究，掌握领域动态 |
| ⚙️ **算法** | 新算法/方法学进展 | 了解方法论创新，优化分析流程 |

### 1.2 核心设计原则

- **信息密集但层次清晰** — 每周内容量大，需要高效的视觉扫描路径
- **专业感与学术气质** — 服务于研究人员，设计语言应体现严谨与可信赖
- **数据可视化驱动** — 用图表揭示趋势，用交互表格支撑探索
- **中英双语** — 面向全球生信社区

### 1.3 目标用户画像

- 生物信息学研究员（核心用户）
- 计算生物学博士生/博士后
- 生物技术公司研发人员
- 生物信息学工具开发者

---

## 2. 设计系统

### 2.1 设计风格

| 维度 | 选用方案 | 理由 |
|------|---------|------|
| **主风格** | Editorial Grid / Magazine + Swiss Modernism | 瑞士网格保证信息密度下的清晰层次，杂志风格适配内容策展 |
| **辅助风格** | Bento Grid（统计概览区） | Apple 式模块化卡片，适合展示多维数据摘要 |
| **暗色模式** | 完整支持（全量 CSS 变量驱动） | 生信研究人员常长时间工作，暗色模式降低用眼疲劳 |

### 2.2 色彩系统

采用蓝-琥珀色系，兼顾科学的冷静感与重点突出的暖色强调。

```css
/* 亮色模式 */
--primary:      #1E40AF;   /* 深蓝 — 主色/品牌色 */
--primary-light:#3B82F6;   /* 亮蓝 — 辅色 */
--accent:       #D97706;   /* 琥珀 — 强调/热点标记 */
--success:      #059669;   /* 翠绿 — 高IF、增长趋势 */
--purple:       #7C3AED;   /* 紫 — 单细胞领域色 */
--bg:           #F8FAFC;   /* 页底 */
--bg-card:      #FFFFFF;   /* 卡片底色 */
--fg:           #1E293B;   /* 主文字 */

/* 暗色模式适配 */
[data-theme="dark"] {
  --primary:      #60A5FA;
  --accent:       #FBBF24;
  --bg:           #0F172A;
  --bg-card:      #1E293B;
  --fg:           #F1F5F9;
  /* ...其余色值同步适配... */
}
```

**领域色板**（用于热力图表征各子领域）：

| 领域 | 色值 | 用途 |
|------|------|------|
| Genomics | `#3B82F6` 蓝 | 基因组学 |
| Single Cell | `#8B5CF6` 紫 | 单细胞组学 |
| Transcriptomics | `#10B981` 绿 | 转录组学 |
| Epigenomics | `#F59E0B` 橙 | 表观基因组学 |
| Metagenomics | `#EC4899` 粉 | 宏基因组学 |
| Proteomics | `#EF4444` 红 | 蛋白质组学 |
| Structural Bio. | `#14B8A6` 青 | 结构生物学 |
| GWAS | `#F97316` 橙红 | 全基因组关联分析 |

### 2.3 字体系统

```
标题: Crimson Pro (衬线体, 400/500/600/700)
  → 学术感、排版气质、专业权威
正文: Atkinson Hyperlegible (无衬线体, 400/700)
  → 高可读性、适合长时间阅读、对低视力友好
```

- 基线字号：`16px`（桌面端正文）
- 标题使用 `clamp(28px, 3.5vw, 42px)` 流式缩放
- 表格/UI 文本使用 `12px-14px`

### 2.4 布局系统

- 最大内容宽度：`1400px`
- 网格：12 列隐式网格（CSS Grid），用于复杂排版区域
- 间距系统：`4px / 8px` 为基数的递增体系
- 卡片圆角：`12px`（常规）/ `20px`（大卡片）
- 响应式断点：
  - 默认 ≥1024px：桌面全布局（4 列统计卡 / 两列并排）
  - 1024px：堆叠两列，统计卡 2×2
  - 640px：单列布局，调整内边距

---

## 3. 信息架构

### 3.1 页面结构

```
BioinfoHub
├── 📋 首页（每周摘要视图）
│   ├── 📊 本周概览统计卡
│   ├── 📈 趋势折线图
│   ├── 🔧 工具表格 + 领域气泡图（并排）
│   ├── 📄 论文表格
│   ├── ⚙️ 算法表格（含对比模态框）
│   └── 🔗 方法论关联网络图
├── 📚 往期回顾（Archive）
├── ℹ️ 关于页面
└── 🔧 管理后台（未来）
```

### 3.2 导航系统

- **一级导航**：Sticky Header，包含 Logo + 周次导航 + RSS + 订阅
- **周次导航**：左右箭头切换 + 周次标签显示，支持键盘操作
- **Footer 导航**：内容分类 / 关于 / 支持 四栏布局

---

## 4. 页面布局

### 4.1 首页布局（优先级从上到下）

```
┌──────────────────────────────────────────────────────────────┐
│  🧬 BioinfoHub · 2026 年第 27 周           [RSS] [订阅]    │
│  "每周生物信息情报"                                          │
├──────────────────────────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐                  │
│  │ 工具  │ │ 论文  │ │ 算法  │ │ 热门领域 │                  │
│  │  12   │ │  28   │ │  6    │ │ 单细胞   │                  │
│  │ ↑ +3  │ │ ↑ +8  │ │ ↑ +1  │ │ ↑ 12篇   │                  │
│  └──────┘ └──────┘ └──────┘ └──────────┘                  │
├──────────────────────────────────────────────────────────────┤
│  📈 每周趋势 (Line Chart)                                   │
│  出版物按领域分布 (Genomics / Transcriptomics /              │
│                    Single Cell / Epigenomics)               │
│  [Hover 交互 · Zoom]                                         │
├──────────────────────────────────────────────────────────────┤
│  🔧 工具 (12)          ── 并排 ──  🔥 领域气泡图 (CirclePacking) │
│  ┌────────────────────┐         ┌────────────────────┐      │
│  │ Sortable Table     │         │   基因组学  ⚪     │      │
│  │ ☐ 名称 ██ 星数 操作│         │ 单细胞 ⚪ 转录组 ⚪ │      │
│  │ ☐ STARsolo ⭐2,218 │         │   表观  宏基因组   │      │
│  │ ☐ CellBender ⭐404 │         │                    │      │
│  └────────────────────┘         └────────────────────┘      │
├──────────────────────────────────────────────────────────────┤
│  📄 论文 (28)                                               │
│  [Sortable Table with checkbox · tags · IF bar]             │
├──────────────────────────────────────────────────────────────┤
│  ⚙️ 算法 (6)                    [📊 对比选中项]            │
│  [Sortable Table · 勾选 2-4 项弹出雷达图]                   │
├──────────────────────────────────────────────────────────────┤
│  🔗 方法论关联网络 (D3 Force Graph)                         │
│  工具 → 论文 → 算法 引用关系 · 拖拽探索                      │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 页面层级说明

每条内容使用 `FadeInUp` 动画依次入场（`anim-in-d1` 到 `anim-in-d4`），营造逐层展开的浏览体验。

---

## 5. 交互功能清单

### 5.1 全局交互

| 功能 | 实现方式 | 状态 |
|------|---------|------|
| **🌙 暗色模式切换** | CSS 变量驱动 + localStorage 持久化 | ✅ Demo 实现 |
| **🌐 中英双语切换** | data-i18n 属性 + JavaScript 字典 | ✅ Demo 实现 |
| **📅 周次导航** | 左右箭头 + 日期联动 | ✅ Demo 实现 |
| **Toast 通知** | 底部滑入，2 秒自动消失 | ✅ Demo 实现 |

### 5.2 图表交互

| 图表类型 | 交互 | 库 | 状态 |
|---------|------|----|------|
| **📈 趋势折线图** | Hover 显示数值、Zoom 缩放、图例切换 | Chart.js | ✅ Demo 实现 |
| **🔥 领域气泡图** | Hover 放大发光、弹性入场动画 | D3 Circle Packing | ✅ Demo 实现 |
| **📊 算法雷达图** | 勾选 2-4 项 → 弹出对比 | Chart.js Radar | ✅ Demo 实现 |
| **🔗 关联网络图** | 拖拽节点、悬停高亮、缩放平移 | D3 Force Graph | ✅ Demo 实现 |

### 5.3 表格交互

| 功能 | 说明 | 状态 |
|------|------|------|
| **列排序** | 点击表头排序（↕↑↓），支持数值和字符串 | ✅ Demo 实现 |
| **搜索过滤** | 实时输入过滤表格行 | ✅ Demo 实现 |
| **标签筛选** | 按领域/分类切换（Tools 表） | ✅ Demo 实现 |
| **多选勾选** | 全选/取消，跨页选择（未来） | ✅ Demo 实现 |
| **行操作** | 复制命令、收藏、PDF 预览 | ✅ Demo 实现 |
| **分页** | 页码导航 | ✅ Demo 实现 |
| **IF 影响因子色条** | 高/中/低 三段可视化 | ✅ Demo 实现 |

### 5.4 待实现高级交互（下一阶段）

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 内容详情展开/折叠 | P1 | 行内展开摘要和元数据 |
| 论文收藏夹本地存储 | P1 | IndexedDB 或 localStorage |
| 导出选定项为 BibTeX/CSV | P2 | 格式化导出 |
| 高级筛选面板 | P2 | 多条件组合筛选（日期范围、IF 阈值等） |
| 键盘快捷键 | P2 | n/p 导航上一周/下一周，/ 搜索 |
| 分享链接生成 | P3 | 生成当前视图的分享 URL |

---

## 6. 组件树

```
App
├── Header (sticky)
│   ├── Logo (🧬 BioinfoHub)
│   ├── WeekNav
│   │   ├── PrevButton
│   │   ├── WeekLabel
│   │   └── NextButton
│   ├── RSSButton
│   ├── SubscribeButton
│   ├── LangToggle (中/EN)
│   └── ThemeToggle (🌙/☀️)
├── Main Container
│   ├── Hero
│   │   ├── Title
│   │   ├── Subtitle
│   │   └── MetaInfo (date, count, update)
│   ├── StatsGrid
│   │   └── StatCard × 4
│   ├── TrendSection
│   │   ├── SectionHeader
│   │   └── ChartCard
│   │       └── LineChart (Chart.js)
│   ├── ToolsSection
│   │   ├── SectionHeader
│   │   └── TwoColumnLayout
│   │       ├── TableCard (Tools)
│   │       │   ├── TableToolbar (Search + Filters)
│   │       │   ├── SortableTable
│   │       │   └── Pagination
│   │       └── ChartCard
│   │           └── CirclePacking (D3.js)   ← 替换 Treemap
│   ├── PapersSection
│   │   ├── SectionHeader
│   │   └── TableCard (Papers)
│   │       ├── TableToolbar
│   │       ├── SortableTable
│   │       └── Pagination
│   ├── AlgorithmsSection
│   │   ├── SectionHeader
│   │   └── TableCard (Algorithms)
│   │       ├── TableToolbar
│   │       ├── SortableTable
│   │       └── Pagination
│   └── NetworkSection
│       ├── SectionHeader
│       └── NetworkCard
│           └── ForceGraph (D3.js)
├── Footer
│   ├── BrandColumn
│   ├── ContentColumn
│   ├── AboutColumn
│   └── SupportColumn
├── CompareModal (overlay)
│   ├── ModalHeader
│   ├── RadarChart (Recharts)
│   └── CompareInfo
└── Toast (fixed bottom-right)
```

---

## 7. 数据模型

### 7.1 工具 (Tool)

```typescript
interface Tool {
  id: string;
  name: string;
  version: string;
  description: string;
  domain: 'rna-seq' | 'single-cell' | 'genomics' | 'epigenomics' | 'metagenomics' | 'proteomics';
  language: 'Python' | 'R' | 'Julia' | 'C++';
  platform: 'CLI' | 'GUI' | 'Web' | 'API';
  stars: number | null;    // GitHub Stars 计数（如 2218），无 GitHub 页面则为 null
  installCmd: string;   // 安装命令
  githubUrl?: string;
  paperUrl?: string;
  weekAdded: string;    // e.g. "2026-W27"
  dateAdded: string;    // ISO date
  tags: string[];
}
```

### 7.2 论文 (Paper)

```typescript
interface Paper {
  id: string;
  title: string;
  titleZh?: string;       // 中文标题
  authors: string[];
  journal: string;
  impactFactor: number;
  citations: number;
  abstract: string;
  url: string;
  doi: string;
  domains: string[];       // 所属领域
  weekAdded: string;
  dateAdded: string;
  tags: string[];
  bibtex: string;          // BibTeX 格式引用
}
```

### 7.3 算法 (Algorithm)

```typescript
interface Algorithm {
  id: string;
  name: string;
  version: string;
  task: string;
  taskZh?: string;
  complexity: {
    time: string;          // e.g. "O(n)"
    space?: string;
    color: 'green' | 'yellow' | 'red';
  };
  description: string;
  githubUrl?: string;
  paperUrl?: string;
  stars?: number | null;   // GitHub Stars 计数
  domains: string[];
  weekAdded: string;
  // 用于雷达图对比的维度评分 (0-100)
  metrics?: {
    accuracy: number;
    speed: number;
    memory: number;
    scalability: number;
    usability: number;
    community: number;
  };
}
```

### 7.4 周数据聚合 (Weekly Digest)

```typescript
interface WeeklyDigest {
  week: string;           // e.g. "2026-W27"
  dateRange: {
    start: string;        // ISO date
    end: string;
  };
  stats: {
    tools: number;
    papers: number;
    algorithms: number;
    hotTopic: string;
    hotTopicCount: number;
  };
  tools: Tool[];
  papers: Paper[];
  algorithms: Algorithm[];
  trends: {
    domain: string;
    weeklyCounts: number[];   // 过去 8 周数据
  }[];
  network: {
    nodes: NetworkNode[];
    links: NetworkLink[];
  };
}
```

---

## 8. 技术选型

### 8.1 推荐技术栈

| 层次 | 方案 | 理由 |
|------|------|------|
| **框架** | Next.js 14+ (App Router) | SSR/SSG 支持，SEO 友好，React 生态 |
| **语言** | TypeScript | 类型安全，数据模型清晰 |
| **样式** | Tailwind CSS | 快速原型，与设计系统衔接好 |
| **UI 组件** | shadcn/ui | 高质量基础组件（按钮、弹窗、表格） |
| **图表** | Recharts + D3.js + Chart.js | 见下方分工说明 |
| **表格** | TanStack Table v8 | 排序、过滤、分页、勾选开箱即用 |
| **动画** | Framer Motion | 布局动画和入场过渡 |
| **数据层** | MDX / JSON 文件 | SSG 构建，每周手动更新 |

### 8.2 图表库分工

| 用途 | 库 | 原因 |
|------|----|------|
| 趋势折线图 | **Recharts** | React 原生，交互开箱即用（Hover/Zoom/图例） |
| 算法雷达图 | **Recharts** | 同上，与折线图保持一致 |
| 领域气泡图 | **D3.js** | 采用 Circle Packing 布局替代传统 Treemap，视觉效果更现代 |
| 关联网络图 | **D3.js** | Force-directed graph，拖拽/缩放/悬停高亮 |

> Demo 阶段使用 Chart.js 和 D3.js 的 CDN 版本以快速验证设计。正式开发迁移到上述分工。

### 8.3 双语方案

```typescript
// 核心策略：字典式 i18n，构建时静态生成
// 每个页面对应两个路由: /zh/week/27 和 /en/week/27
// 或使用单个路由 + 语言前缀: /week/27?lang=zh

interface I18nDict {
  [key: string]: {
    en: string;
    zh: string;
  };
}

// 动态内容（如论文标题）在数据层直接提供双语字段:
interface Paper {
  titleEn: string;
  titleZh: string;
  // ...
}
```

### 8.4 数据流架构

```
Content Creators
      ↓
 Markdown / JSON files  ← 每周手动更新
      ↓
    Git repository
      ↓
 Next.js SSG (getStaticProps)
      ↓
 Static HTML pages
      ↓
   CDN Delivery
```

---

## 9. 开发路线图

### Phase 1 — 设计验证（已完成）

- [x] 设计方案讨论与定稿
- [x] 设计系统定义（色彩、字体、布局）
- [x] 交互式 HTML Demo
- [x] 双语切换验证
- [x] 暗色模式验证

### Phase 2 — 基础工程（已完成）

- [x] Next.js 14.2 项目初始化 + TypeScript Strict 模式
- [x] 设计系统落地（Tailwind 配置、CSS 变量、Google Fonts）
- [x] 布局组件（Header / Footer / SectionHeader / StatCard）
- [x] Sticky Header + 周次导航（prev/next 边界禁用）
- [x] 暗色模式（CSS 变量 + localStorage 持久化 + 防闪烁）
- [x] i18n 框架（React Context + 字典模式，中/英即时切换）

### Phase 3 — 数据与内容（已完成）

- [x] 数据模型定义（Tool / Paper / Algorithm / WeeklyDigest 等完整类型）
- [x] 每周 JSON 数据文件（`data/weeks/2026-W27.json`）
- [x] 周次索引（`data/archive.json`）
- [x] SSG 构建（`output: 'export'` + 静态 import 数据层）
- [x] 首页 + 周次路由（`/week/[id]` `generateStaticParams`）
- [x] 从 GitHub API 拉取真实 Star 数写入数据

### Phase 4 — 核心功能（已完成）

- [x] 统计卡片（4 列网格，含变化趋势箭头）
- [x] 趋势折线图（Recharts LineChart，4 领域 8 周滑动窗口）
- [x] 交互式表格（TanStack Table v8）
  - [x] 列排序（↕↑↓ 数值/字符串）
  - [x] 搜索过滤（全局实时输入）
  - [x] 多选勾选（全选/取消 + 跨页选择）
  - [x] 分页（10 条/页）
- [x] 领域气泡图（D3 CirclePacking，替换 Treemap）
  - [x] 径向渐变 + 弹性入场动画
  - [x] Hover 放大 + 发光特效
- [x] 算法雷达图对比模态框（Recharts RadarChart）
- [x] 关联网络图（D3 Force Graph，拖拽/缩放/悬停提示）
- [x] 三种表格各自按数据类型定制列

### Phase 5 — 高级功能（待实现）

- [ ] 论文收藏夹（localStorage / IndexedDB）
- [ ] BibTeX / CSV 导出
- [ ] 搜索结果页面
- [ ] 键盘快捷键
- [ ] 打印优化样式
- [ ] PWA / 离线支持

---

## 10. UX 检查清单

### 10.1 可访问性

- [ ] 所有交互元素有 `cursor: pointer`
- [ ] Hover 状态有过渡动画（150-300ms）
- [ ] Focus 状态可见（键盘导航）
- [ ] 颜色对比度 ≥ 4.5:1（AA 标准）
- [ ] 颜色不单独作为信息传达方式（图表补充线型/标签）
- [ ] `prefers-reduced-motion` 媒体查询
- [ ] 语义化 HTML 标签（nav, main, section, table）

### 10.2 性能

- [ ] 图片使用 WebP/AVIF 格式
- [ ] 图表组件动态导入（按需加载）
- [ ] CSS 变量主题切换无重排
- [ ] 大列表虚拟化（50+ 条时）
- [ ] 字体使用 `font-display: swap`
- [ ] SSG 预渲染，首次内容绘制 < 1s

### 10.3 响应式

- [ ] 375px（小屏手机）正常显示
- [ ] 768px（平板）适配
- [ ] 1024px+（桌面）全布局
- [ ] 表格横向滚动支持
- [ ] 热力图/网络图在移动端简化为静态图

### 10.4 暗色模式

- [ ] 所有元素切换无闪烁
- [ ] 图表同步切换颜色
- [ ] 热力图卡片背景适配
- [ ] 表格行 hover 颜色适配
- [ ] 模态框遮罩色适配

---

## 附录 A: Demo 验证结果

Demo (`demo.html`) 已验证的功能：

| 模块 | 功能 | 状态 |
|------|------|------|
| Header | 周次导航、RSS、订阅、主题切换 | ✅ |
| Header | 中英双语切换（data-i18n） | ✅ |
| 统计卡片 | 4 列数据概览，hover 效果 | ✅ |
| 趋势折线图 | Chart.js 4 系列，Hover 交互 | ✅ |
| 工具表格 | 排序、搜索、标签筛选、分页 | ✅ |
| 领域气泡图 | D3 Circle Packing，Hover 放大发光 | ✅ |
| 论文表格 | 排序、搜索、IF 色条、操作按钮 | ✅ |
| 算法表格 | 勾选对比、雷达图模态框 | ✅ |
| 关联网络 | D3 Force Graph，拖拽/缩放 | ✅ |
| Footer | 四栏布局，链接交互 | ✅ |
| 暗色模式 | 全局 CSS 变量切换 | ✅ |
| 双语 | 全部文本 + 图表标签 + 动态数据 | ✅ |
| 响应式 | 1024px / 640px 断点 | ✅ |

---

*文档版本：v0.1 · 下次更新：进入 Phase 2 开发前*
