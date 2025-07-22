require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixCategoriesSubtitle() {
  console.log('🔧 Fixing HomePage.categories.subtitle for all languages...\n');
  
  // D'abord, récupérer la valeur FR comme référence
  const { data: frData } = await supabaseAdmin
    .from('site_content')
    .select('value')
    .eq('page', 'HomePage')
    .eq('section', 'categories')
    .eq('key', 'subtitle')
    .eq('locale', 'fr')
    .single();
    
  if (!frData) {
    console.error('❌ No French subtitle found for HomePage.categories');
    return;
  }
  
  console.log(`FR subtitle: "${frData.value}"\n`);
  
  // Vérifier quelles langues ont déjà cette traduction
  const { data: existing } = await supabaseAdmin
    .from('site_content')
    .select('locale')
    .eq('page', 'HomePage')
    .eq('section', 'categories')
    .eq('key', 'subtitle');
    
  const existingLocales = new Set(existing?.map(e => e.locale) || []);
  console.log('Already exists for:', Array.from(existingLocales).join(', '));
  
  // Langues cibles
  const targetLocales = ['en', 'de', 'it', 'nl', 'es', 'pt'];
  const toTranslate = targetLocales.filter(locale => !existingLocales.has(locale));
  
  console.log('Need to add for:', toTranslate.join(', '));
  
  // Pour l'instant, copier la valeur FR (vous pourrez traduire après)
  for (const locale of toTranslate) {
    const { error } = await supabaseAdmin
      .from('site_content')
      .insert({
        page: 'HomePage',
        section: 'categories',
        key: 'subtitle',
        locale: locale,
        value: frData.value // Temporairement en français
      });
      
    if (error) {
      console.error(`❌ Error adding ${locale}:`, error.message);
    } else {
      console.log(`✅ Added ${locale} (copied from FR)`);
    }
  }
  
  console.log('\n✨ Done! HomePage.categories.subtitle now exists for all languages.');
  console.log('Note: The translations are currently in French. Use the admin panel to translate them properly.');
}

fixCategoriesSubtitle().catch(console.error);
