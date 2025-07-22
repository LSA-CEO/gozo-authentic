import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Créer le middleware intl
const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Si c'est une route admin, ne pas appliquer le middleware intl
  if (path.startsWith('/admin')) {
    return NextResponse.next();
  }
  
  // Pour toutes les autres routes, utiliser le middleware intl
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
