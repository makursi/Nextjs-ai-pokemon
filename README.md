# Toolbox

A collection of single-purpose browser tools, each running entirely in your browser. One deployable, many tools.

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
apps/web/     the App (Next.js App Router, Mantine, Tailwind CSS v4)
packages/     code shared between workspace packages
docs/adr/     decisions that are hard to reverse
CONTEXT.md    the vocabulary: Tool, Package, App, Tool Registry
```

## Commands

| Command          | Purpose                      |
| ---------------- | ---------------------------- |
| `pnpm dev`       | run apps/web                 |
| `pnpm build`     | production build             |
| `pnpm lint`      | Oxlint, type-aware           |
| `pnpm typecheck` | `tsc --noEmit`               |
| `pnpm fmt`       | format everything with Oxfmt |
| `pnpm fmt:check` | verify formatting (CI)       |
| `pnpm test`      | Vitest unit tests            |

## CI

`.github/workflows/ci.yml` runs `fmt:check`, `lint`, `typecheck`, `test` and `build` on every push to `main` and every pull request. The pre-push hook covers only `lint` and `typecheck`.

## Adding a tool

1. `apps/web/src/tools/<slug>/` — the implementation plus a `meta.ts` exporting its `ToolMeta`.
2. `apps/web/src/app/tools/<slug>/page.tsx` — the route: a thin adapter that renders the tool.
3. `apps/web/src/tools/registry.ts` — add the Tool to the Tool Registry.

Tool logic stays in `src/tools/*` so it is testable without Next and can be moved to `packages/*` later, once a second consumer actually needs it.

Tests live in a `__tests__` directory beside the code they cover, named `<file>.test.ts`. `pnpm test` runs them in Vitest's Node environment, with `@/*` resolving — see `docs/adr/0003-vitest-for-unit-tests.md`.

## Constraints

Every Tool runs in the browser and the site makes **no outbound requests** after a page has loaded: no analytics, no telemetry, no error reporting, no third-party hosts. This is enforced by a `Content-Security-Policy` header, not by convention — see `docs/adr/0005-no-outbound-requests.md`.

## Environment

`SITE_URL` is the canonical origin, used by metadata, `robots.txt` and `sitemap.xml`. Copy `apps/web/.env.example`; it falls back to `http://localhost:3000`.
