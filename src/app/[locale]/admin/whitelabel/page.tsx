'use client';

import { FeaturePlaceholder } from '@/components/common/FeaturePlaceholder';

export default function WhiteLabelPage() {
  return (
    <FeaturePlaceholder
      title="White Label Solution"
      description="Turnkey B2B solution for partners to launch their own branded exchange."
      phase={28}
      sunTzuQuote={{
        chinese: '分',
        english: 'Division',
        meaning: 'Divide and conquer by enabling others.',
      }}
    />
  );
}
