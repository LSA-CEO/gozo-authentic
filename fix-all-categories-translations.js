require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixAllCategoriesTranslations() {
  console.log('🔧 Correction des traductions de catégories\n');
  
  // 1. Corriger HomePage.categories.subtitle
  console.log('1️⃣ Correction du subtitle (temporairement en anglais):');
  
  const englishSubtitle = "After 3 years in Gozo, we've organized our best finds into 6 intimate categories";
  const locales = ['de', 'it', 'nl', 'es', 'pt'];
  
  for (const locale of locales) {
    const { error } = await supabaseAdmin
      .from('site_content')
      .update({ value: englishSubtitle })
      .eq('page', 'HomePage')
      .eq('section', 'categories')
      .eq('key', 'subtitle')
      .eq('locale', locale);
      
    if (!error) {
      console.log(`  ✅ ${locale}`);
    }
  }
  
  // 2. Ajouter les descriptions manquantes aux catégories
  console.log('\n2️⃣ Ajout des descriptions manquantes:');
  
  // Récupérer toutes les catégories
  const { data: categories } = await supabaseAdmin
    .from('categories')
    .select('*');
    
  for (const category of categories || []) {
    console.log(`\n${category.slug}:`);
    
    // Pour chaque langue, copier depuis l'anglais si manquant
    for (const locale of ['es', 'de', 'it', 'nl', 'pt']) {
      const descKey = `description_${locale}`;
      
      if (!category[descKey] && category.description_en) {
        const { error } = await supabaseAdmin
          .from('categories')
          .update({ [descKey]: category.description_en })
          .eq('id', category.id);
          
        if (!error) {
          console.log(`  ✅ ${locale}`);
        }
      }
    }
  }
  
  console.log('\n✨ Fait! Utilisez le panel admin pour traduire correctement.');
}

fixAllCategoriesTranslations();
