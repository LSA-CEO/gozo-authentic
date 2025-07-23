import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { supabase } from '../../../lib/supabase';
import { Metadata } from 'next';
import { CategoryHero } from '../../../components/category/CategoryHero';
import { ExperienceGrid } from '../../../components/category/ExperienceGrid';

interface CategoryPageProps {
  params: Promise<{
    locale: string;
    'category-slug': string;
  }>;
}

// Générer les métadonnées pour le SEO
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { locale, 'category-slug': categorySlug } = await params;
  const t = await getTranslations({ locale, namespace: 'Categories' });
  
  // Récupérer la catégorie avec métadonnées SEO enrichies
  const slugColumn = locale === 'fr' ? 'slug' : `slug_${locale}`;
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .or(`slug.eq.${categorySlug},${slugColumn}.eq.${categorySlug}`)
    .eq('is_active', true)
    .single();
    
  if (!category) return {};
  
  // Utiliser meta_title et meta_description s'ils existent
  const title = category.meta_title?.[locale] || 
    `${category[`name_${locale}`] || category.name_en} à Gozo | Flav & Jade`;
    
  const description = category.meta_description?.[locale] || 
    category[`description_${locale}`] || 
    category.description_en || 
    t('defaultDescription');
  
  const keywords = category.seo_keywords?.[locale] || [];
  
  return {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title,
      description,
      locale: locale,
      images: category.hero_image_url ? [category.hero_image_url] : [],
    },
    alternates: {
      languages: {
        'en': `/en/${category.slug_en || categorySlug}`,
        'fr': `/fr/${category.slug}`,
        'de': `/de/${category.slug_de || categorySlug}`,
        'it': `/it/${category.slug_it || categorySlug}`,
        'nl': `/nl/${category.slug_nl || categorySlug}`,
        'es': `/es/${category.slug_es || categorySlug}`,
        'pt': `/pt/${category.slug_pt || categorySlug}`,
      }
    }
  };
}

// Générer les params statiques pour toutes les langues et slugs
export async function generateStaticParams() {
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, slug_en, slug_de, slug_it, slug_nl, slug_es, slug_pt')
    .eq('is_active', true);
    
  if (!categories) return [];
  
  const locales = ['fr', 'en', 'de', 'it', 'nl', 'es', 'pt'];
  const params: any[] = [];
  
  categories.forEach(category => {
    locales.forEach(locale => {
      const slugKey = locale === 'fr' ? 'slug' : `slug_${locale}`;
      const slug = category[slugKey as keyof typeof category] || category.slug;
      
      params.push({
        locale,
        'category-slug': slug
      });
    });
  });
  
  return params;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, 'category-slug': categorySlug } = await params;
  
  // Récupérer la catégorie en cherchant dans tous les slugs traduits
  const slugColumn = locale === 'fr' ? 'slug' : `slug_${locale}`;
  
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .or(`slug.eq.${categorySlug},${slugColumn}.eq.${categorySlug}`)
    .eq('is_active', true)
    .single();
    
  if (categoryError || !category) {
    notFound();
  }

  // Incrémenter le compteur de vues (pour analytics SEO)
  await supabase
    .from('categories')
    .update({ view_count: (category.view_count || 0) + 1 })
    .eq('id', category.id);

  // Récupérer toutes les expériences de cette catégorie
  const { data: experiences = [], error: experiencesError } = await supabase
    .from('experiences')
    .select(`
      *,
      experience_tags (
        tag_id,
        tags (*)
      )
    `)
    .eq('category_id', category.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (experiencesError) {
    console.error('Error fetching experiences:', experiencesError);
  }

  // Récupérer tous les tags disponibles pour le filtrage
  const { data: allTags = [] } = await supabase
    .from('tags')
    .select('*')
    .eq('is_active', true)
    .order('tag_type')
    .order('name_fr');

  return (
    <main className="min-h-screen bg-gray-50">
      <CategoryHero 
        category={category} 
        experienceCount={experiences?.length || 0}
      />
      <ExperienceGrid
        experiences={experiences || []}
        tags={allTags || []}
        locale={locale}
      />
    </main>
  );
}
