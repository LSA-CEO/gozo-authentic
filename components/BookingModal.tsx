'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { WhatsAppButton } from './WhatsAppButton';
import { generateLeadReference } from '../lib/utils';
import Link from 'next/link';
import Image from 'next/image';

interface Experience {
  id: string;
  name_en: string;
  name_fr: string;
  [key: string]: any;
}

interface BookingModalProps {
  experience: Experience;
  onClose: () => void;
}

export function BookingModal({ experience, onClose }: BookingModalProps) {
  const locale = useLocale();
  const [showForm, setShowForm] = useState(false);
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
  
  // Get image URL
  const getExperienceImage = (id: string) => {
    switch(id) {
      case '1': return '/images/experiences/quad-gozo.jpg';
      case '2': return '/images/experiences/boat-trip.jpg';
      case '3': return '/images/experiences/jetski.jpg';
      case '4': return '/images/experiences/restaurant.jpg';
      default: return '/images/experiences/default.jpg';
    }
  };
  
  const imageUrl = experience.images?.[0]?.url || getExperienceImage(experience.id);
  
  // Textes détaillés pour chaque expérience
  const getDetailedDescription = (id: string) => {
    const descriptions: Record<string, { en: string; fr: string }> = {
      '1': {
        en: `Embark on an exhilarating quad bike adventure through Gozo's rugged landscapes. Our experienced guide Joseph will lead you through ancient valleys, past crumbling watchtowers, and along dramatic clifftops that offer breathtaking views of the Mediterranean.

This 3-hour journey takes you far from the tourist trails, into the heart of authentic Gozo. You'll discover hidden caves where pirates once sheltered, traverse salt pans that have been harvested for centuries, and feel the thrill of conquering challenging terrain.

Perfect for adventure seekers, this tour combines adrenaline with culture, as Joseph shares stories of Gozo's rich history and points out secret spots only locals know.`,
        fr: `Embarquez pour une aventure exaltante en quad à travers les paysages accidentés de Gozo. Notre guide expérimenté Joseph vous mènera à travers des vallées anciennes, devant des tours de guet en ruines et le long de falaises spectaculaires offrant des vues à couper le souffle sur la Méditerranée.

Ce voyage de 3 heures vous emmène loin des sentiers touristiques, au cœur du Gozo authentique. Vous découvrirez des grottes cachées où les pirates se réfugiaient autrefois, traverserez des salines exploitées depuis des siècles et ressentirez le frisson de conquérir des terrains difficiles.

Parfait pour les amateurs d'aventure, ce tour combine adrénaline et culture, alors que Joseph partage des histoires de la riche histoire de Gozo et indique des endroits secrets que seuls les locaux connaissent.`
      },
      '2': {
        en: `Set sail on crystal-clear waters for an unforgettable day exploring Gozo's stunning coastline. Captain Lorenzo, a third-generation fisherman, knows every hidden cove and secret swimming spot around the island.

Your journey includes stops at the famous Blue Lagoon, where you can swim in impossibly turquoise waters, and lesser-known gems where you'll have the sea to yourself. Explore mysterious sea caves carved by centuries of waves, and snorkel above vibrant underwater landscapes teeming with Mediterranean marine life.

Lorenzo provides fresh fruit, local wine, and traditional Gozitan snacks throughout the day. As the sun begins to set, you'll anchor in a secluded bay for a magical golden hour that photographers dream of.`,
        fr: `Naviguez sur des eaux cristallines pour une journée inoubliable à explorer la côte époustouflante de Gozo. Le capitaine Lorenzo, pêcheur de troisième génération, connaît chaque crique cachée et spot de baignade secret autour de l'île.

Votre voyage comprend des arrêts au célèbre Blue Lagoon, où vous pourrez nager dans des eaux turquoise impossibles, et des joyaux moins connus où vous aurez la mer pour vous seul. Explorez des grottes marines mystérieuses sculptées par des siècles de vagues, et faites du snorkeling au-dessus de paysages sous-marins vibrants grouillant de vie marine méditerranéenne.

Lorenzo fournit des fruits frais, du vin local et des collations traditionnelles gozitaines tout au long de la journée. Alors que le soleil commence à se coucher, vous jetterez l'ancre dans une baie isolée pour une heure dorée magique dont les photographes rêvent.`
      },
      '3': {
        en: `Feel the rush of pure freedom as you race across Gozo's azure waters on a high-performance jet ski. Chris, your certified instructor and local water sports enthusiast, will guide you to the most spectacular spots along the coastline.

This isn't just about speed – it's about experiencing Gozo from a thrilling new perspective. Zoom past towering cliffs, explore sea caves accessible only by water, and stop at secluded spots for cliff jumping (optional for the brave!).

Chris knows the waters like the back of his hand and will adapt the route based on conditions and your experience level. Whether you're a beginner or an experienced rider, this hour of pure adrenaline will be the highlight of your Gozo adventure.`,
        fr: `Ressentez la montée d'adrénaline de la liberté pure en fonçant sur les eaux azur de Gozo sur un jet ski haute performance. Chris, votre instructeur certifié et passionné de sports nautiques local, vous guidera vers les endroits les plus spectaculaires le long de la côte.

Il ne s'agit pas seulement de vitesse – il s'agit de découvrir Gozo sous un angle nouveau et palpitant. Foncez devant des falaises imposantes, explorez des grottes marines accessibles uniquement par l'eau, et arrêtez-vous dans des endroits isolés pour du saut de falaise (optionnel pour les courageux !).

Chris connaît les eaux comme sa poche et adaptera l'itinéraire en fonction des conditions et de votre niveau d'expérience. Que vous soyez débutant ou pilote expérimenté, cette heure d'adrénaline pure sera le point culminant de votre aventure à Gozo.`
      },
      '4': {
        en: `Indulge in an authentic Gozitan culinary journey at a hidden gem restaurant perched on the cliffs overlooking Xlendi Bay. This family-run establishment has been serving traditional recipes passed down through generations, using only the freshest local ingredients.

Your evening begins with a selection of local appetizers – ġbejniet (Gozo cheese), sun-dried tomatoes, and crusty Maltese bread drizzled with golden olive oil from nearby groves. The main course features the catch of the day, grilled to perfection, or the restaurant's famous rabbit stew, slow-cooked in wine and herbs.

As you dine, the sun sets over the Mediterranean, painting the sky in shades of orange and pink. The owner often joins guests to share stories of Gozo's culinary traditions and may even reveal the secret ingredients that make their dishes unforgettable.`,
        fr: `Offrez-vous un voyage culinaire gozitain authentique dans un restaurant caché perché sur les falaises surplombant la baie de Xlendi. Cet établissement familial sert des recettes traditionnelles transmises de génération en génération, en utilisant uniquement les ingrédients locaux les plus frais.

Votre soirée commence par une sélection d'apéritifs locaux – ġbejniet (fromage de Gozo), tomates séchées au soleil et pain maltais croustillant arrosé d'huile d'olive dorée des oliveraies voisines. Le plat principal propose la pêche du jour, grillée à la perfection, ou le fameux ragoût de lapin du restaurant, mijoté dans du vin et des herbes.

Pendant que vous dînez, le soleil se couche sur la Méditerranée, peignant le ciel dans des tons d'orange et de rose. Le propriétaire rejoint souvent les invités pour partager des histoires sur les traditions culinaires de Gozo et peut même révéler les ingrédients secrets qui rendent leurs plats inoubliables.`
      }
    };
    
    return descriptions[id]?.[locale as 'en' | 'fr'] || descriptions[id]?.en || description;
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
    
    const whatsappMessage = `
🎯 New Booking Request - ${reference}
📍 Experience: ${name}
👤 Name: ${formData.name}
📱 Phone: ${formData.phone}
📧 Email: ${formData.email}
📅 Preferred Date: ${formData.preferredDate}
👥 Guests: ${formData.guests}
💬 Message: ${formData.message}
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
          partner_type: experience.partner_id
        })
      });
      
      if (response.ok) {
        setSubmitResult({ success: true, reference });
        setTimeout(() => {
          window.open(`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`);
        }, 1000);
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      setSubmitResult({ 
        success: false, 
        error: 'Something went wrong. Please try again.' 
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
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <button 
              onClick={onClose}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Request Sent!</h2>
              <p className="text-gray-600 mb-4">Your reference code is:</p>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6">
                <code className="text-xl font-mono font-bold text-gray-900">
                  {submitResult.reference}
                </code>
              </div>
              
              <p className="text-sm text-gray-600 mb-6">
                Save this code to track your booking
              </p>
              
              <div className="space-y-2">
                <Link
                  href={`/${locale}/track/${submitResult.reference}`}
                  className="block w-full bg-amber-500 text-white py-3 px-4 rounded-lg hover:bg-amber-600 transition-all font-semibold"
                >
                  Track Your Booking
                </Link>
                
                <button
                  onClick={onClose}
                  className="block w-full text-gray-600 py-2 hover:text-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Main Modal - Taille fixe maintenue
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        {/* Modal avec taille fixe */}
        <div className="relative bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden">
          {/* Close button outside modal */}
          <button 
            onClick={onClose}
            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors md:hidden"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="grid md:grid-cols-2">
            {/* Left side - Image and info - Hauteur fixe */}
            <div className="relative h-64 md:h-[600px] bg-gray-100">
              <Image
                src={imageUrl}
                alt={name as string}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              {/* Content overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="text-3xl mb-2">
                  {experience.id === '1' && '🏍️'}
                  {experience.id === '2' && '⛵'}
                  {experience.id === '3' && '🌊'}
                  {experience.id === '4' && '🍽️'}
                </div>
                <h2 className="text-2xl font-bold mb-2">{name}</h2>
                
                {/* Duration */}
                <div className="flex items-center gap-2 text-white/80 text-sm mb-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    {experience.id === '1' && '3 hours'}
                    {experience.id === '2' && 'Full day'}
                    {experience.id === '3' && '1 hour'}
                    {experience.id === '4' && '2-3 hours'}
                  </span>
                </div>
                
                {/* Price */}
                {experience.price_from && (
                  <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-sm font-semibold">From €{experience.price_from}</span>
                  </div>
                )}
              </div>
              
              {/* Close button for desktop */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors hidden md:block"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Right side - Hauteur fixe avec contenu qui change */}
            <div className="relative h-[600px] overflow-hidden">
              {/* Description View */}
              <div className={`absolute inset-0 p-6 md:p-8 overflow-y-auto transition-all duration-500 ${
                showForm ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'
              }`}>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Discover Your Adventure</h3>
                
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {getDetailedDescription(experience.id)}
                  </p>
                </div>
                
                <div className="mt-8 p-6 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-gray-800 text-center">
                    Ready to experience this incredible adventure?{' '}
                    <button
                      onClick={() => setShowForm(true)}
                      className="text-amber-600 hover:text-amber-700 font-bold underline decoration-2 underline-offset-2 transition-colors"
                    >
                      Book your spot now
                    </button>
                  </p>
                </div>
              </div>
              
              {/* Form View */}
              <div className={`absolute inset-0 p-6 md:p-8 overflow-y-auto transition-all duration-500 ${
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
                  <h3 className="text-xl font-bold text-gray-900">Book Your Experience</h3>
                </div>
                
                {submitResult?.error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {submitResult.error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1 text-sm">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent placeholder-gray-400"
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-medium mb-1 text-sm">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent placeholder-gray-400"
                        placeholder="+356 9999 9999"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-1 text-sm">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent placeholder-gray-400"
                      placeholder="john@example.com"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1 text-sm">Preferred Date</label>
                      <input
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-medium mb-1 text-sm">Guests</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.guests}
                        onChange={(e) => setFormData({...formData, guests: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-1 text-sm">Message (Optional)</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none placeholder-gray-400"
                      placeholder="Special requests..."
                    />
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          Send via WhatsApp
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>
                
                <div className="mt-6 pt-4 border-t text-center">
                  <p className="text-sm text-gray-600">
                    Already have a booking?{' '}
                    <Link href={`/${locale}/track`} className="text-amber-600 hover:text-amber-700 font-semibold">
                      Track it here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
