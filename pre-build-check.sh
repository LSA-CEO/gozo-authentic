#!/bin/bash

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Variables globales
TOTAL_ERRORS=0
TOTAL_WARNINGS=0
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
REPORT_FILE="pre-build-report-$TIMESTAMP.md"

# Fonction pour afficher et logger
log() {
    echo -e "$1"
    echo -e "$1" | sed 's/\x1b\[[0-9;]*m//g' >> "$REPORT_FILE"
}

# En-tête du rapport
cat > "$REPORT_FILE" << EOFHEADER
# Rapport Pre-Build GozoAuthentic - $TIMESTAMP

## Résumé Exécutif

EOFHEADER

log "${BLUE}================================================${NC}"
log "${BLUE}    ANALYSE PRE-BUILD COMPLETE GOZOAUTHENTIC    ${NC}"
log "${BLUE}================================================${NC}"
log ""

# 1. Vérification des variables d'environnement
log "${CYAN}1. Vérification des variables d'environnement...${NC}"
ENV_ERRORS=0
REQUIRED_ENVS=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "GOOGLE_SHEETS_PRIVATE_KEY"
    "GOOGLE_SHEETS_CLIENT_EMAIL"
    "GOOGLE_SHEETS_SPREADSHEET_ID"
    "GROQ_API_KEY"
)

echo "### 1. Variables d'Environnement" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

for env in "${REQUIRED_ENVS[@]}"; do
    if [ -z "${!env}" ]; then
        log "  ${RED}❌ $env manquante${NC}"
        echo "- ❌ \`$env\` manquante" >> "$REPORT_FILE"
        ((ENV_ERRORS++))
        ((TOTAL_ERRORS++))
    else
        log "  ${GREEN}✓ $env présente${NC}"
        echo "- ✅ \`$env\` présente" >> "$REPORT_FILE"
    fi
done

if [ $ENV_ERRORS -eq 0 ]; then
    log "${GREEN}✅ Toutes les variables d'environnement sont présentes${NC}"
fi
echo "" >> "$REPORT_FILE"

# 2. Vérification des imports @/
log ""
log "${CYAN}2. Vérification des imports @/...${NC}"
echo "### 2. Imports @/" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

AT_IMPORTS=$(grep -r "from ['\"]@/" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | grep -v node_modules | grep -v .next | wc -l)

if [ $AT_IMPORTS -gt 0 ]; then
    log "  ${RED}❌ $AT_IMPORTS imports @/ trouvés (non supportés)${NC}"
    echo "❌ **$AT_IMPORTS imports @/ trouvés** (non supportés dans cette configuration)" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "Fichiers concernés:" >> "$REPORT_FILE"
    echo "\`\`\`" >> "$REPORT_FILE"
    grep -r "from ['\"]@/" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | grep -v node_modules | grep -v .next | cut -d: -f1 | sort | uniq >> "$REPORT_FILE"
    echo "\`\`\`" >> "$REPORT_FILE"
    ((TOTAL_ERRORS += AT_IMPORTS))
else
    log "  ${GREEN}✓ Aucun import @/ trouvé${NC}"
    echo "✅ Aucun import @/ trouvé" >> "$REPORT_FILE"
fi
echo "" >> "$REPORT_FILE"

# 3. Vérification des imports de modules inexistants
log ""
log "${CYAN}3. Vérification des imports de modules inexistants...${NC}"
echo "### 3. Imports de Modules Inexistants" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

IMPORT_ERRORS=0
# Patterns d'imports problématiques connus
PROBLEMATIC_IMPORTS=(
    "lib/supabase/server"
    "lib/supabase/client"
    "@/components"
    "@/lib"
    "@/app"
)

for pattern in "${PROBLEMATIC_IMPORTS[@]}"; do
    COUNT=$(grep -r "$pattern" . --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v node_modules | grep -v .next | wc -l)
    if [ $COUNT -gt 0 ]; then
        log "  ${RED}❌ $COUNT imports de '$pattern' trouvés${NC}"
        echo "- ❌ **$COUNT imports de \`$pattern\`** trouvés" >> "$REPORT_FILE"
        ((IMPORT_ERRORS += COUNT))
    fi
done

if [ $IMPORT_ERRORS -eq 0 ]; then
    log "  ${GREEN}✓ Aucun import problématique détecté${NC}"
    echo "✅ Aucun import problématique détecté" >> "$REPORT_FILE"
fi
((TOTAL_ERRORS += IMPORT_ERRORS))
echo "" >> "$REPORT_FILE"

# 4. Vérification TypeScript
log ""
log "${CYAN}4. Vérification TypeScript...${NC}"
echo "### 4. Erreurs TypeScript" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

npx tsc --noEmit --pretty false 2>&1 | tee tsc-output.tmp | head -20
TSC_EXIT_CODE=${PIPESTATUS[0]}
TSC_ERRORS=$(grep -c "error TS" tsc-output.tmp 2>/dev/null || echo 0)

if [ $TSC_EXIT_CODE -ne 0 ]; then
    log "  ${RED}❌ $TSC_ERRORS erreurs TypeScript trouvées${NC}"
    echo "❌ **$TSC_ERRORS erreurs TypeScript** trouvées" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "Premières erreurs:" >> "$REPORT_FILE"
    echo "\`\`\`typescript" >> "$REPORT_FILE"
    head -10 tsc-output.tmp >> "$REPORT_FILE"
    echo "\`\`\`" >> "$REPORT_FILE"
    ((TOTAL_ERRORS += TSC_ERRORS))
else
    log "  ${GREEN}✓ Aucune erreur TypeScript${NC}"
    echo "✅ Aucune erreur TypeScript" >> "$REPORT_FILE"
fi
rm -f tsc-output.tmp
echo "" >> "$REPORT_FILE"

# 5. Vérification ESLint
log ""
log "${CYAN}5. Vérification ESLint...${NC}"
echo "### 5. Erreurs ESLint" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

npx eslint . --ext .ts,.tsx,.js,.jsx --format unix 2>&1 | tee eslint-output.tmp | head -20
ESLINT_ERRORS=$(grep -c "error" eslint-output.tmp 2>/dev/null || echo 0)
ESLINT_WARNINGS=$(grep -c "warning" eslint-output.tmp 2>/dev/null || echo 0)

log "  ${YELLOW}⚠️  $ESLINT_WARNINGS warnings ESLint${NC}"
log "  ${RED}❌ $ESLINT_ERRORS erreurs ESLint${NC}"
echo "- ⚠️  **$ESLINT_WARNINGS warnings** ESLint" >> "$REPORT_FILE"
echo "- ❌ **$ESLINT_ERRORS erreurs** ESLint" >> "$REPORT_FILE"

((TOTAL_ERRORS += ESLINT_ERRORS))
((TOTAL_WARNINGS += ESLINT_WARNINGS))
rm -f eslint-output.tmp
echo "" >> "$REPORT_FILE"

# 6. Vérification des dépendances
log ""
log "${CYAN}6. Vérification des dépendances...${NC}"
echo "### 6. Dépendances" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Vérifier package-lock.json
if [ ! -f "package-lock.json" ]; then
    log "  ${YELLOW}⚠️  package-lock.json manquant${NC}"
    echo "⚠️  \`package-lock.json\` manquant" >> "$REPORT_FILE"
    ((TOTAL_WARNINGS++))
fi

# Vérifier les dépendances manquantes
npm ls --depth=0 2>&1 | grep "UNMET" > unmet-deps.tmp
UNMET_COUNT=$(wc -l < unmet-deps.tmp)

if [ $UNMET_COUNT -gt 0 ]; then
    log "  ${RED}❌ $UNMET_COUNT dépendances non satisfaites${NC}"
    echo "❌ **$UNMET_COUNT dépendances non satisfaites**" >> "$REPORT_FILE"
    ((TOTAL_ERRORS += UNMET_COUNT))
else
    log "  ${GREEN}✓ Toutes les dépendances sont installées${NC}"
    echo "✅ Toutes les dépendances sont installées" >> "$REPORT_FILE"
fi
rm -f unmet-deps.tmp
echo "" >> "$REPORT_FILE"

# 7. Vérification des fichiers critiques
log ""
log "${CYAN}7. Vérification des fichiers critiques...${NC}"
echo "### 7. Fichiers Critiques" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

CRITICAL_FILES=(
    "next.config.js"
    "tsconfig.json"
    "tailwind.config.js"
    "middleware.ts"
    "i18n/request.ts"
)

MISSING_FILES=0
for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        log "  ${RED}❌ $file manquant${NC}"
        echo "- ❌ \`$file\` manquant" >> "$REPORT_FILE"
        ((MISSING_FILES++))
        ((TOTAL_ERRORS++))
    else
        log "  ${GREEN}✓ $file présent${NC}"
        echo "- ✅ \`$file\` présent" >> "$REPORT_FILE"
    fi
done
echo "" >> "$REPORT_FILE"

# 8. Analyse des erreurs potentielles de build Next.js
log ""
log "${CYAN}8. Analyse des patterns d'erreurs Next.js 15...${NC}"
echo "### 8. Patterns d'Erreurs Next.js 15" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Vérifier les params asynchrones dans les pages dynamiques
ASYNC_PARAMS=$(grep -r "params:" app --include="*.tsx" | grep -v "Promise<" | grep "\[.*\]" | wc -l)
if [ $ASYNC_PARAMS -gt 0 ]; then
    log "  ${YELLOW}⚠️  $ASYNC_PARAMS pages dynamiques sans params asynchrones (Next.js 15)${NC}"
    echo "⚠️  **$ASYNC_PARAMS pages dynamiques** pourraient nécessiter des params asynchrones" >> "$REPORT_FILE"
    ((TOTAL_WARNINGS += ASYNC_PARAMS))
fi

# 9. Résumé final
log ""
log "${PURPLE}═══════════════════════════════════════════════${NC}"
log "${PURPLE}                RÉSUMÉ FINAL                    ${NC}"
log "${PURPLE}═══════════════════════════════════════════════${NC}"
log ""

echo "## Résumé Final" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "- 🔴 **Erreurs totales**: $TOTAL_ERRORS" >> "$REPORT_FILE"
echo "- 🟡 **Warnings totaux**: $TOTAL_WARNINGS" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

if [ $TOTAL_ERRORS -eq 0 ]; then
    log "${GREEN}✅ AUCUNE ERREUR CRITIQUE DÉTECTÉE !${NC}"
    log "${GREEN}   Le build devrait réussir.${NC}"
    echo "✅ **AUCUNE ERREUR CRITIQUE DÉTECTÉE !**" >> "$REPORT_FILE"
    echo "Le build devrait réussir." >> "$REPORT_FILE"
else
    log "${RED}❌ $TOTAL_ERRORS ERREURS CRITIQUES DÉTECTÉES !${NC}"
    log "${RED}   Le build va probablement échouer.${NC}"
    echo "❌ **$TOTAL_ERRORS ERREURS CRITIQUES DÉTECTÉES !**" >> "$REPORT_FILE"
    echo "Le build va probablement échouer." >> "$REPORT_FILE"
fi

if [ $TOTAL_WARNINGS -gt 0 ]; then
    log "${YELLOW}⚠️  $TOTAL_WARNINGS warnings à considérer${NC}"
fi

log ""
log "${CYAN}📋 Rapport complet sauvegardé dans: ${BLUE}$REPORT_FILE${NC}"
log ""
log "${CYAN}🚀 Pour lancer le build: ${BLUE}npm run build${NC}"
log "${CYAN}🔧 Pour ignorer ESLint: ${BLUE}DISABLE_ESLINT_PLUGIN=true npm run build${NC}"

# Ouvrir le rapport si possible
if command -v code &> /dev/null; then
    code "$REPORT_FILE"
elif command -v open &> /dev/null; then
    open "$REPORT_FILE"
fi

# Code de sortie basé sur les erreurs
exit $TOTAL_ERRORS

