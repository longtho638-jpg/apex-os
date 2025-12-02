export function JsonLdProvider() {
  return (
    <>
      <OrganizationJsonLd />
      <SoftwareAppJsonLd />
      {/* FAQ can be page specific, included here globally for critical common FAQs or move to specific page */}
    </>
  );
}

// Specific Components
export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ApexOS",
    "url": "https://apexrebate.com",
    "logo": "https://apexrebate.com/logo.png",
    "sameAs": [
      "https://twitter.com/apexos",
      "https://t.me/apexos"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-555-5555", // Placeholder
      "contactType": "customer service"
    }
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export function SoftwareAppJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ApexOS",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "29.00",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1200"
    }
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export function FAQPageJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [{
      "@type": "Question",
      "name": "Is ApexOS free to try?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, we offer a 7-day free trial with full access to AI signals."
      }
    }, {
      "@type": "Question",
      "name": "Can I cancel anytime?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely. You can cancel your subscription instantly from your dashboard."
      }
    }]
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
