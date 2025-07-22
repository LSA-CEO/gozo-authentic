#!/bin/bash

echo "🔧 Correction des params asynchrones pour Next.js 15..."
echo ""

# Fichiers à corriger
FILES=(
    "app/api/admin/experiences/[id]/route.ts"
    "app/api/admin/leads/[id]/route.ts"
    "app/api/admin/tags/[id]/route.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "📝 Correction de: $file"
        
        # Créer une sauvegarde
        cp "$file" "$file.backup"
        
        # Étape 1: Remplacer { params: { id: string } } par { params: Promise<{ id: string }> }
        sed -i '' 's/{ params }: { params: { id: string } }/{ params }: { params: Promise<{ id: string }> }/g' "$file"
        
        # Étape 2: Ajouter const { id } = await params; après chaque signature de fonction
        # Pour GET
        sed -i '' '/export async function GET(/,/^{/ {
            /^{/ a\
  const { id } = await params;
        }' "$file"
        
        # Pour POST
        sed -i '' '/export async function POST(/,/^{/ {
            /^{/ a\
  const { id } = await params;
        }' "$file"
        
        # Pour PATCH
        sed -i '' '/export async function PATCH(/,/^{/ {
            /^{/ a\
  const { id } = await params;
        }' "$file"
        
        # Pour PUT
        sed -i '' '/export async function PUT(/,/^{/ {
            /^{/ a\
  const { id } = await params;
        }' "$file"
        
        # Pour DELETE
        sed -i '' '/export async function DELETE(/,/^{/ {
            /^{/ a\
  const { id } = await params;
        }' "$file"
        
        # Étape 3: Remplacer params.id par id dans tout le fichier
        sed -i '' 's/params\.id/id/g' "$file"
        
        echo "  ✅ Corrigé"
    else
        echo "  ⚠️  Fichier non trouvé: $file"
    fi
done

echo ""
echo "✅ Corrections terminées!"
echo "💡 Les sauvegardes sont dans *.backup"
echo ""
echo "🚀 Pour relancer le build: npm run build"

