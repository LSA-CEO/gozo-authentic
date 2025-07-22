import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { supabase } from '../../../../lib/supabase';
import { WhatsAppButton } from '../../../../components/WhatsAppButton';
import Link from 'next/link';

async function getLeadByReference(reference: string) {
  const { data, error } = await supabase
    .from('leads')
    .select('*, experiences(name_en, name_fr, name_de, name_it, name_nl, name_es, name_pt)')
    .eq('reference_code', reference)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return data;
}

export default async function TrackingDetailsPage({
  params
}: {
  params: Promise<{ reference: string; locale: string }>;
}) {
  const { reference, locale } = await params;
  const t = await getTranslations('TrackingDetails');
  
  const lead = await getLeadByReference(reference.toUpperCase());
  
  if (!lead) {
    notFound();
  }
  
  const experienceName = lead.experiences[`name_${locale}`] || lead.experiences.name_en;
  
  // Status colors and icons
  const statusConfig = {
    sent: {
      color: 'bg-blue-100 text-blue-800',
      icon: '📤',
      message: t('status.sent')
    },
    confirmed: {
      color: 'bg-green-100 text-green-800',
      icon: '✅',
      message: t('status.confirmed')
    },
    completed: {
      color: 'bg-gray-100 text-gray-800',
      icon: '🎉',
      message: t('status.completed')
    }
  };
  
  const status = statusConfig[lead.status as keyof typeof statusConfig] || statusConfig.sent;
  
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Success Banner */}
      <section className="bg-green-50 border-b border-green-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-green-800 font-medium">{t('found')}</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-8">
              <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
              <p className="text-xl opacity-90">{reference}</p>
            </div>
            
            {/* Details */}
            <div className="p-8">
              {/* Status */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('currentStatus')}</h2>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{status.icon}</span>
                  <div>
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${status.color}`}>
                      {status.message}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      {t('lastUpdate')}: {new Date(lead.created_at).toLocaleDateString(locale)}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Booking Details */}
              <div className="border-t pt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('bookingDetails')}</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t('experience')}</p>
                    <p className="font-semibold text-gray-900">{experienceName}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t('name')}</p>
                    <p className="font-semibold text-gray-900">{lead.customer_name}</p>
                  </div>
                  
                  {lead.preferred_date && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{t('preferredDate')}</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(lead.preferred_date).toLocaleDateString(locale)}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t('guests')}</p>
                    <p className="font-semibold text-gray-900">{lead.guests}</p>
                  </div>
                </div>
                
                {lead.message && (
                  <div className="mt-6">
                    <p className="text-sm text-gray-600 mb-1">{t('message')}</p>
                    <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{lead.message}</p>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="border-t mt-8 pt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('needHelp')}</h2>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <WhatsAppButton
                    message={`Hi! I'm checking on my booking ${reference}`}
                    className="flex-1 bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors font-semibold text-center"
                  >
                    Contact on WhatsApp
                  </WhatsAppButton>
                  
                  <Link 
                    href={`/${locale}`}
                    className="flex-1 bg-gray-200 text-gray-900 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-center"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Timeline */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('timeline')}</h2>
            
            <div className="space-y-6">
              {/* Request Sent */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    lead.status !== 'sent' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-900">{t('steps.sent.title')}</h3>
                  <p className="text-sm text-gray-600">{t('steps.sent.description')}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(lead.created_at).toLocaleString(locale)}
                  </p>
                </div>
              </div>
              
              {/* Partner Confirmation */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    lead.status === 'confirmed' || lead.status === 'completed' 
                      ? 'bg-green-100' 
                      : 'bg-gray-200'
                  }`}>
                    {lead.status === 'confirmed' || lead.status === 'completed' ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    )}
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-900">{t('steps.confirmed.title')}</h3>
                  <p className="text-sm text-gray-600">{t('steps.confirmed.description')}</p>
                  {lead.status === 'sent' && (
                    <p className="text-xs text-amber-600 mt-1">{t('steps.confirmed.waiting')}</p>
                  )}
                </div>
              </div>
              
              {/* Activity Completed */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    lead.status === 'completed' ? 'bg-green-100' : 'bg-gray-200'
                  }`}>
                    {lead.status === 'completed' ? (
                      <span className="text-xl">🎉</span>
                    ) : (
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    )}
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-900">{t('steps.completed.title')}</h3>
                  <p className="text-sm text-gray-600">{t('steps.completed.description')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
