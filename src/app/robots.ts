import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/', '/settings/', '/wallet/', '/library/', '/earnings/', '/my-content/', '/students/', '/certificates/'],
    },
    sitemap: 'https://lugha-pro.vercel.app/sitemap.xml',
  }
}
