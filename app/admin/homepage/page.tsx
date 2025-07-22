'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface SectionContent {
  title_fr?: string;
  subtitle_fr?: string;
  cta_fr?: string;
  scrollText_fr?: string;
  content_fr?: string;
  button_fr?: string;
  image_url?: string;
}

interface HomepageSection {
  id: string;
  name: string;
  order: number;
  content: SectionContent;
}

export default function AdminHomepage() {
  const router = useRouter();
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [draggedOverImage, setDraggedOverImage] = useState<string | null>(null);

  // Charger le contenu depuis la DB
  useEffect(() => {
    async function loadContent() {
      try {
        const response = await fetch('/api/admin/homepage');
        const data = await response.json();
        
        // Transformer en sections avec ordre
        const initialSections: HomepageSection[] = [
          {
            id: 'hero',
            name: 'Section Hero',
            order: 1,
            content: data.hero || {
              title_fr: "",
              subtitle_fr: "",
              cta_fr: "",
              scrollText_fr: "",
              image_url: "/images/mgarr.jpg"
            }
          },
          {
            id: 'about',
            name: 'Section À Propos',
            order: 2,
            content: data.about || {
              title_fr: "",
              content_fr: "",
              image_url: "/images/nous.jpg"
            }
          },
          {
            id: 'cta',
            name: 'Section CTA Final',
            order: 3,
            content: data.cta || {
              title_fr: "",
              subtitle_fr: "",
              button_fr: ""
            }
          }
        ];
        
        setSections(initialSections);
      } catch (error) {
        console.error('Error loading content:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadContent();
  }, []);

  // Gestion du drag & drop pour les sections
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setIsDragging(true);
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedIndex(null);
    setDropIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropIndex(index);
  };

  const handleDragLeave = () => {
    setDropIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    
    const newSections = [...sections];
    const [draggedSection] = newSections.splice(draggedIndex, 1);
    newSections.splice(dropIndex, 0, draggedSection);
    
    // Mettre à jour les ordres
    newSections.forEach((section, index) => {
      section.order = index + 1;
    });
    
    setSections(newSections);
    setDraggedIndex(null);
    setDropIndex(null);
  };

  // Upload d'image
  const handleImageUpload = async (file: File, sectionId: string) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    setIsUploading(sectionId);
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
        updateSectionContent(sectionId, 'image_url', data.url);
        setUploadProgress(100);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsUploading(null);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleImageDrop = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    setDraggedOverImage(null);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file, sectionId);
    }
  };

  const handleImageDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    setDraggedOverImage(sectionId);
  };

  const handleImageDragLeave = () => {
    setDraggedOverImage(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, sectionId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file, sectionId);
    }
  };

  // Mise à jour du contenu d'une section
  const updateSectionContent = (sectionId: string, field: string, value: string) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, content: { ...section.content, [field]: value } }
        : section
    ));
  };

  // Sauvegarder avec progress bar
  const handleSave = async () => {
    setIsSaving(true);
    setProgress(0);
    
    // Simuler la progression
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          if (progressInterval.current) {
            clearInterval(progressInterval.current);
          }
          return prev;
        }
        return prev + 10;
      });
    }, 100);

    try {
      const content: any = {};
      sections.forEach(section => {
        content[section.id] = section.content;
      });

      const response = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      
      if (response.ok) {
        setProgress(100);
        setTimeout(() => {
          alert('Contenu sauvegardé avec succès !');
          setProgress(0);
        }, 500);
      } else {
        alert('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      setTimeout(() => {
        setIsSaving(false);
        setProgress(0);
      }, 1000);
    }
  };

  if (isLoading) {
    return <div className="p-8">Chargement...</div>;
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-light text-gray-900">Contenu Homepage</h1>
        <div className="text-sm text-gray-500">
          Glissez-déposez pour réorganiser les sections
        </div>
      </div>
      
      <div className="space-y-6">
        {sections.map((section, index) => (
          <div
            key={section.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            className={`relative ${isDragging && draggedIndex === index ? 'opacity-50' : ''}`}
          >
            {/* Indicateur de drop */}
            {dropIndex === index && draggedIndex !== index && (
              <div className="absolute -top-2 left-0 right-0 h-1 bg-blue-500 rounded-full" />
            )}
            
            <div className="bg-white rounded-lg shadow p-6 cursor-move hover:shadow-lg transition-shadow">
              {/* Header avec drag handle */}
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <h2 className="text-xl font-medium text-gray-900">{section.name}</h2>
              </div>

              {/* Contenu spécifique par section */}
              <div className="space-y-4">
                {section.id === 'hero' && (
                  <>
                    <div>
                      <label className="block text-md font-medium text-black mb-1">
                        Titre principal
                      </label>
                      <input
                        type="text"
                        value={section.content.title_fr || ''}
                        onChange={(e) => updateSectionContent(section.id, 'title_fr', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-md font-medium text-black mb-1">
                        Sous-titre
                      </label>
                      <input
                        type="text"
                        value={section.content.subtitle_fr || ''}
                        onChange={(e) => updateSectionContent(section.id, 'subtitle_fr', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-md font-medium text-black mb-1">
                        Texte du bouton CTA
                      </label>
                      <input
                        type="text"
                        value={section.content.cta_fr || ''}
                        onChange={(e) => updateSectionContent(section.id, 'cta_fr', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-md font-medium text-black mb-1">
                        Texte de scroll (en bas)
                      </label>
                      <input
                        type="text"
                        value={section.content.scrollText_fr || ''}
                        onChange={(e) => updateSectionContent(section.id, 'scrollText_fr', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
                      />
                    </div>
                    
                    {/* Zone de drag & drop pour l'image Hero */}
                    <div>
                      <label className="block text-md font-medium text-black mb-1">
                        Image de la section
                      </label>
                      <div
                        onDrop={(e) => handleImageDrop(e, section.id)}
                        onDragOver={(e) => handleImageDragOver(e, section.id)}
                        onDragLeave={handleImageDragLeave}
                        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                          draggedOverImage === section.id ? 'border-gray-400 bg-gray-50' : 'border-gray-300'
                        }`}
                      >
                        {section.content.image_url && isUploading !== section.id ? (
                          <div className="space-y-4">
                            <div className="relative w-40 h-40 mx-auto rounded-lg overflow-hidden">
                              <Image
                                src={section.content.image_url}
                                alt="Preview"
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => updateSectionContent(section.id, 'image_url', '')}
                              className="text-sm text-red-600 hover:text-red-700"
                            >
                              Supprimer l'image
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {isUploading === section.id ? (
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
                                    onChange={(e) => handleFileSelect(e, section.id)}
                                    className="hidden"
                                    id={`hero-image-upload`}
                                  />
                                  <label
                                    htmlFor={`hero-image-upload`}
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
                  </>
                )}

                {section.id === 'about' && (
                  <>
                    <div>
                      <label className="block text-md font-medium text-black mb-1">
                        Titre
                      </label>
                      <input
                        type="text"
                        value={section.content.title_fr || ''}
                        onChange={(e) => updateSectionContent(section.id, 'title_fr', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-md font-medium text-black mb-1">
                        Contenu (HTML supporté)
                      </label>
                      <textarea
                        value={section.content.content_fr || ''}
                        onChange={(e) => updateSectionContent(section.id, 'content_fr', e.target.value)}
                        rows={8}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900 font-mono text-sm"
                        placeholder="<p>Paragraphe 1...</p>&#10;<p>Paragraphe 2...</p>"
                      />
                    </div>
                    
                    {/* Zone de drag & drop pour l'image About */}
                    <div>
                      <label className="block text-md font-medium text-black mb-1">
                        Image de la section
                      </label>
                      <div
                        onDrop={(e) => handleImageDrop(e, section.id)}
                        onDragOver={(e) => handleImageDragOver(e, section.id)}
                        onDragLeave={handleImageDragLeave}
                        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                          draggedOverImage === section.id ? 'border-gray-400 bg-gray-50' : 'border-gray-300'
                        }`}
                      >
                        {section.content.image_url && isUploading !== section.id ? (
                          <div className="space-y-4">
                            <div className="relative w-40 h-40 mx-auto rounded-lg overflow-hidden">
                              <Image
                                src={section.content.image_url}
                                alt="Preview"
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => updateSectionContent(section.id, 'image_url', '')}
                              className="text-sm text-red-600 hover:text-red-700"
                            >
                              Supprimer l'image
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {isUploading === section.id ? (
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
                                    onChange={(e) => handleFileSelect(e, section.id)}
                                    className="hidden"
                                    id={`about-image-upload`}
                                  />
                                  <label
                                    htmlFor={`about-image-upload`}
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
                  </>
                )}

                {section.id === 'cta' && (
                  <>
                    <div>
                      <label className="block text-md font-medium text-black mb-1">
                        Titre
                      </label>
                      <input
                        type="text"
                        value={section.content.title_fr || ''}
                        onChange={(e) => updateSectionContent(section.id, 'title_fr', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-md font-medium text-black mb-1">
                        Sous-titre
                      </label>
                      <input
                        type="text"
                        value={section.content.subtitle_fr || ''}
                        onChange={(e) => updateSectionContent(section.id, 'subtitle_fr', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-md font-medium text-black mb-1">
                        Texte du bouton
                      </label>
                      <input
                        type="text"
                        value={section.content.button_fr || ''}
                        onChange={(e) => updateSectionContent(section.id, 'button_fr', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar de sauvegarde */}
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 w-64">
          <p className="text-sm text-gray-600 mb-2">Sauvegarde en cours...</p>
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{progress}%</p>
        </div>
      )}
      
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
