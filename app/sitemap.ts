import { MetadataRoute } from 'next';
import { seoConfig } from '../lib/seo-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = seoConfig.siteUrl;
  const languages = ['en', 'fr', 'de', 'it', 'nl', 'es', 'pt'];
  
  // Pages principales
  const routes = ['', '/experiences', '/about', '/contact'];
  
  // Générer toutes les URLs pour toutes les langues
  const urls = languages.flatMap(lang => 
    routes.map(route => ({
      url: `${baseUrl}/${lang}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1 : 0.8,
      alternates: {
        languages: languages.reduce((acc, l) => ({
          ...acc,
          [l]: `${baseUrl}/${l}${route}`
        }), {})
      }
    }))
  );
  
  return urls;
}

