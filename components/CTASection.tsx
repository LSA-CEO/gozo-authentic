'use client';

import { useTranslations } from 'next-intl';
import { WhatsAppButton } from './WhatsAppButton';
import { useEffect, useRef, useState } from 'react';

interface CTASectionProps {
  locale: string;
}

export function CTASection({ locale }: CTASectionProps) {
  const t = useTranslations('HomePage.cta');
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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

  // Utiliser UNIQUEMENT les traductions
  const title = t('title');
  const subtitle = t('subtitle');
  const buttonText = t('button');

  return (
    <section id="cta" ref={sectionRef} className="py-10 md:py-24 bg-white">
      <div className="container mx-auto px-6 md:px-12 text-center max-w-3xl">
        <h2 className={`text-2xl md:text-3xl font-light text-gray-900 mb-4 ${
          isVisible ? 'animate-fade-in-up' : 'opacity-0'
        }`}>
          {title}
        </h2>
        
        <p className={`text-gray-600 mb-8 ${
          isVisible ? 'animate-fade-in-up' : 'opacity-0'
        }`} style={{ animationDelay: '0.1s' }}>
          {subtitle}
        </p>

        <div className={`${
          isVisible ? 'animate-fade-in-up' : 'opacity-0'
        }`} style={{ animationDelay: '0.2s' }}>
          <WhatsAppButton 
            message={subtitle}
            className="inline-flex items-center gap-2 bg-green-500 text-white hover:bg-green-700 px-6 py-3 rounded-full transition-colors duration-300"
          >
            <span className="text-sm font-medium">{buttonText}</span>
          </WhatsAppButton>
        </div>
      </div>
    </section>
  );
}
