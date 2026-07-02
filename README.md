# 🧬 BioinfoHub

**每周生物信息前沿技术汇总平台** — *Weekly Bioinformatics Intelligence*

[![Deploy to GitHub Pages](https://github.com/LeLi0912/BHub4/actions/workflows/deploy.yml/badge.svg)](https://github.com/LeLi0912/BHub4/actions/workflows/deploy.yml)

BioinfoHub 是一个内容策展型平台，每周汇总生物信息学领域的前沿动态，面向研究人员和计算生物学家提供最新工具、论文和算法信息。

> 🔗 **在线地址**: [https://leli0912.github.io/BHub4](https://leli0912.github.io/BHub4)
>
> 🎨 **交互 Demo**: [demo.html](./demo.html)（单文件原型，含完整交互和暗色模式）

---

## 📋 核心内容

| 分类 | 内容 | 目标用户价值 |
|------|------|-------------|
| 🔧 **工具** | 新发布的生信工具、软件、平台 | 快速了解可用工具，减少重复造轮子 |
| 📄 **论文** | 本周重要生信论文 | 跟进前沿研究，掌握领域动态 |
| ⚙️ **算法** | 新算法/方法学进展 | 了解方法论创新，优化分析流程 |

## ✨ 功能特性

- 📊 **统计概览** — 工具/论文/算法数量及环比变化
- 📈 **趋势折线图** — 4 大领域 8 周滑动窗口趋势分析
- 🔥 **领域气泡图** — D3 Circle Packing 可视化领域分布
- 🔗 **方法论关联网络** — D3 Force Graph 展示工具-论文-算法引用关系
- 📋 **交互式表格** — TanStack Table 驱动，支持排序、搜索、分页、多选
- 📊 **算法雷达图对比** — 勾选 2-4 个算法，弹出六维评分对比
- 🌐 **中英双语** — 一键切换，全局即时生效
- 🌙 **暗色模式** — CSS 变量驱动，localStorage 持久化，防闪烁
- 📱 **响应式** — 桌面 4 列 → 平板 2×2 → 手机单列
- 🏗️ **SSG 静态生成** — Next.js 构建时预渲染，CDN 分发

## 🛠️ 技术栈

| 层次 | 方案 | 用途 |
|------|------|------|
| **框架** | Next.js 14 (App Router) | SSG 静态生成 |
| **语言** | TypeScript (Strict) | 类型安全 |
| **样式** | Tailwind CSS + CSS 变量 | 设计系统 + 暗色模式 |
| **图表** | Recharts + D3.js | 趋势图 / 圈层图 / 网络图 / 雷达图 |
| **表格** | TanStack Table v8 | 排序、过滤、分页、勾选 |
| **数据** | JSON 文件 + Git | 构建时加载，无需数据库 |
| **部署** | GitHub Actions → Pages | 自动构建部署，CDN 分发 |

## 📁 目录结构

```
BHub4/
├── .github/workflows/
│   ├── deploy.yml              ← 自动部署到 GitHub Pages
│   └── validate-data.yml        ← PR 数据校验
├── data/
│   ├── archive.json             ← 周次索引（8 周）
│   └── weeks/                   ← 每周数据文件
│       ├── 2026-W20.json
│       ├── ...
│       └── 2026-W27.json
├── scripts/
│   └── validate-data.mjs       ← JSON 数据校验脚本
├── src/
│   ├── app/
│   │   ├── page.tsx             ← 首页（重定向到最新周次）
│   │   ├── layout.tsx           ← 根布局
│   │   ├── about/page.tsx       ← 关于页面
│   │   ├── archive/page.tsx     ← 往期回顾
│   │   └── week/[id]/
│   │       ├── page.tsx         ← SSG 周次页面
│   │       └── WeekContent.tsx  ← 周次内容（客户端组件）
│   ├── components/
│   │   ├── layout/              ← Header, Footer, Container
│   │   ├── cards/               ← StatCard
│   │   ├── charts/              ← TrendChart, CirclePacking, NetworkGraph, RadarCompare
│   │   ├── tables/              ← ToolsTable, PapersTable, AlgorithmsTable
│   │   ├── modals/              ← CompareModal
│   │   └── SectionHeader.tsx
│   ├── lib/                     ← i18n, data, utils
│   └── types/                   ← TypeScript 类型定义
├── demo.html                    ← 交互式单文件原型
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 🚀 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev
# → http://localhost:3000

# 3. 生产构建
npm run build

# 4. 校验 JSON 数据
npm run validate-data
```

## 📦 数据格式

每个周次数据文件遵循统一 Schema：

```typescript
interface WeeklyDigest {
  week: string;           // "2026-W27"
  label: Bilingual;       // { en, zh }
  dateRange: { start, end };
  stats: WeekStats;       // tools/papers/algorithms count + change
  tools: Tool[];          // 工具列表
  papers: Paper[];        // 论文列表
  algorithms: Algorithm[]; // 算法列表（含六维 metrics 评分）
  trends: Trend[];        // 4 领域 × 8 周趋势
  treemap: TreemapData;   // 领域气泡图数据（中/英双语）
  network: NetworkData;   // 关联网络节点和边
}
```

## 🔄 数据更新流程

```bash
# 新增一周数据
cp data/weeks/2026-W27.json data/weeks/2026-W28.json
# 修改 week、label、dateRange、updatedAt
# 更新 stats、tools、papers、algorithms、trends、treemap、network
# 在 data/archive.json 头部插入新记录

# 本地校验
npm run validate-data

# 提交
git add data/ && git commit -m "data: add 2026-W28"
git push origin main              # → 自动触发部署
```

## 🌐 双语支持

- **UI 文本**: React Context + 字典模式，`src/lib/i18n.tsx`
- **动态内容**: 数据字段使用 `Bilingual` 类型 `{ en: string, zh: string }`
- **切换方式**: Header 按钮或 `?lang=zh` / `?lang=en` 查询参数
- **接入方式**: `useI18n()` hook 返回 `{ lang, toggleLang, t }`

## 📊 图表选型

| 图表 | 库 | 说明 |
|------|----|------|
| 趋势折线图 | Recharts | React 原生，交互开箱即用 |
| 领域气泡图 | D3 Circle Packing | 径向渐变 + 弹性入场 + Hover 发光 |
| 关联网络图 | D3 Force Graph | 拖拽 / 缩放 / 悬停提示 |
| 雷达对比图 | Recharts Radar | 算法六维评分对比 |

## 🧪 交互演示

仓库中附带完整的单文件交互原型 `demo.html`：

```
demo.html
├── Header + 周次导航
├── 统计卡片（4 列，hover 效果）
├── 趋势折线图（Chart.js，4 领域）
├── 工具表格 + 领域气泡图（D3 Circle Packing）
├── 论文表格（排序/搜索/IF 色条）
├── 算法表格（勾选对比 + 雷达图）
├── 关联网络图（D3 Force Graph）
├── Footer（4 栏）
├── 暗色模式切换
└── 中英双语切换
```

直接在浏览器中打开 `demo.html` 即可体验，无需构建步骤。

## 📄 文档

- [DEPLOY.md](./DEPLOY.md) — 部署与开发流程
- [FRONTEND_DEV.md](./FRONTEND_DEV.md) — 前端设计文档
- [DATA_DEV.md](./DATA_DEV.md) — 数据层开发规范

## 📌 开发路线

- ✅ **Phase 1** — 设计验证（色彩/字体/布局 Demo）
- ✅ **Phase 2** — 基础工程（Next.js + Tailwind + 设计系统 + i18n）
- ✅ **Phase 3** — 数据与内容（类型定义 + JSON 数据 + SSG 构建）
- ✅ **Phase 4** — 核心功能（图表 + 表格 + 网络图 + 雷达图对比）
- 🔲 **Phase 5** — 高级功能（收藏夹 / BibTeX 导出 / 键盘快捷键 / PWA）

---

*Built with Next.js · TypeScript · Tailwind CSS · D3.js · Recharts · TanStack Table*
