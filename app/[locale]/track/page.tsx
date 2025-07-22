import { getTranslations } from 'next-intl/server';
import { TrackingForm } from '../../../components/TrackingForm';
import { Suspense } from 'react';

export default async function TrackPage() {
  const t = await getTranslations('TrackPage');
  
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <section className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-serif text-gray-900 text-center mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 text-center">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Tracking Form */}
      <section className="py-12">
        <div className="max-w-lg mx-auto px-4">
          <Suspense fallback={<div className="text-center">Loading...</div>}>
            <TrackingForm />
          </Suspense>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('help.title')}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📧</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('help.email.title')}</h3>
              <p className="text-gray-600">{t('help.email.description')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('help.whatsapp.title')}</h3>
              <p className="text-gray-600">{t('help.whatsapp.description')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('help.code.title')}</h3>
              <p className="text-gray-600">{t('help.code.description')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
