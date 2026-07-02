# BioinfoHub — 开发与部署流程文档

> 版本：v0.1
> 日期：2026-07-02
> 对应文档：FRONTEND_DEV.md / DATA_DEV.md

---

## 目录

1. [架构总览](#1-架构总览)
2. [环境准备](#2-环境准备)
3. [项目初始化](#3-项目初始化)
4. [开发流程](#4-开发流程)
5. [数据更新流程](#5-数据更新流程)
6. [GitHub Actions 部署](#6-github-actions-部署)
7. [目录结构](#7-目录结构)
8. [关键配置](#8-关键配置)
9. [故障排查](#9-故障排查)

---

## 1. 架构总览

```
┌─────────────────────────────────────────────────────────┐
│                     开发者工作站                          │
│  编辑 JSON 数据 → git push → GitHub                      │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   GitHub 仓库                            │
│                                                         │
│  PR 触发 ──→ validate-data.yml ──→ JSON 语法/字段校验    │
│                                                         │
│  push main ──→ deploy.yml ──→ Next.js SSG 构建          │
│                           └──→ 部署到 GitHub Pages       │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   GitHub Pages                           │
│  静态 HTML / CSS / JS → 全球 CDN 分发                    │
│  用户访问: https://<username>.github.io/BioinfoHub       │
└─────────────────────────────────────────────────────────┘
```

**核心设计决策：**

| 决策 | 选择 | 理由 |
|------|------|------|
| 托管平台 | GitHub Pages | 免费、零运维、内置 CDN、对静态内容最简路径 |
| 构建方式 | Next.js `output: 'export'` | 数据在构建时全部已知，SSG 天然匹配，FCP < 1s |
| 数据层 | JSON 文件 + Git 版本管理 | 无需数据库、变更可追溯、PR 即可审查内容 |
| CI/CD | GitHub Actions | 与仓库深度集成、免费额度充足、社区生态成熟 |
| 双语路由 | `?lang=zh` 查询参数 | 避免静态导出文件翻倍，切换语言无需重新加载页面 |

---

## 2. 环境准备

### 2.1 本机开发环境

| 工具 | 版本要求 | 安装方式 |
|------|---------|---------|
| Node.js | ≥ 20 LTS | `nvm install 20` 或 [nodejs.org](https://nodejs.org) |
| npm | ≥ 10 | 随 Node.js 附带 |
| Git | ≥ 2.40 | `sudo apt install git` (Linux) 或 [git-scm.com](https://git-scm.com) |
| Python | ≥ 3.10 | 仅用于 JSON 格式校验 |

验证安装：

```bash
node -v    # 应输出 v20.x.x
npm -v     # 应输出 10.x.x
git -v     # 应输出 git version 2.x.x
```

### 2.2 GitHub 仓库设置

1. 在 GitHub 创建新仓库，命名为 `BioinfoHub`（公开仓库）
2. 前往 **Settings → Pages**：
   - **Source**: 选择 `GitHub Actions`
   - **Enforce HTTPS**: 勾选
3. 前往 **Settings → Environments**：
   - 确认 `github-pages` 环境已自动创建

---

## 3. 项目初始化

### 3.1 创建 Next.js 项目

```bash
# 在项目根目录执行
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --no-import-alias \
  --use-npm

# 安装运行时依赖
npm install recharts d3 @tanstack/react-table framer-motion next-themes

# 安装类型声明
npm install -D @types/d3

# 初始化 shadcn/ui（交互式）
npx shadcn@latest init
```

shadcn/ui 初始化选项：

```
✔ Which style would you like to use? › New York
✔ Which color would you like to use as the base color? › Blue
✔ Would you like to use CSS variables for theming? › yes
```

### 3.2 初始化 Git 仓库

```bash
git init
git config user.name "lile"
git config user.email "lile@users.noreply.github.com"

# 添加 .gitignore
cat > .gitignore << 'EOF'
node_modules/
.next/
out/
.env
.env.local
*.log
.DS_Store
EOF

git add -A
git commit -m "init: Next.js project scaffold with TypeScript and Tailwind"
```

### 3.3 关联远程仓库

```bash
git remote add origin https://github.com/<username>/BioinfoHub.git
git branch -M main
git push -u origin main
```

---

## 4. 开发流程

### 4.1 开发阶段划分

| 阶段 | 内容 | 产出 |
|------|------|------|
| **Phase 2** — 基础工程 | 设计系统落地、布局组件、i18n 框架 | 可运行的空白骨架 |
| **Phase 3** — 数据与内容 | TypeScript 类型、SSG 数据加载、周次路由 | 数据驱动的静态页面 |
| **Phase 4** — 核心功能 | 统计卡片、图表、交互表格、网络图 | 功能完整的首页 |
| **Phase 5** — 高级功能 | 收藏夹、导出、快捷键、PWA | 增强体验 |

### 4.2 Phase 2 实施步骤

#### 步骤 1：设计系统 Tailwind 配置

编辑 `tailwind.config.ts`，扩展项目的色彩和字体系统：

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1E40AF",
          light: "#3B82F6",
        },
        accent: { DEFAULT: "#D97706" },
        success: { DEFAULT: "#059669" },
        purple: { DEFAULT: "#7C3AED" },
      },
      fontFamily: {
        heading: ["Crimson Pro", "serif"],
        body: ["Atkinson Hyperlegible", "sans-serif"],
      },
      maxWidth: {
        content: "1400px",
      },
      borderRadius: {
        card: "12px",
        "card-lg": "20px",
      },
    },
  },
};

export default config;
```

#### 步骤 2：全局 CSS 变量

编辑 `src/app/globals.css`，定义亮/暗双主题：

```css
:root {
  --primary: #1E40AF;
  --primary-light: #3B82F6;
  --accent: #D97706;
  --success: #059669;
  --purple: #7C3AED;
  --bg: #F8FAFC;
  --bg-card: #FFFFFF;
  --fg: #1E293B;
  --fg-muted: #64748B;
  --border: #E2E8F0;
}

.dark {
  --primary: #60A5FA;
  --primary-light: #93C5FD;
  --accent: #FBBF24;
  --success: #34D399;
  --purple: #A78BFA;
  --bg: #0F172A;
  --bg-card: #1E293B;
  --fg: #F1F5F9;
  --fg-muted: #94A3B8;
  --border: #334155;
}
```

#### 步骤 3：布局组件骨架

创建以下组件文件：

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx        ← Sticky Header + 周次导航
│   │   ├── Footer.tsx        ← 四栏 Footer
│   │   └── Container.tsx     ← max-w-content 容器
│   ├── ui/                   ← shadcn/ui 组件（自动生成）
│   ├── cards/
│   │   └── StatCard.tsx      ← 统计卡片
│   └── charts/               ← 图表组件（Phase 4）
├── lib/
│   ├── i18n.ts               ← 双语切换逻辑
│   └── data.ts               ← JSON 数据加载工具
└── types/
    └── index.ts              ← TypeScript 接口定义
```

#### 步骤 4：i18n 框架

`src/lib/i18n.ts`:

```ts
export type Lang = 'en' | 'zh';

export interface Bilingual {
  en: string;
  zh: string;
}

export function t(value: Bilingual | string, lang: Lang): string {
  if (typeof value === 'string') return value;
  return value[lang] || value.en;
}

// 从 URL 查询参数或 localStorage 读取语言偏好
export function getLang(searchParams: URLSearchParams): Lang {
  const fromUrl = searchParams.get('lang');
  if (fromUrl === 'zh' || fromUrl === 'en') return fromUrl;
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('lang') as Lang | null;
    if (saved === 'zh' || saved === 'en') return saved;
  }
  return 'en';
}
```

### 4.3 Phase 3 实施步骤

#### 步骤 1：TypeScript 类型定义

`src/types/index.ts` — 按 DATA_DEV.md 中的 Schema 完整定义：

```ts
export interface Bilingual {
  en: string;
  zh: string;
}

export interface Tool {
  id: string;
  name: string;
  version: string;
  description: Bilingual;
  domain: string;
  language: string;
  platform: 'CLI' | 'GUI' | 'Web' | 'API';
  stars: number;
  installCmd: string;
  githubUrl?: string;
  paperUrl?: string;
  weekAdded: string;
  dateAdded: string;
  tags: string[];
}

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
  githubUrl?: string;
  paperUrl?: string;
  stars?: number | null;   // GitHub Stars 计数
  domains: string[];
  weekAdded: string;
  metrics?: {
    accuracy: number;
    speed: number;
    memory: number;
    scalability: number;
    usability: number;
    community: number;
  };
}

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
  treemap: { en: TreemapItem[]; zh: TreemapItem[] };
  network: NetworkData;
}

// ... WeekStats, Trend, TreemapItem, NetworkNode, NetworkLink 等辅助类型
```

#### 步骤 2：数据加载工具

`src/lib/data.ts`:

```ts
import { WeeklyDigest } from '@/types';
import archiveData from '@/../data/archive.json';

export async function getAllWeekIds(): Promise<string[]> {
  return archiveData.weeks.map(w => w.week);
}

export async function getWeekData(week: string): Promise<WeeklyDigest> {
  const data = await import(`@/../data/weeks/${week}.json`);
  return data as WeeklyDigest;
}

export async function getLatestWeek(): Promise<string> {
  return archiveData.weeks[0].week;
}
```

#### 步骤 3：页面路由

```
src/app/
├── layout.tsx              ← 根布局（Header + Footer + 主题提供者）
├── page.tsx                ← 重定向到最新周次
└── week/
    └── [id]/
        └── page.tsx        ← 周次详情页（SSG 静态生成）
```

`src/app/week/[id]/page.tsx`:

```tsx
import { getAllWeekIds, getWeekData } from '@/lib/data';
import { WeeklyDigest } from '@/types';

// 构建时生成所有周次路径
export async function generateStaticParams() {
  const weeks = await getAllWeekIds();
  return weeks.map(week => ({ id: week }));
}

export default async function WeekPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { lang?: string };
}) {
  const data: WeeklyDigest = await getWeekData(params.id);
  const lang = searchParams.lang === 'zh' ? 'zh' : 'en';

  return (
    <main>
      {/* StatsGrid, Charts, Tables 等组件，传入 data 和 lang */}
    </main>
  );
}
```

### 4.4 Phase 4 核心组件实现要点

#### D3 Circle Packing 在 React 中的集成

关键模式：`useRef` + `useCallback` + `useEffect`，在 effect 中直接操作 SVG DOM，不在 React 中管理 D3 生成的节点。使用 `ResizeObserver` 实现响应式重绘。

```tsx
'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';

export default function CirclePacking({ data }: { data: TreemapItem[] }) {
  const svgRef = useRef<SVGSVGElement>(null);

  const draw = useCallback(() => {
    if (!svgRef.current || !data.length) return;
    const width = svgRef.current.clientWidth || 400;
    // ... D3 pack layout + 径向渐变 + 弹性动画
  }, [data]);

  useEffect(() => {
    draw();
    const observer = new ResizeObserver(draw);
    if (svgRef.current) observer.observe(svgRef.current);
    return () => observer.disconnect();
  }, [draw]);

  return <svg ref={svgRef} className="w-full" style={{ minHeight: '320px' }} />;
}
```

> D3 ForceGraph（关联网络图）同理，标记 `'use client'`，在 useEffect 中绑定力导向布局。

#### TanStack Table 集成

工具表格示例骨架：

```tsx
'use client';

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';

// 列定义、排序状态、过滤状态均在此管理
// 表头点击 → 排序切换（↕ → ↑ → ↓）
// 搜索框输入 → 实时过滤
```

#### 暗色模式

使用 `next-themes` 的 `ThemeProvider`：

```tsx
// src/app/layout.tsx
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

切换按钮：

```tsx
'use client';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
```

### 4.5 开发命令

```bash
npm run dev          # 启动开发服务器 → http://localhost:3000
npm run build        # 生产构建（静态导出到 out/）
npm run validate-data # 运行 JSON 数据校验
npm run lint         # ESLint 检查
```

---

## 5. 数据更新流程

### 5.1 每周更新检查清单

新增一周数据（以 2026-W28 为例）：

```
□ 1. cp data/weeks/2026-W27.json data/weeks/2026-W28.json
□ 2. 修改 week → "2026-W28"
□ 3. 修改 label、dateRange、updatedAt
□ 4. 更新 stats 中的 counts 和 changes
□ 5. 替换 tools / papers / algorithms 数组
□ 6. 更新 trends[].weeklyCounts（移除最旧数据点，末尾添加本周数据）
□ 7. 更新 treemap.en 和 treemap.zh（value 值）
□ 8. 更新 network.nodes 和 network.links
□ 9. 在 data/archive.json 的 weeks 数组头部插入新记录
□ 10. npm run validate-data（本地校验）
□ 11. git add data/ && git commit -m "data: add 2026-W28"
□ 12. git push origin main → 触发自动部署
```

### 5.2 JSON 数据校验脚本

`scripts/validate-data.mjs`:

```js
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DATA_DIR = 'data/weeks';
const ARCHIVE_PATH = 'data/archive.json';

const errors = [];

const archive = JSON.parse(readFileSync(ARCHIVE_PATH, 'utf8'));
const weekFiles = readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));

for (const file of weekFiles) {
  const data = JSON.parse(readFileSync(join(DATA_DIR, file), 'utf8'));
  const expectedWeek = file.replace('.json', '');

  if (data.week !== expectedWeek)
    errors.push(`${file}: week "${data.week}" != filename "${expectedWeek}"`);

  if (data.tools.length !== data.stats.tools.count)
    errors.push(`${file}: tools count mismatch (${data.tools.length} vs ${data.stats.tools.count})`);

  if (data.papers.length !== data.stats.papers.count)
    errors.push(`${file}: papers count mismatch`);

  if (data.algorithms.length !== data.stats.algorithms.count)
    errors.push(`${file}: algorithms count mismatch`);

  const inArchive = archive.weeks.find(w => w.week === data.week);
  if (!inArchive)
    errors.push(`${file}: week not found in archive.json`);

  for (const trend of data.trends) {
    if (trend.weeklyCounts.length !== 8)
      errors.push(`${file}: trend "${trend.domain}" weeklyCounts.length != 8`);
  }
}

// archive.json 降序校验
for (let i = 1; i < archive.weeks.length; i++) {
  if (archive.weeks[i].week > archive.weeks[i - 1].week)
    errors.push('archive.json: weeks not in descending order');
}

if (errors.length > 0) {
  console.error('Validation errors:');
  errors.forEach(e => console.error('  ❌', e));
  process.exit(1);
}

console.log(`✅ Validated ${weekFiles.length} week files + archive.json`);
```

### 5.3 package.json 脚本配置

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "validate-data": "node scripts/validate-data.mjs"
  }
}
```

---

## 6. GitHub Actions 部署

### 6.1 目录结构

```
.github/
└── workflows/
    ├── deploy.yml          ← 主部署流水线
    └── validate-data.yml   ← PR 数据校验
```

### 6.2 deploy.yml — 构建部署

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Validate JSON data
        run: npm run validate-data

      - name: Build static site
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 6.3 validate-data.yml — PR 校验

```yaml
name: Validate Data

on:
  pull_request:
    paths:
      - 'data/**/*.json'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Validate data files
        run: node scripts/validate-data.mjs
```

### 6.4 首次部署后的验证

部署成功后，GitHub Pages 的 URL 格式为：

```
https://<username>.github.io/BioinfoHub
```

如果使用自定义域名：
1. 在 `public/` 目录下创建 `CNAME` 文件，写入自定义域名
2. 在 DNS 服务商处添加 CNAME 记录指向 `<username>.github.io`
3. 在仓库 Settings → Pages → Custom domain 中填入域名

---

## 7. 目录结构

实施完成后的完整目录结构：

```
BioinfoHub/
├── .github/
│   └── workflows/
│       ├── deploy.yml
│       └── validate-data.yml
├── data/
│   ├── archive.json
│   └── weeks/
│       ├── 2026-W20.json
│       ├── 2026-W21.json
│       ├── 2026-W22.json
│       ├── 2026-W23.json
│       ├── 2026-W24.json
│       ├── 2026-W25.json
│       ├── 2026-W26.json
│       └── 2026-W27.json
├── public/
│   └── fonts/
│       ├── CrimsonPro-Variable.woff2
│       └── AtkinsonHyperlegible-Regular.woff2
├── scripts/
│   └── validate-data.mjs
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx                    ← 重定向到 /week/<latest>
│   │   ├── archive/
│   │   │   └── page.tsx                ← 往期回顾
│   │   └── week/
│   │       └── [id]/
│   │           └── page.tsx            ← 周次详情
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Container.tsx
│   │   ├── cards/
│   │   │   └── StatCard.tsx
│   │   ├── charts/
│   │   │   ├── TrendChart.tsx          ← Recharts Line
│   │   │   ├── CirclePacking.tsx       ← D3 Circle Packing
│   │   │   └── ForceGraph.tsx          ← D3 Force Graph
│   │   ├── tables/
│   │   │   ├── ToolsTable.tsx          ← TanStack Table
│   │   │   ├── PapersTable.tsx
│   │   │   └── AlgorithmsTable.tsx
│   │   ├── ui/                         ← shadcn/ui 组件
│   │   └── modals/
│   │       └── CompareModal.tsx        ← 算法雷达图对比（内嵌 Recharts Radar）
│   ├── lib/
│   │   ├── data.ts                     ← getWeekData / getAllWeekIds
│   │   └── i18n.ts                     ← t() / getLang()
│   └── types/
│       └── index.ts                    ← Tool / Paper / Algorithm / WeeklyDigest
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 8. 关键配置

### 8.1 next.config.js

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  // 如果仓库名不是 <username>.github.io，需要设置 basePath：
  // basePath: '/BioinfoHub',
};

module.exports = nextConfig;
```

### 8.2 tsconfig.json (路径别名)

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 8.3 .gitignore 关键条目

```
node_modules/
.next/
out/
.env
.env.local
*.log
.DS_Store
```

---

## 9. 故障排查

| 现象 | 可能原因 | 排查步骤 |
|------|---------|---------|
| 构建失败 `module not found` | 依赖未安装 | `rm -rf node_modules && npm install` |
| `validate-data` 报错 | JSON 字段不匹配 Schema | 对照 DATA_DEV.md 逐字段检查 |
| GitHub Pages 404 | basePath 未配置 | 检查 `next.config.js` 的 `basePath` 与仓库名一致 |
| 页面白屏 | 静态导出不完整 | 检查 `out/` 目录是否包含 `index.html` |
| 字体不显示 | 跨域或路径问题 | 字体文件放 `public/fonts/`，CSS 用相对路径 |
| 暗色模式闪烁 | SSR 时未注入 class | 在 `<html>` 添加 `suppressHydrationWarning` |
| D3 图表不渲染 | 未标记 `'use client'` | 使用 D3 的组件必须添加 `'use client'` 指令 |

---

*文档版本：v0.1 · 下次更新：Phase 2 实施完成后*
