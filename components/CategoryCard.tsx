'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from 'next-intl';

interface CategoryCardProps {
  category: {
    id: string;
    slug: string;
    slug_en?: string;
    slug_de?: string;
    slug_it?: string;
    slug_nl?: string;
    slug_es?: string;
    slug_pt?: string;
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
  };
  experienceCount: number;
}

export function CategoryCard({ category, experienceCount }: CategoryCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const locale = useLocale();
  
  const name = category[`name_${locale}`] || category.name_en;
  const description = category[`description_${locale}`] || category.description_en;
  
  // Obtenir le slug traduit
  const categorySlug = locale === 'fr' 
    ? category.slug 
    : category[`slug_${locale}` as keyof typeof category] || category.slug;

  console.log('Category data:', category.slug, categorySlug, locale);

  
  return (
    <Link href={`/${locale}/${categorySlug}`}>
      <div 
        className="group relative h-full cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Container principal avec bordure fine */}
        <div className="relative h-full border border-gray-200 rounded-lg overflow-hidden bg-white hover:border-gray-300 transition-all duration-300">
          
          {/* Image container - plus petite et minimaliste */}
          <div className="relative h-48 overflow-hidden bg-gray-50">
            {category.image_url && !imageError ? (
              <Image
                src={category.image_url}
                alt={name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={() => setImageError(true)}
                unoptimized={category.image_url.includes('supabase')}
              />
            ) : (
              // Fallback minimaliste sans emoji
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
            )}
            
            {/* Overlay très léger au hover */}
            <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${isHovered ? 'opacity-10' : 'opacity-0'}`} />
          </div>
          
          {/* Contenu texte - style épuré */}
          <div className="p-6">            
            {/* Titre plus petit et élégant */}
            <h3 className="text-xl font-medium text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
              {name}
            </h3>
            
            {/* Description courte */}
            {description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {description}
              </p>
            )}
            
            {/* Compteur discret */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {experienceCount} {experienceCount === 1 ? 'expérience' : 'expériences'}
              </span>
              
              {/* Flèche subtile */}
              <svg 
                className={`w-4 h-4 text-gray-400 transition-all duration-300 ${isHovered ? 'translate-x-1' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
          
          {/* Ligne d'accent en bas - très fine */}
          <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 transition-all duration-300 ${isHovered ? 'scale-x-100' : 'scale-x-0'}`} />
        </div>
      </div>
    </Link>
  );
}
