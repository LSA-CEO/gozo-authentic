#!/bin/bash

echo "🔧 Correction des doublons dans SEO.tsx..."

# Sauvegarder
cp components/SEO.tsx components/SEO.tsx.backup-duplicates

# Créer une version temporaire avec les corrections
cat > components/SEO.tsx.fixed << 'EOFSEO'
import Head from 'next/head';
import { seoConfig } from "../lib/seo-config";
import { useRouter } from 'next/router';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  article?: boolean;
  locale: string;
  alternates?: Record<string, string>;
}

export function SEO({ 
  title, 
  description, 
  image = '/og-image.jpg',
  article = false,
  locale,
  alternates
}: SEOProps) {
  const router = useRouter();
  const siteUrl = seoConfig.siteUrl;
  const currentUrl = `${siteUrl}${router.asPath}`;
  
  const finalTitle = title ? `${title} | ${seoConfig.siteName}` : seoConfig.siteName;
  const finalDescription = description || seoConfig.siteDescription;
  const keywords = "Gozo, voyage, expériences, tourisme, Malte";
  
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Gozo Authentic" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content={locale} />
      
      {/* Open Graph */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={`${siteUrl}${image}`} />
      <meta property="og:site_name" content={seoConfig.siteName} />
      <meta property="og:locale" content={locale} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={`${siteUrl}${image}`} />
      
      {/* Canonical */}
      <link rel="canonical" href={currentUrl} />
      
      {/* Alternate Languages */}
      {alternates && Object.entries(alternates).map(([lang, url]) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={`${siteUrl}${url}`} />
      ))}
      
      {/* Geo Tags */}
      <meta name="geo.region" content="MT-14" />
      <meta name="geo.placename" content="Għajnsielem, Gozo" />
      <meta name="geo.position" content="36.025833;14.285000" />
      <meta name="ICBM" content="36.025833, 14.285000" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(seoConfig.organizationSchema)
        }}
      />
      
      {/* FAQ Schema for homepage */}
      {router.pathname === '/' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": []
            })
          }}
        />
      )}
      
      {/* Local Business Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Gozo Authentic",
            "image": `${siteUrl}/logo.png`,
            "priceRange": "Free",
            "@id": siteUrl,
            "url": siteUrl,
            "telephone": "+35699999999",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Għajnsielem",
              "addressLocality": "Għajnsielem",
              "postalCode": "GSM",
              "addressCountry": "MT"
            },
            "sameAs": [
              "https://www.instagram.com/gozoauthentic",
              "https://www.facebook.com/gozoauthentic"
            ]
          })
        }}
      />
    </Head>
  );
}
EOFSEO

# Remplacer le fichier
mv components/SEO.tsx.fixed components/SEO.tsx

echo "✅ SEO.tsx corrigé (doublons supprimés) !"
echo ""
echo "🔍 Test final..."
npx tsc --noEmit 2>&1 | grep -c "error" || echo "🎉 AUCUNE ERREUR TYPESCRIPT !"

