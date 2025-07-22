'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Category {
  id: string;
  slug: string;
  position: number;
  is_active: boolean;
  name_fr: string;
  name_en: string;
  description_fr: string;
  description_en: string;
  image_url: string | null;
}

interface CategoryActionsProps {
  category: Category;
  onUpdate?: () => void;
}

export function CategoryActions({ category, onUpdate }: CategoryActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [draggedOver, setDraggedOver] = useState(false);
  const [imageUrl, setImageUrl] = useState(category.image_url || '');
  const [formData, setFormData] = useState({
    name_fr: category.name_fr,
    description_fr: category.description_fr || '',
    position: category.position,
    is_active: category.is_active
  });

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    // Simuler la progression
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 100);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/gallery/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.url) {
        setImageUrl(data.url);
        setUploadProgress(100);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(true);
  };

  const handleDragLeave = () => {
    setDraggedOver(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          name_en: formData.name_fr, // Copier le français en anglais temporairement
          image_url: imageUrl || null
        })
      });

      if (response.ok) {
        setIsEditOpen(false);
        onUpdate?.();
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${category.name_fr}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        onUpdate?.();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsEditOpen(true)}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          Modifier
        </button>
        <button
          onClick={handleDelete}
          className="text-red-600 hover:text-red-700 transition-colors"
        >
          Supprimer
        </button>
      </div>

      {isEditOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsEditOpen(false)} />
            
            <div className="relative bg-white rounded-lg w-full max-w-2xl">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-light text-gray-900">Modifier la catégorie</h2>
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUpdate} className="p-6">
                {/* Zone de drag & drop pour l'image */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image de la catégorie
                  </label>
                  
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      draggedOver ? 'border-gray-400 bg-gray-50' : 'border-gray-300'
                    }`}
                  >
                    {imageUrl && !isUploading ? (
                      <div className="space-y-4">
                        <div className="relative w-40 h-40 mx-auto rounded-lg overflow-hidden">
                          <Image
                            src={imageUrl}
                            alt="Preview"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex justify-center gap-4">
                          <button
                            type="button"
                            onClick={() => setImageUrl('')}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Supprimer l'image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {isUploading ? (
                          <>
                            <div className="w-16 h-16 mx-auto relative">
                              <svg className="animate-spin h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </div>
                            <div className="w-full max-w-xs mx-auto">
                              <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div 
                                  className="bg-blue-600 h-full transition-all duration-300"
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                              <p className="text-sm text-gray-600 mt-2">Upload en cours... {uploadProgress}%</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <div>
                              <p className="text-sm text-gray-600">
                                Glissez une image ici ou
                              </p>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                disabled={isUploading}
                                className="hidden"
                                id={`category-image-${category.id}`}
                              />
                              <label
                                htmlFor={`category-image-${category.id}`}
                                className="mt-2 inline-block cursor-pointer text-blue-600 hover:text-blue-500"
                              >
                                parcourez vos fichiers
                              </label>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF jusqu'à 10MB
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Titre */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name_fr}
                    onChange={(e) => setFormData({...formData, name_fr: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
                  />
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description_fr}
                    onChange={(e) => setFormData({...formData, description_fr: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
                  />
                </div>

                {/* Statut */}
                <div className="mb-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="rounded text-gray-900 focus:ring-gray-400"
                    />
                    <span className="text-sm font-medium text-gray-700">Catégorie active</span>
                  </label>
                </div>

                {/* Boutons */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
