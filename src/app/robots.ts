import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: ["/"],
        disallow: ["/api/"],
      },
      {
        userAgent: "Baiduspider",
        allow: ["/"],
        disallow: ["/api/"],
        crawlDelay: 10,
      },
      {
        userAgent: "Bingbot",
        allow: ["/"],
        disallow: ["/api/"],
        crawlDelay: 10,
      },
      {
        userAgent: "YandexBot",
        allow: ["/"],
        disallow: ["/api/"],
        crawlDelay: 10,
      },
      {
        userAgent: "Sogou spider",
        allow: ["/"],
        disallow: ["/api/"],
        crawlDelay: 10,
      },
    ],
    sitemap: "https://choria.example.com/sitemap.xml",
    host: "https://choria.example.com",
  };
}
