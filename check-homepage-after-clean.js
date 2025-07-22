require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkHomePage() {
  // Vérifier les traductions HomePage après nettoyage
  const { data, count } = await supabaseAdmin
    .from('site_content')
    .select('page, section, key, value', { count: 'exact' })
    .eq('locale', 'fr')
    .eq('page', 'HomePage')
    .order('section, key');
    
  console.log(`\nFound ${count} HomePage translations for FR:\n`);
  
  // Grouper par section
  const sections = {};
  data?.forEach(item => {
    if (!sections[item.section]) {
      sections[item.section] = [];
    }
    sections[item.section].push(`  ${item.key}: "${item.value.substring(0, 40)}..."`);
  });
  
  Object.entries(sections).forEach(([section, keys]) => {
    console.log(`[HomePage.${section}]`);
    keys.forEach(key => console.log(key));
    console.log('');
  });
  
  // Vérifier aussi les autres langues
  console.log('\nChecking other languages:');
  const locales = ['en', 'de', 'it', 'nl', 'es', 'pt'];
  
  for (const locale of locales) {
    const { count } = await supabaseAdmin
      .from('site_content')
      .select('*', { count: 'exact', head: true })
      .eq('locale', locale)
      .eq('page', 'HomePage');
      
    console.log(`  ${locale.toUpperCase()}: ${count || 0} HomePage translations`);
  }
  
  // Vérifier la structure complète pour debug
  console.log('\n\nDEBUG - Full structure for FR:');
  const { data: allFr } = await supabaseAdmin
    .from('site_content')
    .select('page, section, key')
    .eq('locale', 'fr')
    .limit(10);
    
  console.log('Sample entries:', JSON.stringify(allFr, null, 2));
}

checkHomePage();
