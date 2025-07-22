'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tag } from '../../types';

interface TagFilterProps {
  tags: Tag[];
  selectedTags: string[];
  onTagToggle: (tagSlug: string) => void;
  onClearAll?: () => void;
  locale: string;
}

export function TagFilter({ tags, selectedTags, onTagToggle, onClearAll, locale }: TagFilterProps) {
  const t = useTranslations('Categories.filters');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getTagName = (tag: Tag) => {
    const key = `name_${locale}` as keyof Tag;
    return (tag[key] as string) || tag.name_en;
  };
  
  // Tags les plus utilisés à afficher en permanence
  const popularTags = ['romantique', 'famille', 'sunset', 'petit-budget'];
  const visibleTags = tags.filter(tag => popularTags.includes(tag.slug));
  
  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="container mx-auto px-6 md:px-12 max-w-7xl py-4">
        <div className="flex items-center justify-between">
          {/* Tags populaires toujours visibles */}
          <div className="flex items-center gap-3 flex-1">
            {visibleTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => onTagToggle(tag.slug)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedTags.includes(tag.slug)
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                }`}
              >
                {getTagName(tag)}
              </button>
            ))}
            
            {/* Bouton plus de filtres */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-4 py-1.5 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-300 hover:border-gray-400 transition-all flex items-center gap-1"
            >
              Plus de filtres
              <svg 
                className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          {/* Clear all */}
          {selectedTags.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs text-gray-500 hover:text-gray-700 ml-4"
            >
              Effacer ({selectedTags.length})
            </button>
          )}
        </div>
        
        {/* Filtres étendus */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-2">
            {tags.filter(tag => !popularTags.includes(tag.slug)).map(tag => (
              <button
                key={tag.id}
                onClick={() => onTagToggle(tag.slug)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all text-left ${
                  selectedTags.includes(tag.slug)
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                }`}
              >
                {getTagName(tag)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
