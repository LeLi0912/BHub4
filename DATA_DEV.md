# BioinfoHub 数据库开发文档

> 项目：每周生物信息前沿技术汇总平台
> 版本：v0.1
> 日期：2026-07-02
> 对应前端文档：FRONTEND_DEV.md

---

## 目录

1. [概述](#1-概述)
2. [数据架构](#2-数据架构)
3. [文件组织](#3-文件组织)
4. [archive.json — 周次索引](#4-archivejson--周次索引)
5. [周数据文件 — WeeklyDigest](#5-周数据文件--weeklydigest)
6. [实体模型](#6-实体模型)
    - [6.1 Tool — 工具](#61-tool--工具)
    - [6.2 Paper — 论文](#62-paper--论文)
    - [6.3 Algorithm — 算法](#63-algorithm--算法)
    - [6.4 Trend — 趋势数据](#64-trend--趋势数据)
    - [6.5 CirclePacking — 领域气泡图](#65-circlepacking--领域气泡图)
    - [6.6 Network — 关联网络图](#66-network--关联网络图)
7. [双语数据规范](#7-双语数据规范)
8. [前端消费指南](#8-前端消费指南)
9. [开发规范](#9-开发规范)
10. [附录：领域色板与标签映射](#10-附录领域色板与标签映射)

---

## 1. 概述

BioinfoHub 采用 **JSON-based SSG 数据层**。所有内容数据以 JSON 文件形式存储在 `data/` 目录下，前端通过 Next.js SSG（`getStaticProps`）在构建时读取并生成静态页面。

设计原则：
- **约定优于配置**：所有文件遵循统一 schema，新增周次只需添加 JSON 文件
- **双语言内嵌**：所有展示文本使用 `{ en, zh }` 格式，前端按语言切换取值
- **自包含**：每个周数据文件包含该周全部展示所需数据（含图表、网络图数据）
- **静态优先**：构建时加载，无需运行时数据库

---

## 2. 数据架构

```
┌─────────────────────────────────────────────────────────────┐
│  Content Creators (每周手动更新)                              │
│       ↓                                                      │
│  data/archive.json  +  data/weeks/2026-WXX.json              │
│       ↓                                                      │
│  Git repository (版本管理)                                    │
│       ↓                                                      │
│  Next.js getStaticProps / getStaticPaths                      │
│       ↓                                                      │
│  静态 HTML（CDN 分发）                                        │
└─────────────────────────────────────────────────────────────┘
```

数据流向：
1. 内容编辑者创建/更新 JSON 数据文件
2. 提交至 Git 仓库
3. Next.js 构建时通过 `getStaticPaths` 读取 `archive.json` 生成所有周次路径
4. 通过 `getStaticProps` 读取对应周数据文件传入前端组件
5. 前端 React 组件根据语言偏好渲染中/英文内容

---

## 3. 文件组织

```
data/
├── archive.json               ← 周次索引（所有可用周次的元数据）
└── weeks/
    ├── 2026-W20.json          ← 单周完整数据
    ├── 2026-W21.json
    ├── 2026-W22.json
    ├── 2026-W23.json
    ├── 2026-W24.json
    ├── 2026-W25.json
    ├── 2026-W26.json
    └── 2026-W27.json          ← 最新周次
```

**命名规范**：
- 周次文件：`data/weeks/{年}-W{周数}.json`（如 `2026-W27.json`）
- 周次标识符：`"2026-W27"` 格式，ISO 周次标准
- archive.json 中的 `week` 字段必须与对应文件名一致（不含 `.json`）

---

## 4. archive.json — 周次索引

供周次导航组件和往期回顾页面使用。

### Schema

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `weeks` | `WeekMeta[]` | 是 | 周次元数据数组，按周次降序排列 |

### WeekMeta

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `week` | `string` | 是 | ISO 周次标识，如 `"2026-W27"` |
| `label` | `Bilingual` | 是 | 周次显示标签 |
| `dateRange` | `object` | 是 | 日期范围 |
| `dateRange.start` | `string` | 是 | 起始日期 ISO 格式 |
| `dateRange.end` | `string` | 是 | 结束日期 ISO 格式 |
| `stats` | `object` | 是 | 该周统计摘要 |
| `stats.tools` | `number` | 是 | 工具数量 |
| `stats.papers` | `number` | 是 | 论文数量 |
| `stats.algorithms` | `number` | 是 | 算法数量 |
| `stats.hotTopic` | `Bilingual` | 是 | 本周热门领域名称 |
| `stats.hotTopicCount` | `number` | 是 | 热门领域论文数 |

### 示例

```json
{
  "weeks": [
    {
      "week": "2026-W27",
      "label": { "en": "Week 27, 2026", "zh": "2026 年第 27 周" },
      "dateRange": { "start": "2026-06-29", "end": "2026-07-05" },
      "stats": {
        "tools": 12,
        "papers": 28,
        "algorithms": 6,
        "hotTopic": { "en": "Single Cell", "zh": "单细胞" },
        "hotTopicCount": 12
      }
    }
  ]
}
```

### 前端映射

- **Header 周次导航**：`weeks[i].label` → 周次显示；左右箭头切换索引
- **统计卡片**：`weeks[i].stats` → 工具数/论文数/算法数/热门领域
- **往期回顾页面**：遍历 `weeks` 数组生成列表

---

## 5. 周数据文件 — WeeklyDigest

单周完整数据的顶层结构。文件名必须与 `week` 字段值匹配。

### Schema

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `week` | `string` | 是 | ISO 周次标识 |
| `label` | `Bilingual` | 是 | 周次显示标签 |
| `dateRange` | `DateRange` | 是 | 日期范围 |
| `updatedAt` | `string` | 是 | ISO 8601 更新时间戳 |
| `totalItems` | `number` | 是 | 本周内容总条目数 |
| `stats` | `WeekStats` | 是 | 统计概览 |
| `tools` | `Tool[]` | 是 | 工具列表 |
| `papers` | `Paper[]` | 是 | 论文列表 |
| `algorithms` | `Algorithm[]` | 是 | 算法列表 |
| `trends` | `Trend[]` | 是 | 趋势数据 |
| `treemap` | `TreemapData` | 是 | 领域热力图数据（前端用 CirclePacking 渲染） |
| `network` | `NetworkData` | 是 | 关联网络图数据 |

### WeekStats

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `tools` | `{ count, change }` | 是 | 工具数及较上周变化 |
| `papers` | `{ count, change }` | 是 | 论文数及较上周变化 |
| `algorithms` | `{ count, change }` | 是 | 算法数及较上周变化 |
| `hotTopic` | `HotTopic` | 是 | 热门领域信息 |

其中 `change` 为正数表示增长，负数表示下降，用于统计卡片的 `up/down` 样式。

```json
{
  "stats": {
    "tools": { "count": 12, "change": 3 },
    "papers": { "count": 28, "change": 8 },
    "algorithms": { "count": 6, "change": 1 },
    "hotTopic": {
      "key": "single_cell",
      "name": { "en": "Single Cell", "zh": "单细胞" },
      "count": 12
    }
  }
}
```

---

## 6. 实体模型

### 6.1 Tool — 工具

对应前端 Tools SortableTable 和 CirclePacking 筛选。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string` | 是 | 唯一标识符，kebab-case |
| `name` | `string` | 是 | 工具名称 |
| `version` | `string` | 是 | 当前版本号 |
| `description` | `Bilingual` | 是 | 中英双语简介 |
| `domain` | `string` | 是 | 领域 key，见附录色板 |
| `language` | `string` | 是 | 编程语言 |
| `platform` | `string` | 是 | 平台类型：CLI/GUI/Web/API |
| `stars` | `number | null` | 是 | GitHub Stars 计数（实际数值，如 2218），无 GitHub 页面则为 0 或 null |
| `installCmd` | `string` | 是 | 安装/使用命令 |
| `githubUrl` | `string` | 否 | GitHub 仓库地址 |
| `paperUrl` | `string` | 否 | 关联论文 DOI 链接 |
| `weekAdded` | `string` | 是 | 首次收录周次 |
| `dateAdded` | `string` | 是 | 收录日期 ISO 格式 |
| `tags` | `string[]` | 是 | 标签数组，用于筛选和分类 |

**前端的 tags 映射到 CSS class**：
- `"rna-seq"` → `.tag-blue`
- `"single-cell"` → `.tag-purple`
- `"genomics"` → `.tag-blue`
- `"transcriptomics"` → `.tag-green`
- `"epigenomics"` → `.tag-orange`
- `"metagenomics"` → `.tag-pink`
- `"proteomics"` → `.tag-red`
- `"structural-bio"` → `.tag-teal`

**star 渲染规则**：`stars` 字段值为实际 GitHub Stars 计数（如 2218），在 UI 中以 `⭐ 2,218` 格式显示（使用 `toLocaleString()` 格式化）。无 GitHub 页面时显示 `-`。

### 6.2 Paper — 论文

对应前端 Papers SortableTable。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string` | 是 | 唯一标识符，kebab-case |
| `title` | `Bilingual` | 是 | 中英双语标题 |
| `authors` | `string[]` | 是 | 作者列表 |
| `journal` | `string` | 是 | 期刊名称 |
| `impactFactor` | `number` | 是 | 影响因子 |
| `citations` | `number` | 是 | 引用数 |
| `abstract` | `Bilingual` | 是 | 中英双语摘要 |
| `url` | `string` | 是 | 论文链接 |
| `doi` | `string` | 是 | DOI 标识符 |
| `domains` | `string[]` | 是 | 所属领域列表 |
| `weekAdded` | `string` | 是 | 收录周次 |
| `dateAdded` | `string` | 是 | 收录日期 |
| `tags` | `string[]` | 是 | 标签数组 |
| `bibtex` | `string` | 是 | BibTeX 格式引用字符串 |

**IF 颜色条规则**（前端根据 impactFactor 计算）：
- `impactFactor >= 20` → `.if-bar.high`（绿色，宽度 40px）
- `5 <= impactFactor < 20` → `.if-bar.med`（蓝色，宽度 24px）
- `impactFactor < 5` → `.if-bar.low`（灰色，宽度 12px）

### 6.3 Algorithm — 算法

对应前端 Algorithms SortableTable 和 RadarChart 模态框。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string` | 是 | 唯一标识符 |
| `name` | `string` | 是 | 算法名称 |
| `version` | `string` | 是 | 版本号 |
| `task` | `Bilingual` | 是 | 任务描述 |
| `complexity` | `Complexity` | 是 | 时间复杂度 |
| `description` | `Bilingual` | 是 | 算法描述 |
| `githubUrl` | `string` | 否 | GitHub 链接 |
| `paperUrl` | `string` | 否 | 论文链接 |
| `stars` | `number | null` | 否 | GitHub Stars 计数，无 GitHub 页面则为 null |
| `domains` | `string[]` | 是 | 所属领域 |
| `weekAdded` | `string` | 是 | 收录周次 |
| `metrics` | `Metrics` | 是 | 六维评分（雷达图数据） |

#### Complexity

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `time` | `string` | 是 | 时间复杂度表示，如 "O(n)" |
| `space` | `string` | 否 | 空间复杂度表示 |
| `color` | `string` | 是 | 标签颜色：`"green"`/`"yellow"`/`"red"` |

#### Metrics（雷达图六维评分）

| 字段 | 类型 | 范围 | 说明 |
|------|------|------|------|
| `accuracy` | `number` | 0-100 | 准确度 |
| `speed` | `number` | 0-100 | 速度 |
| `memory` | `number` | 0-100 | 内存效率 |
| `scalability` | `number` | 0-100 | 可扩展性 |
| `usability` | `number` | 0-100 | 易用性 |
| `community` | `number` | 0-100 | 社区活跃度 |

**雷达图维度在 i18n 字典中的 key**：
- `radar_accuracy` / `radar_speed` / `radar_memory`
- `radar_scalability` / `radar_usability` / `radar_community`

### 6.4 Trend — 趋势数据

对应前端 LineChart（Chart.js/Recharts）。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `domain` | `string` | 是 | 领域显示名称（英文，作为图例标签） |
| `domainKey` | `string` | 是 | 领域 key，用于双语切换 |
| `color` | `string` | 是 | 线条颜色（十六进制） |
| `weeklyCounts` | `number[]` | 是 | 过去 8 周数据点数组 |

**约定**：`weeklyCounts` 数组长度为 8，索引 0 为 8 周前，索引 7 为当前周。前端周次标签应与 archive.json 中连续 8 周对应。

### 6.5 CirclePacking — 领域气泡图

对应前端 D3 Circle Packing（替换原 Treemap）。

结构为 `{ "en": [...], "zh": [...] }` 的双语对象。

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | `string` | 领域名称 |
| `value` | `number` | 领域权重（决定气泡面积，通常为工具数+论文数） |
| `color` | `string` | 填充颜色（十六进制） |

前端使用 D3 `d3.pack()` 布局渲染为气泡图，支持弹性入场动画和 Hover 放大发光效果。各领域颜色见附录色板。

### 6.6 Network — 关联网络图

对应前端 D3 ForceGraph。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `nodes` | `NetworkNode[]` | 是 | 节点数组，18-25 个节点为宜 |
| `links` | `NetworkLink[]` | 是 | 边数组，25-35 条边为宜 |

#### NetworkNode

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string` | 是 | 节点 ID（被 links.source/target 引用） |
| `group` | `string` | 是 | 节点类型：`"tool"` / `"paper"` / `"algo"` |
| `label` | `string` | 是 | 节点显示标签 |
| `val` | `number` | 是 | 节点大小权重 |
| `color` | `string` | 是 | 节点颜色 |

**节点类型分组颜色**：
- 工具 (tool)：`#8B5CF6`（单细胞类）/ `#3B82F6`（基因组类）
- 论文 (paper)：`#10B981`（绿色）
- 算法 (algo)：`#F59E0B`（琥珀色）

#### NetworkLink

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `source` | `string` | 是 | 源节点 ID |
| `target` | `string` | 是 | 目标节点 ID |
| `value` | `number` | 是 | 连接强度（决定线条粗细） |

---

## 7. 双语数据规范

### 7.1 Bilingual 类型

所有需要双语展示的字段使用统一格式：

```typescript
interface Bilingual {
  en: string;  // 英文文本
  zh: string;  // 中文文本
}
```

### 7.2 分布位置

| 展示内容 | 字段 | 双语方式 |
|----------|------|----------|
| 周次标签 | `label` | Bilingual 对象 |
| 工具简介 | `tool.description` | Bilingual 对象 |
| 论文标题 | `paper.title` | Bilingual 对象 |
| 论文摘要 | `paper.abstract` | Bilingual 对象 |
| 算法任务 | `algorithm.task` | Bilingual 对象 |
| 算法描述 | `algorithm.description` | Bilingual 对象 |
| 热门领域 | `stats.hotTopic.name` | Bilingual 对象 |
| 领域气泡图 | `treemap.zh / treemap.en` | 独立中英文数组（D3 CirclePacking 渲染） |

### 7.3 双语切换逻辑

前端读取数据时的伪代码：

```typescript
function resolveBilingual(value: Bilingual | string, lang: 'en' | 'zh'): string {
  if (typeof value === 'string') return value;
  return value[lang] || value.en;  // fallback to English
}
```

---

## 8. 前端消费指南

### 8.1 数据加载（Next.js SSG）

```typescript
// data/weeks/[week].tsx — getStaticPaths
export async function getStaticPaths() {
  const archive = await import('../../data/archive.json');
  const paths = archive.weeks.map(w => ({
    params: { week: w.week }
  }));
  return { paths, fallback: false };
}

// data/weeks/[week].tsx — getStaticProps
export async function getStaticProps({ params }) {
  const weekData = await import(`../../data/weeks/${params.week}.json`);
  return { props: { data: weekData } };
}
```

### 8.2 组件数据映射

| 前端组件 | 数据源 | 关键字段 |
|----------|--------|----------|
| StatsGrid (4 卡片) | `weeklyDigest.stats` | tools.count, papers.count, algorithms.count, hotTopic.name |
| LineChart | `weeklyDigest.trends` | domain, color, weeklyCounts |
| Tools Table | `weeklyDigest.tools` | name, version, domain, stars, tags, installCmd |
| Papers Table | `weeklyDigest.papers` | title, journal, impactFactor, citations, tags |
| Algorithms Table | `weeklyDigest.algorithms` | name, task, complexity, metrics |
| CirclePacking | `weeklyDigest.treemap[lang]` | name, value, color |
| ForceGraph | `weeklyDigest.network` | nodes, links |
| RadarChart | `weeklyDigest.algorithms[].metrics` | accuracy, speed, memory, scalability, usability, community |

### 8.3 分页

表格数据目前未在 JSON 中预分页。前端组件（如 TanStack Table）从完整数组中读取数据，在前端完成分页渲染。

将来若单周数据量极大（tools > 50, papers > 200），可考虑在 JSON 中添加 `pagination` 字段分块加载。

---

## 9. 开发规范

### 9.1 添加新周次

1. 复制上一周 JSON 文件作为模板：`cp data/weeks/2026-W26.json data/weeks/2026-W28.json`
2. 修改 `week`、`label`、`dateRange`、`updatedAt` 字段
3. 更新 `stats` 中的 counts 和 changes
4. 替换或补充 `tools` / `papers` / `algorithms` 数组内容
5. 更新 `trends` 数组：移除最旧数据点，在末尾添加本周数据点
6. 更新 `treemap` 中的 value 以反映本周分布
7. 更新 `network` 节点和边以反映本周引用关系
8. 在 `data/archive.json` 的 `weeks` 数组**头部**插入新周记录

### 9.2 字段约束

- **id 字段**：全小写 kebab-case，如 `"deeplearning-variant-calling"`
- **日期字段**：ISO 8601 格式，如 `"2026-07-02"` 或 `"2026-07-02T06:00:00Z"`
- **周次标识**：`"2026-W27"` 格式，W 大写，周数两位数
- **stars 评分**：实际 GitHub Stars 数值（整数），如 2218
- **metrics 评分**：0-100 整数
- **impactFactor**：保留一位小数
- **citations**：整数

### 9.3 JSON 校验要求

每次提交前执行以下校验：

```bash
# 1. JSON 语法校验
python3 -m json.tool data/weeks/2026-W27.json > /dev/null

# 2. 必填字段校验（示例脚本）
python3 -c "
import json
with open('data/weeks/2026-W27.json') as f:
    d = json.load(f)
assert len(d['tools']) == d['stats']['tools']['count'], 'tools count mismatch'
assert d['week'] in open('data/archive.json').read(), 'week not in archive'
print('✅ 校验通过')
"
```

```bash
# 一键校验所有数据文件
for f in data/weeks/*.json; do
  python3 -m json.tool "$f" > /dev/null && echo "✅ $f" || echo "❌ $f"
done
```

### 9.4 数据量建议

| 数据 | 建议数量 | 说明 |
|------|----------|------|
| tools | 10-20 | 每周更新，过少则稀疏，过多则维护成本高 |
| papers | 20-40 | 核心内容，覆盖各领域 |
| algorithms | 4-10 | 精选有代表性的新算法 |
| trends.weeklyCounts | 8 | 固定 8 周滑动窗口 |
| network.nodes | 15-20 | 保持可读性 |
| network.links | 20-30 | 反映主要引用关系 |

---

## 10. 附录：领域色板与标签映射

### 10.1 领域色板

| 领域 Key | 英文名 | 中文名 | HEX 色值 | CSS 标签类 |
|----------|--------|--------|----------|-----------|
| `genomics` | Genomics | 基因组学 | `#3B82F6` | `.tag-blue` |
| `single-cell` | Single Cell | 单细胞组学 | `#8B5CF6` | `.tag-purple` |
| `transcriptomics` | Transcriptomics | 转录组学 | `#10B981` | `.tag-green` |
| `epigenomics` | Epigenomics | 表观基因组学 | `#F59E0B` | `.tag-orange` |
| `metagenomics` | Metagenomics | 宏基因组学 | `#EC4899` | `.tag-pink` |
| `proteomics` | Proteomics | 蛋白质组学 | `#EF4444` | `.tag-red` |
| `structural-bio` | Structural Bio. | 结构生物学 | `#14B8A6` | `.tag-teal` |
| `gwas` | GWAS | 全基因组关联分析 | `#F97316` | `.tag-orange` |

### 10.2 Domain 字段允许值

`tool.domain` 和 `trends.domainKey` 使用的标准 key：

```
rna-seq  |  single-cell  |  genomics  |  epigenomics
metagenomics  |  proteomics  |  structural-bio  |  gwas
transcriptomics  |  spatial  |  cancer
```

### 10.3 Complexity 颜色映射

| `complexity.color` | 效果 | 前端标签类 |
|--------------------|------|-----------|
| `"green"` | 🟢 绿色标签 | `.tag-green` |
| `"yellow"` | 🟡 琥珀标签 | `.tag-orange` |
| `"red"` | 🔴 红色标签 | `.tag-red` |

### 10.4 表格操作按钮图标

| 按钮 | 表格 | emoji | 功能 |
|------|------|-------|------|
| 复制命令 | Tools | 📋 | 复制 installCmd 到剪贴板 |
| 收藏 | Tools/Papers | ⭐ / 📚 | 收藏/取消收藏 |
| PDF 预览 | Papers | 📄 | 打开 PDF 链接 |
| 复制 BibTeX | Papers | 📋 | 复制 bibtex 字段到剪贴板 |
| 保存链接 | Papers | 🔗 | 保存论文链接 |
| 打开 GitHub | Algorithms | 🐙 | 打开 githubUrl |
| 打开论文 | Algorithms | 📄 | 打开 paperUrl |

---

*文档版本：v0.1 · 对应前端文档 FRONTEND_DEV.md v0.1 · 下次更新：进入 Phase 2 开发前*
