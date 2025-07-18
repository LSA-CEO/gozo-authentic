import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  locales: ['en', 'fr', 'de', 'nl', 'es', 'pt', 'en-US'],
  defaultLocale: 'en'
});
 
export const config = {
  matcher: ['/', '/(fr|en|de|nl|es|pt|en-US)/:path*']
};