'use client';

import { FeaturePlaceholder } from '@/components/common/FeaturePlaceholder';

export default function MarketingPage() {
  return (
    <FeaturePlaceholder
      title="Email & SEO Engine"
      description="Automated email drip campaigns and advanced SEO tools to drive organic traffic."
      phase={2}
      sunTzuQuote={{
        chinese: '用間',
        english: 'Use of Spies',
        meaning: 'Information gathering and dissemination is key to strategy.',
      }}
    />
  );
}
