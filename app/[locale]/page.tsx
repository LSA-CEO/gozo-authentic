import { getTranslations } from 'next-intl/server';
import { CategorySection } from '../../components/CategorySection';
import { HeroSection } from '../../components/HeroSection';
import { AboutSection } from '../../components/AboutSection';
import { GallerySection } from '../../components/GallerySection';
import { CTASection } from '../../components/CTASection';
import { supabase } from '../../lib/supabase';

// Forcer le rechargement des données sans cache
export const revalidate = 0;
interface Category {
  id: string;
  slug: string;
  icon: string;
  position: number;
  is_active: boolean;
  name_en: string;
  name_fr?: string;
  name_de?: string;
  name_it?: string;
  name_nl?: string;
  name_es?: string;
  name_pt?: string;
  description_en?: string;
  description_fr?: string;
  description_de?: string;
  description_it?: string;
  description_nl?: string;
  description_es?: string;
  description_pt?: string;
  image_url?: string | null;  created_at: string;
  updated_at: string;
}

async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('position', { ascending: true });
  
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  
  return data || [];
}

async function getExperienceCountByCategory(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('experiences')
    .select('category_id')
    .eq('is_active', true);
  
  if (error) {
    console.error('Error fetching experience counts:', error);
    return {};
  }
  
  const counts: Record<string, number> = {};
  data?.forEach(exp => {
    if (exp.category_id) {
      counts[exp.category_id] = (counts[exp.category_id] || 0) + 1;
    }
  });
  
  return counts;
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const [categories, experienceCounts] = await Promise.all([
    getCategories(),
    getExperienceCountByCategory()
  ]);
  
  const { locale } = await params;
  const t = await getTranslations('HomePage');
  
  return (
    <main className="min-h-screen bg-white">
      <HeroSection locale={locale} />
      <AboutSection locale={locale} />
      <CategorySection 
        categories={categories} 
        experienceCounts={experienceCounts} 
        locale={locale} 
      />
      <GallerySection locale={locale} />
      <CTASection locale={locale} />
    </main>
  );
}