import { notFound } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ContactModalWrapper } from '../../../../components/ContactModalWrapper';

interface ExperiencePageProps {
  params: Promise<{
    locale: string;
    'category-slug': string;
    'experience-slug': string;
  }>;
}

// Générer les métadonnées pour le SEO
export async function generateMetadata({ params }: ExperiencePageProps): Promise<Metadata> {
  const { locale, 'category-slug': categorySlug, 'experience-slug': experienceSlug } = await params;
  
  // Récupérer la catégorie d'abord
  const categorySlugColumn = locale === 'fr' ? 'slug' : `slug_${locale}`;
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .or(`slug.eq.${categorySlug},${categorySlugColumn}.eq.${categorySlug}`)
    .single();
    
  if (!category) return {};
  
  // Récupérer l'expérience avec le bon slug
  const expSlugColumn = locale === 'fr' ? 'slug' : `slug_${locale}`;
  const { data: experience } = await supabase
    .from('experiences')
    .select('*')
    .eq('category_id', category.id)
    .or(`id.eq.${experienceSlug},slug.eq.${experienceSlug},${expSlugColumn}.eq.${experienceSlug}`)
    .single();
    
  if (!experience) return {};
  
  // Utiliser les métadonnées enrichies
  const title = experience.meta_title?.[locale] || 
    `${experience[`name_${locale}`] || experience.name_en} - ${category[`name_${locale}`] || category.name_en} | Gozo Authentic`;
    
  const description = experience.meta_description?.[locale] || 
    experience[`description_${locale}`] || 
    experience.description_en;
  
  const keywords = experience.seo_keywords?.[locale] || [];
  
  // Schema.org pour les rich snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: experience[`name_${locale}`] || experience.name_en,
    description: description,
    image: experience.featured_image_url,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Gozo',
      addressCountry: 'MT'
    },
    offers: experience.price_from ? {
      '@type': 'Offer',
      price: experience.price_from,
      priceCurrency: 'EUR'
    } : undefined,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '127'
    }
  };
  
  return {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title,
      description,
      images: experience.featured_image_url ? [experience.featured_image_url] : [],
      locale: locale,
      type: 'article',
    },
    alternates: {
      languages: {
        'en': `/en/${category.slug_en || categorySlug}/${experience.slug_en || experienceSlug}`,
        'fr': `/fr/${category.slug}/${experience.slug || experienceSlug}`,
        'de': `/de/${category.slug_de || categorySlug}/${experience.slug_de || experienceSlug}`,
        'it': `/it/${category.slug_it || categorySlug}/${experience.slug_it || experienceSlug}`,
        'nl': `/nl/${category.slug_nl || categorySlug}/${experience.slug_nl || experienceSlug}`,
        'es': `/es/${category.slug_es || categorySlug}/${experience.slug_es || experienceSlug}`,
        'pt': `/pt/${category.slug_pt || categorySlug}/${experience.slug_pt || experienceSlug}`,
      }
    },
    other: {
      'script:ld+json': JSON.stringify(jsonLd)
    }
  };
}

// Générer les params statiques pour toutes les combinaisons
export async function generateStaticParams() {
  // Récupérer d'abord toutes les catégories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug, slug_en, slug_de, slug_it, slug_nl, slug_es, slug_pt')
    .eq('is_active', true);
    
  if (!categories) return [];
  
  // Créer un map des catégories
  const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
  
  // Récupérer toutes les expériences
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
      category_id
    `)
    .eq('is_active', true);
    
  if (!experiences) return [];
  
  const locales = ['fr', 'en', 'de', 'it', 'nl', 'es', 'pt'];
  const params: any[] = [];
  
  experiences.forEach(exp => {
    const category = categoryMap.get(exp.category_id);
    if (!category) return; // Skip si pas de catégorie
    
    locales.forEach(locale => {
      const categorySlugKey = locale === 'fr' ? 'slug' : `slug_${locale}`;
      const categorySlug = category[categorySlugKey as keyof typeof category] || category.slug;
      
      const expSlugKey = locale === 'fr' ? 'slug' : `slug_${locale}`;
      const expSlug = exp[expSlugKey as keyof typeof exp] || exp.slug || exp.id;
      
      params.push({
        locale,
        'category-slug': categorySlug,
        'experience-slug': expSlug
      });
    });
  });
  
  return params;
}

export default async function ExperiencePage({ params }: ExperiencePageProps) {
  const { locale, 'category-slug': categorySlug, 'experience-slug': experienceSlug } = await params;
  
  // Récupérer la catégorie avec gestion des slugs multilingues
  const categorySlugColumn = locale === 'fr' ? 'slug' : `slug_${locale}`;
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .or(`slug.eq.${categorySlug},${categorySlugColumn}.eq.${categorySlug}`)
    .single();
    
  if (!category) {
    notFound();
  }
  
  // Récupérer l'expérience avec gestion des slugs multilingues
  const expSlugColumn = locale === 'fr' ? 'slug' : `slug_${locale}`;
  const { data: experience } = await supabase
    .from('experiences')
    .select(`
      *,
      experience_tags (
        tag_id,
        tags (*)
      )
    `)
    .eq('category_id', category.id)
    .or(`id.eq.${experienceSlug},slug.eq.${experienceSlug},${expSlugColumn}.eq.${experienceSlug}`)
    .single();
    
  if (!experience) {
    notFound();
  }

  // Incrémenter le compteur de vues
  await supabase
    .from('experiences')
    .update({ view_count: (experience.view_count || 0) + 1 })
    .eq('id', experience.id);

  // Récupérer d'autres expériences de la même catégorie
  const { data: relatedExperiences = [] } = await supabase
    .from('experiences')
    .select('*')
    .eq('category_id', category.id)
    .eq('is_active', true)
    .neq('id', experience.id)
    .limit(3);

  const experienceName = experience[`name_${locale}`] || experience.name_en;
  const experienceDescription = experience[`description_${locale}`] || experience.description_en;
  const categoryName = category[`name_${locale}`] || category.name_en;
  const ourStory = experience[`our_story_${locale}`] || experience.our_story_en;
  const tips = experience[`tips_${locale}`] || experience.tips_en;

  // Breadcrumb Schema.org
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}`
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: categoryName,
        item: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/${categorySlug}`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: experienceName
      }
    ]
  };

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      
      {/* Breadcrumb */}
      <div className="container mx-auto px-6 py-4">
        <nav className="text-sm text-gray-600">
          <Link href={`/${locale}`} className="hover:text-gray-900">
            Accueil
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/${locale}/${categorySlug}`} className="hover:text-gray-900">
            {categoryName}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{experienceName}</span>
        </nav>
      </div>

      {/* Hero avec image */}
      <div className="relative h-[50vh] bg-gray-100">
        {experience.featured_image_url && (
          <Image
            src={experience.featured_image_url}
            alt={experienceName}
            fill
            className="object-cover"
            priority
            unoptimized={experience.featured_image_url.includes('supabase')}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="container mx-auto">
            <h1 className="text-4xl font-light mb-2">{experienceName}</h1>
            <p className="text-xl opacity-90">{categoryName}</p>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Colonne principale */}
          <div className="md:col-span-2">
            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-600 mb-8">
                {experienceDescription}
              </p>
              
              {ourStory && (
                <div className="mb-8">
                  <h2 className="text-2xl font-light mb-4">Notre histoire</h2>
                  <p>{ourStory}</p>
                </div>
              )}

              {tips && (
                <div className="mb-8">
                  <h2 className="text-2xl font-light mb-4">Bon à savoir</h2>
                  <p>{tips}</p>
                </div>
              )}
            </div>

            {/* Tags */}
            {experience.experience_tags && experience.experience_tags.length > 0 && (
              <div className="mt-8 pt-8 border-t">
                <div className="flex flex-wrap gap-2">
                  {experience.experience_tags.map((et: any) => (
                    <span
                      key={et.tag_id}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {et.tags[`name_${locale}`] || et.tags.name_en}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
              <h3 className="text-xl font-medium mb-4">Informations</h3>
              
              {experience.price_from && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">À partir de</p>
                  <p className="text-2xl font-light">{experience.price_from}€</p>
                </div>
              )}

              {experience.duration_hours && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Durée</p>
                  <p className="text-lg">{experience.duration_hours}h</p>
                </div>
              )}

              <ContactModalWrapper
                experience={{...experience, category}}
                buttonClass="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors text-center"
              />
            </div>
          </div>
        </div>

        {/* Expériences similaires */}
        {relatedExperiences && relatedExperiences.length > 0 && (
          <div className="mt-16 pt-16 border-t">
            <h2 className="text-3xl font-light mb-8">Dans la même catégorie</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedExperiences.map((exp) => {
                const relatedExpSlug = locale === 'fr' 
                  ? (exp.slug || exp.id)
                  : (exp[`slug_${locale}` as keyof typeof exp] || exp.slug || exp.id);
                  
                return (
                  <Link
                    key={exp.id}
                    href={`/${locale}/${categorySlug}/${relatedExpSlug}`}
                    className="group"
                  >
                    <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden mb-4">
                      {exp.featured_image_url && (
                        <Image
                          src={exp.featured_image_url}
                          alt={exp[`name_${locale}`] || exp.name_en}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized={exp.featured_image_url.includes('supabase')}
                        />
                      )}
                    </div>
                    <h3 className="text-lg font-medium group-hover:text-gray-600 transition-colors">
                      {exp[`name_${locale}`] || exp.name_en}
                    </h3>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
