'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  locale: string;
}

export function Header({ locale }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('Navigation');

  // Sections de la homepage avec les bons IDs
  const sections = [
    { id: 'hero', label: t('home') },
    { id: 'about', label: t('about') },
    { id: 'categories', label: t('discover') },
    { id: 'gallery', label: t('gallery') },
    { id: 'cta', label: t('contact') }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Détection de la section active
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      
      // Parcourir les sections dans l'ordre inverse pour prioriser la dernière visible
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const element = document.getElementById(section.id);
        
        if (element) {
          const rect = element.getBoundingClientRect();
          const top = rect.top + window.scrollY;
          
          if (scrollPosition >= top) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const top = element.offsetTop - offset;
      
      window.scrollTo({
        top: top,
        behavior: 'smooth'
      });
    }
  };

  const isHomepage = pathname === `/${locale}` || pathname === `/${locale}/`;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-lg py-4' 
          : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 md:px-12">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="relative z-10">
            <div className={`transition-all duration-300 ${
              isScrolled ? '' : 'brightness-0 invert'
            }`}>
              <Image 
                src="/images/logo.png" 
                alt="Gozo Authentic" 
                width={400} 
                height={180} 
                className="h-12 md:h-16 w-auto object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {isHomepage ? (
              // Navigation par sections pour la homepage
              <>
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`relative font-medium transition-colors duration-300 ${
                      isScrolled 
                        ? activeSection === section.id 
                          ? 'text-gray-600' 
                          : 'text-gray-700 hover:text-gray-600'
                        : activeSection === section.id
                          ? 'text-white'
                          : 'text-white/90 hover:text-white'
                    }`}
                  >
                    {section.label}
                    <span 
                      className={`absolute -bottom-1 left-0 h-0.5 bg-gray-600 transition-all duration-300 ease-out ${
                        activeSection === section.id ? 'w-full' : 'w-0'
                      }`}
                    />
                  </button>
                ))}
              </>
            ) : (
              // Navigation normale pour les autres pages
              <>
                <Link
                  href={`/${locale}`}
                  className={`font-medium transition-colors duration-300 ${
                    isScrolled ? 'text-gray-700 hover:text-gray-600' : 'text-white/90 hover:text-white'
                  }`}
                >
                  {t('home')}
                </Link>
                <Link
                  href={`/${locale}/experiences`}
                  className={`font-medium transition-colors duration-300 ${
                    isScrolled ? 'text-gray-700 hover:text-gray-600' : 'text-white/90 hover:text-white'
                  }`}
                >
                  {t('experiences')}
                </Link>
                <Link
                  href={`/${locale}/about`}
                  className={`font-medium transition-colors duration-300 ${
                    isScrolled ? 'text-gray-700 hover:text-gray-600' : 'text-white/90 hover:text-white'
                  }`}
                >
                  {t('about')}
                </Link>
                <Link
                  href={`/${locale}/contact`}
                  className={`font-medium transition-colors duration-300 ${
                    isScrolled ? 'text-gray-700 hover:text-gray-600' : 'text-white/90 hover:text-white'
                  }`}
                >
                  {t('contact')}
                </Link>
              </>
            )}
            
            {/* Language Selector */}
            <div className="relative group">
              <button className={`flex items-center gap-2 font-medium transition-colors duration-300 ${
                isScrolled ? 'text-gray-700 hover:text-gray-600' : 'text-white/90 hover:text-white'
              }`}>
                {locale.toUpperCase()}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <div className="py-2">
                  {['en', 'fr', 'de', 'it', 'nl', 'es', 'pt'].map((lang) => (
                    <Link
                      key={lang}
                      href={pathname.replace(`/${locale}`, `/${lang}`)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-600 transition-colors"
                    >
                      {lang.toUpperCase()}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Link 
              href={`/${locale}/carnet`}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                isScrolled 
                  ? 'bg-gray-900 text-white hover:bg-gray-700' 
                  : 'bg-white text-gray-900 hover:bg-gray-100'
              }`}
            >
              {t('myCarnet')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden relative z-10 ${
              isScrolled ? 'text-gray-900' : 'text-white'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden fixed inset-x-0 top-0 bg-white shadow-2xl transition-transform duration-300 ${
        isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-8">
            <Link href={`/${locale}`} onClick={() => setIsMobileMenuOpen(false)}>
              <Image 
                src="/images/logo.png" 
                alt="Gozo Authentic" 
                width={300} 
                height={120} 
                className="h-10 w-auto object-contain"
              />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {isHomepage ? (
              sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    scrollToSection(section.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left text-lg font-medium ${
                    activeSection === section.id ? 'text-gray-600' : 'text-gray-700'
                  }`}
                >
                  {section.label}
                </button>
              ))
            ) : (
              <>
                <Link
                  href={`/${locale}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-lg font-medium text-gray-700"
                >
                  {t('home')}
                </Link>
                <Link
                  href={`/${locale}/experiences`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-lg font-medium text-gray-700"
                >
                  {t('experiences')}
                </Link>
                <Link
                  href={`/${locale}/about`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-lg font-medium text-gray-700"
                >
                  {t('about')}
                </Link>
                <Link
                  href={`/${locale}/contact`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-lg font-medium text-gray-700"
                >
                  {t('contact')}
                </Link>
              </>
            )}
            
            <hr className="my-4" />
            
            <div className="space-y-2">
              <p className="text-sm text-gray-500 uppercase tracking-wider">Language</p>
              <div className="flex flex-wrap gap-2">
                {['en', 'fr', 'de', 'it', 'nl', 'es', 'pt'].map((lang) => (
                  <Link
                    key={lang}
                    href={pathname.replace(`/${locale}`, `/${lang}`)}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      lang === locale 
                        ? 'bg-gray-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </Link>
                ))}
              </div>
            </div>
            
            <hr className="my-4" />
            
            <Link 
              href={`/${locale}/carnet`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full text-center bg-gray-600 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-700"
            >
              {t('myCarnet')}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}