'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function CreateAdminUser() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    role: 'admin',
    enable2FA: true
  });
  const [result, setResult] = useState<any>(null);
  
  const handleCreate = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (formData.password.length < 8) {
      alert('Le mot de passe doit faire au moins 8 caractères');
      return;
    }
    
    setIsCreating(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          password: formData.password,
          role: formData.role,
          enable2FA: formData.enable2FA
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        alert(data.error || 'Erreur lors de la création');
        return;
      }
      
      // Si 2FA activé, afficher le QR code
      if (formData.enable2FA && data.qrCode) {
        setResult(data);
      } else {
        setIsModalOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      alert('Erreur lors de la création');
    } finally {
      setIsCreating(false);
    }
  };
  
  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
      role: 'admin',
      enable2FA: true
    });
    setResult(null);
    setIsModalOpen(false);
    router.refresh();
  };
  
  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-gray-900 text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
      >
        Nouvel admin
      </button>
      
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => !result && setIsModalOpen(false)} />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              {!result ? (
                <>
                  <h3 className="text-xl font-medium text-gray-900 mb-4">
                    Nouvel utilisateur admin
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-md font-medium text-black mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900 text-black bg-white"                        />
                      </div>
                      
                      <div>
                        <label className="block text-md font-medium text-black mb-1">
                          Nom *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900 text-black bg-white"                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-md font-medium text-black mb-1">
                          Mot de passe *
                        </label>
                        <input
                          type="password"
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900 text-black bg-white"                          placeholder="Min. 8 caractères"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-md font-medium text-black mb-1">
                          Confirmer mot de passe *
                        </label>
                        <input
                          type="password"
                          required
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900 text-black bg-white"                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-md font-medium text-black mb-1">
                        Rôle
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900 text-black bg-white"                      >
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </div>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.enable2FA}
                        onChange={(e) => setFormData({...formData, enable2FA: e.target.checked})}
                        className="rounded text-gray-900"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Activer l'authentification à deux facteurs (recommandé)
                      </span>
                    </label>
                  </div>
                  
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-900"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleCreate}
                      disabled={!formData.email || !formData.name || !formData.password || isCreating}
                      className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-50"
                    >
                      {isCreating ? 'Création...' : 'Créer'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-medium text-gray-900 mb-4">
                    Utilisateur créé avec succès
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded p-4">
                      <p className="text-green-800">
                        L'utilisateur <strong>{result.user.email}</strong> a été créé avec succès.
                      </p>
                    </div>
                    
                    {result.qrCode && (
                      <>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-4">
                            Scannez ce QR code avec Google Authenticator
                          </p>
                          <div 
                            className="inline-block p-4 bg-white border-2 border-gray-300 rounded"
                            dangerouslySetInnerHTML={{ __html: result.qrCode }}
                          />
                        </div>
                        
                        <div className="bg-gray-50 rounded p-4">
                          <p className="text-sm text-gray-600 mb-2">Secret 2FA (conservez-le en sécurité) :</p>
                          <code className="block text-xs bg-white p-2 rounded border">
                            {result.secret}
                          </code>
                        </div>
                      </>
                    )}
                    
                    <button
                      onClick={resetForm}
                      className="w-full px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
                    >
                      Fermer
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
