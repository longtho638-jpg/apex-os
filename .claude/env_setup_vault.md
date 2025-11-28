# Environment Configuration Template
# Copy relevant values to your .env.local

## Required for Encryption
Add to your `.env.local`:
```
VAULT_KEY_MASTER=<generate-with-openssl-rand-base64-32>
```

## Generate a secure key:
```bash
openssl rand -base64 32
```

** CRITICAL**: This key must:
- Be at least 32 characters long
- Never be committed to version control
- Be different for each environment (dev/staging/prod)
- Be backed up securely
