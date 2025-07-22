'use client';

import { useMemo } from 'react';
import { ExperienceWithDetails } from '../types';

export function useFilteredExperiences(
  experiences: ExperienceWithDetails[],
  selectedTags: string[]
) {
  return useMemo(() => {
    if (selectedTags.length === 0) {
      return experiences;
    }
    
    return experiences.filter(experience => {
      // Vérifier si l'expérience a au moins un des tags sélectionnés
      const experienceTagSlugs = experience.tags?.map(tag => tag.slug) || [];
      return selectedTags.some(selectedTag => experienceTagSlugs.includes(selectedTag));
    });
  }, [experiences, selectedTags]);
}
