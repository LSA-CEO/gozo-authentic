import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';
 
export const routing = defineRouting({
  locales: ['en', 'fr', 'de', 'it', 'nl', 'es', 'pt'],
  defaultLocale: 'fr'
});
 
export const {Link, redirect, usePathname, useRouter} =
  createNavigation(routing);
