'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface HeroContent {
  title_fr?: string;
  subtitle_fr?: string;
  cta_fr?: string;
  image_url?: string;
}

export function HeroSection({ locale }: { locale: string }) {
  const t = useTranslations('HomePage.hero');
  const [content, setContent] = useState<HeroContent | null>(null);
  
  // Charger le contenu depuis l'API admin qui utilise site_content
  useEffect(() => {
    fetch('/api/admin/homepage')
      .then(res => res.json())
      .then(data => {
        if (data.hero) {
          setContent(data.hero);
        }
      })
      .catch(console.error);
  }, []);
  
  // Utiliser le contenu de la DB ou les traductions par défaut
  const title = content?.title_fr || t('title');
  const subtitle = content?.subtitle_fr || t('subtitle');
  const ctaText = content?.cta_fr || t('cta');
  const imageUrl = content?.image_url || '/images/mgarr.jpg';
  
  return (
    <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imageUrl}
          alt="Gozo Island"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-light mb-6 animate-fade-in">
          {title}
        </h1>
        <p className="text-xl md:text-2xl font-light mb-8 animate-fade-in animation-delay-200">
          {subtitle}
        </p>
        <Link
          href="#categories"
          className="inline-block bg-white text-gray-900 px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-all transform hover:scale-105 animate-fade-in animation-delay-400"
        >
          {ctaText}
        </Link>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
