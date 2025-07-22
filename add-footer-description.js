require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addFooterDescription() {
  console.log('🔧 Ajout de Footer.description manquante\n');
  
  // Récupérer la valeur EN
  const { data: enData } = await supabaseAdmin
    .from('site_content')
    .select('value')
    .eq('page', 'Footer')
    .eq('section', 'general')
    .eq('key', 'description')
    .eq('locale', 'en')
    .single();
    
  const enValue = enData?.value || 'Discover authentic Gozo through our personal travel journal';
  console.log(`Valeur EN: "${enValue}"\n`);
  
  // Ajouter pour les langues manquantes
  const missingLocales = ['de', 'it', 'nl', 'es', 'pt'];
  
  for (const locale of missingLocales) {
    const { error } = await supabaseAdmin
      .from('site_content')
      .insert({
        page: 'Footer',
        section: 'general',
        key: 'description',
        locale: locale,
        value: enValue
      });
      
    if (!error) {
      console.log(`✅ Ajouté pour ${locale}`);
    } else {
      console.error(`❌ Erreur ${locale}:`, error.message);
    }
  }
  
  console.log('\n✨ Utilisez le panel admin pour traduire correctement.');
}

addFooterDescription();
