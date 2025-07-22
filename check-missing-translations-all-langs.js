require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMissingTranslations() {
  console.log('🔍 Checking translation coverage...\n');
  
  const locales = ['fr', 'en', 'de', 'it', 'nl', 'es', 'pt'];
  
  // D'abord, obtenir toutes les clés uniques de FR (référence)
  const { data: frTranslations } = await supabaseAdmin
    .from('site_content')
    .select('page, section, key')
    .eq('locale', 'fr')
    .order('page, section, key');
    
  const frKeys = new Set(
    frTranslations?.map(t => `${t.page}.${t.section}.${t.key}`) || []
  );
  
  console.log(`Reference (FR): ${frKeys.size} unique keys\n`);
  
  // Pour chaque langue, vérifier ce qui manque
  for (const locale of locales.slice(1)) { // Skip FR
    const { data: translations } = await supabaseAdmin
      .from('site_content')
      .select('page, section, key')
      .eq('locale', locale);
      
    const localeKeys = new Set(
      translations?.map(t => `${t.page}.${t.section}.${t.key}`) || []
    );
    
    const missing = [...frKeys].filter(key => !localeKeys.has(key));
    
    console.log(`\n${locale.toUpperCase()}: ${localeKeys.size}/${frKeys.size} keys`);
    if (missing.length > 0) {
      console.log(`  Missing ${missing.length} keys:`);
      // Afficher les 10 premières clés manquantes
      missing.slice(0, 10).forEach(key => console.log(`    - ${key}`));
      if (missing.length > 10) {
        console.log(`    ... and ${missing.length - 10} more`);
      }
    }
  }
  
  // Vérifier spécifiquement OurStory
  console.log('\n\n📊 OurStory translations by language:');
  for (const locale of locales) {
    const { data, count } = await supabaseAdmin
      .from('site_content')
      .select('key', { count: 'exact' })
      .eq('page', 'OurStory')
      .eq('locale', locale)
      .order('key');
      
    console.log(`\n${locale.toUpperCase()}: ${count || 0} keys`);
    if (data && data.length > 0) {
      console.log(`  Keys: ${data.map(d => d.key).join(', ')}`);
    }
  }
}

checkMissingTranslations().catch(console.error);
