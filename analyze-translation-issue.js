require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeTranslationIssue() {
  console.log('🔍 Analyse du problème de traduction\n');
  
  // 1. Vérifier les catégories non traduites
  console.log('1️⃣ CATEGORIES - Valeurs actuelles:');
  const { data: categories } = await supabaseAdmin
    .from('categories')
    .select('slug, description_en, description_es, description_fr')
    .in('slug', ['nos-aventures-en-mer', 'nos-folies-terrestres', 'nos-pepites-locales']);
    
  categories?.forEach(cat => {
    console.log(`\n${cat.slug}:`);
    console.log(`  EN: ${cat.description_en}`);
    console.log(`  FR: ${cat.description_fr}`);
    console.log(`  ES: ${cat.description_es}`);
    console.log(`  Traduit? ${cat.description_es !== cat.description_en ? '✅' : '❌'}`);
  });
  
  // 2. Vérifier HomePage.categories.subtitle
  console.log('\n\n2️⃣ HOMEPAGE.CATEGORIES.SUBTITLE:');
  const { data: subtitles } = await supabaseAdmin
    .from('site_content')
    .select('locale, value')
    .eq('page', 'HomePage')
    .eq('section', 'categories')
    .eq('key', 'subtitle')
    .in('locale', ['en', 'fr', 'es']);
    
  subtitles?.forEach(s => {
    console.log(`  ${s.locale}: ${s.value.substring(0, 60)}...`);
  });
}

analyzeTranslationIssue();
