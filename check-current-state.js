require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCurrentState() {
  console.log('🔍 État actuel\n');
  
  // 1. Vérifier nos-aventures-en-mer
  console.log('1️⃣ nos-aventures-en-mer:');
  const { data: aventures } = await supabaseAdmin
    .from('categories')
    .select('description_fr, description_en, description_es, description_de')
    .eq('slug', 'nos-aventures-en-mer')
    .single();
    
  console.log('  FR:', aventures?.description_fr);
  console.log('  EN:', aventures?.description_en || '❌ VIDE');
  console.log('  ES:', aventures?.description_es || '❌ VIDE');
  console.log('  DE:', aventures?.description_de || '❌ VIDE');
  
  // 2. Vérifier HomePage.categories.subtitle
  console.log('\n2️⃣ HomePage.categories.subtitle:');
  const { data: subtitles } = await supabaseAdmin
    .from('site_content')
    .select('locale, value')
    .eq('page', 'HomePage')
    .eq('section', 'categories')
    .eq('key', 'subtitle')
    .in('locale', ['fr', 'es', 'de']);
    
  subtitles?.forEach(s => {
    console.log(`  ${s.locale}: ${s.value.substring(0, 60)}...`);
  });
}

checkCurrentState();
