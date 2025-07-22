'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ImageModal } from './ImageModal';

interface GallerySectionProps {
  locale: string;
}

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  type: 'normal' | 'tall' | 'wide';
  order_position: number;
}

export function GallerySection({ locale }: GallerySectionProps) {
  const t = useTranslations('HomePage.gallery');
  const [isVisible, setIsVisible] = useState(false);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Charger UNIQUEMENT les images depuis l'API
  useEffect(() => {
    fetch('/api/admin/gallery')
      .then(res => res.json())
      .then(data => {
        if (data.images) {
          setImages(data.images);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Utiliser UNIQUEMENT les traductions pour les textes
  const title = t('title');
  const subtitle = t('subtitle');

  const openModal = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeModal = () => {
    setSelectedImageIndex(null);
  };

  return (
    <>
      <section id="gallery" ref={sectionRef} className="py-10 md:py-24 bg-white">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          {/* Header minimaliste */}
          <div className="mb-12">
            <h2 className={`text-2xl md:text-3xl font-light text-gray-900 mb-2 ${
              isVisible ? 'animate-fade-in-up' : 'opacity-0'
            }`}>
              {title}
            </h2>
            {/* CTA Instagram subtil */}
            <div className="mt-3">
              <a 
                href="https://instagram.com/gozoauthentic" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                </svg>
                <span>{subtitle}</span>
              </a>
            </div>
          </div>

          {/* Gallery Grid Masonry */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`relative overflow-hidden group cursor-pointer ${
                  image.type === 'tall' ? 'md:row-span-2' : 
                  image.type === 'wide' ? 'md:col-span-2' : ''
                } ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => openModal(index)}
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes={image.type === 'wide' ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                
                {/* Icône zoom au hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      {selectedImageIndex !== null && (
        <ImageModal
          isOpen={selectedImageIndex !== null}
          onClose={closeModal}
          images={images.map(img => ({ url: img.url, alt: img.alt }))}
          initialIndex={selectedImageIndex}
        />
      )}
    </>
  );
}
