export const seoConfig = {
  siteName: 'Gozo Authentic',
  siteDescription: 'Découvrez le vrai Gozo avec Flav & Jade - Votre carnet de voyage intimiste pour explorer les meilleures expériences de l\'île',
  siteUrl: 'https://gozoauthentic.com',
  twitterHandle: '@gozoauthentic',
  defaultImage: '/images/gozo-hero.jpg',
  defaultLocale: 'fr',
  locales: ['en', 'fr', 'de', 'it', 'nl', 'es', 'pt'],
  
  // OpenGraph default values
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Gozo Authentic',
    images: [
      {
        url: '/images/gozo-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Gozo Authentic - Découvrez le vrai Gozo',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    handle: '@gozoauthentic',
    site: '@gozoauthentic',
    cardType: 'summary_large_image',
  },
  
  // Additional meta tags
  additionalMetaTags: [
    {
      name: 'author',
      content: 'Flav & Jade',
    },
    {
      name: 'keywords',
      content: 'Gozo, Malte, voyage, expériences authentiques, carnet de voyage, tourisme, activités Gozo',
    },
  ],
  
  // Structured data for organization
  organizationSchema: {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'Gozo Authentic',
    description: 'Carnet de voyage intimiste pour découvrir Gozo',
    url: 'https://gozoauthentic.com',
    logo: 'https://gozoauthentic.com/images/logo.png',
    sameAs: [
      'https://facebook.com/gozoauthentic',
      'https://instagram.com/gozoauthentic',
      'https://twitter.com/gozoauthentic',
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Għajnsielem',
      addressCountry: 'MT',
      addressRegion: 'Gozo',
    },
  },
};

// Helper function to generate meta tags for a page
export function generateMetaTags({
  title,
  description,
  image,
  url,
  locale = 'fr',
}: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  locale?: string;
}) {
  const pageTitle = title ? `${title} | ${seoConfig.siteName}` : seoConfig.siteName;
  const pageDescription = description || seoConfig.siteDescription;
  const pageImage = image || seoConfig.defaultImage;
  const pageUrl = url || seoConfig.siteUrl;
  
  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: pageUrl,
      images: [{ url: pageImage }],
      locale: locale,
      siteName: seoConfig.siteName,
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [pageImage],
    },
  };
}

// Category-specific SEO configurations
export const categorySeoConfig = {
  'nos-aventures-en-mer': {
    title: 'Nos aventures en mer à Gozo',
    description: 'Découvrez nos meilleures expériences maritimes à Gozo : boat trips, jet ski, plongée et plus encore. Testées et approuvées par Flav & Jade.',
    keywords: 'boat trip gozo, jet ski gozo, plongée gozo, activités nautiques gozo',
  },
  'nos-folies-terrestres': {
    title: 'Nos folies terrestres à Gozo',
    description: 'Quad, vélo, escalade et segway : toutes nos aventures terrestres préférées à Gozo pour les amateurs d\'adrénaline.',
    keywords: 'quad gozo, vélo gozo, escalade gozo, segway gozo, activités terrestres',
  },
  'nos-tables-secretes': {
    title: 'Nos tables secrètes à Gozo',
    description: 'Les meilleurs restaurants cachés de Gozo : terrasses sunset, tavernes familiales et nos adresses coup de cœur où on emmène nos amis.',
    keywords: 'restaurants gozo, où manger gozo, restaurants cachés gozo, gastronomie maltaise',
  },
  'nos-refuges-coup-de-coeur': {
    title: 'Nos refuges coup de cœur à Gozo',
    description: 'Farmhouses authentiques, B&B intimes et hôtels de charme : découvrez nos hébergements préférés à Gozo.',
    keywords: 'hébergement gozo, farmhouse gozo, b&b gozo, où dormir gozo',
  },
  'nos-plages-cachees': {
    title: 'Nos plages cachées à Gozo',
    description: 'Criques secrètes, spots de snorkeling et plages isolées : nos coins de paradis cachés à Gozo, loin des touristes.',
    keywords: 'plages gozo, plages cachées gozo, snorkeling gozo, criques secrètes',
  },
  'nos-pepites-locales': {
    title: 'Nos pépites locales à Gozo',
    description: 'Marchés locaux, artisans, transport et services : toutes les bonnes adresses qu\'on garde jalousement à Gozo.',
    keywords: 'marchés gozo, artisans gozo, transport gozo, services gozo',
  },
};

// Experience page SEO helper
export function generateExperienceSeo(experience: {
  title: string;
  description: string;
  category: string;
  image?: string;
}) {
  return generateMetaTags({
    title: experience.title,
    description: experience.description,
    image: experience.image,
  });
}
