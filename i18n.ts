import {getRequestConfig} from 'next-intl/server';
import {routing} from './i18n/routing';
import { supabaseAdmin } from './lib/supabase-admin';

export default getRequestConfig(async ({locale}) => {
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
      console.error('Error loading translations:', error);
      return {
        locale,
        messages: {}
      };
    }

    // Convertir en format attendu par next-intl
    const messages: any = {};
    data?.forEach((row: any) => {
      if (!messages[row.page]) {
        messages[row.page] = {};
      }
      if (!messages[row.page][row.section]) {
        messages[row.page][row.section] = {};
      }
      messages[row.page][row.section][row.key] = row.value;
    });

    return {
      locale,
      messages
    };
  } catch (error) {
    console.error('Error in i18n config:', error);
    return {
      locale,
      messages: {}
    };
  }
});
