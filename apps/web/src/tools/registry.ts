import type { ToolMeta } from "./types";

/**
 * The single source of truth for which tools exist.
 *
 * The homepage grid, navigation and sitemap all read this list, so adding a
 * tool means adding one line here plus its implementation directory.
 */
export const tools: ToolMeta[] = [];
