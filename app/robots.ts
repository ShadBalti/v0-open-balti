import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://openbalti.vercel.app"

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/auth/", "/settings/", "/profile/", "/favorites/", "/_next/", "/server-sitemap.xml"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/auth/", "/settings/", "/profile/", "/favorites/"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/api/", "/auth/", "/settings/", "/profile/", "/favorites/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
