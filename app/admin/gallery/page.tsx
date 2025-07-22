'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  type: 'normal' | 'tall' | 'wide';
  order: number;
}

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [gallerySubtitle, setGallerySubtitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [draggedOver, setDraggedOver] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    loadGalleryData();
  }, []);

  const loadGalleryData = async () => {
    try {
      const response = await fetch('/api/admin/gallery');
      const data = await response.json();
      setImages(data.images || []);
      setGalleryTitle(data.title || '');
      setGallerySubtitle(data.subtitle || '');
    } catch (error) {
      console.error('Error loading gallery:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      console.log('Starting upload for:', file.name, 'Size:', file.size);
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/gallery/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Upload error:', data.error);
        alert(`Erreur upload: ${data.error}`);
        return null;
      }

      console.log('Upload successful:', data);
      return data.url;
    } catch (error) {
      console.error('Upload exception:', error);
      alert(`Erreur: ${error}`);
      return null;
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      alert('Veuillez déposer uniquement des images');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const newImages: GalleryImage[] = [];
    
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      setUploadProgress(((i + 1) / imageFiles.length) * 100);
      
      const publicUrl = await uploadImage(file);
      
      if (publicUrl) {
        newImages.push({
          id: `uploaded-${Date.now()}-${i}`,
          url: publicUrl,
          alt: file.name.split('.')[0],
          type: 'normal',
          order: images.length + i
        });
      }
    }

    console.log('New images to add:', newImages);

    if (newImages.length > 0) {
      setImages([...images, ...newImages]);
    } else {
      alert('Aucune image n\'a pu être uploadée');
    }

    setIsUploading(false);
    setUploadProgress(0);
  }, [images]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(true);
  };

  const handleDragLeave = () => {
    setDraggedOver(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert('Veuillez sélectionner uniquement des images');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const newImages: GalleryImage[] = [];
    
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      setUploadProgress(((i + 1) / imageFiles.length) * 100);
      
      const publicUrl = await uploadImage(file);
      
      if (publicUrl) {
        newImages.push({
          id: `uploaded-${Date.now()}-${i}`,
          url: publicUrl,
          alt: file.name.split('.')[0],
          type: 'normal',
          order: images.length + i
        });
      }
    }

    console.log('New images to add:', newImages);

    if (newImages.length > 0) {
      setImages([...images, ...newImages]);
    } else {
      alert('Aucune image n\'a pu être uploadée');
    }

    setIsUploading(false);
    setUploadProgress(0);
    
    // Reset l'input
    e.target.value = '';
  };

  const updateImageType = (id: string, type: 'normal' | 'tall' | 'wide') => {
    setImages(images.map(img => 
      img.id === id ? { ...img, type } : img
    ));
  };

  const updateImageAlt = (id: string, alt: string) => {
    setImages(images.map(img => 
      img.id === id ? { ...img, alt } : img
    ));
  };

  const deleteImage = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return;

    const image = images.find(img => img.id === id);
    if (image && image.url.includes('supabase')) {
      // Extraire le path du fichier depuis l'URL Supabase
      const urlParts = image.url.split('/storage/v1/object/public/gallery/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        
        console.log('Deleting file:', filePath);
        
        // Appeler l'API de suppression sécurisée
        try {
          const response = await fetch('/api/admin/gallery/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath })
          });
          
          if (!response.ok) {
            console.error('Error deleting from storage');
          }
        } catch (error) {
          console.error('Error calling delete API:', error);
        }
      }
    }

    setImages(images.filter(img => img.id !== id));
    if (selectedImage?.id === id) {
      setSelectedImage(null);
    }
  };

  const moveImage = (id: string, direction: 'up' | 'down') => {
    const index = images.findIndex(img => img.id === id);
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === images.length - 1)
    ) {
      return;
    }

    const newImages = [...images];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    
    // Update order values
    newImages.forEach((img, idx) => {
      img.order = idx;
    });

    setImages(newImages);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: galleryTitle,
          subtitle: gallerySubtitle,
          images: images.map((img, idx) => ({
            ...img,
            order_position: idx
          }))
        }),
      });

      if (response.ok) {
        alert('Galerie sauvegardée avec succès !');
        await loadGalleryData();
      } else {
        const error = await response.text();
        alert('Erreur lors de la sauvegarde: ' + error);
      }
    } catch (error) {
      console.error('Error saving gallery:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-light text-gray-900 mb-8">Galerie Instagram</h1>

      {/* Textes de la section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-medium text-gray-900 mb-4">Textes de la section</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-md font-medium text-black mb-1">
              Titre de la section
            </label>
            <input
              type="text"
              value={galleryTitle}
              onChange={(e) => setGalleryTitle(e.target.value)}
              placeholder="Moments de Gozo"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-md font-medium text-black mb-1">
              Sous-titre
            </label>
            <input
              type="text"
              value={gallerySubtitle}
              onChange={(e) => setGallerySubtitle(e.target.value)}
              placeholder="Suivez nos aventures @gozoauthentic"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Zone de drag & drop */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`bg-white rounded-lg shadow p-8 mb-8 border-2 border-dashed transition-colors ${
          draggedOver ? 'border-gray-400 bg-gray-50' : 'border-gray-300'
        }`}
      >
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            Glissez et déposez vos images ici
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ou
          </p>
          <label className="mt-2 inline-block">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <span className="cursor-pointer text-blue-600 hover:text-blue-500">
              parcourez vos fichiers
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-2">
            PNG, JPG, GIF jusqu'à 10MB
          </p>
        </div>

        {/* Barre de progression */}
        {isUploading && (
          <div className="mt-4">
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Upload en cours... {Math.round(uploadProgress)}%
            </p>
          </div>
        )}
      </div>

      {/* Grille d'images */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-medium text-gray-900 mb-4">
          Images ({images.length})
        </h2>
        
        {images.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Aucune image dans la galerie. Glissez des images ci-dessus pour commencer.
          </p>
        ) : (
          <div className="space-y-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`flex items-center gap-4 p-4 border rounded-lg ${
                  selectedImage?.id === image.id ? 'border-gray-400 bg-gray-50' : 'border-gray-200'
                }`}
              >
                {/* Image preview */}
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover rounded"
                    unoptimized
                  />
                  <div className="absolute top-1 left-1">
                    <span className={`px-2 py-1 text-xs rounded ${
                      image.type === 'tall' ? 'bg-blue-500 text-white' :
                      image.type === 'wide' ? 'bg-green-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {image.type}
                    </span>
                  </div>
                </div>

                {/* Image info */}
                <div className="flex-1">
                  <input
                    type="text"
                    value={image.alt}
                    onChange={(e) => updateImageAlt(image.id, e.target.value)}
                    placeholder="Texte alternatif"
                    className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => updateImageType(image.id, 'normal')}
                      className={`px-3 py-1 text-sm rounded ${
                        image.type === 'normal' 
                          ? 'bg-gray-900 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      onClick={() => updateImageType(image.id, 'tall')}
                      className={`px-3 py-1 text-sm rounded ${
                        image.type === 'tall' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Tall
                    </button>
                    <button
                      onClick={() => updateImageType(image.id, 'wide')}
                      className={`px-3 py-1 text-sm rounded ${
                        image.type === 'wide' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Wide
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => moveImage(image.id, 'up')}
                    disabled={index === 0}
                    className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Déplacer vers le haut"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveImage(image.id, 'down')}
                    disabled={index === images.length - 1}
                    className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Déplacer vers le bas"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteImage(image.id)}
                    className="p-2 text-red-500 hover:text-red-700"
                    title="Supprimer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bouton sauvegarder */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gray-900 text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  );
}
