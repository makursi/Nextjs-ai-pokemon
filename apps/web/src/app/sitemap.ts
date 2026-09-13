import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";
import { toolPath, tools } from "@/tools/registry";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...tools.map((tool) => ({
      url: `${siteUrl}${toolPath(tool.slug)}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
