// src/app/sitemap.ts
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://kiichpam-xunaan.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://kiichpam-xunaan.com/cenotes',
      lastModified: new Date(),
    },
    {
      url: 'https://kiichpam-xunaan.com/paquetes',
      lastModified: new Date(),
    },
  ];
}