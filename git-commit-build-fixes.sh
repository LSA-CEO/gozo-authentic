#!/bin/bash

echo "📦 PRÉPARATION DU COMMIT GIT"
echo "============================"
echo ""

# 1. Voir le status actuel
echo "📊 Status actuel :"
git status --short

echo ""
echo "📋 Résumé des modifications :"
git diff --stat

echo ""
echo "🔍 Fichiers modifiés :"
git diff --name-only

echo ""
echo "➡️  Ajout de tous les fichiers modifiés..."
git add .

echo ""
echo "📝 Création du commit..."
git commit -m "🚀 Fix: Correction de toutes les erreurs TypeScript pour Next.js 15

- ✅ Params asynchrones dans toutes les routes API
- ✅ Correction des types null/undefined
- ✅ Fix des imports et exports manquants
- ✅ Ajout des types manquants (Buffer, refs, etc.)
- ✅ Correction SEO.tsx (doublons supprimés)
- ✅ Fix auth avec email obligatoire
- ✅ Build réussi sans erreurs TypeScript

Tous les fichiers sont maintenant compatibles avec Next.js 15 et TypeScript strict."

echo ""
echo "✅ Commit créé !"
echo ""
echo "📊 Dernier commit :"
git log -1 --oneline

echo ""
echo "🚀 Pour pusher : git push origin main"

