require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addCategoryTranslations() {
  console.log('🔧 Ajout des traductions pour Categories\n');
  
  const translations = {
    place: { fr: 'lieu', en: 'place', es: 'lugar', de: 'Ort', it: 'luogo', nl: 'plaats', pt: 'lugar' },
    places: { fr: 'lieux', en: 'places', es: 'lugares', de: 'Orte', it: 'luoghi', nl: 'plaatsen', pt: 'lugares' },
    discover: { fr: 'Découvrir', en: 'Discover', es: 'Descubrir', de: 'Entdecken', it: 'Scoprire', nl: 'Ontdekken', pt: 'Descobrir' }
  };
  
  for (const [key, langs] of Object.entries(translations)) {
    for (const [locale, value] of Object.entries(langs)) {
      const { error } = await supabaseAdmin
        .from('site_content')
        .upsert({
          page: 'Categories',
          section: 'general',
          key: key,
          locale: locale,
          value: value
        }, {
          onConflict: 'page,section,key,locale'
        });
        
      if (!error) {
        console.log(`✅ ${key} - ${locale}`);
      }
    }
  }
  
  console.log('\n✨ Fait !');
}

addCategoryTranslations();
