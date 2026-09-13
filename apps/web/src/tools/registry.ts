import type { ToolMeta } from "./types";

/**
 * The single source of truth for which Tools exist — the Tool Registry.
 *
 * The homepage grid, navigation and sitemap all read this list, so adding a
 * Tool means adding one line here plus its implementation directory.
 */
export const tools: ToolMeta[] = [];

/** The route a Tool lives at, kept here so the template has one definition. */
export function toolPath(slug: string): string {
  return `/tools/${slug}`;
}
