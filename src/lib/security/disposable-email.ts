export const DISPOSABLE_DOMAINS = new Set([
    'mailinator.com',
    'tempmail.com',
    '10minutemail.com',
    'guerrillamail.com',
    'yopmail.com',
    'sharklasers.com',
    'getnada.com',
    'dispostable.com',
    'throwawaymail.com',
    'temp-mail.org',
    'maildrop.cc',
    'trashmail.com',
    'fake-email.com',
    'emailondeck.com',
    'tempmailo.com',
    // Add more as needed
]);

export function isDisposableEmail(email: string): boolean {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return false;
    return DISPOSABLE_DOMAINS.has(domain);
}
