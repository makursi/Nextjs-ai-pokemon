# 宝可梦详情页 - 增强信息展示与中文化

- **日期**: 2026-05-20
- **状态**: 已完成

---

## 概述

重写 `/pokemon/[name]` 详情页，从仅展示图片和英文名称扩展为包含中文名、分类、身高、体重、属性、能力、种族值的完整图鉴卡片。同时将精灵图片从原生 `<img>` 替换为 Next.js `<Image>` 组件以获得自动优化。

## 涉及文件

| 文件 | 操作 | 说明 |
| --- | --- | --- |
| `next.config.ts` | 修改 | 添加 `images.remotePatterns` 允许 PokeAPI sprites CDN |
| `src/app/pokemon/[name]/page.tsx` | 重写 | 扩展数据获取、中文化映射、UI 分区重设计 |

## 数据来源

| 数据 | API | 中文获取方式 |
| --- | --- | --- |
| 基础数据 | `GET /pokemon/{name}` | types/abilities/stats 本地映射 |
| 中文名/分类 | `GET /pokemon-species/{id}` | `names` / `genera` 数组 `zh-hans` 字段 |
| 精灵图片 | PokeAPI sprites CDN | Next.js Image 代理优化 |

## 实现要点

### 1. Next.js Image 远程图片优化

在 `next.config.ts` 添加 `raw.githubusercontent.com` 到 `images.remotePatterns`，将原生 `<img>` 替换为 `<Image width={256} height={256} priority />`。

### 2. 并行数据获取

```ts
const pokemon = await getPokemon(name);
const species = await getPokemonSpecies(pokemon.id);
// Promise.all 并行，不增加额外延迟
```

### 3. 中文映射表

- **18 种属性**：normal→一般, fire→火, water→水, electric→电, grass→草, psychic→超能力 等
- **50+ 能力**：static→静电, blaze→猛火, levitate→飘浮, cursed-body→诅咒之躯 等
- **6 项种族值**：hp→HP, attack→攻击, defense→防御, special-attack→特攻, special-defense→特防, speed→速度

### 4. 单位换算

- 身高：分米 ÷ 10 = 米
- 体重：百克 ÷ 10 = 千克

### 5. UI 卡片分区

```
┌─────────────────────────────┐
│      [官方插画 Next/Image]    │
│  皮卡丘 (中文名)              │
│  pikachu (英文名)            │
│  鼠宝可梦 (分类)             │
│  ─── 基本资料 ───            │
│  身高: 0.4 m  体重: 6.0 kg   │
│  ─── 属性 ───               │
│  [电]                       │
│  ─── 能力 ───               │
│  静电  避雷针 (隐藏)          │
│  ─── 种族值 ───              │
│  HP 35  攻击 55  防御 40     │
│  特攻 50 特防 50 速度 90     │
└─────────────────────────────┘
```

- 隐藏特性使用 `outline` 样式 + `(隐藏)` 文字标注
- 属性使用 `Badge variant="default"`（主色填充）
- 使用 `Separator` 分隔各区块

### 6. Skeleton 更新

同步更新 `PokemonDetailSkeleton` 以匹配新布局。

## 验证结果

| 测试用例 | 中文名 | 属性 | 能力 | 身高 | 体重 | 种族值 |
| --- | --- | --- | --- | --- | --- | --- |
| Pikachu | 皮卡丘 | 电 | 静电, 避雷针(隐藏) | 0.4m | 6.0kg | ✅ |
| Charizard | 喷火龙 | 火, 飞行 | 猛火, 太阳之力(隐藏) | 1.7m | 90.5kg | ✅ |
| Gengar | 耿鬼 | 幽灵, 毒 | 诅咒之躯 | ✅ | ✅ | ✅ |

- Next.js Image 优化：`data-nimg="1"` 确认，图片经由 `/_next/image` 代理
- 无图片宝可梦显示 fallback 占位
- 未知能力/属性降级显示英文原名
