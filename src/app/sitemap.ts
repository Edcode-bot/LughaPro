import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://lugha-pro.vercel.app', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://lugha-pro.vercel.app/learn', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://lugha-pro.vercel.app/tutors', lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: 'https://lugha-pro.vercel.app/about', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://lugha-pro.vercel.app/help', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ]
}
