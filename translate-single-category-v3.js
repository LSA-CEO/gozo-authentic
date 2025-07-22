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

async function translateSingleCategory() {
  console.log('🎯 Traduction spécifique de "nos-aventures-en-mer"\n');
  
  // 1. Récupérer cette catégorie spécifique
  const { data: category } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('slug', 'nos-aventures-en-mer')
    .single();
    
  if (!category || !category.description_fr) {
    console.error('❌ Catégorie non trouvée ou pas de description FR');
    return;
  }
  
  console.log(`Description FR: "${category.description_fr}"\n`);
  
  // 2. Traduire avec un prompt plus simple
  const prompt = `Translate "${category.description_fr}" from French to: English, German, Italian, Dutch, Spanish, Portuguese. Reply with JSON only.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192",
      temperature: 0.3,
      max_tokens: 1000,
    });

    const response = completion.choices[0].message.content;
    
    // Analyser caractère par caractère autour de la position 327
    console.log('Analyse autour de la position 327:');
    for (let i = 320; i < 335; i++) {
      console.log(`Position ${i}: '${response[i]}' (code: ${response.charCodeAt(i)})`);
    }
    
    // Solution: créer manuellement les traductions basées sur le contenu visible
    const translations = {
      en: "We've tested to find the best for you",
      de: "Wir haben getestet, um die besten für Sie zu finden",
      it: "Abbiamo testato per trovare i migliori per te",
      nl: "Wij hebben getest om de beste voor je te vinden",
      es: "Hemos probado para encontrar lo mejor para ti",
      pt: "Testamos para encontrar o melhor para você"
    };
    
    console.log('\nTraductions à utiliser:', translations);
    
    // 3. Mettre à jour la catégorie
    const updates = {
      description_en: translations.en,
      description_de: translations.de,
      description_it: translations.it,
      description_nl: translations.nl,
      description_es: translations.es,
      description_pt: translations.pt
    };
    
    const { error } = await supabaseAdmin
      .from('categories')
      .update(updates)
      .eq('slug', 'nos-aventures-en-mer');
      
    if (!error) {
      console.log('\n✅ Catégorie traduite avec succès !');
    } else {
      console.error('❌ Erreur:', error);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

translateSingleCategory();
