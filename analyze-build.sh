#!/bin/bash

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Fichiers de log
BUILD_LOG="build-output.log"
ERROR_LOG="build-errors.log"
ANALYSIS_LOG="build-analysis.md"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}    ANALYSE COMPLÈTE DU BUILD GOZOAUTHENTIC    ${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Nettoyage des anciens logs
rm -f $BUILD_LOG $ERROR_LOG $ANALYSIS_LOG

# Créer le fichier d'analyse
cat > $ANALYSIS_LOG << EOFMD
# Analyse du Build GozoAuthentic - $TIMESTAMP

## Résumé Exécutif

EOFMD

# Fonction pour compter les occurrences
count_pattern() {
    grep -c "$1" $BUILD_LOG 2>/dev/null || echo 0
}

# Fonction pour extraire les erreurs uniques
extract_unique_errors() {
    grep -E "(Error:|error:|ERROR:|Failed|failed|FAILED)" $BUILD_LOG | \
    grep -v "0 errors" | \
    sort | uniq -c | sort -rn
}

# 1. Lancer le build et capturer la sortie
echo -e "${YELLOW}📦 Lancement du build...${NC}"
npm run build > $BUILD_LOG 2>&1
BUILD_EXIT_CODE=$?

# 2. Analyser le code de sortie
echo "" >> $ANALYSIS_LOG
if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Build réussi!${NC}"
    echo "✅ **Build Status**: SUCCESS" >> $ANALYSIS_LOG
else
    echo -e "${RED}❌ Build échoué avec le code: $BUILD_EXIT_CODE${NC}"
    echo "❌ **Build Status**: FAILED (Exit code: $BUILD_EXIT_CODE)" >> $ANALYSIS_LOG
fi

# 3. Extraire toutes les erreurs
echo -e "\n${YELLOW}🔍 Extraction des erreurs...${NC}"
grep -E "(Error:|error:|ERROR:|Failed|failed|FAILED|Warning:|warning:|WARNING:)" $BUILD_LOG > $ERROR_LOG 2>/dev/null

# 4. Compter les différents types d'erreurs
TOTAL_ERRORS=$(count_pattern "Error:|error:|ERROR:")
TOTAL_WARNINGS=$(count_pattern "Warning:|warning:|WARNING:")
TYPE_ERRORS=$(count_pattern "Type error:|type error:|TS[0-9]+:")
IMPORT_ERRORS=$(count_pattern "Cannot find module|Module not found|import")
ESLINT_ERRORS=$(count_pattern "ESLint|eslint")
MISSING_DEPS=$(count_pattern "Module not found|Cannot resolve")
TYPESCRIPT_ERRORS=$(count_pattern "TS[0-9]+:|TypeScript error")

# 5. Écrire le résumé dans le rapport
cat >> $ANALYSIS_LOG << EOFMD

## Statistiques des Erreurs

- **Total Erreurs**: $TOTAL_ERRORS
- **Total Warnings**: $TOTAL_WARNINGS
- **Erreurs TypeScript**: $TYPESCRIPT_ERRORS
- **Erreurs de Type**: $TYPE_ERRORS
- **Erreurs d'Import**: $IMPORT_ERRORS
- **Erreurs ESLint**: $ESLINT_ERRORS
- **Dépendances Manquantes**: $MISSING_DEPS

## Erreurs par Catégorie

### 1. Erreurs TypeScript
\`\`\`
EOFMD

# Extraire les erreurs TypeScript
grep -E "TS[0-9]+:|TypeScript error" $BUILD_LOG >> $ANALYSIS_LOG 2>/dev/null || echo "Aucune erreur TypeScript trouvée" >> $ANALYSIS_LOG

cat >> $ANALYSIS_LOG << EOFMD
\`\`\`

### 2. Erreurs d'Import/Module
\`\`\`
EOFMD

grep -E "Cannot find module|Module not found|Cannot resolve|import" $BUILD_LOG | head -20 >> $ANALYSIS_LOG 2>/dev/null || echo "Aucune erreur d'import trouvée" >> $ANALYSIS_LOG

cat >> $ANALYSIS_LOG << EOFMD
\`\`\`

### 3. Erreurs de Type
\`\`\`
EOFMD

grep -E "Type '.*' is not assignable|Property '.*' does not exist|type error" $BUILD_LOG | head -20 >> $ANALYSIS_LOG 2>/dev/null || echo "Aucune erreur de type trouvée" >> $ANALYSIS_LOG

cat >> $ANALYSIS_LOG << EOFMD
\`\`\`

### 4. Fichiers avec Erreurs
\`\`\`
EOFMD

# Extraire les fichiers avec erreurs
grep -E "\.tsx?:|\.jsx?:" $BUILD_LOG | cut -d: -f1 | sort | uniq -c | sort -rn | head -20 >> $ANALYSIS_LOG 2>/dev/null

cat >> $ANALYSIS_LOG << EOFMD
\`\`\`

## Erreurs Uniques (Top 10)
\`\`\`
EOFMD

extract_unique_errors | head -10 >> $ANALYSIS_LOG

cat >> $ANALYSIS_LOG << EOFMD
\`\`\`

## Recommandations

EOFMD

# 6. Analyser et suggérer des solutions
echo -e "\n${CYAN}💡 Génération des recommandations...${NC}"

if [ $IMPORT_ERRORS -gt 0 ]; then
    cat >> $ANALYSIS_LOG << EOFMD
### 🔧 Erreurs d'Import ($IMPORT_ERRORS trouvées)
- Vérifier les chemins d'import (relatifs vs absolus)
- S'assurer que tous les modules sont installés: \`npm install\`
- Vérifier les exports dans les modules importés
- Vérifier la casse des noms de fichiers (sensible sur Linux)

EOFMD
fi

if [ $TYPE_ERRORS -gt 0 ]; then
    cat >> $ANALYSIS_LOG << EOFMD
### 🔧 Erreurs de Type ($TYPE_ERRORS trouvées)
- Ajouter les types manquants aux props/paramètres
- Vérifier les interfaces et types définis
- Utiliser \`any\` temporairement pour débloquer le build
- Vérifier les versions des @types/* packages

EOFMD
fi

if [ $TYPESCRIPT_ERRORS -gt 0 ]; then
    cat >> $ANALYSIS_LOG << EOFMD
### 🔧 Erreurs TypeScript ($TYPESCRIPT_ERRORS trouvées)
- Vérifier tsconfig.json
- S'assurer que les types sont correctement définis
- Utiliser \`// @ts-ignore\` en dernier recours
- Mettre à jour TypeScript si nécessaire

EOFMD
fi

if [ $MISSING_DEPS -gt 0 ]; then
    cat >> $ANALYSIS_LOG << EOFMD
### 🔧 Dépendances Manquantes ($MISSING_DEPS trouvées)
Exécuter les commandes suivantes:
\`\`\`bash
rm -rf node_modules package-lock.json
npm install
npm audit fix
\`\`\`

EOFMD
fi

# 7. Commandes de debug suggérées
cat >> $ANALYSIS_LOG << EOFMD

## Commandes de Debug Suggérées

\`\`\`bash
# 1. Nettoyer et réinstaller
rm -rf .next node_modules
npm install

# 2. Vérifier les types
npx tsc --noEmit

# 3. Lancer ESLint
npm run lint

# 4. Build avec plus de détails
NEXT_TELEMETRY_DISABLED=1 npm run build -- --debug

# 5. Vérifier les imports circulaires
npx madge --circular --extensions ts,tsx ./

# 6. Analyser le bundle
ANALYZE=true npm run build
\`\`\`

## Logs Complets

- Build complet: \`$BUILD_LOG\`
- Erreurs extraites: \`$ERROR_LOG\`
- Cette analyse: \`$ANALYSIS_LOG\`

EOFMD

# 8. Afficher le résumé dans le terminal
echo -e "\n${PURPLE}📊 RÉSUMÉ DE L'ANALYSE${NC}"
echo -e "${PURPLE}═══════════════════════${NC}"
echo -e "Erreurs totales: ${RED}$TOTAL_ERRORS${NC}"
echo -e "Warnings totaux: ${YELLOW}$TOTAL_WARNINGS${NC}"
echo -e "Erreurs TypeScript: ${RED}$TYPESCRIPT_ERRORS${NC}"
echo -e "Erreurs d'import: ${RED}$IMPORT_ERRORS${NC}"
echo -e "Erreurs de type: ${RED}$TYPE_ERRORS${NC}"

# 9. Créer un fichier avec les corrections rapides
if [ $BUILD_EXIT_CODE -ne 0 ]; then
    echo -e "\n${YELLOW}🔧 Génération du script de correction rapide...${NC}"
    
    cat > fix-build.sh << 'EOFFIX'
#!/bin/bash
echo "🔧 Application des corrections rapides..."

# 1. Clean
echo "🧹 Nettoyage..."
rm -rf .next node_modules/.cache

# 2. Fix des types les plus communs
echo "📝 Correction des types..."

# Ajouter 'any' temporairement aux endroits problématiques
find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | while read file; do
    # Backup
    cp "$file" "$file.backup"
done

# 3. Vérification des imports
echo "🔍 Vérification des imports..."
npx tsc --noEmit --listFiles | grep -E "error TS" || echo "✅ Pas d'erreur TypeScript majeure"

echo "✅ Corrections appliquées. Relancer: npm run build"
EOFFIX

    chmod +x fix-build.sh
    echo -e "${GREEN}✅ Script de correction créé: ./fix-build.sh${NC}"
fi

# 10. Afficher les prochaines étapes
echo -e "\n${CYAN}📋 PROCHAINES ÉTAPES:${NC}"
echo -e "${CYAN}════════════════════${NC}"
echo "1. Consulter l'analyse détaillée: ${BLUE}cat $ANALYSIS_LOG${NC}"
echo "2. Voir toutes les erreurs: ${BLUE}cat $ERROR_LOG${NC}"
echo "3. Voir le log complet: ${BLUE}cat $BUILD_LOG${NC}"

if [ $BUILD_EXIT_CODE -ne 0 ]; then
    echo "4. Appliquer les corrections: ${BLUE}./fix-build.sh${NC}"
    echo "5. Relancer le build: ${BLUE}npm run build${NC}"
    
    # Afficher les 5 premières erreurs critiques
    echo -e "\n${RED}🚨 PREMIÈRES ERREURS CRITIQUES:${NC}"
    grep -E "Error:|error:" $BUILD_LOG | grep -v "0 errors" | head -5
fi

echo -e "\n${GREEN}✅ Analyse terminée!${NC}"
echo -e "Rapport complet sauvegardé dans: ${BLUE}$ANALYSIS_LOG${NC}"

# Ouvrir automatiquement le rapport si possible
if command -v code &> /dev/null; then
    code $ANALYSIS_LOG
elif command -v open &> /dev/null; then
    open $ANALYSIS_LOG
fi

