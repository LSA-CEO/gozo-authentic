import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Créer le middleware intl
const intlMiddleware = createMiddleware(routing);

// Mapping pays -> langue préférée
const countryToLocale: Record<string, string> = {
  // Français
  'FR': 'fr', 'BE': 'fr', 'CH': 'fr', 'LU': 'fr', 'MC': 'fr',
  'CI': 'fr', 'SN': 'fr', 'CM': 'fr', 'MG': 'fr', 'BF': 'fr',
  'ML': 'fr', 'NE': 'fr', 'TG': 'fr', 'BJ': 'fr', 'GA': 'fr',
  'CD': 'fr', 'CG': 'fr', 'GN': 'fr', 'HT': 'fr', 'DJ': 'fr',
  'KM': 'fr', 'SC': 'fr', 'TD': 'fr', 'BI': 'fr', 'RW': 'fr',
  'CF': 'fr', 'CA': 'fr', // Canada (partiel)
  
  // Anglais
  'GB': 'en', 'US': 'en', 'AU': 'en', 'NZ': 'en', 'IE': 'en',
  'ZA': 'en', 'NG': 'en', 'KE': 'en', 'GH': 'en', 'IN': 'en',
  'PK': 'en', 'PH': 'en', 'SG': 'en', 'MY': 'en', 'MT': 'en',
  
  // Allemand
  'DE': 'de', 'AT': 'de', 'LI': 'de',
  
  // Italien
  'IT': 'it', 'SM': 'it', 'VA': 'it',
  
  // Néerlandais
  'NL': 'nl', 'SR': 'nl', 'AW': 'nl', 'CW': 'nl', 'SX': 'nl',
  
  // Espagnol
  'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es', 'CL': 'es',
  'PE': 'es', 'VE': 'es', 'EC': 'es', 'GT': 'es', 'CU': 'es',
  'BO': 'es', 'DO': 'es', 'HN': 'es', 'PY': 'es', 'SV': 'es',
  'NI': 'es', 'CR': 'es', 'PA': 'es', 'UY': 'es', 'GQ': 'es',
  
  // Portugais
  'PT': 'pt', 'BR': 'pt', 'AO': 'pt', 'MZ': 'pt', 'CV': 'pt',
  'GW': 'pt', 'ST': 'pt', 'TL': 'pt',
};

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Si c'est une route admin, ne pas appliquer le middleware intl
  if (path.startsWith('/admin')) {
    return NextResponse.next();
  }
  
  // Si c'est la racine ou pas de locale dans l'URL, détecter la langue
  const pathnameHasLocale = routing.locales.some(
    locale => path.startsWith(`/${locale}/`) || path === `/${locale}`
  );
  
  if (!pathnameHasLocale) {
    // Vérifier si l'utilisateur a déjà une préférence sauvegardée
    const localeCookie = request.cookies.get('NEXT_LOCALE');
    if (localeCookie) {
      return intlMiddleware(request);
    }
    
    // Détecter le pays via les headers
    const country = request.headers.get('CF-IPCountry') || // Cloudflare
                   request.headers.get('X-Vercel-IP-Country') || // Vercel
                   request.headers.get('x-country-code') || // Autres CDN
                   request.headers.get('x-real-country'); // Autre variante
    
    if (country && countryToLocale[country]) {
      // Rediriger vers la langue appropriée
      const detectedLocale = countryToLocale[country];
      const response = NextResponse.redirect(
        new URL(`/${detectedLocale}${path}`, request.url)
      );
      
      // Sauvegarder la préférence
      response.cookies.set('NEXT_LOCALE', detectedLocale, {
        maxAge: 60 * 60 * 24 * 365, // 1 an
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
      
      return response;
    }
    
    // Si pas de pays détecté, utiliser Accept-Language
    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage) {
      const detectedLocale = detectLocaleFromAcceptLanguage(acceptLanguage);
      if (detectedLocale) {
        const response = NextResponse.redirect(
          new URL(`/${detectedLocale}${path}`, request.url)
        );
        
        response.cookies.set('NEXT_LOCALE', detectedLocale, {
          maxAge: 60 * 60 * 24 * 365,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production'
        });
        
        return response;
      }
    }
  }
  
  // Pour toutes les autres routes, utiliser le middleware intl
  return intlMiddleware(request);
}

function detectLocaleFromAcceptLanguage(acceptLanguage: string): string | null {
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, quality = '1'] = lang.trim().split(';q=');
      return { code: code.toLowerCase(), quality: parseFloat(quality) };
    })
    .sort((a, b) => b.quality - a.quality);
  
  for (const { code } of languages) {
    // Extraire le code langue principal (fr-FR -> fr)
    const mainCode = code.split('-')[0];
    
    if (routing.locales.includes(mainCode as any)) {
      return mainCode;
    }
  }
  
  return null;
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
