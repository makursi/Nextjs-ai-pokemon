/**
 * A Tool is a user-facing capability: one entry in the registry, one route.
 *
 * Keep this contract minimal — fields are added here when a real tool needs
 * them, not in anticipation of one. A Tool is *not* a Package: only extract to
 * `packages/*` once a second consumer actually reuses the logic.
 */
export type ToolMeta = {
  /** URL segment: the tool lives at `/tools/<slug>`. */
  slug: string;
  title: string;
  /** One line, shown in the homepage grid. */
  description: string;
  /**
   * The Tool's cover image, as a path served from `public/` — a same-origin URL,
   * because the site loads no third-party assets (see ADR-0005).
   *
   * Optional on purpose: a Tool with no cover is listed on type alone, so adding
   * a Tool never waits on artwork, and no placeholder graphic is invented to
   * stand in for one.
   */
  cover?: string;
};
