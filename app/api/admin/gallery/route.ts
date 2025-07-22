import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase-admin';

export async function GET() {
  try {
    // Récupérer les textes de la galerie
    const { data: textData } = await supabaseAdmin
      .from('site_content')
      .select('*')
      .eq('page', 'HomePage')
      .eq('section', 'gallery')
      .eq('locale', 'fr');

    // Récupérer les images depuis la DB
    const { data: images, error: imagesError } = await supabaseAdmin
      .from('gallery_images')
      .select('*')
      .eq('is_active', true)
      .order('order_position', { ascending: true });

    if (imagesError) {
      console.error('Error loading images:', imagesError);
    }

    const content: any = {
      title: '',
      subtitle: '',
      images: images || []
    };

    textData?.forEach(item => {
      if (item.key === 'gallery.title') content.title = item.value;
      if (item.key === 'gallery.subtitle') content.subtitle = item.value;
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error loading gallery:', error);
    return NextResponse.json({ error: 'Erreur lors du chargement' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    const updates = [];

    // Sauvegarder les textes
    if (body.title !== undefined) {
      updates.push({
        page: 'HomePage',
        section: 'gallery',
        key: 'gallery.title',
        locale: 'fr',
        value: body.title
      });
    }

    if (body.subtitle !== undefined) {
      updates.push({
        page: 'HomePage',
        section: 'gallery',
        key: 'gallery.subtitle',
        locale: 'fr',
        value: body.subtitle
      });
    }

    // Upsert les mises à jour de texte
    for (const update of updates) {
      await supabaseAdmin
        .from('site_content')
        .upsert(update, {
          onConflict: 'page,section,key,locale'
        });
    }

    // Sauvegarder les images dans la DB
    if (body.images && Array.isArray(body.images)) {
      // D'abord, supprimer toutes les images existantes
      await supabaseAdmin
        .from('gallery_images')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      // Ensuite, insérer les nouvelles images
      if (body.images.length > 0) {
        const imagesToInsert = body.images.map((img: any, index: number) => ({
          url: img.url,
          alt: img.alt,
          type: img.type,
          order_position: img.order_position || index,
          is_active: true
        }));

        const { error: insertError } = await supabaseAdmin
          .from('gallery_images')
          .insert(imagesToInsert);

        if (insertError) {
          console.error('Error inserting images:', insertError);
          throw insertError;
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving gallery:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde' },
      { status: 500 }
    );
  }
}



