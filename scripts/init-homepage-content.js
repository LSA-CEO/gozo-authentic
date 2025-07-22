require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function initContent() {
  // Lire le fichier fr.json
  const frTranslations = JSON.parse(fs.readFileSync('messages/fr.json', 'utf8'));
  
  // Contenu Hero
  await supabase.from('homepage_content').upsert({
    section: 'hero',
    locale: 'fr',
    content: {
      title_fr: frTranslations.HomePage.hero.title,
      subtitle_fr: frTranslations.HomePage.hero.subtitle,
      cta_fr: frTranslations.HomePage.hero.cta,
      image_url: '/images/mgarr.jpg'
    }
  }, { onConflict: 'section,locale' });
  
  // Contenu About
  await supabase.from('homepage_content').upsert({
    section: 'about',
    locale: 'fr',
    content: {
      title_fr: frTranslations.OurStory.title,
      content_fr: `<p>${frTranslations.OurStory.paragraph1}</p><p>${frTranslations.OurStory.paragraph2}</p><p>${frTranslations.OurStory.paragraph3}</p>`,
      image_url: '/images/nous.jpg'
    }
  }, { onConflict: 'section,locale' });
  
  console.log('✅ Contenu initialisé depuis fr.json');
}

initContent();
