require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixNestedKeys() {
  console.log('🔧 Fixing nested keys in sections...\n');
  
  // Récupérer toutes les traductions
  const { data: allTranslations, error } = await supabaseAdmin
    .from('site_content')
    .select('*')
    .order('locale, page, section, key');
    
  if (error) {
    console.error('Error fetching translations:', error);
    return;
  }
  
  const updates = [];
  
  // Chercher les clés qui ont des points et qui ne sont pas dans la section "general"
  allTranslations.forEach(item => {
    if (item.section !== 'general' && item.key.includes('.')) {
      // Cas spécial pour les sections direct, trusted, unique dans HomePage
      if (item.page === 'HomePage' && ['direct', 'trusted', 'unique'].includes(item.section)) {
        // why.direct.title -> title
        // why.trusted.description -> description
        const parts = item.key.split('.');
        const newKey = parts[parts.length - 1]; // Prendre juste la dernière partie
        
        updates.push({
          id: item.id,
          oldKey: item.key,
          newKey: newKey,
          page: item.page,
          section: item.section,
          locale: item.locale
        });
      }
    }
  });
  
  console.log(`Found ${updates.length} keys to fix:\n`);
  
  // Afficher ce qui va être changé
  updates.forEach(u => {
    console.log(`  ${u.page}.${u.section}.${u.oldKey} -> ${u.newKey}`);
  });
  
  // Appliquer les mises à jour
  if (updates.length > 0) {
    console.log('\n\nApplying updates...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const update of updates) {
      try {
        // Vérifier d'abord si la nouvelle clé existe déjà
        const { data: existing } = await supabaseAdmin
          .from('site_content')
          .select('id')
          .eq('page', update.page)
          .eq('section', update.section)
          .eq('key', update.newKey)
          .eq('locale', update.locale)
          .single();
          
        if (existing) {
          // Si elle existe, supprimer l'ancienne
          console.log(`  Deleting duplicate: ${update.oldKey} (keeping ${update.newKey})`);
          await supabaseAdmin
            .from('site_content')
            .delete()
            .eq('id', update.id);
        } else {
          // Sinon, mettre à jour
          const { error } = await supabaseAdmin
            .from('site_content')
            .update({ key: update.newKey })
            .eq('id', update.id);
            
          if (error) {
            console.error(`  Error updating ${update.oldKey}:`, error.message);
            errorCount++;
          } else {
            successCount++;
          }
        }
      } catch (err) {
        console.error(`  Error processing ${update.oldKey}:`, err.message);
        errorCount++;
      }
    }
    
    console.log(`\n✅ Successfully updated: ${successCount}`);
    if (errorCount > 0) {
      console.log(`❌ Errors: ${errorCount}`);
    }
  }
  
  // Vérifier le résultat final pour HomePage
  console.log('\n\n📊 Final HomePage structure:');
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
}

fixNestedKeys().catch(console.error);
