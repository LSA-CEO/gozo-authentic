import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth-config';
import { supabaseAdmin } from '../../../../../lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { filePath } = await request.json();
    
    if (!filePath) {
      return NextResponse.json({ error: 'Chemin du fichier manquant' }, { status: 400 });
    }

    // Supprimer de Supabase Storage avec le client admin
    const { error } = await supabaseAdmin.storage
      .from('gallery')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete exception:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
