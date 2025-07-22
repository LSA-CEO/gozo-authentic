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
  const { 'experience-slug': experienceSlug } = await params;
  
  // Pour l'instant on utilise l'ID comme slug
  const { data: experience } = await supabase
    .from('experiences')
    .select('*')
    .eq('id', experienceSlug)
    .single();
    
  if (!experience) return {};
  
  return {
    title: `${experience.name_fr} | Gozo Authentic`,
    description: experience.description_fr,
  };
}

export default async function ExperiencePage({ params }: ExperiencePageProps) {
  const { locale, 'category-slug': categorySlug, 'experience-slug': experienceSlug } = await params;
  
  // Récupérer la catégorie
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', categorySlug)
    .single();
    
  if (!category) {
    notFound();
  }
  
  // Récupérer l'expérience (pour l'instant on utilise l'ID comme slug)
  const { data: experience } = await supabase
    .from('experiences')
    .select(`
      *,
      experience_tags (
        tag_id,
        tags (*)
      )
    `)
    .eq('id', experienceSlug)
    .eq('category_id', category.id)
    .single();
    
  if (!experience) {
    notFound();
  }

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

  return (
    <main className="min-h-screen bg-white">
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
              
              {experience.our_story_fr && (
                <div className="mb-8">
                  <h2 className="text-2xl font-light mb-4">Notre histoire</h2>
                  <p>{experience.our_story_fr}</p>
                </div>
              )}

              {experience.tips_fr && (
                <div className="mb-8">
                  <h2 className="text-2xl font-light mb-4">Bon à savoir</h2>
                  <p>{experience.tips_fr}</p>
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
                experience={experience}
                
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
              {relatedExperiences.map((exp) => (
                <Link
                  key={exp.id}
                  href={`/${locale}/${categorySlug}/${exp.id}`}
                  className="group"
                >
                  <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden mb-4">
                    {exp.featured_image_url && (
                      <Image
                        src={exp.featured_image_url}
                        alt={exp[`name_${locale}`] || exp.name_en}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <h3 className="text-lg font-medium group-hover:text-gray-600 transition-colors">
                    {exp[`name_${locale}`] || exp.name_en}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
