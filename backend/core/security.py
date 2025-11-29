from cryptography.fernet import Fernet
import os
import base64

# Generate a key if not provided (for dev) or use env var
# In production, this MUST be set in environment variables
ENCRYPTION_KEY = os.getenv('ENCRYPTION_KEY')

if not ENCRYPTION_KEY:
    # Fallback for local dev only - warning printed
    print("WARNING: ENCRYPTION_KEY not set. Using temporary key for development.")
    ENCRYPTION_KEY = Fernet.generate_key().decode()

cipher = Fernet(ENCRYPTION_KEY.encode() if isinstance(ENCRYPTION_KEY, str) else ENCRYPTION_KEY)

def encrypt_value(value: str) -> str:
    """Encrypt a string value"""
    if not value:
        return ""
    return cipher.encrypt(value.encode()).decode()

def decrypt_value(encrypted_value: str) -> str:
    """Decrypt a string value"""
    if not encrypted_value:
        return ""
    try:
        return cipher.decrypt(encrypted_value.encode()).decode()
    except Exception:
        return ""
