import type { MetadataRoute } from "next";

import { CONFIG } from "src/global-config";

export default function robots(): MetadataRoute.Robots {
  const env = CONFIG.env;
  const isProd = env === "PROD";

  const domainPrefix = isProd ? "" : `${env.toLowerCase()}.`;
  const baseUrl = `https://${domainPrefix}loop.edu.pl`;

  const prodBots = ["Googlebot", "Applebot", "Bingbot"];

  const rules: MetadataRoute.Robots["rules"] = isProd
    ? prodBots.map((bot) => ({
        userAgent: bot,
        allow: ["/"],
        disallow: ["/_next"],
      }))
    : [
        {
          userAgent: "*",
          disallow: "/",
        },
      ];

  return {
    rules,
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
