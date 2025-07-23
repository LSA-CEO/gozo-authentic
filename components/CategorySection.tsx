'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Category {
  id: string;
  slug: string;
  slug_en?: string;
  slug_de?: string;
  slug_it?: string;
  slug_nl?: string;
  slug_es?: string;
  slug_pt?: string;
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
  [key: string]: any;
}

interface CategorySectionProps {
  categories: Category[];
  experienceCounts: Record<string, number>;
  locale: string;
}

export function CategorySection({ categories, experienceCounts, locale }: CategorySectionProps) {
  const t = useTranslations('HomePage.categories');
  const tCommon = useTranslations('Categories'); // Pour les traductions communes
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const observers = itemRefs.current.map((ref, index) => {
      if (!ref) return null;
      
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleItems(prev => [...prev, index]);
          }
        },
        { threshold: 0.1 }
      );
      
      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach(observer => observer?.disconnect());
    };
  }, [categories]);

  const handleImageError = (categoryId: string) => {
    setImageErrors(prev => ({ ...prev, [categoryId]: true }));
  };

  return (
    <section id="categories" className="py-10 md:py-24 bg-white flex items-center">
      <div className="container mx-auto px-6 md:px-12 max-w-7xl">
        {/* Header compact */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-3">
            {t('title')}
          </h2>
          <p className="text-gray-600 text-sm max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Grille optimisée pour tenir sur une page */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {categories.map((category, index) => {
            const name = category[`name_${locale}`] || category.name_en;
            const description = category[`description_${locale}`] || category.description_en;
            const count = experienceCounts[category.id] || 0;
            const hasImage = category.image_url && !imageErrors[category.id];
            
            // Obtenir le slug traduit
            const categorySlug = locale === 'fr' 
              ? category.slug 
              : category[`slug_${locale}` as keyof typeof category] || category.slug;
            
            return (
              <div
                key={category.id}
                ref={(el) => { if (el) itemRefs.current[index] = el; }}
                className={`group ${
                  visibleItems.includes(index) ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link href={`/${locale}/${categorySlug}`}>
                  <article className="relative h-[220px] md:h-[240px] overflow-hidden cursor-pointer bg-white border border-gray-100 hover:border-gray-300 transition-all duration-300">
                    {/* Image avec overlay ou fallback */}
                    <div className="absolute inset-0">
                      {hasImage ? (
                        <Image
                          src={category.image_url!}
                          alt={name}
                          fill
                          className="object-cover transform group-hover:scale-105 transition-transform duration-700"
                          onError={() => handleImageError(category.id)}
                          unoptimized={category.image_url!.includes('supabase')}
                        />
                      ) : (
                        // Fallback élégant sans image
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    </div>
                    
                    {/* Contenu compact */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/70 text-xs">
                          {count} {count === 1 ? tCommon('place') : tCommon('places')}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-medium text-white mb-1">
                        {name}
                      </h3>
                      
                      <p className="text-white/80 text-xs line-clamp-2">
                        {description}
                      </p>
                      
                      {/* Indicateur de hover subtil */}
                      <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-white text-xs uppercase tracking-wider flex items-center gap-1">
                          {tCommon('discover')}
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
