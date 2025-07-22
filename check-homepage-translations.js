require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkHomePage() {
  // Vérifier les traductions HomePage
  const { data } = await supabaseAdmin
    .from('site_content')
    .select('page, section, key, value')
    .eq('locale', 'fr')
    .eq('page', 'HomePage')
    .order('section', 'key');
    
  console.log('HomePage translations:');
  data?.forEach(item => {
    console.log(`  ${item.section}.${item.key}: "${item.value.substring(0, 50)}..."`);
  });
  
  // Voir la structure créée
  const messages = {};
  data?.forEach(item => {
    if (!messages[item.page]) {
      messages[item.page] = {};
    }
    
    if (item.section === 'general') {
      messages[item.page][item.key] = item.value;
    } else {
      if (!messages[item.page][item.section]) {
        messages[item.page][item.section] = {};
      }
      messages[item.page][item.section][item.key] = item.value;
    }
  });
  
  console.log('\nStructure finale:');
  console.log(JSON.stringify(messages, null, 2));
}

checkHomePage();
