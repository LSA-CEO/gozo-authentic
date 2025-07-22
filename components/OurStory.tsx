'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

export function OurStory() {
  const t = useTranslations('OurStory');
  const [imageUrl, setImageUrl] = useState('/images/nous.jpg');
  
  // Charger l'image depuis l'API
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
  
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background décoratif */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-blue-50"></div>
      
      {/* Formes décoratives */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <div className="relative container mx-auto px-4 max-w-7xl">
        {/* Header section */}
        <div className="text-center mb-16">
          <p className="text-amber-600 font-medium text-sm uppercase tracking-wider mb-3">Notre Histoire</p>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
            Flav & Jade
          </h2>
          <div className="w-32 h-1 bg-gradient-to-r from-amber-400 to-blue-400 mx-auto"></div>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Photo côté gauche */}
          <div className="relative order-2 lg:order-1">
            <div className="relative">
              {/* Photo principale avec effet */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <Image
                  src={imageUrl}
                  alt="Flav & Jade à Gozo"
                  width={600}
                  height={450}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              {/* Carte postale overlay */}
              <div className="absolute -top-8 -right-8 bg-white rounded-2xl shadow-xl p-6 max-w-xs transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                <p className="text-4xl mb-2">📍</p>
                <p className="font-bold text-gray-900 mb-1">Gozo, Malte</p>
                <p className="text-sm text-gray-600">{t('yearsBadge')}</p>
                <p className="text-xs text-amber-600 mt-2">Notre petit paradis méditerranéen</p>
              </div>
              
              {/* Quote bubble */}
              <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-4 max-w-[200px] transform rotate-3">
                <p className="text-sm font-medium italic">"Tombés amoureux de Gozo dès le premier jour"</p>
              </div>
            </div>
          </div>
          
          {/* Texte côté droit */}
          <div className="space-y-8 order-1 lg:order-2">
            {/* Introduction */}
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {t('title')}
              </h3>
              
              {/* Histoire avec style */}
              <div className="space-y-6">
                <div className="relative pl-8 border-l-4 border-amber-400">
                  <div className="absolute -left-[10px] top-0 w-5 h-5 bg-amber-400 rounded-full"></div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {t('paragraph1')}
                  </p>
                </div>
                
                <div className="relative pl-8 border-l-4 border-blue-400">
                  <div className="absolute -left-[10px] top-0 w-5 h-5 bg-blue-400 rounded-full"></div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {t('paragraph2')}
                  </p>
                </div>
                
                <div className="relative pl-8 border-l-4 border-gray-400">
                  <div className="absolute -left-[10px] top-0 w-5 h-5 bg-gray-400 rounded-full"></div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {t('paragraph3')}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Signature avec style */}
            <div className="bg-gradient-to-r from-amber-50 to-blue-50 rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  F&J
                </div>
                <div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    Flav & Jade
                  </p>
                  <p className="text-gray-600">
                    {t('signature')}
                  </p>
                </div>
              </div>
              
              {/* Mini stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">3</p>
                  <p className="text-xs text-gray-600">Années à Gozo</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">100+</p>
                  <p className="text-xs text-gray-600">Lieux découverts</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">6</p>
                  <p className="text-xs text-gray-600">Catégories</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Citation inspirante en bas */}
        <div className="mt-20 relative">
          <div className="bg-gradient-to-r from-amber-100 via-white to-blue-100 rounded-3xl p-12 text-center relative overflow-hidden">
            {/* Pattern de fond */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
            </div>
            
            <div className="relative">
              <svg className="w-12 h-12 mx-auto mb-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
              </svg>
              <blockquote className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-800 italic leading-relaxed max-w-4xl mx-auto">
                {t('quote')}
              </blockquote>
              <svg className="w-12 h-12 mx-auto mt-4 text-amber-400 transform rotate-180" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
