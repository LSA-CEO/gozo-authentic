import { ExperienceForm } from '../../../../components/admin/ExperienceForm';
import { supabaseAdmin } from '../../../../lib/supabase-admin';

export default async function NewExperience() {
  // Récupérer les catégories et tags pour le formulaire
  const [
    { data: categories },
    { data: tags }
  ] = await Promise.all([
    supabaseAdmin.from('categories').select('*').eq('is_active', true).order('position'),
    supabaseAdmin.from('tags').select('*').eq('is_active', true).order('tag_type')
  ]);
  
  return (
    <div>
      <h1 className="text-3xl font-light text-gray-900 mb-8">Nouvelle expérience</h1>
      <ExperienceForm 
        categories={categories || []} 
        tags={tags || []}
      />
    </div>
  );
}
