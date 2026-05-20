# SEO 搜索优化方案 - 基础建设

- **日期**: 2026-05-20
- **状态**: 已完成

---

## 概述

为 Choria 应用建立 SEO 基础架构，包括 robots.txt 爬虫协议、sitemap.xml 站点地图以及全面的元数据（metadata）优化。涵盖国内外主流搜索引擎爬虫的资源分配策略。

## 涉及文件

| 文件 | 操作 | 说明 |
| --- | --- | --- |
| `src/app/robots.ts` | 重写 | 5 个爬虫规则 + host/sitemap 字段 |
| `src/app/sitemap.ts` | 新建 | 动态 sitemap 覆盖 4 条路由 |
| `src/app/layout.tsx` | 修改 | 扩展 metadata，新增 OG/Twitter Card/robots/canonical |
| `src/app/page.tsx` | 修改 | 首页独立 metadata |
| `src/app/dashboard/page.tsx` | 修改 | 控制台页 metadata |
| `src/app/chat/page.tsx` | 修改 | AI 对话页 metadata |
| `src/app/pokemon/page.tsx` | 修改 | 宝可梦列表页 metadata |
| `src/app/pokemon/[name]/page.tsx` | 修改 | 动态宝可梦详情页 metadata + OG |

## 实现要点

### 1. robots.txt 爬虫协议

通过 `src/app/robots.ts` 生成，覆盖 5 个主流爬虫：

| 爬虫 | 允许 | 禁止 | 抓取延迟 |
| --- | --- | --- | --- |
| Googlebot | `/` | `/api/` | - (Google 不支持) |
| Baiduspider | `/` | `/api/` | 10s |
| Bingbot | `/` | `/api/` | 10s |
| YandexBot | `/` | `/api/` | 10s |
| Sogou spider | `/` | `/api/` | 10s |

- `host` 字段指向生产域名
- `sitemap` 字段指向 sitemap.xml 完整 URL

### 2. sitemap.xml 站点地图

动态生成，覆盖所有公开路由：

| 路由 | 优先级 | 更新频率 |
| --- | --- | --- |
| `/` | 1.0 | weekly |
| `/dashboard` | 0.8 | weekly |
| `/chat` | 0.8 | weekly |
| `/pokemon` | 0.6 | daily |

> 宝可梦详情页数据来自外部 API，无法枚举，由列表页导航发现。

### 3. Root Layout Metadata

在 `layout.tsx` 中配置站点级元数据：

- **title**: 使用 template 模式 `"%s | Choria"`，子页面标题自动拼接
- **metadataBase**: `new URL("...")` 提供 canonical 和 OG 的基础域名
- **keywords**: 中英文关键词覆盖
- **robots**: `index, follow` + Googlebot 高级参数（max-snippet、max-image-preview、max-video-preview）
- **openGraph**: title / description / type / siteName / locale
- **twitter**: `summary_large_image` 卡片类型
- **alternates**: canonical URL

### 4. 页面级 Metadata

每个路由独立导出 `metadata`，利用 layout 的 title template 自动拼接站点名：

- **首页** — 独立完整 title（不使用 template），含详细中文描述
- **控制台** — title: "控制台 | Choria"
- **AI 对话** — title: "AI 对话 | Choria"
- **宝可梦列表** — title: "宝可梦图鉴 | Choria"
- **宝可梦详情** — 动态 `generateMetadata`，title 包含宝可梦名称 + OG 标签

## 域名配置

所有 SEO 文件使用占位域名 `choria.example.com`，部署前需全局替换为实际域名：

- `src/app/robots.ts` — `host` / `sitemap`
- `src/app/sitemap.ts` — `BASE_URL` 常量
- `src/app/layout.tsx` — `metadataBase`

## 验证结果

| 验证项 | 状态 |
| --- | --- |
| `GET /robots.txt` 返回正确格式 | ✅ |
| `GET /sitemap.xml` 返回有效 XML | ✅ |
| `<meta description>` 标签 | ✅ |
| `<meta keywords>` 标签 | ✅ |
| `<meta robots>` + `googlebot` 指令 | ✅ |
| OpenGraph 标签 (`og:*`) | ✅ |
| Twitter Card 标签 (`twitter:*`) | ✅ |
| `<link rel="canonical">` | ✅ |
