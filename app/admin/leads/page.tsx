import { supabase } from '../../../lib/supabase';
import { LeadActions } from '../../../components/admin/LeadActions';

export default async function AdminLeads() {
  const { data: leads } = await supabase
    .from('leads')
    .select(`
      *,
      experiences(name_fr, partner_name, category_id)
    `)
    .order('created_at', { ascending: false });
    
  // Grouper les leads par statut
  const groupedLeads = {
    pending: leads?.filter(l => l.status === 'pending' || !l.status) || [],
    confirmed: leads?.filter(l => l.status === 'confirmed') || [],
    completed: leads?.filter(l => l.status === 'completed') || [],
    cancelled: leads?.filter(l => l.status === 'cancelled') || []
  };
  
  const statusLabels = {
    pending: 'En attente',
    confirmed: 'Confirmées',
    completed: 'Terminées',
    cancelled: 'Annulées'
  };
  
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  
  return (
    <div>
      <h1 className="text-3xl font-light text-gray-900 mb-8">Demandes clients</h1>
      
      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {Object.entries(groupedLeads).map(([status, leads]) => (
          <div key={status} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{statusLabels[status as keyof typeof statusLabels]}</p>
                <p className="text-2xl font-light text-gray-900 mt-1">{leads.length}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${statusColors[status as keyof typeof statusColors]}`} />
            </div>
          </div>
        ))}
      </div>
      
      {/* Tableau des leads */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Référence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expérience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date souhaitée
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads?.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(lead.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-sm font-mono bg-gray-900 text-gray-100 px-2 py-1 rounded">
                      {lead.reference_code}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {lead.customer_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {lead.customer_email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {lead.customer_phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm text-gray-900">
                        {lead.experiences?.name_fr || '-'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {lead.experiences?.partner_name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.preferred_date 
                      ? new Date(lead.preferred_date).toLocaleDateString('fr-FR')
                      : 'Flexible'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      statusColors[lead.status as keyof typeof statusColors] || statusColors.pending
                    }`}>
                      {statusLabels[lead.status as keyof typeof statusLabels] || 'En attente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <LeadActions lead={lead} />
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
