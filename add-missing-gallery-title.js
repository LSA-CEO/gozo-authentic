require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addMissingGalleryTitle() {
  console.log('🔧 Ajout de HomePage.gallery.title pour les langues manquantes\n');
  
  // Récupérer la valeur EN comme base
  const { data: enData } = await supabaseAdmin
    .from('site_content')
    .select('value')
    .eq('page', 'HomePage')
    .eq('section', 'gallery')
    .eq('key', 'title')
    .eq('locale', 'en')
    .single();
    
  const enValue = enData?.value || 'Moments from Gozo';
  
  // Ajouter pour les langues manquantes
  const missingLocales = ['de', 'it', 'nl', 'es', 'pt'];
  
  for (const locale of missingLocales) {
    const { error } = await supabaseAdmin
      .from('site_content')
      .insert({
        page: 'HomePage',
        section: 'gallery',
        key: 'title',
        locale: locale,
        value: enValue  // Temporairement en anglais
      });
      
    if (!error) {
      console.log(`✅ Ajouté pour ${locale}`);
    }
  }
}

addMissingGalleryTitle();
