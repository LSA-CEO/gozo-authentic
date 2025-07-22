'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Modal } from './Modal';
import { ContactModal } from './ContactModal';
import { formatPrice } from '../lib/utils';
import { Experience } from '../types';

interface ExperienceCardProps {
  experience: Experience;
}

export function ExperienceCard({ experience }: ExperienceCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  const locale = useLocale();
  
  const name = experience[`name_${locale}` as keyof Experience] || experience.name_en;
  const description = experience[`description_${locale}` as keyof Experience] || experience.description_en;
  
  // Utiliser featured_image_url en priorité, sinon images array, sinon fallback
  const getExperienceImage = (id: string) => {
    switch(id) {
      case '1': return '/images/experiences/quad-sunset-tours.jpg';
      case '2': return '/images/experiences/boat-trip.jpg';
      case '3': return '/images/experiences/jetski.jpg';
      case '4': return '/images/experiences/restaurant.jpg';
      default: return '/images/experiences/default.jpg';
    }
  };
  
  const imageUrl = experience.featured_image_url || experience.images?.[0]?.url || getExperienceImage(experience.id);
  
  // Icônes par catégorie
  const getCategoryIcon = () => {
    if (!experience.category) return '🌟';
    switch(experience.category.slug) {
      case 'sea-adventures': return '🌊';
      case 'land-activities': return '🏃';
      case 'secret-restaurants': return '🍽️';
      case 'cozy-stays': return '🛏️';
      case 'hidden-beaches': return '🏖️';
      case 'local-gems': return '💎';
      default: return '🌟';
    }
  };
  
  return (
    <>
      <div className="group cursor-pointer" onClick={() => setShowModal(true)}>
        <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
          {/* Image container */}
          <div className="aspect-[4/5] relative overflow-hidden">
            {!imageError ? (
              <Image
                src={imageUrl}
                alt={name as string}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                onError={() => setImageError(true)}
              />
            ) : (
              // Fallback gradient si l'image ne charge pas
              <div className="w-full h-full bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-300" />
            )}
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Price badge */}
            {experience.price_from && (
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                <span className="text-sm font-semibold text-gray-900">From {formatPrice(experience.price_from)}</span>
              </div>
            )}
            
            {/* Popular badge pour les expériences populaires */}
            {experience.is_popular && (
              <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg animate-pulse">
                ⭐ Most Popular
              </div>
            )}
            
            {/* Contenu en bas */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              {/* Icône de catégorie */}
              <div className="text-4xl mb-3">
                {getCategoryIcon()}
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">
                {name}
              </h3>
              
              {/* Durée si disponible */}
              {experience.duration && (
                <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{experience.duration}</span>
                </div>
              )}
              
              {description && (
                <p className="text-white/70 text-sm line-clamp-2">
                  {description}
                </p>
              )}
              
              {/* Tags si disponibles */}
              {experience.tags && experience.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {experience.tags.slice(0, 3).map((tag: any, index: number) => (
                    <span 
                      key={index}
                      className="text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Action bar */}
          <div className="bg-white p-4 flex items-center justify-between">
            <span className="text-amber-600 font-medium flex items-center gap-2 group-hover:text-amber-700">
              Discover More
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
            
            {/* Rating si disponible */}
            {experience.rating && (
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.floor(experience.rating || 5) ? 'fill-current' : 'fill-gray-300'}`} 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal rendue dans un Portal */}
      <Modal isOpen={showModal}>
        <ContactModal
          experience={experience}
          onClose={() => setShowModal(false)}
        />
      </Modal>
    </>
  );
}
