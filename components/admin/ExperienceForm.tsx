'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface ExperienceFormProps {
  experience?: any;
  categories: any[];
  tags: any[];
}

interface TagGroup {
  type: string;
  label: string;
  tags: any[];
}

export function ExperienceForm({ experience, categories, tags }: ExperienceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    experience?.experience_tags?.map((et: any) => et.tag_id) || []
  );
  
  // États pour la galerie
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [galleryImages, setGalleryImages] = useState<string[]>(
    experience?.gallery_urls || []
  );
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [draggedOver, setDraggedOver] = useState(false);
  const [draggedOverGallery, setDraggedOverGallery] = useState(false);
  
  const [formData, setFormData] = useState({
    name_fr: experience?.name_fr || '',
    description_fr: experience?.description_fr || '',
    category_id: experience?.category_id || '',
    partner_name: experience?.partner_name || '',
    partner_phone: experience?.partner_phone || '',
    partner_whatsapp: experience?.partner_whatsapp || '',
    price_from: experience?.price_from || '',
    duration_hours: experience?.duration_hours || '',
    featured_image_url: experience?.featured_image_url || '',
    our_story_fr: experience?.our_story_fr || '',
    tips_fr: experience?.tips_fr || '',
    is_active: experience?.is_active ?? true,
  });

  // Grouper les tags par type
  const groupedTags: TagGroup[] = [
    { type: 'ambiance', label: 'Ambiance', tags: tags.filter(t => t.tag_type === 'ambiance') },
    { type: 'budget', label: 'Budget', tags: tags.filter(t => t.tag_type === 'budget') },
    { type: 'duration', label: 'Durée', tags: tags.filter(t => t.tag_type === 'duration') },
    { type: 'location', label: 'Localisation', tags: tags.filter(t => t.tag_type === 'location') },
    { type: 'special', label: 'Spécial', tags: tags.filter(t => t.tag_type === 'special') },
  ];

  // Upload d'image principale
  const handleMainImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    setIsUploadingMain(true);
    setUploadProgress(0);
    
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 100);

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const response = await fetch('/api/admin/gallery/upload', {
        method: 'POST',
        body: uploadFormData
      });

      const data = await response.json();
      if (data.url) {
        setFormData({...formData, featured_image_url: data.url});
        setUploadProgress(100);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsUploadingMain(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  // Upload d'images de galerie (multiple)
  const handleGalleryUpload = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      alert('Veuillez sélectionner des images');
      return;
    }

    setIsUploadingGallery(true);
    const uploadedUrls: string[] = [];

    for (const file of imageFiles) {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      try {
        const response = await fetch('/api/admin/gallery/upload', {
          method: 'POST',
          body: uploadFormData
        });

        const data = await response.json();
        if (data.url) {
          uploadedUrls.push(data.url);
        }
      } catch (error) {
        console.error('Error uploading gallery image:', error);
      }
    }

    if (uploadedUrls.length > 0) {
      setGalleryImages([...galleryImages, ...uploadedUrls]);
    }
    
    setIsUploadingGallery(false);
  };

  // Drag & drop pour image principale
  const handleMainDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleMainImageUpload(file);
    }
  };

  // Drag & drop pour galerie
  const handleGalleryDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOverGallery(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleGalleryUpload(files);
    }
  };

  // Réorganisation des images de galerie
  const handleImageDragStart = (index: number) => {
    setDraggedImageIndex(index);
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedImageIndex === null || draggedImageIndex === index) return;
    
    const newImages = [...galleryImages];
    const draggedImage = newImages[draggedImageIndex];
    newImages.splice(draggedImageIndex, 1);
    newImages.splice(index, 0, draggedImage);
    
    setGalleryImages(newImages);
    setDraggedImageIndex(index);
  };

  const handleImageDragEnd = () => {
    setDraggedImageIndex(null);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const method = experience ? 'PUT' : 'POST';
      const url = experience 
        ? `/api/admin/experiences/${experience.id}`
        : '/api/admin/experiences';
        
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          gallery_urls: galleryImages,
          tags: selectedTags,
          // Copier le français vers les autres langues pour le moment
          name_en: formData.name_fr,
          description_en: formData.description_fr,
          our_story_en: formData.our_story_fr,
          tips_en: formData.tips_fr,
        }),
      });
      
      if (response.ok) {
        router.push('/admin/experiences');
        router.refresh();
      }
    } catch (error) {
      console.error('Error saving experience:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Informations de base */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-medium text-gray-900 mb-6">Informations de base</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'expérience *
            </label>
            <input
              type="text"
              required
              value={formData.name_fr}
              onChange={(e) => setFormData({...formData, name_fr: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
              placeholder="Ex: Tour en bateau Crystal Lagoon"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description_fr}
              onChange={(e) => setFormData({...formData, description_fr: e.target.value})}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
              placeholder="Décrivez brièvement l'expérience..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie *
            </label>
            <select
              required
              value={formData.category_id}
              onChange={(e) => setFormData({...formData, category_id: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name_fr}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix à partir de (€)
            </label>
            <input
              type="number"
              value={formData.price_from}
              onChange={(e) => setFormData({...formData, price_from: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
              placeholder="Ex: 45"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durée (heures)
            </label>
            <input
              type="number"
              step="0.5"
              value={formData.duration_hours}
              onChange={(e) => setFormData({...formData, duration_hours: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
              placeholder="Ex: 2.5"
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-medium text-gray-900 mb-6">Images</h2>
        
        {/* Image principale */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image principale
          </label>
          <div
            onDrop={handleMainDrop}
            onDragOver={(e) => { e.preventDefault(); setDraggedOver(true); }}
            onDragLeave={() => setDraggedOver(false)}
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              draggedOver ? 'border-gray-400 bg-gray-50' : 'border-gray-300'
            }`}
          >
            {formData.featured_image_url && !isUploadingMain ? (
              <div className="space-y-4">
                <div className="relative w-40 h-40 mx-auto rounded-lg overflow-hidden">
                  <Image
                    src={formData.featured_image_url}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, featured_image_url: ''})}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Supprimer l'image
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {isUploadingMain ? (
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
                        onChange={(e) => e.target.files?.[0] && handleMainImageUpload(e.target.files[0])}
                        className="hidden"
                        id="main-image-upload"
                      />
                      <label
                        htmlFor="main-image-upload"
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

        {/* Galerie */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Galerie d'images
          </label>
          
          {/* Images existantes */}
          {galleryImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {galleryImages.map((url, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handleImageDragStart(index)}
                  onDragOver={(e) => handleImageDragOver(e, index)}
                  onDragEnd={handleImageDragEnd}
                  className={`relative group cursor-move ${
                    draggedImageIndex === index ? 'opacity-50' : ''
                  }`}
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={url}
                      alt={`Galerie ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="bg-red-600 text-white p-1.5 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Zone d'upload */}
          <div
            onDrop={handleGalleryDrop}
            onDragOver={(e) => { e.preventDefault(); setDraggedOverGallery(true); }}
            onDragLeave={() => setDraggedOverGallery(false)}
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              draggedOverGallery ? 'border-gray-400 bg-gray-50' : 'border-gray-300'
            } ${isUploadingGallery ? 'pointer-events-none' : ''}`}
          >
            {isUploadingGallery ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm text-gray-600">Upload en cours...</span>
              </div>
            ) : (
              <>
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    Glissez plusieurs images ici ou
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => e.target.files && handleGalleryUpload(e.target.files)}
                    className="hidden"
                    id="gallery-upload"
                  />
                  <label
                    htmlFor="gallery-upload"
                    className="mt-2 inline-block cursor-pointer text-blue-600 hover:text-blue-500"
                  >
                    parcourez vos fichiers
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Vous pouvez sélectionner plusieurs images
                </p>
              </>
            )}
          </div>
          
          {galleryImages.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Glissez-déposez les images pour réorganiser
            </p>
          )}
        </div>
      </div>

      {/* Informations partenaire */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-medium text-gray-900 mb-6">Informations partenaire</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du partenaire
            </label>
            <input
              type="text"
              value={formData.partner_name}
              onChange={(e) => setFormData({...formData, partner_name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
              placeholder="Ex: Lorenzo"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp partenaire
            </label>
            <input
              type="text"
              value={formData.partner_whatsapp}
              onChange={(e) => setFormData({...formData, partner_whatsapp: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
              placeholder="Ex: 35679999999"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone partenaire
            </label>
            <input
              type="text"
              value={formData.partner_phone}
              onChange={(e) => setFormData({...formData, partner_phone: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
              placeholder="Ex: +356 7999 9999"
            />
          </div>
        </div>
      </div>

      {/* Contenu éditorial */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-medium text-gray-900 mb-6">Contenu éditorial</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notre histoire avec ce partenaire
            </label>
            <textarea
              value={formData.our_story_fr}
              onChange={(e) => setFormData({...formData, our_story_fr: e.target.value})}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
              placeholder="Racontez comment vous avez découvert ce lieu ou rencontré ce partenaire..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nos conseils
            </label>
            <textarea
              value={formData.tips_fr}
              onChange={(e) => setFormData({...formData, tips_fr: e.target.value})}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
              placeholder="Meilleur moment pour y aller, ce qu'il faut apporter, astuces..."
            />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-medium text-gray-900 mb-6">Tags</h2>
        
        <div className="space-y-6">
          {groupedTags.map((group) => (
            group.tags.length > 0 && (
              <div key={group.type}>
                <h3 className="text-sm font-medium text-gray-700 mb-3">{group.label}</h3>
                <div className="flex flex-wrap gap-2">
                  {group.tags.map((tag) => (
                    <label
                      key={tag.id}
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all ${
                        selectedTags.includes(tag.id)
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.id)}
                        onChange={() => toggleTag(tag.id)}
                        className="sr-only"
                      />
                      {tag.name_fr}
                    </label>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Statut et actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              className="w-5 h-5 rounded text-gray-900 focus:ring-gray-500"
            />
            <span className="text-sm font-medium text-gray-700">Expérience active</span>
          </label>
          
          <div className="flex items-center gap-3">
            <Link
              href="/admin/experiences"
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </Link>
            
            <button
              type="button"
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              onClick={() => alert('La traduction automatique sera disponible dans la page Traductions')}
            >
              Traduire en 6 langues
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Enregistrement...' : (experience ? 'Mettre à jour' : 'Créer')}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
