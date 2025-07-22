'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Modal } from '../Modal';
import { ContactModal } from '../ContactModal';
import { formatPrice } from '../../lib/utils';
import { ExperienceWithDetails } from '../../types';

interface ExperienceCardCategoryProps {
  experience: ExperienceWithDetails;
}

export function ExperienceCardCategory({ experience }: ExperienceCardCategoryProps) {
  const [showModal, setShowModal] = useState(false);
  const locale = useLocale();
  
  const name = experience[`name_${locale}`] || experience.name_en;
  const description = experience[`description_${locale}`] || experience.description_en;
  
  // Obtenir l'image
  const imageUrl = experience.featured_image_url || 
    experience.images?.[0]?.url || 
    `/images/experiences/default.jpg`;
  
  // Compter les tags pour afficher comme sur les cartes catégories
  const tagCount = experience.tags?.length || 0;
  
  return (
    <>
      <div className="group" onClick={() => setShowModal(true)}>
        <article className="relative h-[220px] md:h-[240px] overflow-hidden cursor-pointer bg-white border border-gray-100 hover:border-gray-300 transition-all duration-300">
          {/* Image avec overlay - même style que CategorySection */}
          <div className="absolute inset-0">
            <Image
              src={imageUrl}
              alt={name as string}
              fill
              className="object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </div>
          
          {/* Contenu compact - même structure que CategorySection */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            
            <h3 className="text-lg font-medium text-white mb-1">
              {name}
            </h3>
            
            <p className="text-white/80 text-xs line-clamp-2">
              {description}
            </p>
            
            {/* Indicateur de hover subtil - même que CategorySection */}
            <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-white text-xs uppercase tracking-wider flex items-center gap-1">
                Découvrir
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </article>
      </div>
      
      {/* Modal */}
      <Modal isOpen={showModal}>
        <ContactModal
          experience={experience}
          onClose={() => setShowModal(false)}
        />
      </Modal>
    </>
  );
}
