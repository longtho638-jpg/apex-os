'use client';

import LegalPageLayout from '@/components/marketing/LegalPageLayout';

export default function CookiesPage() {
  return (
    <LegalPageLayout title="Cookie Policy" lastUpdated="December 1, 2025">
      <h3>1. What are Cookies?</h3>
      <p>
        Cookies are small text files that are stored on your device when you visit our website. They help us remember
        your preferences and improve your user experience.
      </p>

      <h3>2. How We Use Cookies</h3>
      <p>We use cookies for:</p>
      <ul>
        <li>Authentication: To keep you logged in.</li>
        <li>Analytics: To understand how you use our site.</li>
        <li>Preferences: To remember your language and theme settings.</li>
      </ul>

      <h3>3. Managing Cookies</h3>
      <p>
        You can control and manage cookies through your browser settings. However, disabling cookies may affect the
        functionality of our platform.
      </p>
    </LegalPageLayout>
  );
}
