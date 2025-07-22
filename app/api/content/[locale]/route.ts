import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  
  // Récupérer le contenu pour la locale demandée
  let { data, error } = await supabaseAdmin
    .from('site_content')
    .select('*')
    .eq('locale', locale)
    .in('page', ['HomePage', 'OurStory']);
    
  if (error) {
    console.error('Erreur Supabase:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // Si pas de données pour cette locale, fallback sur FR
  if (!data || data.length === 0) {
    const { data: frData } = await supabaseAdmin
      .from('site_content')
      .select('*')
      .eq('locale', 'fr')
      .in('page', ['HomePage', 'OurStory']);
      
    data = frData || [];
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
      if (item.key === 'title') content.hero[`title_${locale}`] = item.value;
      if (item.key === 'subtitle') content.hero[`subtitle_${locale}`] = item.value;
      if (item.key === 'cta') content.hero[`cta_${locale}`] = item.value;
      if (item.key === 'scrollText') content.hero[`scrollText_${locale}`] = item.value;
      if (item.key === 'image_url') content.hero.image_url = item.value;
    }
    
    // About section (OurStory)
    if (item.page === 'OurStory' && item.section === 'general') {
      if (item.key === 'title') content.about[`title_${locale}`] = item.value;
      if (item.key === 'paragraph1' || item.key === 'paragraph2' || item.key === 'paragraph3') {
        if (!content.about[`content_${locale}`]) content.about[`content_${locale}`] = '';
        content.about[`content_${locale}`] += `<p>${item.value}</p>`;
      }
      if (item.key === 'image_url') content.about.image_url = item.value;
    }

    // CTA section
    if (item.page === 'HomePage' && item.section === 'cta') {
      if (item.key === 'title') content.cta[`title_${locale}`] = item.value;
      if (item.key === 'subtitle') content.cta[`subtitle_${locale}`] = item.value;
      if (item.key === 'button') content.cta[`button_${locale}`] = item.value;
    }
  });
  
  // Ajouter les images par défaut
  content.hero.image_url = content.hero.image_url || '/images/mgarr.jpg';
  content.about.image_url = content.about.image_url || '/images/nous.jpg';
  
  return NextResponse.json(content);
}
