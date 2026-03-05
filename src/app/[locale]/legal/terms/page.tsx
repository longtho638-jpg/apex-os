'use client';

import LegalPageLayout from '@/components/marketing/LegalPageLayout';

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="December 1, 2025">
      <h3>1. Acceptance of Terms</h3>
      <p>
        By accessing and using ApexOS ("the Platform"), you agree to be bound by these Terms of Service. If you do not
        agree to these terms, please do not use our services.
      </p>

      <h3>2. Risk Disclosure</h3>
      <p>
        Trading cryptocurrencies involves significant risk and can result in the loss of your capital. You should not
        invest more than you can afford to lose and should ensure that you fully understand the risks involved.
      </p>

      <h3>3. Account Security</h3>
      <p>
        You are responsible for maintaining the confidentiality of your account credentials. ApexOS is not liable for
        any loss or damage arising from your failure to protect your account information.
      </p>

      <h3>4. Prohibited Activities</h3>
      <p>
        Users are prohibited from engaging in market manipulation, money laundering, or any other illegal activities on
        the Platform.
      </p>

      <h3>5. Limitation of Liability</h3>
      <p>
        ApexOS provides the platform "as is" and makes no warranties regarding its reliability or availability. We are
        not liable for any trading losses incurred while using our services.
      </p>
    </LegalPageLayout>
  );
}
