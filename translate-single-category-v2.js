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
  
  // 2. Traduire UNIQUEMENT cette description
  const prompt = `Translate this French text to English, German, Italian, Dutch, Spanish, and Portuguese. Keep the same tone and style.

French text: "${category.description_fr}"

Respond with ONLY a JSON object (no markdown, no extra text):
{"en":"English translation","de":"German translation","it":"Italian translation","nl":"Dutch translation","es":"Spanish translation","pt":"Portuguese translation"}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192",
      temperature: 0.3,
      max_tokens: 1000,
    });

    const response = completion.choices[0].message.content;
    console.log('Réponse brute:', response);
    
    // Essayer de nettoyer et parser
    let translations;
    try {
      // Nettoyer la réponse si nécessaire
      const cleanResponse = response.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
      translations = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('Erreur de parsing, tentative de correction...');
      // Si échec, essayer de corriger manuellement
      const match = response.match(/\{[\s\S]*\}/);
      if (match) {
        translations = JSON.parse(match[0]);
      } else {
        throw parseError;
      }
    }
    
    console.log('\nTraductions parsées:', translations);
    
    // 3. Mettre à jour UNIQUEMENT cette catégorie
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
