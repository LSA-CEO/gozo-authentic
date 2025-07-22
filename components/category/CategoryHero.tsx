'use client';

import Image from 'next/image';
import { useLocale } from 'next-intl';

interface CategoryHeroProps {
  category: {
    id: string;
    slug: string;
    name_fr: string;
    name_en: string;
    description_fr?: string;
    description_en?: string;
    image_url?: string;
    [key: string]: any; // Index signature pour les clés dynamiques
  };
  experienceCount: number;
}

export function CategoryHero({ category, experienceCount }: CategoryHeroProps) {
  const locale = useLocale();
  
  const name = category[`name_${locale}`] || category.name_en;
  const description = category[`description_${locale}`] || category.description_en;
  
  return (
    <div className="relative h-[400px] bg-gray-900">
      {category.image_url && (
        <Image
          src={category.image_url}
          alt={name}
          fill
          className="object-cover opacity-60"
          priority
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      
      <div className="relative container mx-auto px-6 h-full flex items-end pb-16">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-light text-white mb-4">
            {name}
          </h1>
          {description && (
            <p className="text-xl text-white/90 mb-6 leading-relaxed">
              {description}
            </p>
          )}
          <div className="flex items-center gap-6 text-white/80">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {experienceCount} {experienceCount === 1 ? "expérience" : "expériences"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
