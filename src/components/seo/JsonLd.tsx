export function JsonLdProvider() {
  return (
    <>
      <OrganizationJsonLd />
      <SoftwareAppJsonLd />
      {/* FAQ can be page specific, included here globally for critical common FAQs or move to specific page */}
    </>
  );
}

// Helper to safely serialize JSON-LD, preventing XSS via </script> injection
const safeJsonLd = (data: any) => {
  return JSON.stringify(data).replace(/</g, '\\u003c');
};

export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ApexOS',
    url: 'https://apexrebate.com',
    logo: 'https://apexrebate.com/logo.png',
    sameAs: ['https://twitter.com/apexos', 'https://t.me/apexos'],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-555-5555', // Placeholder
      contactType: 'customer service',
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }} />;
}

export function SoftwareAppJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ApexOS',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Zero subscription fees. Revenue from exchange spread only.',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1200',
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }} />;
}

export function FAQPageJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is ApexOS really free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. ApexOS charges $0/mo forever. We earn from exchange spread (0.05%–0.30%) — you keep 100% of your profits.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do tiers work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Tiers unlock automatically via your monthly trading volume. Higher volume = lower spread + more AI agents + higher self-rebate.',
        },
      },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }} />;
}
