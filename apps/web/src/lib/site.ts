/**
 * Site identity, shared by metadata, sitemap and robots.
 *
 * Server-only: SITE_URL is deliberately not a NEXT_PUBLIC_* variable, so it is
 * read at build time on the server rather than inlined into the client bundle.
 */
const fallbackUrl = "http://localhost:3000";

export const siteName = "Toolbox";

export const siteDescription =
  "A collection of single-purpose browser tools. No accounts, no uploads.";

/**
 * Canonical origin, falling back to localhost so dev needs no configuration.
 *
 * An empty value is treated as unset: `??` would pass `SITE_URL=` straight
 * through, and `new URL("")` throws while the build collects page data.
 */
function resolveSiteUrl(): string {
  const configured = process.env.SITE_URL?.trim();
  return configured ? configured : fallbackUrl;
}

export const siteUrl = resolveSiteUrl();
