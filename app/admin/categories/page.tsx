'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { CreateCategory } from '../../../components/admin/CreateCategory';
import { CategoryActions } from '../../../components/admin/CategoryActions';

interface Category {
  id: string;
  slug: string;
  position: number;
  is_active: boolean;
  name_fr: string;
  name_en: string;
  name_de: string;
  name_it: string;
  name_nl: string;
  name_es: string;
  name_pt: string;
  description_fr: string;
  description_en: string;
  description_de: string;
  description_it: string;
  description_nl: string;
  description_es: string;
  description_pt: string;
  image_url: string | null;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const moveCategory = async (id: string, direction: 'up' | 'down') => {
    const index = categories.findIndex(cat => cat.id === id);
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === categories.length - 1)
    ) {
      return;
    }

    const newCategories = [...categories];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Échanger les positions
    const tempPosition = newCategories[index].position;
    newCategories[index].position = newCategories[newIndex].position;
    newCategories[newIndex].position = tempPosition;
    
    // Échanger dans l'array
    [newCategories[index], newCategories[newIndex]] = [newCategories[newIndex], newCategories[index]];
    
    setCategories(newCategories);

    // Sauvegarder les nouvelles positions
    try {
      await fetch(`/api/admin/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          position: newCategories.find(c => c.id === id)?.position 
        })
      });
      
      await fetch(`/api/admin/categories/${newCategories[newIndex].id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          position: newCategories[newIndex].position 
        })
      });
    } catch (error) {
      console.error('Error updating positions:', error);
      loadCategories(); // Recharger en cas d'erreur
    }
  };

  if (isLoading) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-light text-gray-900">Catégories</h1>
        <CreateCategory onCategoryCreated={loadCategories} />
      </div>
      
      <div className="grid gap-6">
        {categories.map((category, index) => (
          <div 
            key={category.id} 
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
          >
            <div className="flex items-center gap-6">
              {/* Image de la catégorie */}
              <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {category.image_url ? (
                  <Image
                    src={category.image_url}
                    alt={category.name_fr}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Infos de la catégorie */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-medium text-gray-900">
                      {category.name_fr}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {category.name_en}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    category.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                {category.description_fr && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {category.description_fr}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    /{category.slug}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    Position {category.position}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => moveCategory(category.id, 'up')}
                  disabled={index === 0}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Monter"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => moveCategory(category.id, 'down')}
                  disabled={index === categories.length - 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Descendre"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="w-px h-8 bg-gray-200 mx-2" />
                <CategoryActions category={category} onUpdate={loadCategories} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
