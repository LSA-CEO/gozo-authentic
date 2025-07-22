#!/bin/bash

echo "🔧 Correction finale de auth/index.ts..."

# Voir le contenu actuel autour du return
echo "📄 Contenu actuel du return:"
grep -A5 -B2 "return {" lib/auth/index.ts

# Corriger en s'assurant que email n'est jamais undefined
sed -i '' '/return {/,/}/ {
  s/email: data\.user\.email,/email: data.user.email || "",/
  s/name: data\.user\.email,/name: data.user.email || "",/
}' "lib/auth/index.ts"

echo ""
echo "✅ Correction appliquée !"
echo ""
echo "🔍 Test final..."
npx tsc --noEmit 2>&1 | grep -c "error" | {
  read count
  if [ "$count" -eq "0" ]; then
    echo ""
    echo "🎉 🎉 🎉 AUCUNE ERREUR TYPESCRIPT ! 🎉 🎉 🎉"
    echo ""
    echo "✅ Prêt pour le build final : npm run build"
  else
    echo "❌ Il reste des erreurs"
    npx tsc --noEmit
  fi
}

