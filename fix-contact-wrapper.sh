#!/bin/bash

FILE="app/[locale]/[category-slug]/[experience-slug]/page.tsx"

echo "🔧 Correction de ContactModalWrapper dans $FILE"

# Sauvegarder
cp "$FILE" "$FILE.backup"

# Remplacer le bloc ContactModalWrapper
sed -i '' '/<ContactModalWrapper/,/\/>/{
  s/locale={locale}//
  s/className=/buttonClass=/
}' "$FILE"

echo "✅ Corrections appliquées:"
echo "  - Supprimé: locale={locale}"
echo "  - Changé: className → buttonClass"

echo ""
echo "📄 Vérification du résultat:"
sed -n '175,185p' "$FILE"

