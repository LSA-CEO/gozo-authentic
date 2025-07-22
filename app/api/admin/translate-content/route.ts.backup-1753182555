import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase-admin';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const targetLanguages = ['en', 'de', 'it', 'nl', 'es', 'pt'];

async function translateText(text: string, fromLang: string = 'fr'): Promise<Record<string, string>> {
  if (!text || text.trim() === '') return {};

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

    const response = completion.choices[0]?.message?.content || '{}';
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      console.error('Parse error for text:', text);
      return {};
    }
  } catch (error) {
    console.error('Translation error:', error);
    return {};
  }
}

async function translateCategories() {
  console.log('Starting categories translation...');
  
  const { data: categories, error } = await supabaseAdmin
    .from('categories')
    .select('*');

  if (error || !categories) {
    console.error('Error fetching categories:', error);
    return { success: false, count: 0 };
  }

  let count = 0;
  
  for (const category of categories) {
    // Traduire le nom
    if (category.name_fr) {
      const nameTranslations = await translateText(category.name_fr);
      
      // Traduire la description
      const descTranslations = category.description_fr 
        ? await translateText(category.description_fr)
        : {};

      // Mettre à jour la catégorie
      const updates: any = {};
      
      for (const lang of targetLanguages) {
        if (nameTranslations[lang]) {
          updates[`name_${lang}`] = nameTranslations[lang];
        }
        if (descTranslations[lang]) {
          updates[`description_${lang}`] = descTranslations[lang];
        }
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabaseAdmin
          .from('categories')
          .update(updates)
          .eq('id', category.id);

        if (!updateError) {
          count++;
          console.log(`Translated category: ${category.name_fr}`);
        }
      }
    }
  }

  return { success: true, count };
}

async function translateExperiences() {
  console.log('Starting experiences translation...');
  
  const { data: experiences, error } = await supabaseAdmin
    .from('experiences')
    .select('*');

  if (error || !experiences) {
    console.error('Error fetching experiences:', error);
    return { success: false, count: 0 };
  }

  let count = 0;
  
  for (const experience of experiences) {
    const updates: any = {};
    
    // Traduire les différents champs
    if (experience.name_fr) {
      const nameTranslations = await translateText(experience.name_fr);
      for (const lang of targetLanguages) {
        if (nameTranslations[lang]) {
          updates[`name_${lang}`] = nameTranslations[lang];
        }
      }
    }
    
    if (experience.description_fr) {
      const descTranslations = await translateText(experience.description_fr);
      for (const lang of targetLanguages) {
        if (descTranslations[lang]) {
          updates[`description_${lang}`] = descTranslations[lang];
        }
      }
    }
    
    if (experience.our_story_fr) {
      const storyTranslations = await translateText(experience.our_story_fr);
      for (const lang of targetLanguages) {
        if (storyTranslations[lang]) {
          updates[`our_story_${lang}`] = storyTranslations[lang];
        }
      }
    }
    
    if (experience.tips_fr) {
      const tipsTranslations = await translateText(experience.tips_fr);
      for (const lang of targetLanguages) {
        if (tipsTranslations[lang]) {
          updates[`tips_${lang}`] = tipsTranslations[lang];
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from('experiences')
        .update(updates)
        .eq('id', experience.id);

      if (!updateError) {
        count++;
        console.log(`Translated experience: ${experience.name_fr}`);
      }
    }
    
    // Pause entre les traductions pour éviter de surcharger l'API
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return { success: true, count };
}

async function translateSiteContent() {
  console.log('Starting site content translation...');
  
  const { data: content, error } = await supabaseAdmin
    .from('site_content')
    .select('*')
    .eq('locale', 'fr');

  if (error || !content) {
    console.error('Error fetching site content:', error);
    return { success: false, count: 0 };
  }

  let count = 0;
  
  for (const item of content) {
    if (item.value) {
      const translations = await translateText(item.value);
      
      // Insérer les traductions pour chaque langue
      for (const lang of targetLanguages) {
        if (translations[lang]) {
          const { error: upsertError } = await supabaseAdmin
            .from('site_content')
            .upsert({
              page: item.page,
              section: item.section,
              key: item.key,
              locale: lang,
              value: translations[lang]
            }, {
              onConflict: 'page,section,key,locale'
            });

          if (!upsertError) {
            count++;
          }
        }
      }
    }
  }

  return { success: true, count };
}

async function translateTags() {
  console.log('Starting tags translation...');
  
  const { data: tags, error } = await supabaseAdmin
    .from('tags')
    .select('*');

  if (error || !tags) {
    console.error('Error fetching tags:', error);
    return { success: false, count: 0 };
  }

  let count = 0;
  
  for (const tag of tags) {
    if (tag.name_fr) {
      const translations = await translateText(tag.name_fr);
      
      const updates: any = {};
      for (const lang of targetLanguages) {
        if (translations[lang]) {
          updates[`name_${lang}`] = translations[lang];
        }
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabaseAdmin
          .from('tags')
          .update(updates)
          .eq('id', tag.id);

        if (!updateError) {
          count++;
          console.log(`Translated tag: ${tag.name_fr}`);
        }
      }
    }
  }

  return { success: true, count };
}

export async function POST(request: NextRequest) {
  try {
    const { contentType } = await request.json();
    
    let result;
    
    switch (contentType) {
      case 'categories':
        result = await translateCategories();
        break;
      case 'experiences':
        result = await translateExperiences();
        break;
      case 'site_content':
        result = await translateSiteContent();
        break;
      case 'tags':
        result = await translateTags();
        break;
      case 'all':
        // Traduire tout
        const categoriesResult = await translateCategories();
        const tagsResult = await translateTags();
        const experiencesResult = await translateExperiences();
        const siteContentResult = await translateSiteContent();
        
        result = {
          success: true,
          message: `Traduction complète : ${categoriesResult.count} catégories, ${tagsResult.count} tags, ${experiencesResult.count} expériences, ${siteContentResult.count} contenus`
        };
        break;
      default:
        return NextResponse.json(
          { error: 'Type de contenu invalide' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: result.success,
      message: (result as any).message || `${result.count} éléments traduits avec succès`
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la traduction', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
