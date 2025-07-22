import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth-config';
import { supabaseAdmin } from '../../../../../lib/supabase-admin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    
    // Préparer les données à mettre à jour
    const updateData: any = {};
    
    // Champs qui peuvent être mis à jour
    const allowedFields = [
      'name_fr', 'name_en', 'name_de', 'name_it', 'name_nl', 'name_es', 'name_pt',
      'description_fr', 'description_en', 'description_de', 'description_it', 
      'description_nl', 'description_es', 'description_pt',
      'position', 'is_active', 'image_url'
    ];
    
    // Filtrer uniquement les champs autorisés
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }
    
    // Mettre à jour dans Supabase
    const { data, error } = await supabaseAdmin
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating category:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PATCH:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Vérifier s'il y a des expériences dans cette catégorie
    const { count } = await supabaseAdmin
      .from('experiences')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id);
      
    if (count && count > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer une catégorie contenant des expériences' },
        { status: 400 }
      );
    }

    // Supprimer la catégorie
    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting category:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
