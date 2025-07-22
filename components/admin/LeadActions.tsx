'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LeadActionsProps {
  lead: any;
}

export function LeadActions({ lead }: LeadActionsProps) {
  const router = useRouter();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const updateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error updating lead:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <>
      <div className="flex items-center gap-2 justify-end">
        <button
          onClick={() => setIsDetailsOpen(true)}
          className="text-gray-600 hover:text-gray-900"
        >
          Détails
        </button>
        
        <select
          value={lead.status || 'pending'}
          onChange={(e) => updateStatus(e.target.value)}
          disabled={isUpdating}
          className="text-sm border border-gray-300 text-gray-900 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          <option value="pending">En attente</option>
          <option value="confirmed">Confirmée</option>
          <option value="completed">Terminée</option>
          <option value="cancelled">Annulée</option>
        </select>
      </div>
      
      {/* Modal détails */}
      {isDetailsOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsDetailsOpen(false)} />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-medium text-gray-900">
                  Détails de la demande
                </h3>
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Référence</p>
                    <p className="font-mono text-gray-900">{lead.reference_code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date de création</p>
                    <p className="text-gray-900">
                      {new Date(lead.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Client</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Nom</p>
                      <p className="text-gray-900">{lead.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-gray-900">{lead.customer_email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Téléphone</p>
                      <p className="text-gray-900">{lead.customer_phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Langue</p>
                      <p className="text-gray-900">{lead.locale?.toUpperCase() || 'FR'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Réservation</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Expérience</p>
                      <p className="text-gray-900">{lead.experiences?.name_fr || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Partenaire</p>
                      <p className="text-gray-900">{lead.experiences?.partner_name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date souhaitée</p>
                      <p className="text-gray-900">
                        {lead.preferred_date 
                          ? new Date(lead.preferred_date).toLocaleDateString('fr-FR')
                          : 'Flexible'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nombre de personnes</p>
                      <p className="text-gray-900">{lead.guests || 1}</p>
                    </div>
                  </div>
                </div>
                
                {lead.message && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Message</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{lead.message}</p>
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Tracking</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Source</p>
                      <p className="text-gray-900">{lead.source || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">UTM Source</p>
                      <p className="text-gray-900">{lead.utm_source || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">UTM Medium</p>
                      <p className="text-gray-900">{lead.utm_medium || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">UTM Campaign</p>
                      <p className="text-gray-900">{lead.utm_campaign || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
