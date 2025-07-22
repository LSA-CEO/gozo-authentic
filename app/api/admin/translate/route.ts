import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Map des codes de langue pour les pays mentionnés
const languageNames: Record<string, string> = {
  fr: 'French',
  en: 'English',
  de: 'German',
  it: 'Italian',
  nl: 'Dutch',
  es: 'Spanish',
  pt: 'Portuguese',
  pl: 'Polish',
  hu: 'Hungarian',
  sv: 'Swedish',
  cs: 'Czech',
  da: 'Danish',
  fi: 'Finnish',
  no: 'Norwegian',
  he: 'Hebrew'
};

export async function POST(request: NextRequest) {
  try {
    const { texts, targetLanguages } = await request.json();
    
    if (!texts || !targetLanguages || targetLanguages.length === 0) {
      return NextResponse.json(
        { error: 'Textes et langues cibles requis' },
        { status: 400 }
      );
    }

    // Pour le test, on va traduire directement
    const text = texts.test || Object.values(texts)[0];
    
    // Utiliser llama3-8b-8192 qui est actuellement supporté
    const prompt = `Translate this French text to English, German, Italian, Dutch, Spanish, and Portuguese:

"${text}"

Respond with ONLY a JSON object like this (no markdown, no extra text):
{"en":"English translation","de":"German translation","it":"Italian translation","nl":"Dutch translation","es":"Spanish translation","pt":"Portuguese translation"}`;

    console.log('Sending to Groq with llama3-8b-8192');

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama3-8b-8192", // Modèle actuellement supporté
      temperature: 0.3,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || '{}';
    console.log('Groq response:', response);
    
    // Nettoyer et parser
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let translations;
    
    try {
      translations = JSON.parse(cleaned);
    } catch (e) {
      console.error('Parse error:', e);
      // Essayer de trouver un objet JSON dans la réponse
      const jsonMatch = response.match(/\{[^}]+\}/);
      if (jsonMatch) {
        try {
          translations = JSON.parse(jsonMatch[0]);
        } catch (e2) {
          translations = {
            en: "Translation error",
            de: "Übersetzungsfehler",
            it: "Errore di traduzione",
            nl: "Vertaalfout",
            es: "Error de traducción",
            pt: "Erro de tradução"
          };
        }
      }
    }
    
    // Formater pour correspondre au format attendu
    const result: Record<string, Record<string, string>> = {};
    for (const lang of targetLanguages) {
      result[lang] = { test: translations[lang] || 'Translation not available' };
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Translation error:', error);
    
    // Retourner un format valide même en cas d'erreur
    const errorResult: Record<string, Record<string, string>> = {};
    const languages = ['en', 'de', 'it', 'nl', 'es', 'pt'];
    for (const lang of languages) {
      errorResult[lang] = { test: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
    
    return NextResponse.json(errorResult);
  }
}
