require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyCategories() {
  console.log('🔍 Vérification des catégories après traduction\n');
  
  const { data: categories } = await supabaseAdmin
    .from('categories')
    .select('slug, description_es, description_de')
    .order('position');
    
  categories?.forEach(cat => {
    console.log(`${cat.slug}:`);
    console.log(`  ES: ${cat.description_es?.substring(0, 50)}...`);
    console.log(`  DE: ${cat.description_de?.substring(0, 50)}...\n`);
  });
}

verifyCategories();
