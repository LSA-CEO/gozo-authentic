'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    twoFactorCode: ''
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        twoFactorCode: formData.twoFactorCode,
        redirect: false
      });
      
      if (result?.error) {
        switch (result.error) {
          case '2FA_REQUIRED':
            setShowTwoFactor(true);
            setError('Veuillez entrer votre code 2FA');
            break;
          case 'INVALID_2FA_CODE':
            setError('Code 2FA invalide');
            break;
          case 'TOO_MANY_ATTEMPTS':
            setError('Trop de tentatives. Veuillez réessayer dans 5 minutes.');
            break;
          case 'IP_NOT_ALLOWED':
            setError('Accès non autorisé depuis cette adresse IP');
            break;
          default:
            setError('Email ou mot de passe incorrect');
        }
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch (error) {
      setError('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-2xl font-light text-gray-900 mb-6 text-center">
            Administration
          </h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-md font-medium text-black mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                disabled={showTwoFactor}
              />
            </div>
            
            <div>
              <label className="block text-md font-medium text-black mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                disabled={showTwoFactor}
              />
            </div>
            
            {showTwoFactor && (
              <div>
                <label className="block text-md font-medium text-black mb-1">
                  Code 2FA
                </label>
                <input
                  type="text"
                  required
                  value={formData.twoFactorCode}
                  onChange={(e) => setFormData({...formData, twoFactorCode: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="123456"
                  maxLength={6}
                  autoFocus
                />
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 text-white py-3 rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Connexion sécurisée avec authentification à deux facteurs
            </p>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            IP: Votre connexion est surveillée
          </p>
        </div>
      </div>
    </div>
  );
}
