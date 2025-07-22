require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixAllImageUrls() {
  console.log('🔧 Correction des URLs d\'images pour toutes les langues\n');
  
  // Récupérer l'URL correcte depuis FR
  const { data: frData } = await supabaseAdmin
    .from('site_content')
    .select('value')
    .eq('page', 'OurStory')
    .eq('section', 'general')
    .eq('key', 'image_url')
    .eq('locale', 'fr')
    .single();
    
  if (!frData) {
    console.error('❌ URL FR non trouvée');
    return;
  }
  
  const correctUrl = frData.value;
  console.log(`URL correcte: ${correctUrl}\n`);
  
  // Mettre à jour toutes les autres langues
  const locales = ['en', 'de', 'it', 'nl', 'es', 'pt'];
  
  for (const locale of locales) {
    const { error } = await supabaseAdmin
      .from('site_content')
      .update({ value: correctUrl })
      .eq('page', 'OurStory')
      .eq('section', 'general')
      .eq('key', 'image_url')
      .eq('locale', locale);
      
    if (!error) {
      console.log(`✅ ${locale} corrigé`);
    } else {
      console.error(`❌ Erreur ${locale}:`, error);
    }
  }
  
  console.log('\n✨ URLs corrigées!');
}

fixAllImageUrls();
