require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const Groq = require('groq-sdk');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function translateCategoriesSubtitle() {
  console.log('🎯 Traduction de HomePage.categories.subtitle\n');
  
  // 1. Récupérer la version FR
  const { data: frData } = await supabaseAdmin
    .from('site_content')
    .select('value')
    .eq('page', 'HomePage')
    .eq('section', 'categories')
    .eq('key', 'subtitle')
    .eq('locale', 'fr')
    .single();
    
  const frText = frData?.value || "Après 3 ans à Gozo, nous avons organisé nos meilleures trouvailles en 6 catégories intimes";
  console.log(`Texte FR: "${frText}"\n`);
  
  // 2. Traduire
  const prompt = `Translate "${frText}" from French to: English, German, Italian, Dutch, Spanish, Portuguese. Keep the intimate, personal tone.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192",
      temperature: 0.3,
      max_tokens: 1000,
    });

    // Utiliser directement les traductions
    const translations = {
      en: "After 3 years in Gozo, we've organized our best finds into 6 intimate categories",
      de: "Nach 3 Jahren auf Gozo haben wir unsere besten Funde in 6 intime Kategorien organisiert",
      it: "Dopo 3 anni a Gozo, abbiamo organizzato le nostre migliori scoperte in 6 categorie intime",
      nl: "Na 3 jaar op Gozo hebben we onze beste vondsten in 6 intieme categorieën georganiseerd",
      es: "Después de 3 años en Gozo, hemos organizado nuestros mejores hallazgos en 6 categorías íntimas",
      pt: "Após 3 anos em Gozo, organizamos nossas melhores descobertas em 6 categorias íntimas"
    };
    
    console.log('Traductions à appliquer:', translations);
    
    // 3. Mettre à jour pour chaque langue
    for (const [lang, translation] of Object.entries(translations)) {
      const { error } = await supabaseAdmin
        .from('site_content')
        .update({ value: translation })
        .eq('page', 'HomePage')
        .eq('section', 'categories')
        .eq('key', 'subtitle')
        .eq('locale', lang);
        
      if (!error) {
        console.log(`✅ ${lang}`);
      } else {
        console.error(`❌ ${lang}:`, error);
      }
    }
    
    console.log('\n✨ Fait !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

translateCategoriesSubtitle();
