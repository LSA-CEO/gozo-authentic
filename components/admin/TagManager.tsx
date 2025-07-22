'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface Tag {
  id: string;
  name_fr: string;
  name_en?: string;
  slug: string;
  tag_type: string;
  is_active: boolean;
  _count?: {
    experience_tags: number;
  };
}

interface TagManagerProps {
  groupedTags: Record<string, Tag[]>;
  onUpdate: () => void;
}

export function TagManager({ groupedTags, onUpdate }: TagManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [draggedTag, setDraggedTag] = useState<Tag | null>(null);
  const [draggedOverType, setDraggedOverType] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  
  const [formData, setFormData] = useState({
    name_fr: '',
    tag_type: 'ambiance',
    is_active: true
  });
  
  const tagTypes = [
    { value: 'ambiance', label: 'Ambiance', color: 'bg-purple-100 text-purple-800', icon: '✨' },
    { value: 'budget', label: 'Budget', color: 'bg-green-100 text-green-800', icon: '💰' },
    { value: 'duration', label: 'Durée', color: 'bg-blue-100 text-blue-800', icon: '⏱️' },
    { value: 'location', label: 'Localisation', color: 'bg-orange-100 text-orange-800', icon: '📍' },
    { value: 'special', label: 'Spécial', color: 'bg-pink-100 text-pink-800', icon: '🌟' }
  ];
  
  const getTagTypeConfig = (type: string) => {
    return tagTypes.find(t => t.value === type) || tagTypes[0];
  };

  // Générer le slug automatiquement
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };
  
  const handleCreate = async () => {
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

    const slug = generateSlug(formData.name_fr);
      
    try {
      const response = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug,
          name_en: formData.name_fr // Temporairement, on copie le français
        }),
      });
      
      if (response.ok) {
        setProgress(100);
        setTimeout(() => {
          setIsCreating(false);
          setFormData({ name_fr: '', tag_type: 'ambiance', is_active: true });
          onUpdate();
          setProgress(0);
          setIsSaving(false);
        }, 500);
      }
    } catch (error) {
      console.error('Error creating tag:', error);
      setIsSaving(false);
    } finally {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }
  };
  
  const handleUpdate = async () => {
    if (!editingTag) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/tags/${editingTag.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name_fr: formData.name_fr,
          is_active: formData.is_active,
          slug: generateSlug(formData.name_fr)
        }),
      });
      
      if (response.ok) {
        setEditingTag(null);
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating tag:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async (tagId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce tag ?')) return;
    
    try {
      const response = await fetch(`/api/admin/tags/${tagId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };
  
  const handleBulkToggle = async () => {
    if (selectedTags.length === 0) return;
    
    try {
      await Promise.all(
        selectedTags.map(tagId =>
          fetch(`/api/admin/tags/${tagId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: false }),
          })
        )
      );
      
      setSelectedTags([]);
      onUpdate();
    } catch (error) {
      console.error('Error toggling tags:', error);
    }
  };
  
  const handleDragStart = (tag: Tag) => {
    setDraggedTag(tag);
  };
  
  const handleDragEnd = () => {
    setDraggedTag(null);
    setDraggedOverType(null);
  };
  
  const handleDragOver = (e: React.DragEvent, type: string) => {
    e.preventDefault();
    setDraggedOverType(type);
  };
  
  const handleDrop = async (e: React.DragEvent, newType: string) => {
    e.preventDefault();
    if (!draggedTag || draggedTag.tag_type === newType) {
      setDraggedOverType(null);
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/tags/${draggedTag.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag_type: newType }),
      });
      
      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error moving tag:', error);
    }
    
    setDraggedOverType(null);
  };
  
  const toggleSelectTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };
  
  const startEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name_fr: tag.name_fr,
      tag_type: tag.tag_type,
      is_active: tag.is_active
    });
  };
  
  return (
    <div>
      {/* Actions en haut */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setIsCreating(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nouveau tag
        </button>
        
        {selectedTags.length > 0 && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''} sélectionné{selectedTags.length > 1 ? 's' : ''}
            </span>
            <button
              onClick={handleBulkToggle}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Désactiver la sélection
            </button>
            <button
              onClick={() => setSelectedTags([])}
              className="text-sm text-gray-600 hover:text-gray-700"
            >
              Annuler
            </button>
          </div>
        )}
      </div>
      
      {/* Modal de création/édition */}
      {(isCreating || editingTag) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => {
            setIsCreating(false);
            setEditingTag(null);
          }} />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-medium text-gray-900 mb-4">
                {editingTag ? 'Modifier le tag' : 'Nouveau tag'}
              </h3>
              
              <div className="space-y-4">
                {!editingTag && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de tag
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {tagTypes.map(type => (
                        <label
                          key={type.value}
                          className={`relative flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.tag_type === type.value
                              ? 'border-gray-900 bg-gray-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="tag_type"
                            value={type.value}
                            checked={formData.tag_type === type.value}
                            onChange={(e) => setFormData({...formData, tag_type: e.target.value})}
                            className="sr-only"
                          />
                          <span className="text-lg">{type.icon}</span>
                          <span className="text-sm font-medium">{type.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du tag
                  </label>
                  <input
                    type="text"
                    value={formData.name_fr}
                    onChange={(e) => setFormData({...formData, name_fr: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
                    placeholder="Ex: Romantique"
                  />
                  {formData.name_fr && (
                    <p className="text-xs text-gray-500 mt-1">
                      Slug : {generateSlug(formData.name_fr)}
                    </p>
                  )}
                </div>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="rounded text-gray-900"
                  />
                  <span className="text-sm font-medium text-gray-700">Tag actif</span>
                </label>
                
                {/* Preview du tag */}
                {formData.name_fr && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-2">Aperçu :</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                      getTagTypeConfig(formData.tag_type).color
                    }`}>
                      {formData.name_fr}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Progress bar */}
              {isSaving && (
                <div className="mt-4">
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1 text-center">{progress}%</p>
                </div>
              )}
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setEditingTag(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={editingTag ? handleUpdate : handleCreate}
                  disabled={isSaving || !formData.name_fr}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Enregistrement...' : (editingTag ? 'Enregistrer' : 'Créer')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Liste des tags par type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {tagTypes.map(type => {
          const tags = groupedTags[type.value] || [];
          const config = getTagTypeConfig(type.value);
          
          return (
            <div
              key={type.value}
              onDragOver={(e) => handleDragOver(e, type.value)}
              onDrop={(e) => handleDrop(e, type.value)}
              className={`bg-white rounded-lg shadow-sm border ${
                draggedOverType === type.value ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
              } transition-colors`}
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{config.icon}</span>
                    <h3 className="text-lg font-medium text-gray-900">{config.label}</h3>
                  </div>
                  <span className="text-sm text-gray-500">{tags.length} tags</span>
                </div>
              </div>
              
              <div className="p-4">
                {tags.length > 0 ? (
                  <div className="space-y-2">
                    {tags.map(tag => (
                      <div
                        key={tag.id}
                        draggable
                        onDragStart={() => handleDragStart(tag)}
                        onDragEnd={handleDragEnd}
                        className={`group flex items-center justify-between p-3 rounded-lg border transition-all cursor-move ${
                          selectedTags.includes(tag.id)
                            ? 'border-gray-900 bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        } ${!tag.is_active ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedTags.includes(tag.id)}
                            onChange={() => toggleSelectTag(tag.id)}
                            className="rounded text-gray-900"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                              {tag.name_fr}
                            </span>
                            {tag._count?.experience_tags ? (
                              <span className="text-xs text-gray-500 ml-2">
                                {tag._count.experience_tags} expérience{tag._count.experience_tags > 1 ? 's' : ''}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(tag);
                            }}
                            className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(tag.id);
                            }}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">
                    Aucun tag dans cette catégorie
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Instructions */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Glissez-déposez les tags pour les changer de catégorie</p>
      </div>
    </div>
  );
}
