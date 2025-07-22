require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanDuplicates() {
  console.log('🧹 Cleaning duplicates first...\n');
  
  // Récupérer toutes les traductions
  const { data: allTranslations, error } = await supabaseAdmin
    .from('site_content')
    .select('*')
    .order('locale, page, section, key, id');  // Utiliser id au lieu de created_at
    
  if (error) {
    console.error('Error fetching translations:', error);
    return;
  }
  
  console.log(`Found ${allTranslations.length} total translations\n`);
  
  // Identifier les doublons
  const seen = new Map();
  const toDelete = [];
  
  allTranslations.forEach(item => {
    const key = `${item.locale}.${item.page}.${item.section}.${item.key}`;
    
    if (seen.has(key)) {
      // C'est un doublon, marquer pour suppression
      toDelete.push(item.id);
      console.log(`Duplicate found: ${key} (keeping first, deleting id: ${item.id})`);
    } else {
      seen.set(key, item);
    }
  });
  
  console.log(`\n📊 Found ${toDelete.length} duplicates to remove\n`);
  
  // Supprimer les doublons par batch
  if (toDelete.length > 0) {
    console.log('Deleting duplicates...');
    
    // Supprimer par batch de 100
    for (let i = 0; i < toDelete.length; i += 100) {
      const batch = toDelete.slice(i, i + 100);
      
      const { error } = await supabaseAdmin
        .from('site_content')
        .delete()
        .in('id', batch);
        
      if (error) {
        console.error(`Error deleting batch:`, error);
      } else {
        console.log(`Deleted batch ${Math.floor(i/100) + 1}/${Math.ceil(toDelete.length/100)}`);
      }
    }
    
    console.log(`\n✅ Removed ${toDelete.length} duplicates`);
  }
  
  // Maintenant, nettoyer les clés mal formatées
  console.log('\n🔧 Now fixing key structure...\n');
  
  const { data: cleanedData } = await supabaseAdmin
    .from('site_content')
    .select('*')
    .order('locale, page, section, key');
    
  const toUpdate = [];
  
  cleanedData?.forEach(item => {
    let needsUpdate = false;
    let newKey = item.key;
    
    // Cas 1: Clés qui contiennent la section dans le nom
    if (item.section !== 'general' && item.key.startsWith(item.section + '.')) {
      newKey = item.key.substring(item.section.length + 1);
      needsUpdate = true;
    }
    
    // Cas 2: Clés avec doubles sections (ex: "categories.categories.title")
    if (item.key.includes('.')) {
      const parts = item.key.split('.');
      if (parts.length > 1 && parts[0] === item.section) {
        newKey = parts.slice(1).join('.');
        needsUpdate = true;
      }
    }
    
    if (needsUpdate) {
      console.log(`Will fix: ${item.page}.${item.section}.${item.key} -> ${newKey}`);
      toUpdate.push({
        id: item.id,
        oldKey: item.key,
        newKey: newKey,
        locale: item.locale,
        page: item.page,
        section: item.section
      });
    }
  });
  
  console.log(`\n📊 Found ${toUpdate.length} keys to fix\n`);
  
  // Vérifier qu'on ne créera pas de nouveaux doublons
  const willCreateDuplicates = [];
  toUpdate.forEach(update => {
    const newFullKey = `${update.locale}.${update.page}.${update.section}.${update.newKey}`;
    const exists = cleanedData?.find(item => 
      item.locale === update.locale &&
      item.page === update.page &&
      item.section === update.section &&
      item.key === update.newKey
    );
    
    if (exists) {
      willCreateDuplicates.push(update);
      console.log(`⚠️  Cannot update ${update.oldKey} to ${update.newKey} - would create duplicate`);
    }
  });
  
  // Filtrer les updates qui créeraient des doublons
  const safeUpdates = toUpdate.filter(u => !willCreateDuplicates.includes(u));
  
  console.log(`\n📊 ${safeUpdates.length} safe updates to apply\n`);
  
  // Appliquer les updates sûres
  for (const update of safeUpdates) {
    const { error } = await supabaseAdmin
      .from('site_content')
      .update({ key: update.newKey })
      .eq('id', update.id);
      
    if (error) {
      console.error(`Error updating ${update.id}:`, error);
    }
  }
  
  console.log(`\n✅ Fixed ${safeUpdates.length} keys`);
  
  // Supprimer les entrées qui créeraient des doublons
  if (willCreateDuplicates.length > 0) {
    console.log(`\n🗑️  Deleting ${willCreateDuplicates.length} entries that would create duplicates...`);
    
    const idsToDelete = willCreateDuplicates.map(u => u.id);
    await supabaseAdmin
      .from('site_content')
      .delete()
      .in('id', idsToDelete);
      
    console.log('✅ Deleted problematic entries');
  }
  
  console.log('\n✨ Database cleaned!');
}

cleanDuplicates().catch(console.error);
