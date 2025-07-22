'use client';

import { useEffect, useState } from 'react';
import { TagManager } from '../../../components/admin/TagManager';

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

export default function AdminTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTags = async () => {
    try {
      const res = await fetch('/api/admin/tags');
      const data = await res.json();
      setTags(data);
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  // Grouper les tags par type
  const groupedTags = tags.reduce((acc, tag) => {
    if (!acc[tag.tag_type]) {
      acc[tag.tag_type] = [];
    }
    acc[tag.tag_type].push(tag);
    return acc;
  }, {} as Record<string, Tag[]>);

  if (loading) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-light text-gray-900 mb-8">Gestion des Tags</h1>
      <TagManager groupedTags={groupedTags} onUpdate={loadTags} />
    </div>
  );
}
