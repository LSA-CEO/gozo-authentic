import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase-admin';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('experiences')
    .select(`
      *,
      category:categories(name_fr, slug),
      experience_tags(
        tag:tags(name_fr, slug, tag_type)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tags, ...experienceData } = body;

  // Créer l'expérience
  const { data: experience, error: experienceError } = await supabaseAdmin
    .from('experiences')
    .insert([experienceData])
    .select()
    .single();

  if (experienceError) {
    return NextResponse.json({ error: experienceError.message }, { status: 500 });
  }

  // Ajouter les tags
  if (tags && tags.length > 0) {
    const experienceTags = tags.map((tagId: string) => ({
      experience_id: experience.id,
      tag_id: tagId
    }));

    const { error: tagsError } = await supabaseAdmin
      .from('experience_tags')
      .insert(experienceTags);

    if (tagsError) {
      console.error('Error adding tags:', tagsError);
    }
  }

  return NextResponse.json(experience);
}
