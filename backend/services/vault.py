import os
from cryptography.fernet import Fernet
import base64
import logging

# Configure logger
logger = logging.getLogger(__name__)

class VaultService:
    """
    The Vault: Secure credential storage service.
    Uses Fernet (symmetric encryption) to protect API keys at rest.
    """
    
    def __init__(self):
        # Load or generate key
        # In production, this should come from a secure secret manager (AWS Secrets Manager, etc.)
        # For this setup, we expect it in env vars or generate a temporary one (warning logged)
        self._key = os.getenv('VAULT_KEY')
        
        if not self._key:
            logger.warning("⚠️  VAULT_KEY not found in environment. Generating temporary key (DATA WILL BE LOST ON RESTART).")
            self._key = Fernet.generate_key().decode()
        
        try:
            self._cipher = Fernet(self._key.encode() if isinstance(self._key, str) else self._key)
        except Exception as e:
            logger.error(f"Failed to initialize Vault: {e}")
            raise

    def encrypt(self, secret: str) -> str:
        """Encrypt a raw secret string."""
        if not secret:
            return ""
        try:
            return self._cipher.encrypt(secret.encode()).decode()
        except Exception as e:
            logger.error(f"Encryption failed: {e}")
            raise

    def decrypt(self, encrypted_secret: str) -> str:
        """Decrypt an encrypted secret string."""
        if not encrypted_secret:
            return ""
        try:
            return self._cipher.decrypt(encrypted_secret.encode()).decode()
        except Exception as e:
            logger.error(f"Decryption failed: {e}")
            raise

# Singleton instance
try:
    vault = VaultService()
except Exception:
    vault = None

def encrypt_secret(secret: str) -> str:
    if not vault:
        raise RuntimeError("Vault Service not initialized")
    return vault.encrypt(secret)

def decrypt_secret(encrypted: str) -> str:
    if not vault:
        raise RuntimeError("Vault Service not initialized")
    return vault.decrypt(encrypted)
