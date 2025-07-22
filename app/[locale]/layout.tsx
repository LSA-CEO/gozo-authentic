import { notFound } from 'next/navigation';
import { createTranslator, NextIntlClientProvider } from 'next-intl';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { ReactNode } from 'react';
import { supabaseAdmin } from '../../lib/supabase-admin';

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

async function getMessages(locale: string) {
  try {
    console.log('Loading messages for locale:', locale);
    
    // Récupérer les traductions depuis la base de données avec supabaseAdmin
    const { data, error } = await supabaseAdmin
      .from('site_content')
      .select('page, section, key, value')
      .eq('locale', locale);
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} translations for ${locale}`);
    
    // Convertir en format attendu par next-intl
    const messages: Record<string, any> = {};
    
    data?.forEach(item => {
      // Créer la structure de page si elle n'existe pas
      if (!messages[item.page]) {
        messages[item.page] = {};
      }
      
      // Pour les sections "general", on met directement dans la page
      if (item.section === 'general') {
        messages[item.page][item.key] = item.value;
      } else {
        // Pour les autres sections, on crée la hiérarchie complète
        if (!messages[item.page][item.section]) {
          messages[item.page][item.section] = {};
        }
        messages[item.page][item.section][item.key] = item.value;
      }
    });
    
    console.log('Messages structure:', JSON.stringify(Object.keys(messages)));
    
    // PAS DE FALLBACK JSON - Retourner les messages même si vides
    return messages;
  } catch (error) {
    console.error('Error loading translations:', error);
    // Retourner un objet vide au lieu de chercher les JSON
    return {};
  }
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const messages = await getMessages(locale);
  const t = createTranslator({ locale, messages });

  // Utiliser des valeurs par défaut si les traductions n'existent pas
  return {
    title: messages?.LocaleLayout?.title || 'Gozo Authentic',
    description: messages?.LocaleLayout?.description || 'Découvrez le vrai Gozo',
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  const messages = await getMessages(locale);

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header locale={locale} />
          <main>{children}</main>
          <Footer locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
