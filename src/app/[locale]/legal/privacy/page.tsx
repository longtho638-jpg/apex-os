'use client';

import LegalPageLayout from '@/components/marketing/LegalPageLayout';

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="December 1, 2025">
      <h3>1. Data Collection</h3>
      <p>
        We collect information you provide directly to us, such as when you create an account, update your profile, or
        communicate with us. This may include your name, email address, and trading history.
      </p>

      <h3>2. Use of Information</h3>
      <p>
        We use the information we collect to operate, maintain, and improve our services, as well as to communicate with
        you about updates and promotions.
      </p>

      <h3>3. Data Sharing</h3>
      <p>
        We do not sell your personal data. We may share your information with third-party service providers who assist
        us in operating our platform, subject to strict confidentiality agreements.
      </p>

      <h3>4. Security</h3>
      <p>
        We implement industry-standard security measures to protect your personal information from unauthorized access,
        disclosure, or misuse.
      </p>
    </LegalPageLayout>
  );
}
