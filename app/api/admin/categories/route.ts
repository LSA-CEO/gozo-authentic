import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth-config';
import { supabaseAdmin } from '../../../../lib/supabase-admin';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('position');
      
    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in GET:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Générer le slug à partir du nom français
    const slug = body.name_fr
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
      .replace(/[^a-z0-9]+/g, '-') // Remplacer les caractères spéciaux par des tirets
      .replace(/^-+|-+$/g, ''); // Enlever les tirets au début et à la fin
    
    // Préparer les données pour l'insertion
    const insertData = {
      slug,
      name_fr: body.name_fr,
      name_en: body.name_en,
      name_de: body.name_de || body.name_en,
      name_it: body.name_it || body.name_en,
      name_nl: body.name_nl || body.name_en,
      name_es: body.name_es || body.name_en,
      name_pt: body.name_pt || body.name_en,
      description_fr: body.description_fr || '',
      description_en: body.description_en || '',
      description_de: body.description_de || '',
      description_it: body.description_it || '',
      description_nl: body.description_nl || '',
      description_es: body.description_es || '',
      description_pt: body.description_pt || '',
      position: body.position || 10,
      is_active: body.is_active !== false,
      image_url: body.image_url || null,
      icon: '🏷️' // Icône par défaut, on pourra la retirer plus tard
    };
    
    // Insérer dans Supabase
    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert([insertData])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating category:', error);
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: 'Une catégorie avec ce slug existe déjà' },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création' },
      { status: 500 }
    );
  }
}
