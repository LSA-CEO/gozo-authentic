require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findBadCTAEntry() {
  console.log('🔍 Recherche de l\'entrée problématique\n');
  
  // Chercher TOUTES les entrées HomePage pour ES
  const { data } = await supabaseAdmin
    .from('site_content')
    .select('*')
    .eq('page', 'HomePage')
    .eq('locale', 'es')
    .order('section, key');
    
  console.log('Toutes les entrées HomePage pour ES:\n');
  data?.forEach(item => {
    console.log(`${item.section}.${item.key} = "${item.value.substring(0, 50)}..."`);
  });
  
  // Chercher spécifiquement les entrées avec section=general et key=cta
  console.log('\n\n⚠️ Entrées suspectes:');
  data?.filter(item => 
    (item.section === 'general' && item.key === 'cta') ||
    (item.section === 'cta' && !['title', 'subtitle', 'button'].includes(item.key))
  ).forEach(item => {
    console.log(`\nID: ${item.id}`);
    console.log(`Section: ${item.section}, Key: ${item.key}`);
    console.log(`Value: "${item.value}"`);
  });
}

findBadCTAEntry();
