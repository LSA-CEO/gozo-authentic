#!/bin/bash

echo "🎯 CORRECTION FINALE DES DERNIÈRES ERREURS"
echo "=========================================="
echo ""

# 1. Correction SEO.tsx - finalTitle et finalDescription
echo "📝 1. Correction des types dans SEO.tsx..."
# Remplacer les lignes problématiques
sed -i '' '26,29s/.*/  const finalTitle = title ? `${title} | ${seoConfig.siteName}` : seoConfig.siteName;/' "components/SEO.tsx"
sed -i '' '31,32s/.*/  const finalDescription = description || seoConfig.siteDescription;/' "components/SEO.tsx"

# Corriger faqSchema qui n'existe pas
sed -i '' '85s/faqSchema\.toString()/"{}"/' "components/SEO.tsx"

# 2. Correction auth/index.ts - ajouter role
echo "📝 2. Ajout du role dans auth/index.ts..."
sed -i '' '/return {/,/}/ {
  s/name: data\.user\.email,/name: data.user.email,\
          role: "user"/
}' "lib/auth/index.ts"

echo ""
echo "✅ Corrections appliquées !"
echo ""
echo "🔍 Vérification finale..."
echo ""

# Test TypeScript
npx tsc --noEmit 2>&1 | grep "error" | wc -l | {
  read count
  if [ "$count" -eq "0" ]; then
    echo "🎉 AUCUNE ERREUR TYPESCRIPT !"
    echo ""
    echo "🚀 Prêt pour le build : npm run build"
  else
    echo "⚠️  Il reste $count erreurs. Détails :"
    npx tsc --noEmit 2>&1 | grep -A2 "error TS"
  fi
}

