'use client';

import { FeaturePlaceholder } from '@/components/common/FeaturePlaceholder';

export default function ValuationPage() {
  return (
    <FeaturePlaceholder
      title="Exit Strategy & Valuation"
      description="Real-time company valuation tracking and exit scenario planning."
      phase={20}
      sunTzuQuote={{
        chinese: '走為上',
        english: 'Retreat',
        meaning: 'Knowing when to retreat (exit) is the best strategy.',
      }}
    />
  );
}
