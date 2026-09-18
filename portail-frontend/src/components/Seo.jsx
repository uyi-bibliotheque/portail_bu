import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://bcu-uyi.cm';
const DEFAULT_TITLE = 'Bibliothèque Centrale Universitaire de Yaoundé I | BCU UYI';
const DEFAULT_DESCRIPTION = 'Catalogue documentaire, thèses et mémoires, ressources numériques, services et dépôt institutionnel de la Bibliothèque Centrale de l’Université de Yaoundé I.';

export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image = '/logo.png',
  keywords,
  canonical,
  faqSchema,
  articleSchema,
  breadcrumbs,
  children,
}) {
  const resolvedTitle = title ? `${title} | BCU UYI` : DEFAULT_TITLE;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const currentUrl = `${SITE_URL}${normalizedPath}`;
  const canonicalUrl = canonical || currentUrl;
  const finalImage = image.startsWith('http') ? image : `${SITE_URL}${image.startsWith('/') ? image : `/${image}`}`;

  const structuredSchema = [];

  if (faqSchema) {
    structuredSchema.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      ...faqSchema,
    });
  }

  if (articleSchema) {
    structuredSchema.push({
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      ...articleSchema,
    });
  }

  if (breadcrumbs && breadcrumbs.length > 0) {
    structuredSchema.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.href ? `${SITE_URL}${item.href}` : currentUrl,
      })),
    });
  }

  return (
    <>
      <Helmet>
        <title>{resolvedTitle}</title>
        <meta name="description" content={description} />
        {keywords && <meta name="keywords" content={keywords} />}
        <meta name="author" content="Bibliothèque Centrale Universitaire de Yaoundé I" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="theme-color" content="#1B1464" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={resolvedTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={finalImage} />
        <meta property="og:image:alt" content={resolvedTitle} />
        <meta property="og:site_name" content="BCU UYI" />
        <meta property="og:locale" content="fr_CM" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@BCU_UYI" />
        <meta name="twitter:title" content={resolvedTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={finalImage} />
        {children}
      </Helmet>
      {structuredSchema.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify(structuredSchema.length === 1 ? structuredSchema[0] : structuredSchema)}
        </script>
      )}
    </>
  );
}
