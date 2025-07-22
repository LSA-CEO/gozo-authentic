require('dotenv').config({ path: '.env.local' });
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function testTranslationAPI() {
  console.log('🧪 Test direct de l\'API de traduction\n');
  
  const testTexts = [
    "Pour ceux qui aiment l'adrénaline comme nous",
    "On a testé pour vous trouver les meilleures"
  ];
  
  for (const text of testTexts) {
    console.log(`\nTexte FR: "${text}"`);
    
    const prompt = `Translate this French text to English, German, Italian, Dutch, Spanish, and Portuguese. Keep the same tone and style.

French text: "${text}"

Respond with ONLY a JSON object (no markdown, no extra text):
{"en":"English translation","de":"German translation","it":"Italian translation","nl":"Dutch translation","es":"Spanish translation","pt":"Portuguese translation"}`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama3-8b-8192",
        temperature: 0.3,
        max_tokens: 1000,
      });

      const response = completion.choices[0].message.content;
      console.log('Réponse brute:', response);
      
      try {
        const translations = JSON.parse(response);
        console.log('Traductions:');
        console.log('  ES:', translations.es);
        console.log('  DE:', translations.de);
      } catch (e) {
        console.error('Erreur parsing JSON:', e);
      }
      
    } catch (error) {
      console.error('Erreur API:', error);
    }
  }
}

testTranslationAPI();
