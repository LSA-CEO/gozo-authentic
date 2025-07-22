require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function forceCorrectTranslations() {
  console.log('🔧 Suppression des mauvaises traductions pour forcer la retraduction\n');
  
  // Catégories problématiques
  const problematicCategories = [
    { slug: 'nos-aventures-en-mer', fr: 'On a testé pour vous trouver les meilleures' },
    { slug: 'nos-folies-terrestres', fr: 'Pour ceux qui aiment l\'adrénaline comme nous' }
  ];
  
  // 1. D'abord, vider COMPLÈTEMENT les traductions incorrectes
  for (const cat of problematicCategories) {
    console.log(`Nettoyage de ${cat.slug}...`);
    
    const { error } = await supabaseAdmin
      .from('categories')
      .update({
        description_en: null,
        description_es: null,
        description_de: null,
        description_it: null,
        description_nl: null,
        description_pt: null
      })
      .eq('slug', cat.slug);
      
    if (!error) {
      console.log('  ✅ Nettoyé');
    }
  }
  
  console.log('\n2. Maintenant, relancez la traduction des catégories depuis l\'admin');
  console.log('   ou exécutez: node retranslate-categories.js');
}

forceCorrectTranslations();
