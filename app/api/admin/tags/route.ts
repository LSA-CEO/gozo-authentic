import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase-admin';

export async function GET() {
  // Récupérer les tags avec le nombre d'utilisations
  const { data, error } = await supabaseAdmin
    .from('tags')
    .select(`
      *,
      experience_tags(count)
    `)
    .order('tag_type')
    .order('name_fr');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Transformer pour avoir le count
  const tagsWithCount = data?.map(tag => ({
    ...tag,
    _count: {
      experience_tags: tag.experience_tags?.[0]?.count || 0
    }
  }));

  return NextResponse.json(tagsWithCount);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { data, error } = await supabaseAdmin
    .from('tags')
    .insert([body])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
