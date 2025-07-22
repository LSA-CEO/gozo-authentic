'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface TranslationResult {
  id: string;
  type: string;
  name: string;
  status: 'pending' | 'translating' | 'success' | 'error';
  message?: string;
  translations?: Record<string, Record<string, string>>;
  timestamp?: string;
}

interface ContentItem {
  id: string;
  name: string;
  type: string;
  hasTranslations: boolean;
}

export default function AdminTranslations() {
  const [activeTab, setActiveTab] = useState<'quick' | 'bulk' | 'history'>('quick');
  const [isTranslating, setIsTranslating] = useState(false);
  const [results, setResults] = useState<TranslationResult[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [testText, setTestText] = useState('');
  const [testResults, setTestResults] = useState<Record<string, string> | null>(null);
  const [translationSpeed, setTranslationSpeed] = useState<number | null>(null);

  const languages = [
    { code: 'en', name: 'Anglais', flag: '🇬🇧' },
    { code: 'de', name: 'Allemand', flag: '🇩🇪' },
    { code: 'it', name: 'Italien', flag: '🇮🇹' },
    { code: 'nl', name: 'Néerlandais', flag: '🇳🇱' },
    { code: 'es', name: 'Espagnol', flag: '🇪🇸' },
    { code: 'pt', name: 'Portugais', flag: '🇵🇹' }
  ];

  // Charger les contenus disponibles
  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      // Simuler le chargement du contenu
      const items: ContentItem[] = [
        { id: 'cat-1', name: 'Nos aventures en mer', type: 'category', hasTranslations: false },
        { id: 'cat-2', name: 'Nos folies terrestres', type: 'category', hasTranslations: true },
        { id: 'exp-1', name: 'Tour en bateau Crystal Lagoon', type: 'experience', hasTranslations: false },
        { id: 'exp-2', name: 'Aventure Jet Ski', type: 'experience', hasTranslations: false },
      ];
      setContentItems(items);
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };

  const testTranslation = async () => {
    if (!testText.trim()) return;
    
    setIsTranslating(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts: { test: testText },
          targetLanguages: ['en', 'de', 'it', 'nl', 'es', 'pt']
        })
      });

      const translations = await response.json();
      const endTime = Date.now();
      
      setTranslationSpeed(endTime - startTime);
      
      // Extraire les traductions du format retourné
      const results: Record<string, string> = {};
      languages.forEach(lang => {
        results[lang.code] = translations[lang.code]?.test || 'Erreur';
      });
      
      setTestResults(results);
    } catch (error) {
      console.error('Translation error:', error);
      alert('Erreur lors de la traduction');
    } finally {
      setIsTranslating(false);
    }
  };

  const translateContent = async (contentType: string) => {
    const resultId = Date.now().toString();
    const result: TranslationResult = {
      id: resultId,
      type: contentType,
      name: contentType === 'all' ? 'Tout le contenu' : `Les ${contentType}`,
      status: 'translating'
    };
    
    setResults(prev => [result, ...prev]);
    setIsTranslating(true);

    try {
      const response = await fetch('/api/admin/translate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType })
      });

      const data = await response.json();
      
      setResults(prev => prev.map(r => 
        r.id === resultId 
          ? { ...r, status: 'success', message: data.message, timestamp: new Date().toLocaleString() }
          : r
      ));
    } catch (error) {
      setResults(prev => prev.map(r => 
        r.id === resultId 
          ? { ...r, status: 'error', message: 'Erreur lors de la traduction', timestamp: new Date().toLocaleString() }
          : r
      ));
    } finally {
      setIsTranslating(false);
    }
  };

  const translateSelected = async () => {
    if (selectedItems.length === 0) return;
    
    for (const itemId of selectedItems) {
      const item = contentItems.find(i => i.id === itemId);
      if (item) {
        await translateContent(item.type);
      }
    }
    
    setSelectedItems([]);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-light text-gray-900">Centre de traduction</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            API Groq connectée
          </span>
          <span className="text-gray-400">|</span>
          <span>Modèle : Llama 3 8B</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('quick')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'quick'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Test rapide
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'bulk'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Traduction en masse
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm relative ${
              activeTab === 'history'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Historique
            {results.length > 0 && (
              <span className="absolute -top-1 -right-3 bg-gray-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {results.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Quick Test Tab */}
      {activeTab === 'quick' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Tester la traduction</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texte en français
                </label>
                <textarea
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
                  placeholder="Entrez un texte à traduire..."
                />
              </div>
              
              <button
                onClick={testTranslation}
                disabled={isTranslating || !testText.trim()}
                className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isTranslating ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Traduction en cours...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    Traduire
                  </>
                )}
              </button>
              
              {translationSpeed && (
                <p className="text-sm text-gray-600 text-center">
                  Temps de traduction : {translationSpeed}ms
                </p>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Résultats</h2>
            
            {testResults ? (
              <div className="space-y-3">
                {languages.map(lang => (
                  <div key={lang.code} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <span className="text-lg">{lang.flag}</span>
                        {lang.name}
                      </span>
                      <button
                        onClick={() => navigator.clipboard.writeText(testResults[lang.code])}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Copier
                      </button>
                    </div>
                    <p className="text-sm text-gray-900">{testResults[lang.code]}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                Les traductions apparaîtront ici
              </p>
            )}
          </div>
        </div>
      )}

      {/* Bulk Translation Tab */}
      {activeTab === 'bulk' && (
        <div className="space-y-6">
          {/* Actions rapides */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => translateContent('categories')}
                disabled={isTranslating}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                <div className="text-3xl mb-2">📁</div>
                <h3 className="font-medium text-gray-900">Catégories</h3>
                <p className="text-sm text-gray-600 mt-1">Traduire toutes les catégories</p>
              </button>
              
              <button
                onClick={() => translateContent('tags')}
                disabled={isTranslating}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                <div className="text-3xl mb-2">🏷️</div>
                <h3 className="font-medium text-gray-900">Tags</h3>
                <p className="text-sm text-gray-600 mt-1">Traduire tous les tags</p>
              </button>
              
              <button
                onClick={() => translateContent('experiences')}
                disabled={isTranslating}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="font-medium text-gray-900">Expériences</h3>
                <p className="text-sm text-gray-600 mt-1">Traduire toutes les expériences</p>
              </button>
              
              <button
                onClick={() => translateContent('site_content')}
                disabled={isTranslating}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                <div className="text-3xl mb-2">📄</div>
                <h3 className="font-medium text-gray-900">Contenu du site</h3>
                <p className="text-sm text-gray-600 mt-1">Traduire les pages statiques</p>
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <button
                onClick={() => translateContent('all')}
                disabled={isTranslating}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Traduire TOUT le site
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Information importante</p>
                <p>La traduction complète peut prendre plusieurs minutes selon le nombre d'éléments. Les traductions sont effectuées progressivement pour éviter de surcharger l'API.</p>
              </div>
            </div>
          </div>

          {/* Sélection manuelle */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Sélection manuelle</h2>
              {selectedItems.length > 0 && (
                <button
                  onClick={translateSelected}
                  className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                >
                  Traduire la sélection ({selectedItems.length})
                </button>
              )}
            </div>
            
            <div className="space-y-2">
              {contentItems.map(item => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems([...selectedItems, item.id]);
                      } else {
                        setSelectedItems(selectedItems.filter(id => id !== item.id));
                      }
                    }}
                    className="rounded text-gray-900"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {item.type === 'category' ? 'Catégorie' : 'Expérience'}
                    </span>
                  </div>
                  {item.hasTranslations && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Déjà traduit
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Historique des traductions</h2>
          
          {results.length > 0 ? (
            <div className="space-y-3">
              {results.map(result => (
                <div
                  key={result.id}
                  className={`p-4 rounded-lg border ${
                    result.status === 'success' 
                      ? 'border-green-200 bg-green-50' 
                      : result.status === 'error'
                      ? 'border-red-200 bg-red-50'
                      : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {result.status === 'translating' && (
                        <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      )}
                      {result.status === 'success' && (
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {result.status === 'error' && (
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{result.name}</p>
                        <p className="text-sm text-gray-600">{result.message || 'En cours...'}</p>
                      </div>
                    </div>
                    {result.timestamp && (
                      <span className="text-xs text-gray-500">{result.timestamp}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">
              Aucune traduction effectuée pour le moment
            </p>
          )}
        </div>
      )}
    </div>
  );
}
