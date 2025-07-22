import { notFound } from 'next/navigation';
import { ExperienceForm } from '../../../../../components/admin/ExperienceForm';
import { supabaseAdmin } from '../../../../../lib/supabase-admin';
import Link from 'next/link';

export default async function EditExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;

  // Récupérer l'expérience
  const { data: experience, error } = await supabaseAdmin
    .from('experiences')
    .select(`
      *,
      experience_tags (
        tag_id,
        tags (*)
      )
    `)
    .eq('id', resolvedParams.id)
    .single();

  if (error || !experience) {
    notFound();
  }

  // Récupérer toutes les catégories
  const { data: categories } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('order_index');

  // Récupérer tous les tags
  const { data: tags } = await supabaseAdmin
    .from('tags')
    .select('*')
    .order('name');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-between p-6 bg-white border-b">
        <h1 className="text-2xl font-bold text-gray-900">
          Modifier l&apos;expérience
        </h1>
        <Link
          href="/admin/experiences"
          className="text-gray-600 hover:text-gray-900"
        >
          Retour aux expériences
        </Link>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <ExperienceForm
          experience={experience}
          categories={categories || []}
          tags={tags || []}
        />
      </div>
    </div>
  );
}
