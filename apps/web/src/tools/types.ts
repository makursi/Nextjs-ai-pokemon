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
};
