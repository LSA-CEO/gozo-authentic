require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixAllDotsInKeys() {
  console.log('🔧 Fixing ALL keys with dots...\n');
  
  // Récupérer toutes les traductions avec des points dans les clés
  const { data: allTranslations, error } = await supabaseAdmin
    .from('site_content')
    .select('*')
    .like('key', '%.%')
    .order('page, section, key');
    
  if (error) {
    console.error('Error fetching translations:', error);
    return;
  }
  
  console.log(`Found ${allTranslations.length} keys with dots to fix\n`);
  
  // Grouper par page pour affichage
  const byPage = {};
  allTranslations.forEach(item => {
    if (!byPage[item.page]) byPage[item.page] = [];
    byPage[item.page].push(`${item.section}.${item.key}`);
  });
  
  console.log('Keys to fix by page:');
  Object.entries(byPage).forEach(([page, keys]) => {
    console.log(`\n${page}:`);
    keys.forEach(key => console.log(`  - ${key}`));
  });
  
  console.log('\n\nApplying fixes...\n');
  
  let successCount = 0;
  let deleteCount = 0;
  
  for (const item of allTranslations) {
    // Stratégie : prendre la dernière partie après le dernier point
    const parts = item.key.split('.');
    const newKey = parts[parts.length - 1];
    
    console.log(`${item.page}.${item.section}.${item.key} -> ${newKey}`);
    
    try {
      // Vérifier si la nouvelle clé existe déjà
      const { data: existing } = await supabaseAdmin
        .from('site_content')
        .select('id')
        .eq('page', item.page)
        .eq('section', item.section)
        .eq('key', newKey)
        .eq('locale', item.locale)
        .single();
        
      if (existing) {
        // Si elle existe, supprimer l'ancienne avec les points
        console.log(`  → Deleting duplicate (keeping existing ${newKey})`);
        await supabaseAdmin
          .from('site_content')
          .delete()
          .eq('id', item.id);
        deleteCount++;
      } else {
        // Sinon, mettre à jour
        const { error } = await supabaseAdmin
          .from('site_content')
          .update({ key: newKey })
          .eq('id', item.id);
          
        if (error) {
          console.error(`  → Error: ${error.message}`);
        } else {
          console.log(`  → Updated successfully`);
          successCount++;
        }
      }
    } catch (err) {
      console.error(`  → Error: ${err.message}`);
    }
  }
  
  console.log(`\n✅ Summary:`);
  console.log(`  - Updated: ${successCount} keys`);
  console.log(`  - Deleted: ${deleteCount} duplicates`);
  
  // Vérifier s'il reste des points
  console.log('\n\n🔍 Checking for remaining dots...');
  const { data: remaining, count } = await supabaseAdmin
    .from('site_content')
    .select('page, section, key', { count: 'exact' })
    .like('key', '%.%');
    
  if (count && count > 0) {
    console.log(`\n⚠️  Still ${count} keys with dots:`);
    remaining?.forEach(item => {
      console.log(`  - ${item.page}.${item.section}.${item.key}`);
    });
  } else {
    console.log('\n✨ All dots have been removed from keys!');
  }
}

fixAllDotsInKeys().catch(console.error);
