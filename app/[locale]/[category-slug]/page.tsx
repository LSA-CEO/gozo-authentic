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
  
  // Récupérer la catégorie pour le titre
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', categorySlug)
    .eq('is_active', true)
    .single();
    
  if (!category) return {};
  
  const categoryName = category[`name_${locale}`] || category.name_en;
  const categoryDescription = category[`description_${locale}`] || category.description_en;
  
  return {
    title: `${categoryName} | Flav & Jade - Gozo Authentic`,
    description: categoryDescription || t('defaultDescription'),
    openGraph: {
      title: `${categoryName} | Flav & Jade - Gozo Authentic`,
      description: categoryDescription,
      locale: locale,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, 'category-slug': categorySlug } = await params;
  
  // Récupérer la catégorie
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', categorySlug)
    .eq('is_active', true)
    .single();
    
  if (categoryError || !category) {
    notFound();
  }

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