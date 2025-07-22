'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';

interface AboutSectionProps {
  locale: string;
}

export function AboutSection({ locale }: AboutSectionProps) {
  const t = useTranslations('OurStory');
  const [isVisible, setIsVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState('/images/nous.jpg'); // Valeur par défaut
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Récupérer l'image depuis l'admin
  useEffect(() => {
    fetch('/api/admin/homepage')
      .then(res => res.json())
      .then(data => {
        if (data.about?.image_url) {
          setImageUrl(data.about.image_url);
        }
      })
      .catch(console.error);
  }, []);
  
  // Observer pour l'animation au scroll
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

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);
  
  // Utiliser uniquement les traductions pour les textes
  const title = t('title');
  const paragraphs = [t('paragraph1'), t('paragraph2'), t('paragraph3')];

  return (
    <section id="about" className="py-30 bg-white" ref={sectionRef}>
      <div className="container mx-auto px-6 md:px-2O max-w-7xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6">
            <h2 className={`text-3xl md:text-3xl font-light text-gray-900 mb-14 leading-tight transition-all duration-1000 ${
              isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
            }`}>
              {title}
            </h2>
            
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className={`text-gray-700 leading-relaxed transition-all duration-1000 delay-${index * 200} ${
                  isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
                }`}
              >
                {paragraph}
              </p>
            ))}
            
            <div className={`pt-8 transition-all duration-1000 delay-600 ${
              isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
            }`}>
              <p className="text-gray-900 font-medium">
                — {t('signature')}
              </p>
            </div>
          </div>

          {/* Image */}
          <div className={`relative h-[500px] md:h-[600px] overflow-hidden rounded-lg shadow-2xl transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-4'
          }`}>
            <Image
              src={imageUrl}
              alt="Flav & Jade"
              fill
              className="object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-8">
              <div className="text-white">
                <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-4">
                  {t('yearsBadge')}
                </span>
                <p className="text-lg italic">
                  "{t('quote')}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
