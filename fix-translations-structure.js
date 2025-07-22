require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixTranslations() {
  console.log('🔧 Fixing translations structure...\n');
  
  // Récupérer toutes les traductions
  const { data: allTranslations, error } = await supabaseAdmin
    .from('site_content')
    .select('*')
    .order('locale, page, section, key');
    
  if (error) {
    console.error('Error fetching translations:', error);
    return;
  }
  
  console.log(`Found ${allTranslations.length} translations to check\n`);
  
  const toDelete = [];
  const toUpdate = [];
  
  // Identifier les problèmes
  allTranslations.forEach(item => {
    // Cas 1: Clés qui contiennent la section dans le nom (ex: "cta.button" dans section "cta")
    if (item.section !== 'general' && item.key.startsWith(item.section + '.')) {
      // Enlever le préfixe de section de la clé
      const newKey = item.key.substring(item.section.length + 1);
      console.log(`Fix: ${item.page}.${item.section}.${item.key} -> ${item.page}.${item.section}.${newKey}`);
      toUpdate.push({
        id: item.id,
        key: newKey
      });
    }
    
    // Cas 2: Sections qui répètent le nom (ex: section "categories" avec key "categories.title")
    if (item.key.includes('.') && !item.key.startsWith('why.')) {
      const parts = item.key.split('.');
      if (parts[0] === item.section) {
        const newKey = parts.slice(1).join('.');
        console.log(`Fix duplicate: ${item.page}.${item.section}.${item.key} -> ${item.page}.${item.section}.${newKey}`);
        toUpdate.push({
          id: item.id,
          key: newKey
        });
      }
    }
  });
  
  console.log(`\n📊 Found ${toUpdate.length} translations to fix\n`);
  
  // Appliquer les corrections
  if (toUpdate.length > 0) {
    console.log('Applying fixes...');
    
    for (const update of toUpdate) {
      const { error } = await supabaseAdmin
        .from('site_content')
        .update({ key: update.key })
        .eq('id', update.id);
        
      if (error) {
        console.error(`Error updating ${update.id}:`, error);
      }
    }
    
    console.log(`\n✅ Fixed ${toUpdate.length} translations`);
  }
  
  // Vérifier les doublons après correction
  console.log('\n🔍 Checking for duplicates...');
  
  const { data: fixed } = await supabaseAdmin
    .from('site_content')
    .select('*')
    .order('locale, page, section, key');
    
  const seen = new Set();
  const duplicates = [];
  
  fixed?.forEach(item => {
    const key = `${item.locale}.${item.page}.${item.section}.${item.key}`;
    if (seen.has(key)) {
      duplicates.push(item);
    }
    seen.add(key);
  });
  
  if (duplicates.length > 0) {
    console.log(`\n⚠️  Found ${duplicates.length} duplicates to remove:`);
    duplicates.forEach(d => {
      console.log(`  - ${d.locale}.${d.page}.${d.section}.${d.key}`);
    });
    
    // Supprimer les doublons
    for (const dup of duplicates) {
      await supabaseAdmin
        .from('site_content')
        .delete()
        .eq('id', dup.id);
    }
    
    console.log(`\n✅ Removed ${duplicates.length} duplicates`);
  }
  
  console.log('\n✨ Translation structure fixed!');
}

fixTranslations().catch(console.error);
