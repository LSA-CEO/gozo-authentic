require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixCTAStructure() {
  console.log('🔧 Suppression des entrées qui cassent la structure\n');
  
  // Supprimer toutes les entrées general.cta pour TOUTES les langues
  const { data: badEntries } = await supabaseAdmin
    .from('site_content')
    .select('id, locale')
    .eq('page', 'HomePage')
    .eq('section', 'general')
    .eq('key', 'cta');
    
  console.log(`Trouvé ${badEntries?.length || 0} entrées problématiques à supprimer\n`);
  
  if (badEntries && badEntries.length > 0) {
    for (const entry of badEntries) {
      const { error } = await supabaseAdmin
        .from('site_content')
        .delete()
        .eq('id', entry.id);
        
      if (!error) {
        console.log(`✅ Supprimé pour ${entry.locale}`);
      } else {
        console.error(`❌ Erreur pour ${entry.locale}:`, error);
      }
    }
  }
  
  console.log('\n✨ Structure corrigée!');
}

fixCTAStructure();
