import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';
import { supabaseAdmin } from '../lib/supabase-admin';

export default getRequestConfig(async ({requestLocale}) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;
 
  // Ensure that the incoming locale is valid
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  
  // Charger les messages depuis la base de données
  try {
    const { data, error } = await supabaseAdmin
      .from('site_content')
      .select('page, section, key, value')
      .eq('locale', locale);
    
    if (error) {
      console.error('Error loading translations from DB:', error);
      return { locale, messages: {} };
    }
    
    // Convertir en structure imbriquée correcte pour next-intl
    const messages: Record<string, any> = {};
    
    data?.forEach(item => {
      // Créer la structure de page si elle n'existe pas
      if (!messages[item.page]) {
        messages[item.page] = {};
      }
      
      // Si section est "general", mettre directement dans la page
      if (item.section === 'general') {
        messages[item.page][item.key] = item.value;
      } else {
        // Sinon, créer la sous-section
        if (!messages[item.page][item.section]) {
          messages[item.page][item.section] = {};
        }
        messages[item.page][item.section][item.key] = item.value;
      }
    });
    
    console.log('Loaded messages structure:', JSON.stringify(Object.keys(messages)));
    
    return {
      locale,
      messages
    };
  } catch (error) {
    console.error('Failed to load translations:', error);
    return {
      locale,
      messages: {}
    };
  }
});
