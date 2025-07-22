'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { generateLeadReference } from '../lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import type { ContactModalProps, ExperienceWithDetails } from '../types';

export function ContactModal({ experience, onClose }: ContactModalProps) {
  const locale = useLocale();
  const [showForm, setShowForm] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    preferredDate: '',
    guests: 1,
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    reference?: string;
    error?: string;
  } | null>(null);
  
  const name = experience[`name_${locale}`] || experience.name_en;
  const description = experience[`description_${locale}`] || experience.description_en;
  const ourStory = experience[`our_story_${locale}`] || experience.our_story_en || '';
  const tips = experience[`tips_${locale}`] || experience.tips_en || '';
  
  const categoryName = (experience.category as any)?.[`name_${locale}`] || experience.category?.name_en || '';
  const partnerName = experience.partner_name || 'notre partenaire';
  
  // Construire la liste des images (featured + gallery)
  const allImages = [];
  if (experience.featured_image_url) {
    allImages.push(experience.featured_image_url);
  }
  if (experience.gallery_urls && experience.gallery_urls.length > 0) {
    allImages.push(...experience.gallery_urls);
  }
  if (experience.images?.[0]?.url) {
    allImages.push(experience.images[0].url);
  }
  if (allImages.length === 0) {
    allImages.push('/images/experiences/default.jpg');
  }
  
  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };
  
  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };
  
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const reference = generateLeadReference();
    
    // Message WhatsApp simple et professionnel
    const whatsappMessage = `
Nouvelle demande - ${reference}
${name}
${formData.name}
${formData.phone}
${formData.email}
${formData.preferredDate || 'Flexible'}
${formData.guests} personne(s)
${formData.message || 'Pas de message'}

Via Flav & Jade - GoZo Authentic
    `.trim();
    
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experience_id: experience.id,
          reference_code: reference,
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_email: formData.email,
          preferred_date: formData.preferredDate,
          guests: formData.guests,
          message: formData.message,
          category_slug: experience.category?.slug,
          locale: locale,
          partner_type: experience.partner_id
        })
      });
      
      if (response.ok) {
        setSubmitResult({ success: true, reference });
        
        // Ajouter au carnet local
        if (typeof window !== 'undefined') {
          const carnetEntry = {
            experienceId: experience.id,
            experienceName: name as string,
            categorySlug: experience.category?.slug || '',
            categoryName: categoryName,
            partnerName: partnerName,
            addedAt: new Date(),
            contacted: true,
            contactedAt: new Date(),
            budget: experience.price_from,
            locale: locale,
            tags: experience.tags?.map(t => t.slug) || []
          };
          
          const existingCarnet = JSON.parse(localStorage.getItem('gozo-carnet') || '[]');
          existingCarnet.push(carnetEntry);
          localStorage.setItem('gozo-carnet', JSON.stringify(existingCarnet));
        }
        
        // Ouvrir WhatsApp après un délai
        setTimeout(() => {
          const whatsappNumber = experience.partner_whatsapp || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
          window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`);
        }, 1000);
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      setSubmitResult({ 
        success: false, 
        error: locale === 'fr' ? 'Une erreur est survenue. Veuillez réessayer.' : 'Something went wrong. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Success Screen
  if (submitResult?.success) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg max-w-md w-full p-8 shadow-2xl">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-light text-gray-900 mb-2">
                {locale === 'fr' ? 'Contact envoyé' : 'Contact Sent'}
              </h2>
              <p className="text-gray-600 mb-4">
                {locale === 'fr' ? 'Votre référence' : 'Your reference'}
              </p>
              
              <div className="bg-gray-50 border border-gray-200 rounded px-4 py-3 mb-6">
                <code className="text-lg font-mono text-gray-900">
                  {submitResult.reference}
                </code>
              </div>
              
              <p className="text-sm text-gray-600 mb-6">
                {locale === 'fr' 
                  ? `Les coordonnées ont été envoyées à ${formData.email}`
                  : `Contact details have been sent to ${formData.email}`
                }
              </p>
              
              <div className="space-y-3">
                <Link
                  href={`/${locale}/carnet`}
                  className="block w-full bg-gray-900 text-white py-3 px-4 rounded hover:bg-gray-800 transition-colors"
                >
                  {locale === 'fr' ? 'Voir mon carnet' : 'View my notebook'}
                </Link>
                
                <button
                  onClick={onClose}
                  className="block w-full text-gray-600 py-2 hover:text-gray-800 transition-colors"
                >
                  {locale === 'fr' ? 'Fermer' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Main Modal
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg w-full max-w-4xl shadow-2xl overflow-hidden">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors bg-white rounded-full p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="grid md:grid-cols-2">
            {/* Left side - Image with carousel */}
            <div className="relative h-64 md:h-[600px] bg-gray-100">
              <Image
                src={allImages[currentImageIndex]}
                alt={`${name} - Image ${currentImageIndex + 1}`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Navigation arrows - only show if more than 1 image */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={handlePreviousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  {/* Image indicators */}
                  <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
                    {allImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex 
                            ? 'bg-white w-8' 
                            : 'bg-white/50 hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
              
              {/* Nom de l'expérience en bas */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h2 className="text-2xl font-light mb-2">{name}</h2>
                {categoryName && (
                  <p className="text-white/80 text-sm">{categoryName}</p>
                )}
              </div>
            </div>
            
            {/* Right side */}
            <div className="relative">
              {/* Description View */}
              <div className={`absolute inset-0 p-8 overflow-y-auto transition-all duration-500 ${
                showForm ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'
              }`}>
                <h3 className="text-xl font-light text-gray-900 mb-6">
                  {locale === 'fr' ? 'À propos' : 'About'}
                </h3>
                
                {/* Description */}
                {description && (
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    {description}
                  </p>
                )}
                
                {/* Histoire personnelle */}
                {ourStory && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {locale === 'fr' ? 'Notre histoire' : 'Our story'}
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {ourStory}
                    </p>
                  </div>
                )}
                
                {/* Tips */}
                {tips && (
                  <div className="mb-6 p-4 bg-gray-50 rounded">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {locale === 'fr' ? 'Bon à savoir' : 'Good to know'}
                    </h4>
                    <p className="text-gray-600 text-sm">{tips}</p>
                  </div>
                )}
                
                {/* Tags */}
                {experience.tags && experience.tags.length > 0 && (
                  <div className="mb-8">
                    <div className="flex flex-wrap gap-2">
                      {experience.tags.map(tag => (
                        <span key={tag.id} className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                          {(tag as any)[`name_${locale}`] || tag.name_en}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full bg-gray-900 text-white py-3 px-6 rounded hover:bg-gray-800 transition-colors"
                >
                  {locale === 'fr' ? 'Contacter' : 'Contact'}
                </button>
              </div>
              
              {/* Form View */}
              <div className={`absolute inset-0 p-8 overflow-y-auto transition-all duration-500 ${
                !showForm ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
              }`}>
                <div className="flex items-center mb-6">
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors mr-3"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h3 className="text-xl font-light text-gray-900">
                    {locale === 'fr' ? 'Vos informations' : 'Your Information'}
                  </h3>
                </div>
                
                {submitResult?.error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    {submitResult.error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-1 text-sm">
                      {locale === 'fr' ? 'Nom' : 'Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-1 text-sm">
                      {locale === 'fr' ? 'Téléphone' : 'Phone'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-1 text-sm">
                      {locale === 'fr' ? 'Email' : 'Email'}
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">
                        {locale === 'fr' ? 'Date souhaitée' : 'Preferred Date'}
                      </label>
                      <input
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-1 text-sm">
                        {locale === 'fr' ? 'Personnes' : 'Guests'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.guests}
                        onChange={(e) => setFormData({...formData, guests: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-1 text-sm">
                      {locale === 'fr' ? 'Message (optionnel)' : 'Message (optional)'}
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900 focus:border-transparent resize-none"
                    />
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gray-900 text-white py-3 px-6 rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          {locale === 'fr' ? 'Envoi...' : 'Sending...'}
                        </>
                      ) : (
                        <>
                          {locale === 'fr' ? 'Envoyer' : 'Send'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
