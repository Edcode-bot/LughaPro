import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/settings', '/wallet', '/library', '/publish', '/api/'],
    },
    sitemap: 'https://lugha-pro.vercel.app/sitemap.xml',
  }
}
