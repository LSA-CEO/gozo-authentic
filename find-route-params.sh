#!/bin/bash

echo "🔍 Recherche des routes API avec params dynamiques..."
echo ""

# Trouver tous les fichiers route.ts dans des dossiers avec [id] ou autres params dynamiques
FILES=$(find app/api -name "route.ts" -path "*\[*\]*" -type f 2>/dev/null)

echo "📋 Fichiers trouvés avec params dynamiques:"
echo "$FILES" | nl

echo ""
echo "🔎 Analyse des signatures de fonctions..."
echo ""

for file in $FILES; do
    echo "📄 $file:"
    # Chercher les fonctions avec params non-Promise
    grep -n "params.*:.*{.*id.*string.*}" "$file" | grep -v "Promise" | head -5
    echo ""
done

echo "📊 Résumé:"
echo "Total fichiers avec params dynamiques: $(echo "$FILES" | wc -l)"
echo ""
echo "Ces fichiers doivent être mis à jour pour Next.js 15 (params asynchrones)"

