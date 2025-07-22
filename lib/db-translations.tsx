'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

interface TranslationsContextType {
  translations: Record<string, string>;
  locale: string;
  isLoading: boolean;
}

const TranslationsContext = createContext<TranslationsContextType>({
  translations: {},
  locale: 'fr',
  isLoading: true
});

export function useTranslations(namespace?: string) {
  const { translations, locale, isLoading } = useContext(TranslationsContext);
  
  // Fonction pour obtenir une traduction
  const t = (key: string, values?: Record<string, any>) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    let translation = translations[fullKey] || translations[key] || key;
    
    // Remplacer les variables si nécessaire
    if (values) {
      Object.entries(values).forEach(([k, v]) => {
        translation = translation.replace(`{${k}}`, String(v));
      });
    }
    
    return translation;
  };
  
  return t;
}

export function DbTranslationsProvider({ 
  children, 
  locale 
}: { 
  children: React.ReactNode;
  locale: string;
}) {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTranslations() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('page, section, key, value')
          .eq('locale', locale);
        
        if (error) throw error;
        
        // Créer un objet plat avec toutes les traductions
        const translationsMap: Record<string, string> = {};
        
        data?.forEach(item => {
          // Créer plusieurs clés pour faciliter l'accès
          translationsMap[`${item.page}.${item.section}.${item.key}`] = item.value;
          translationsMap[`${item.page}.${item.key}`] = item.value;
          translationsMap[item.key] = item.value;
        });
        
        setTranslations(translationsMap);
      } catch (error) {
        console.error('Error loading translations:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadTranslations();
  }, [locale]);

  return (
    <TranslationsContext.Provider value={{ translations, locale, isLoading }}>
      {children}
    </TranslationsContext.Provider>
  );
}
