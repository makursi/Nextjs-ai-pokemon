import { describe, expect, it } from "vitest";

import { toolPath, tools } from "@/tools/registry";

/**
 * The registry is what the homepage grid, the sitemap and the routes all read,
 * so a bad entry breaks three things at once. These tests guard the shape of
 * the list — they grow in value as Tools are added.
 */
describe("Tool Registry", () => {
  it("gives every Tool a unique slug", () => {
    const slugs = tools.map((tool) => tool.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("keeps every slug usable as a URL path segment", () => {
    for (const tool of tools) {
      expect(tool.slug, tool.title).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it("builds the route from the slug", () => {
    expect(toolPath("image-converter")).toBe("/tools/image-converter");
  });
});
