require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testMessageStructure() {
  console.log('🔍 Test de la structure des messages pour ES\n');
  
  // Simuler ce que fait le layout
  const { data } = await supabaseAdmin
    .from('site_content')
    .select('page, section, key, value')
    .eq('locale', 'es');
    
  // Construire la structure
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
  
  console.log('Structure HomePage pour ES:');
  console.log(JSON.stringify(messages.HomePage, null, 2));
  
  console.log('\nVérification HomePage.cta.title:');
  console.log('Existe?', !!messages.HomePage?.cta?.title);
  console.log('Valeur:', messages.HomePage?.cta?.title);
}

testMessageStructure();
