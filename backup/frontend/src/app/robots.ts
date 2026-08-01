import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sabilearn.online";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login", "/register"],
      disallow: ["/dashboard/", "/api/", "/offline/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
