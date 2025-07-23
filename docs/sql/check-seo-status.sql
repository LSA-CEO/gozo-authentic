-- Vérifier le statut SEO des catégories et expériences

-- 1. Catégories sans métadonnées SEO
SELECT 
  slug,
  name_fr,
  CASE 
    WHEN meta_title IS NULL THEN 'Missing meta_title'
    WHEN meta_description IS NULL THEN 'Missing meta_description'
    ELSE 'OK'
  END as seo_status
FROM categories
WHERE meta_title IS NULL OR meta_description IS NULL;

-- 2. Expériences sans slugs traduits
SELECT 
  e.id,
  e.name_fr,
  c.slug as category_slug,
  CASE
    WHEN e.slug IS NULL THEN 'Missing FR slug'
    WHEN e.slug_en IS NULL THEN 'Missing EN slug'
    WHEN e.slug_de IS NULL THEN 'Missing DE slug'
    WHEN e.slug_it IS NULL THEN 'Missing IT slug'
    WHEN e.slug_nl IS NULL THEN 'Missing NL slug'
    WHEN e.slug_es IS NULL THEN 'Missing ES slug'
    WHEN e.slug_pt IS NULL THEN 'Missing PT slug'
    ELSE 'All slugs OK'
  END as slug_status
FROM experiences e
JOIN categories c ON e.category_id = c.id
WHERE e.is_active = true
AND (
  e.slug IS NULL OR e.slug_en IS NULL OR e.slug_de IS NULL OR 
  e.slug_it IS NULL OR e.slug_nl IS NULL OR e.slug_es IS NULL OR e.slug_pt IS NULL
);

-- 3. Compteurs de vues
SELECT 
  'Categories' as type,
  SUM(view_count) as total_views,
  AVG(view_count) as avg_views,
  MAX(view_count) as max_views
FROM categories
UNION ALL
SELECT 
  'Experiences' as type,
  SUM(view_count) as total_views,
  AVG(view_count) as avg_views,
  MAX(view_count) as max_views
FROM experiences;
