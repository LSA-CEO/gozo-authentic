'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

export function AdminSidebar() {
  const pathname = usePathname();
  
  const menuItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/homepage', label: 'Homepage' },
    { href: '/admin/gallery', label: 'Galerie' },
    { href: '/admin/experiences', label: 'Expériences' },
    { href: '/admin/categories', label: 'Catégories' },
    { href: '/admin/tags', label: 'Tags' },
    { href: '/admin/translations', label: '🌐 Traductions' },
    { href: '/admin/leads', label: 'Demandes' },
    { href: '/admin/users', label: 'Utilisateurs' },
  ];
  
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };
  
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white">
      <div className="p-6 h-full flex flex-col">
        <h2 className="text-2xl font-light mb-8">Admin Panel</h2>
        
        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2 rounded transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="border-t border-gray-800 pt-4 mt-4">
          <Link
            href="/"
            target="_blank"
            className="block px-4 py-2 text-gray-300 hover:text-white transition-colors mb-2"
          >
            ← Retour au site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            🚪 Déconnexion
          </button>
        </div>
      </div>
    </aside>
  );
}
