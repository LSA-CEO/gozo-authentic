require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addMissingCTATitles() {
  console.log('🔧 Ajout des titres CTA manquants\n');
  
  // Récupérer la valeur EN comme base
  const { data: enData } = await supabaseAdmin
    .from('site_content')
    .select('value')
    .eq('page', 'HomePage')
    .eq('section', 'cta')
    .eq('key', 'title')
    .eq('locale', 'en')
    .single();
    
  const enValue = enData?.value || 'Ready to Discover Our Gozo?';
  console.log(`Valeur EN: "${enValue}"\n`);
  
  // Ajouter pour les langues manquantes
  const missingLocales = ['de', 'nl', 'es', 'pt'];
  
  for (const locale of missingLocales) {
    const { error } = await supabaseAdmin
      .from('site_content')
      .insert({
        page: 'HomePage',
        section: 'cta',
        key: 'title',
        locale: locale,
        value: enValue  // Temporairement en anglais
      });
      
    if (!error) {
      console.log(`✅ Ajouté pour ${locale}`);
    } else {
      console.error(`❌ Erreur ${locale}:`, error.message);
    }
  }
  
  console.log('\n✨ Fait! Utilisez le panel admin pour traduire correctement.');
}

addMissingCTATitles();
