'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { TagFilter } from './TagFilter';
import { ExperienceCardCategory } from './ExperienceCardCategory';
import { useFilteredExperiences } from '../../hooks/useFilteredExperiences';
import { ExperienceWithDetails, Tag } from '../../types';

interface ExperienceGridProps {
  experiences: ExperienceWithDetails[];
  tags: Tag[];
  locale: string;
}

export function ExperienceGrid({ experiences, tags, locale }: ExperienceGridProps) {
  const t = useTranslations('Categories');
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    const tagsParam = searchParams.get('tags');
    return tagsParam ? tagsParam.split(',') : [];
  });
  
  const filteredExperiences = useFilteredExperiences(experiences, selectedTags);
  
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    if (selectedTags.length > 0) {
      params.set('tags', selectedTags.join(','));
    } else {
      params.delete('tags');
    }
    
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [selectedTags, pathname, router, searchParams]);
  
  const handleTagToggle = (tagSlug: string) => {
    setSelectedTags(prev =>
      prev.includes(tagSlug)
        ? prev.filter(t => t !== tagSlug)
        : [...prev, tagSlug]
    );
  };
  
  const handleClearAll = () => {
    setSelectedTags([]);
  };
  
  return (
    <>
      {/* Filtres */}
      <TagFilter
        tags={tags}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
        onClearAll={handleClearAll}
        locale={locale}
      />
      
      {/* Section des expériences - même style que CategorySection */}
      <section className="py-10 md:py-10 bg-white flex items-center">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          {/* Compteur discret */}
          {selectedTags.length > 0 && (
            <p className="text-sm text-gray-600 mb-6">
              {filteredExperiences.length} {filteredExperiences.length === 1 ? 'résultat' : 'résultats'}
            </p>
          )}
          
          {/* Grille - même gap que CategorySection */}
          {filteredExperiences.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredExperiences.map((experience) => (
                <ExperienceCardCategory
                  key={experience.id}
                  experience={experience}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-light text-gray-900 mb-2">
                {t('noResults.title')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('noResults.description')}
              </p>
              <button
                onClick={handleClearAll}
                className="px-6 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
              >
                {t('noResults.clearFilters')}
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
