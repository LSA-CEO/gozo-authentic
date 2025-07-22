#!/bin/bash

echo "🔍 Vérification de TOUTES les erreurs TypeScript..."
echo ""

# TypeScript check avec toutes les erreurs
npx tsc --noEmit --pretty false 2>&1 | tee all-typescript-errors.log

# Compter les erreurs
ERROR_COUNT=$(grep -c "error TS" all-typescript-errors.log)

echo ""
echo "📊 Total des erreurs TypeScript: $ERROR_COUNT"
echo ""
echo "📄 Erreurs groupées par fichier:"
grep "error TS" all-typescript-errors.log | cut -d: -f1 | sort | uniq -c | sort -rn

echo ""
echo "💾 Toutes les erreurs sauvegardées dans: all-typescript-errors.log"

# Option 2 : Next.js build avec continuation malgré les erreurs
echo ""
echo "🏗️ Tentative de build Next.js complet..."
NEXT_TELEMETRY_DISABLED=1 npm run build -- --experimental-build-mode=compile 2>&1 | tee all-build-errors.log

