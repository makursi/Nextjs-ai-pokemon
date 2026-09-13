# Oxlint and Oxfmt instead of ESLint and Prettier

Linting is `oxlint` and formatting is `oxfmt`, with no ESLint, Prettier or Biome configuration anywhere. The ecosystem default is the opposite, so this records the trade: Oxlint's type-aware engine (tsgolint) implements 59 of typescript-eslint's 61 type-aware rules at roughly an order of magnitude less wall-clock time, and Oxfmt formats JS/TS/JSON/CSS/Markdown/YAML with Tailwind class sorting and import sorting built in — which removes the `prettier-plugin-tailwindcss` dependency and an entire class of import-order lint rules. The price is maturity: Oxfmt is pre-1.0 with no plugin support, and type _checking_ stays with `tsc`.

## Consequences

- `typescript` and `oxlint-tsgolint` are pinned exactly in the catalog: tsgolint tracks one TypeScript release (`7.0.2001` ⇄ `7.0.2`), so the two must move together or type-aware rules silently stop matching their version.
- Oxlint's `options.typeAware` is root-config-only, so type-aware linting is enabled with the `--type-aware` CLI flag in package scripts. That is also what keeps `lint-staged` fast: it calls `oxlint --fix` without the flag, because type-aware analysis needs a complete TypeScript program.
- Type _checking_ uses `tsc --noEmit`, not `oxlint --type-check`, which the Oxlint config reference still labels experimental.
- Needing a specific ESLint plugin means going through Oxlint's `jsPlugins` bridge, which is alpha and not covered by semver.
- `fmt` and `fmt:check` stay plain root scripts rather than Turborepo tasks: they run Oxfmt once over the whole repository, including files that belong to no package (the README, `.oxfmtrc.json`). A `//#fmt` root task would add Turborepo syntax for no parallelism or caching benefit.
- Reverting means building the ESLint and Prettier configuration from scratch; there is no compatibility shim.
