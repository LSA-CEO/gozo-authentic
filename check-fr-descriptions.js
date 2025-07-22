require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkFrDescriptions() {
  console.log('🔍 Vérification des descriptions FR (source de traduction)\n');
  
  const { data: categories } = await supabaseAdmin
    .from('categories')
    .select('slug, name_fr, description_fr')
    .order('position');
    
  categories?.forEach(cat => {
    console.log(`${cat.slug}:`);
    console.log(`  name_fr: ${cat.name_fr || '❌ MANQUANT'}`);
    console.log(`  description_fr: ${cat.description_fr || '❌ MANQUANT'}`);
    console.log('');
  });
  
  console.log('\n💡 Le système traduit DEPUIS le français.');
  console.log('Si description_fr est vide, rien n\'est traduit !');
}

checkFrDescriptions();
