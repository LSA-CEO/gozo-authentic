import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase-admin';

export async function GET() {
  // Récupérer depuis la nouvelle table site_content avec le client admin
  const { data, error } = await supabaseAdmin
    .from('site_content')
    .select('*')
    .eq('locale', 'fr')
    .in('page', ['HomePage', 'OurStory']);
    
  if (error) {
    console.error('Erreur Supabase:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
    
  // Transformer en structure attendue par le frontend
  const content: any = {
    hero: {},
    about: {},
    cta: {}
  };
  
  data?.forEach(item => {
    // Hero section
    if (item.page === 'HomePage' && item.section === 'hero') {
      if (item.key === 'hero.title') content.hero.title_fr = item.value;
      if (item.key === 'hero.subtitle') content.hero.subtitle_fr = item.value;
      if (item.key === 'hero.cta') content.hero.cta_fr = item.value;
      if (item.key === 'hero.scrollText') content.hero.scrollText_fr = item.value;
      if (item.key === 'hero.image_url') content.hero.image_url = item.value;
    }
    
    // About section (OurStory)
    if (item.page === 'OurStory' && item.section === 'general') {
      if (item.key === 'title') content.about.title_fr = item.value;
      if (item.key === 'paragraph1' || item.key === 'paragraph2' || item.key === 'paragraph3') {
        if (!content.about.content_fr) content.about.content_fr = '';
        content.about.content_fr += `<p>${item.value}</p>`;
      }
      if (item.key === 'image_url') content.about.image_url = item.value;
    }

    // CTA section
    if (item.page === 'HomePage' && item.section === 'cta') {
      if (item.key === 'cta.title') content.cta.title_fr = item.value;
      if (item.key === 'cta.subtitle') content.cta.subtitle_fr = item.value;
      if (item.key === 'cta.button') content.cta.button_fr = item.value;
    }
  });
  
  // Ajouter les images par défaut SI elles n'existent pas dans la DB
  content.hero.image_url = content.hero.image_url || '/images/mgarr.jpg';
  content.about.image_url = content.about.image_url || '/images/nous.jpg';
  
  return NextResponse.json(content);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  
  try {
    // Sauvegarder dans site_content
    const updates = [];
    
    // Hero
    if (body.hero) {
      if (body.hero.title_fr !== undefined) {
        updates.push({
          page: 'HomePage',
          section: 'hero',
          key: 'hero.title',
          locale: 'fr',
          value: body.hero.title_fr
        });
      }
      if (body.hero.subtitle_fr !== undefined) {
        updates.push({
          page: 'HomePage',
          section: 'hero',
          key: 'hero.subtitle',
          locale: 'fr',
          value: body.hero.subtitle_fr
        });
      }
      if (body.hero.cta_fr !== undefined) {
        updates.push({
          page: 'HomePage',
          section: 'hero',
          key: 'hero.cta',
          locale: 'fr',
          value: body.hero.cta_fr
        });
      }
      if (body.hero.scrollText_fr !== undefined) {
        updates.push({
          page: 'HomePage',
          section: 'hero',
          key: 'hero.scrollText',
          locale: 'fr',
          value: body.hero.scrollText_fr
        });
      }
      // AJOUTER L'IMAGE HERO
      if (body.hero.image_url !== undefined) {
        updates.push({
          page: 'HomePage',
          section: 'hero',
          key: 'hero.image_url',
          locale: 'fr',
          value: body.hero.image_url
        });
      }
    }
    
    // About
    if (body.about) {
      if (body.about.title_fr !== undefined) {
        updates.push({
          page: 'OurStory',
          section: 'general',
          key: 'title',
          locale: 'fr',
          value: body.about.title_fr
        });
      }
      // Parser le contenu HTML pour séparer les paragraphes
      if (body.about.content_fr !== undefined) {
        const paragraphs = body.about.content_fr
          .split('</p>')
          .filter((p: string) => p.trim())
          .map((p: string) => p.replace(/<p>/g, '').trim());
          
        paragraphs.forEach((para: string, index: number) => {
          if (para) {
            updates.push({
              page: 'OurStory',
              section: 'general',
              key: `paragraph${index + 1}`,
              locale: 'fr',
              value: para
            });
          }
        });
      }
      // AJOUTER L'IMAGE ABOUT
      if (body.about.image_url !== undefined) {
        updates.push({
          page: 'OurStory',
          section: 'general',
          key: 'image_url',
          locale: 'fr',
          value: body.about.image_url
        });
      }
    }

    // CTA section
    if (body.cta) {
      if (body.cta.title_fr !== undefined) {
        updates.push({
          page: 'HomePage',
          section: 'cta',
          key: 'cta.title',
          locale: 'fr',
          value: body.cta.title_fr
        });
      }
      if (body.cta.subtitle_fr !== undefined) {
        updates.push({
          page: 'HomePage',
          section: 'cta',
          key: 'cta.subtitle',
          locale: 'fr',
          value: body.cta.subtitle_fr
        });
      }
      if (body.cta.button_fr !== undefined) {
        updates.push({
          page: 'HomePage',
          section: 'cta',
          key: 'cta.button',
          locale: 'fr',
          value: body.cta.button_fr
        });
      }
    }
    
    // Upsert toutes les mises à jour avec le client admin
    for (const update of updates) {
      await supabaseAdmin
        .from('site_content')
        .upsert(update, {
          onConflict: 'page,section,key,locale'
        });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving content:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde' },
      { status: 500 }
    );
  }
}
