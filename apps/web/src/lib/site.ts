/**
 * Site identity, shared by metadata, sitemap and robots.
 *
 * Server-only: SITE_URL is deliberately not a NEXT_PUBLIC_* variable, so it is
 * read at build time on the server rather than inlined into the client bundle.
 */
export const siteName = "Toolbox";

export const siteDescription =
  "A collection of single-purpose browser tools. No accounts, no uploads.";

/** Canonical origin. Falls back to localhost so dev needs no configuration. */
export const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
