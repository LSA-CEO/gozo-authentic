require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkFooterTranslations() {
  console.log('📊 Vérification des traductions Footer\n');
  
  const locales = ['fr', 'en', 'de', 'it', 'nl', 'es', 'pt'];
  
  for (const locale of locales) {
    const { data, count } = await supabaseAdmin
      .from('site_content')
      .select('key, value', { count: 'exact' })
      .eq('page', 'Footer')
      .eq('section', 'general')
      .eq('locale', locale);
      
    console.log(`\n${locale.toUpperCase()}: ${count || 0} traductions`);
    if (data && data.length > 0) {
      console.log('  Clés présentes:', data.map(d => d.key).join(', '));
    } else {
      console.log('  ❌ AUCUNE TRADUCTION');
    }
  }
  
  // Vérifier spécifiquement ce qui manque
  console.log('\n\n📊 Clés attendues dans Footer:');
  const expectedKeys = ['description', 'quickLinks', 'home', 'about', 'experiences', 'contact', 'myCarnet', 'contactInfo', 'copyright', 'privacy', 'terms'];
  console.log(expectedKeys.join(', '));
}

checkFooterTranslations().catch(console.error);
