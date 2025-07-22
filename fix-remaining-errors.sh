#!/bin/bash

echo "🔧 Correction des erreurs restantes..."
echo ""

# 1. Corriger l'erreur tags null dans category page
echo "📝 1. Correction du tags null..."
sed -i '' '/tags={tags}/s/tags={tags}/tags={tags || []}/' "app/[locale]/[category-slug]/page.tsx"

# 2. Corriger createClient() qui a besoin d'arguments
echo "📝 2. Vérification de createClient..."
# D'abord, voyons comment createClient est utilisé ailleurs
grep -n "createClient" "app/admin/homepage/page.tsx" | head -5

# 3. Corriger l'assignation à const data
echo "📝 3. Correction de const data..."
sed -i '' '/const { data, error }/s/const/let/' "app/api/content/[locale]/route.ts"

# 4. Corriger CategoryHero types
echo "📝 4. Correction CategoryHero..."
cat > "components/category/CategoryHero.tsx.fix" << 'EOFHERO'
'use client';

import Image from 'next/image';
import { useLocale } from 'next-intl';

interface CategoryHeroProps {
  category: {
    id: string;
    slug: string;
    name_fr: string;
    name_en: string;
    description_fr?: string;
    description_en?: string;
    image_url?: string;
    [key: string]: any; // Index signature pour les clés dynamiques
  };
  experienceCount: number;
}

export function CategoryHero({ category, experienceCount }: CategoryHeroProps) {
  const locale = useLocale();
  
  const name = category[`name_${locale}`] || category.name_en;
  const description = category[`description_${locale}`] || category.description_en;
  
  return (
    <div className="relative h-[400px] bg-gray-900">
      {category.image_url && (
        <Image
          src={category.image_url}
          alt={name}
          fill
          className="object-cover opacity-60"
          priority
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      
      <div className="relative container mx-auto px-6 h-full flex items-end pb-16">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-light text-white mb-4">
            {name}
          </h1>
          {description && (
            <p className="text-xl text-white/90 mb-6 leading-relaxed">
              {description}
            </p>
          )}
          <div className="flex items-center gap-6 text-white/80">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {experienceCount} {experienceCount === 1 ? "expérience" : "expériences"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
EOFHERO
mv components/category/CategoryHero.tsx.fix components/category/CategoryHero.tsx

# 5. Corriger l'import seoConfig dans SEO.tsx
echo "📝 5. Correction de SEO.tsx..."
# Ajouter l'import
sed -i '' '1a\
import { seoConfig } from "../lib/seo-config";
' "components/SEO.tsx"

# 6. Corriger auth-config export
echo "📝 6. Vérification auth-config..."
grep -n "export.*authConfig" "lib/auth-config.ts" | head -5

# 7. Corriger les types Buffer
echo "📝 7. Correction du type Buffer..."
sed -i '' 's/convertedBuffer: Buffer =/convertedBuffer: Buffer<ArrayBuffer> =/' "app/api/admin/gallery/upload/route.ts"

# 8. Corriger translate-content message
echo "📝 8. Correction translate-content..."
sed -i '' '302s/result\.message/(result as any).message/' "app/api/admin/translate-content/route.ts"

echo ""
echo "✅ Corrections appliquées !"
echo ""
echo "🔍 Vérification des fichiers problématiques..."
echo ""

# Vérifier si createClient est importé correctement
echo "Imports de createClient dans homepage:"
grep -n "import.*createClient" "app/admin/homepage/page.tsx"

echo ""
echo "Imports de createClient dans TagManager:"
grep -n "import.*createClient" "components/admin/TagManager.tsx"

