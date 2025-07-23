import { MetadataRoute } from 'next';
import { seoConfig } from '../lib/seo-config';
import { supabase } from '../lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = seoConfig.siteUrl;
  const languages = ['en', 'fr', 'de', 'it', 'nl', 'es', 'pt'];
  
  // Pages principales statiques
  const staticRoutes = ['', '/about', '/contact', '/carnet'];
  
  // Récupérer toutes les catégories actives
  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug, slug_en, slug_de, slug_it, slug_nl, slug_es, slug_pt, updated_at')
    .eq('is_active', true);
    
  // Récupérer toutes les expériences actives
  const { data: experiences } = await supabase
    .from('experiences')
    .select(`
      id,
      slug,
      slug_en,
      slug_de,
      slug_it,
      slug_nl,
      slug_es,
      slug_pt,
      updated_at,
      category_id
    `)
    .eq('is_active', true);
  
  // Créer un map des catégories pour référence rapide
  const categoryMap = new Map();
  if (categories) {
    categories.forEach(cat => categoryMap.set(cat.id, cat));
  }
  
  const urls: MetadataRoute.Sitemap = [];
  
  // 1. Pages statiques multilingues
  languages.forEach(lang => {
    staticRoutes.forEach(route => {
      urls.push({
        url: `${baseUrl}/${lang}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1 : 0.8,
        alternates: {
          languages: languages.reduce((acc, l) => ({
            ...acc,
            [l]: `${baseUrl}/${l}${route}`
          }), {})
        }
      });
    });
  });
  
  // 2. Pages de catégories avec slugs traduits
  if (categories) {
    categories.forEach(category => {
      const alternateUrls: Record<string, string> = {};
      
      languages.forEach(lang => {
        const slugKey = lang === 'fr' ? 'slug' : `slug_${lang}`;
        const slug = category[slugKey as keyof typeof category] || category.slug;
        const url = `${baseUrl}/${lang}/${slug}`;
        alternateUrls[lang] = url;
      });
      
      languages.forEach(lang => {
        const slugKey = lang === 'fr' ? 'slug' : `slug_${lang}`;
        const slug = category[slugKey as keyof typeof category] || category.slug;
        
        urls.push({
          url: `${baseUrl}/${lang}/${slug}`,
          lastModified: new Date(category.updated_at || new Date()),
          changeFrequency: 'daily',
          priority: 0.9,
          alternates: {
            languages: alternateUrls
          }
        });
      });
    });
  }
  
  // 3. Pages d'expériences avec slugs traduits
  if (experiences) {
    experiences.forEach(exp => {
      const category = categoryMap.get(exp.category_id);
      if (!category) return; // Skip si pas de catégorie trouvée
      
      const alternateUrls: Record<string, string> = {};
      
      languages.forEach(lang => {
        const categorySlugKey = lang === 'fr' ? 'slug' : `slug_${lang}`;
        const categorySlug = category[categorySlugKey] || category.slug;
        
        const expSlugKey = lang === 'fr' ? 'slug' : `slug_${lang}`;
        const expSlug = exp[expSlugKey as keyof typeof exp] || exp.slug || exp.id;
        
        const url = `${baseUrl}/${lang}/${categorySlug}/${expSlug}`;
        alternateUrls[lang] = url;
      });
      
      languages.forEach(lang => {
        const categorySlugKey = lang === 'fr' ? 'slug' : `slug_${lang}`;
        const categorySlug = category[categorySlugKey] || category.slug;
        
        const expSlugKey = lang === 'fr' ? 'slug' : `slug_${lang}`;
        const expSlug = exp[expSlugKey as keyof typeof exp] || exp.slug || exp.id;
        
        urls.push({
          url: `${baseUrl}/${lang}/${categorySlug}/${expSlug}`,
          lastModified: new Date(exp.updated_at || new Date()),
          changeFrequency: 'weekly',
          priority: 0.7,
          alternates: {
            languages: alternateUrls
          }
        });
      });
    });
  }
  
  return urls;
}
