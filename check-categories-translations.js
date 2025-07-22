require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCategoriesTranslations() {
  console.log('🔍 Vérification des traductions problématiques\n');
  
  // 1. Vérifier HomePage.categories.subtitle pour ES
  console.log('1️⃣ HomePage.categories.subtitle pour ES:');
  const { data: subtitle } = await supabaseAdmin
    .from('site_content')
    .select('value')
    .eq('page', 'HomePage')
    .eq('section', 'categories')
    .eq('key', 'subtitle')
    .eq('locale', 'es')
    .single();
    
  console.log(`Valeur actuelle: "${subtitle?.value}"\n`);
  
  // 2. Vérifier les descriptions des catégories
  console.log('2️⃣ Descriptions des catégories pour ES:');
  const { data: categories } = await supabaseAdmin
    .from('categories')
    .select('slug, description_es, description_en')
    .order('position');
    
  categories?.forEach(cat => {
    console.log(`\n${cat.slug}:`);
    console.log(`  ES: ${cat.description_es || '❌ MANQUANT'}`);
    console.log(`  EN: ${cat.description_en}`);
  });
}

checkCategoriesTranslations();
