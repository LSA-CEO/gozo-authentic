import { getTranslations } from 'next-intl/server';
import { CategorySection } from '../../components/CategorySection';
import { HeroSection } from '../../components/HeroSection';
import { AboutSection } from '../../components/AboutSection';
import { GallerySection } from '../../components/GallerySection';
import { CTASection } from '../../components/CTASection';
import { supabase } from '../../lib/supabase';
import { Metadata } from 'next';
import { seoConfig } from '../../lib/seo-config';

// Forcer le rechargement des données sans cache
export const revalidate = 0;

// Générer les métadonnées pour le SEO
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  
  const titles = {
    fr: 'Gozo Authentique - Carnet de voyage intimiste par Flav & Jade',
    en: 'Authentic Gozo - Intimate travel journal by Flav & Jade',
    de: 'Authentisches Gozo - Intimes Reisetagebuch von Flav & Jade',
    it: 'Gozo Autentico - Diario di viaggio intimo di Flav & Jade',
    nl: 'Authentiek Gozo - Intiem reisdagboek door Flav & Jade',
    es: 'Gozo Auténtico - Diario de viaje íntimo por Flav & Jade',
    pt: 'Gozo Autêntico - Diário de viagem íntimo por Flav & Jade'
  };
  
  const descriptions = {
    fr: 'Découvrez Gozo à travers notre carnet de voyage personnel. 6 catégories d\'expériences testées et approuvées : aventures en mer, tables secrètes, plages cachées et plus.',
    en: 'Discover Gozo through our personal travel journal. 6 categories of tested experiences: sea adventures, secret restaurants, hidden beaches and more.',
    de: 'Entdecken Sie Gozo durch unser persönliches Reisetagebuch. 6 Kategorien getesteter Erfahrungen: Meeresabenteuer, geheime Restaurants, versteckte Strände und mehr.',
    it: 'Scopri Gozo attraverso il nostro diario di viaggio personale. 6 categorie di esperienze testate: avventure marine, ristoranti segreti, spiagge nascoste e altro.',
    nl: 'Ontdek Gozo door ons persoonlijke reisdagboek. 6 categorieën geteste ervaringen: zee-avonturen, geheime restaurants, verborgen stranden en meer.',
    es: 'Descubre Gozo a través de nuestro diario de viaje personal. 6 categorías de experiencias probadas: aventuras marinas, restaurantes secretos, playas escondidas y más.',
    pt: 'Descubra Gozo através do nosso diário de viagem pessoal. 6 categorias de experiências testadas: aventuras marítimas, restaurantes secretos, praias escondidas e mais.'
  };
  
  const keywords = {
    fr: 'gozo malte, carnet voyage gozo, activités gozo, restaurants gozo, plages gozo, hébergement gozo, flav jade gozo',
    en: 'gozo malta, gozo travel guide, gozo activities, gozo restaurants, gozo beaches, gozo accommodation, flav jade gozo',
    de: 'gozo malta, gozo reiseführer, gozo aktivitäten, gozo restaurants, gozo strände, gozo unterkunft, flav jade gozo',
    it: 'gozo malta, guida viaggio gozo, attività gozo, ristoranti gozo, spiagge gozo, alloggio gozo, flav jade gozo',
    nl: 'gozo malta, gozo reisgids, gozo activiteiten, gozo restaurants, gozo stranden, gozo accommodatie, flav jade gozo',
    es: 'gozo malta, guía viaje gozo, actividades gozo, restaurantes gozo, playas gozo, alojamiento gozo, flav jade gozo',
    pt: 'gozo malta, guia viagem gozo, atividades gozo, restaurantes gozo, praias gozo, alojamento gozo, flav jade gozo'
  };
  
  const title = titles[locale as keyof typeof titles] || titles.fr;
  const description = descriptions[locale as keyof typeof descriptions] || descriptions.fr;
  const keywordList = keywords[locale as keyof typeof keywords] || keywords.fr;
  
  // Schema.org pour l'organisation
  const organizationSchema = {
    ...seoConfig.organizationSchema,
    name: locale === 'fr' ? 'Gozo Authentique' : 'Gozo Authentic',
    description: description
  };
  
  return {
    title,
    description,
    keywords: keywordList,
    authors: [{ name: 'Flav & Jade' }],
    creator: 'Flav & Jade',
    publisher: 'Gozo Authentic',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(seoConfig.siteUrl),
    openGraph: {
      title,
      description,
      url: `${seoConfig.siteUrl}/${locale}`,
      siteName: 'Gozo Authentic',
      locale: locale,
      type: 'website',
      images: [
        {
          url: '/images/gozo-hero.jpg',
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@gozoauthentic',
      images: ['/images/gozo-hero.jpg'],
    },
    alternates: {
      canonical: `${seoConfig.siteUrl}/${locale}`,
      languages: {
        'en': '/en',
        'fr': '/fr',
        'de': '/de',
        'it': '/it',
        'nl': '/nl',
        'es': '/es',
        'pt': '/pt',
      }
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      'script:ld+json': JSON.stringify(organizationSchema)
    }
  };
}

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
  image_url?: string | null;
  created_at: string;
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
