'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: Array<{
    url: string;
    alt: string;
  }>;
  initialIndex: number;
}

export function ImageModal({ isOpen, onClose, images, initialIndex }: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Mettre à jour l'index quand on ouvre une nouvelle image
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setImageLoaded(false);
    }
  }, [isOpen, initialIndex]);

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        navigatePrev();
      } else if (e.key === 'ArrowRight') {
        navigateNext();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyboard);
      
      // Calculer la largeur de la scrollbar
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Ajouter un padding-right pour compenser la scrollbar qui disparaît
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyboard);
      document.body.style.paddingRight = '';
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, currentIndex]);

  const navigatePrev = () => {
    setImageLoaded(false);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const navigateNext = () => {
    setImageLoaded(false);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!isOpen || !images[currentIndex]) return null;

  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop avec animation */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-fade-in-backdrop"
        onClick={onClose}
      />
      
      {/* Container de l'image avec animation */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          aria-label="Fermer"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Flèche gauche */}
        <button
          onClick={navigatePrev}
          className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10 p-2"
          aria-label="Image précédente"
        >
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Flèche droite */}
        <button
          onClick={navigateNext}
          className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10 p-2"
          aria-label="Image suivante"
        >
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Container de l'image avec transition */}
        <div 
          className={`relative transition-all duration-300 ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          style={{
            width: 'min(90vw, 1200px)',
            height: '90vh'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Loader */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          
          <Image
            src={currentImage.url}
            alt={currentImage.alt}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
            priority
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        {/* Indicateur de position */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}
