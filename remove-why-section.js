require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function removeWhySection() {
  console.log('🗑️  Removing all "why" related content...\n');
  
  // 1. Supprimer toute la section "why" de HomePage
  console.log('Deleting HomePage.why section...');
  const { error: error1, count: count1 } = await supabaseAdmin
    .from('site_content')
    .delete()
    .eq('page', 'HomePage')
    .eq('section', 'why');
    
  if (!error1) {
    console.log(`✅ Deleted ${count1 || 0} entries from HomePage.why`);
  }
  
  // 2. Supprimer toutes les clés qui commencent par "why." dans toutes les sections
  console.log('\nSearching for why.* keys in other sections...');
  const { data: whyKeys } = await supabaseAdmin
    .from('site_content')
    .select('id, page, section, key, locale')
    .like('key', 'why.%');
    
  if (whyKeys && whyKeys.length > 0) {
    console.log(`Found ${whyKeys.length} keys starting with "why.":`);
    
    // Grouper par page/section pour affichage
    const grouped = {};
    whyKeys.forEach(item => {
      const key = `${item.page}.${item.section}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item.key);
    });
    
    Object.entries(grouped).forEach(([location, keys]) => {
      console.log(`  ${location}: ${keys.join(', ')}`);
    });
    
    // Supprimer toutes ces clés
    const idsToDelete = whyKeys.map(item => item.id);
    const { error: error2 } = await supabaseAdmin
      .from('site_content')
      .delete()
      .in('id', idsToDelete);
      
    if (!error2) {
      console.log(`\n✅ Deleted ${whyKeys.length} keys starting with "why."`);
    }
  }
  
  // 3. Vérifier le résultat final
  console.log('\n\n📊 Final HomePage structure (FR):');
  const { data: final } = await supabaseAdmin
    .from('site_content')
    .select('section, key')
    .eq('page', 'HomePage')
    .eq('locale', 'fr')
    .order('section, key');
    
  const bySection = {};
  final?.forEach(item => {
    if (!bySection[item.section]) bySection[item.section] = [];
    bySection[item.section].push(item.key);
  });
  
  Object.entries(bySection).forEach(([section, keys]) => {
    console.log(`\n[${section}]`);
    console.log('  ' + keys.join(', '));
  });
  
  // 4. Compter les traductions pour toutes les langues
  console.log('\n\n📊 HomePage translations count by language:');
  const locales = ['fr', 'en', 'de', 'it', 'nl', 'es', 'pt'];
  
  for (const locale of locales) {
    const { count } = await supabaseAdmin
      .from('site_content')
      .select('*', { count: 'exact', head: true })
      .eq('page', 'HomePage')
      .eq('locale', locale);
      
    console.log(`  ${locale.toUpperCase()}: ${count || 0} translations`);
  }
  
  console.log('\n✨ Why section removed successfully!');
}

removeWhySection().catch(console.error);
