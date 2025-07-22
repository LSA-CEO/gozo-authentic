import { supabase } from '../../lib/supabase';

export default async function AdminDashboard() {
  // Récupérer les stats
  const [
    { count: experiencesCount },
    { count: leadsCount },
    { count: categoriesCount },
    { count: tagsCount }
  ] = await Promise.all([
    supabase.from('experiences').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('tags').select('*', { count: 'exact', head: true })
  ]);
  
  // Récupérer les dernières demandes
  const { data: recentLeads } = await supabase
    .from('leads')
    .select('*, experiences(name_fr)')
    .order('created_at', { ascending: false })
    .limit(5);
  
  const stats = [
    { label: 'Expériences', value: experiencesCount || 0 },
    { label: 'Demandes', value: leadsCount || 0 },
    { label: 'Catégories', value: categoriesCount || 0 },
    { label: 'Tags', value: tagsCount || 0 }
  ];
  
  return (
    <div>
      <h1 className="text-3xl font-light text-gray-900 mb-8">Dashboard</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">{stat.label}</p>
            <p className="text-3xl font-light text-gray-900 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>
      
      {/* Dernières demandes */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-medium text-gray-900">Dernières demandes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expérience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Référence
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentLeads?.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(lead.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.customer_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.experiences?.name_fr || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {lead.reference_code}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
