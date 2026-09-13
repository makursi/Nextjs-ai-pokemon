/**
 * Pre-commit gate: fast checks on staged files only.
 *
 * Deliberately NOT type-aware — `oxlint --type-aware` needs a full TypeScript
 * program, which is both slow and imprecise against a partial file list.
 * Type-aware linting and `tsc` run on pre-push and in CI instead.
 */
export default {
  "*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}": ["oxlint --fix", "oxfmt --no-error-on-unmatched-pattern"],
  "*.{json,jsonc,css,md,mdx,yml,yaml,toml,html}": ["oxfmt --no-error-on-unmatched-pattern"],
};
