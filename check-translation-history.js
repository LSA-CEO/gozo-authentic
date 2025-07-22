require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTranslationHistory() {
  console.log('🔍 Analyse approfondie du problème\n');
  
  // Vérifier toutes les valeurs pour les catégories problématiques
  const { data: categories } = await supabaseAdmin
    .from('categories')
    .select('*')
    .in('slug', ['nos-aventures-en-mer', 'nos-folies-terrestres']);
    
  categories?.forEach(cat => {
    console.log(`${cat.slug}:`);
    console.log(`  FR: ${cat.description_fr}`);
    console.log(`  EN: ${cat.description_en}`);
    console.log(`  ES: ${cat.description_es}`);
    console.log(`  DE: ${cat.description_de}`);
    console.log(`  IT: ${cat.description_it}`);
    console.log(`  updated_at: ${cat.updated_at}`);
    console.log('');
  });
  
  console.log('❓ Si ES/DE/IT sont identiques à EN, c\'est que:');
  console.log('   1. La traduction a échoué');
  console.log('   2. OU quelqu\'un a copié EN partout');
}

checkTranslationHistory();
