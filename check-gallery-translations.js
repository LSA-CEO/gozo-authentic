require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkGalleryTranslations() {
  console.log('📊 Vérification des traductions HomePage.gallery\n');
  
  const locales = ['fr', 'en', 'de', 'it', 'nl', 'es', 'pt'];
  
  for (const locale of locales) {
    const { data, count } = await supabaseAdmin
      .from('site_content')
      .select('key, value', { count: 'exact' })
      .eq('page', 'HomePage')
      .eq('section', 'gallery')
      .eq('locale', locale);
      
    console.log(`\n${locale.toUpperCase()}: ${count || 0} traductions`);
    if (data && data.length > 0) {
      data.forEach(item => {
        console.log(`  - ${item.key}: "${item.value.substring(0, 50)}..."`);
      });
    } else {
      console.log('  ❌ AUCUNE TRADUCTION');
    }
  }
}

checkGalleryTranslations().catch(console.error);
