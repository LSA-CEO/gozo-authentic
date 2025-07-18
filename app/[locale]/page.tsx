'use client';

import {useTranslations} from 'next-intl';

export default function HomePage() {
  const t = useTranslations('HomePage');

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-4">
          {t('title')}
        </h1>
        <p className="text-xl text-center text-gray-600 mb-8">
          {t('subtitle')}
        </p>
        <div className="text-center">
          <button className="bg-green-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-green-600">
            {t('cta')}
          </button>
        </div>
      </div>
    </main>
  );
}