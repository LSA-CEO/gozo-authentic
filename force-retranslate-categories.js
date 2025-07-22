require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function forceRetranslateCategories() {
  console.log('🔧 Forcer la retraduction des catégories depuis FR\n');
  
  // D'abord, vider les descriptions incorrectes
  const problematicSlugs = ['nos-aventures-en-mer', 'nos-folies-terrestres'];
  const languages = ['es', 'de', 'it', 'nl', 'pt'];
  
  for (const slug of problematicSlugs) {
    console.log(`Nettoyage de ${slug}...`);
    
    const updates = {};
    languages.forEach(lang => {
      updates[`description_${lang}`] = null;
    });
    
    await supabaseAdmin
      .from('categories')
      .update(updates)
      .eq('slug', slug);
  }
  
  console.log('\n✅ Descriptions vidées. Maintenant relancez la traduction depuis l\'admin.');
}

forceRetranslateCategories();
