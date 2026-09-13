# Toolbox

A collection of single-purpose browser tools — cover image generator, image format conversion, and more to come. One deployable, many tools.

## Prerequisites

- Node.js >= 22.12.0
- pnpm 12 (see `packageManager` in `package.json`)

## Quick start

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

## Structure

```
apps/web/     the App (Next.js App Router, Tailwind CSS v4, shadcn/ui)
packages/     code shared between workspace packages
docs/adr/     decisions that are hard to reverse
CONTEXT.md    the vocabulary: Tool, Package, App, Tool Registry
```

## Commands

| Command          | Purpose                        |
| ---------------- | ------------------------------ |
| `pnpm dev`       | run apps/web                   |
| `pnpm build`     | production build               |
| `pnpm lint`      | Oxlint, type-aware             |
| `pnpm typecheck` | `tsc --noEmit`                 |
| `pnpm fmt`       | format everything with Oxfmt   |
| `pnpm fmt:check` | verify formatting (CI)         |
| `pnpm test`      | test task (no test runner yet) |

## Adding a tool

1. `apps/web/src/tools/<slug>/` — the implementation plus a `meta.ts` exporting its `ToolMeta`.
2. `apps/web/src/app/tools/<slug>/page.tsx` — the route: a thin adapter that renders the tool.
3. `apps/web/src/tools/registry.ts` — add the Tool to the Tool Registry.

Tool logic stays in `src/tools/*` so it is testable without Next and can be moved to `packages/*` later, once a second consumer actually needs it.

## Environment

`SITE_URL` is the canonical origin, used by metadata, `robots.txt` and `sitemap.xml`. Copy `apps/web/.env.example`; it falls back to `http://localhost:3000`.
