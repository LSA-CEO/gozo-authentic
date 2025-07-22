'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminUserActionsProps {
  user: any;
}

export function AdminUserActions({ user }: AdminUserActionsProps) {
  const router = useRouter();
  const [isResetting2FA, setIsResetting2FA] = useState(false);
  
  const handleToggleActive = async () => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      
      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error toggling user:', error);
    }
  };
  
  const handleReset2FA = async () => {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser le 2FA pour cet utilisateur ?')) return;
    
    setIsResetting2FA(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/reset-2fa`, {
        method: 'POST',
      });
      
      if (response.ok) {
        alert('2FA réinitialisé avec succès');
        router.refresh();
      }
    } catch (error) {
      console.error('Error resetting 2FA:', error);
    } finally {
      setIsResetting2FA(false);
    }
  };
  
  return (
    <div className="flex items-center gap-2 justify-end">
      <button
        onClick={handleToggleActive}
        className="text-sm text-gray-600 hover:text-gray-900"
      >
        {user.is_active ? 'Désactiver' : 'Activer'}
      </button>
      {user.two_factor_enabled && (
        <button
          onClick={handleReset2FA}
          disabled={isResetting2FA}
          className="text-sm text-orange-600 hover:text-orange-900 disabled:opacity-50"
        >
          Reset 2FA
        </button>
      )}
    </div>
  );
}
