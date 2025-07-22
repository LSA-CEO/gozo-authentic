require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyCTAES() {
  console.log('🔍 Vérification spécifique pour ES\n');
  
  // Vérifier TOUT ce qui existe pour HomePage.cta en ES
  const { data, error } = await supabaseAdmin
    .from('site_content')
    .select('*')
    .eq('page', 'HomePage')
    .eq('section', 'cta')
    .eq('locale', 'es');
    
  console.log('Résultat de la requête:');
  console.log('Error:', error);
  console.log('Data:', data);
  
  // Vérifier aussi si le layout charge bien les données
  console.log('\n🔍 Vérification de TOUTES les traductions ES:');
  const { count } = await supabaseAdmin
    .from('site_content')
    .select('*', { count: 'exact', head: true })
    .eq('locale', 'es');
    
  console.log(`Total traductions ES: ${count}`);
}

verifyCTAES();
