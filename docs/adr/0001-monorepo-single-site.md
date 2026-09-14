# One site, many tools — in a monorepo

Toolbox grows by adding Tools, not by adding sites: `apps/web` is the only App, and each Tool is a route plus a Tool Registry entry. Splitting Tools into separate deployable Apps inside the same monorepo was rejected — it would duplicate layout, SEO and build configuration for capabilities that are client-side and share one design system, while buying fault isolation and independent deploys that a personal toolset does not need. pnpm workspaces and Turborepo are here to make the _toolchain_ single-sourced (TypeScript config, lint/format, and later shared logic), not to host many sites.

"Its own runtime" means its own **process or deployment**, not its own thread. A Tool that needs a Web Worker — batch image conversion, say — stays in `apps/web`: a worker is a browser primitive inside one route, not a second thing to deploy, and moving it out would pay the duplication cost above for no isolation it actually needs. See ADR-0004.

## Consequences

- A Tool that genuinely needs its own runtime — a separate server process, a different deployment target, its own framework version — gets added as a second App. The shape allows it; the default is not to.
- A Tool that needs a Web Worker is **not** that case: it ships as a route in `apps/web`.
- Because there is no second App to force the issue, anything two Tools share has to be extracted into `packages/*` deliberately, or it will drift.

## Considered Options

- **One repository per Tool**: rejected — N× layout, SEO and build setup, and only the second Tool would benefit.
- **One repository, one deployment per Tool**: rejected — same duplication plus more infrastructure.
