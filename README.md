# NovaStar Dashboard

> 未来科幻风格的多源数据聚合动态网站。集成 GitHub 开源数据和 18+ 第三方 API，具有前沿的交互模式、动态信息可视化和沉浸式动效设计。

## 项目阶段

**当前：设计阶段** — 使用 Google Stitch 生成 UI 视觉稿，确定排版和风格。

## 技术栈（规划）

- Next.js 15 + Tailwind CSS v4
- Three.js + React Three Fiber（3D 地球）
- Framer Motion（动效）
- D3.js / Recharts（数据图表）
- Zustand（状态管理）+ SWR（数据缓存）
- SSE（实时数据推送）

## 目录结构

```
新星/
├── README.md                      ← 项目说明（本文件）
├── docs/
│   ├── DESIGN.md                  ← 完整设计系统文档
│   └── ui-filter-results.md       ← UI 截图筛选结果
└── prompts/
    ├── stitch-prompts.md          ← 12 个页面的 Stitch 提示词合集
    ├── dashboard.md               ← 指挥中心专用提示词
    ├── indicators.md              ← 全球发展指标专用提示词
    └── settings.md                ← 系统设置专用提示词
```

## 设计系统概要

| 要素 | 规范 |
|------|------|
| 背景色 | #0A0E1A（深空黑） |
| 主色 | #00E5FF（电光青） |
| 强调色 | #FF0090（霓虹洋红） |
| 第三色 | #8B5CF6（电光紫） |
| 标题字体 | Orbitron |
| 正文字体 | Inter |
| 数据字体 | JetBrains Mono |

## 数据源

GitHub API · NASA APOD/NeoWs/FIRMS/EONET · CelesTrak · N2YO · ISS Tracker · USGS Earthquake · GDACS · RainViewer · Open-Meteo · NOAA SWPC/NWS/NHC · OpenAQ · SIMBAD · NASA Exoplanet Archive · World Bank · REST Countries · NewsAPI · CoinGecko

## 页面清单

1. 指挥中心（仪表盘主页）
2. 全球互联（3D 地球可视化）
3. GitHub 数据探索
4. NASA 太空动态
5. 全球卫星追踪
6. 天气监测
7. 降雨监测
8. 全球地震监测
9. 火灾热点
10. 太空天气监测
11. 新闻资讯
12. 全球发展指标
13. 系统设置
