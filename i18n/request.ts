import {getRequestConfig} from 'next-intl/server';
 
const locales = ['en', 'fr', 'de', 'nl', 'es', 'pt', 'en-US'];

export default getRequestConfig(async ({locale}) => {
  // Ensure locale is always a string
  const currentLocale = locale || 'en';
  
  // Validate that the incoming locale parameter is valid
  const validLocale = locales.includes(currentLocale) ? currentLocale : 'en';
 
  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default
  };
});