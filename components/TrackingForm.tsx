'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export function TrackingForm() {
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const locale = useLocale();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!reference.trim()) {
      setError('Please enter your reference code');
      return;
    }
    
    // Nettoyer et formatter le code
    const cleanReference = reference.trim().toUpperCase();
    
    // Rediriger vers la page de détails
    router.push(`/${locale}/track/${cleanReference}`);
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-2">
            Reference Code
          </label>
          <input
            type="text"
            id="reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. GA-20241220-ABCD"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-lg font-mono"
            autoComplete="off"
            autoFocus
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
        
        <button
          type="submit"
          className="w-full bg-amber-500 text-white py-3 px-6 rounded-lg hover:bg-amber-600 transition-colors font-semibold text-lg"
        >
          Track My Request
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Lost your reference code?{' '}
          <a href={`https://wa.me/33612342642?text=Hi, I lost my reference code`} 
             className="text-amber-600 hover:text-amber-700 font-medium">
            Contact us on WhatsApp
          </a>
        </p>
      </div>
    </div>
  );
}
