import type { ToolMeta } from "@/tools/types";

/** The Tool Registry entry for this Tool — see `apps/web/src/tools/registry.ts`. */
export const meta: ToolMeta = {
  slug: "image-converter",
  title: "图片格式转换",
  description: "在 PNG、JPEG、WebP、AVIF 与 BMP 之间批量互转，全部在浏览器本地完成。",
};
