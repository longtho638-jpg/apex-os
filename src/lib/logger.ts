/**
 * Secure Logger Utility
 * Wraps console methods to automatically redact sensitive information.
 * Essential for preventing data leaks in serverless environments.
 */

const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'key',
  'authorization',
  'cookie',
  'session',
  'access_token',
  'refresh_token',
  'api_key',
  'mnemonic',
  'private_key',
];

function _maskSensitiveData(data: any): any {
  if (!data) return data;

  if (typeof data === 'string') {
    // Basic heuristic: if it looks like a JWT or long secret, mask it
    // This is hard to do perfectly on strings without context, so we focus on objects.
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(_maskSensitiveData);
  }

  if (typeof data === 'object') {
    const masked: any = {};
    for (const key in data) {
      if (Object.hasOwn(data, key)) {
        const lowerKey = key.toLowerCase();
        if (SENSITIVE_KEYS.some((k) => lowerKey.includes(k))) {
          masked[key] = '***REDACTED***';
        } else {
          masked[key] = _maskSensitiveData(data[key]);
        }
      }
    }
    return masked;
  }

  return data;
}

export const logger = {
  info: (message: string, meta?: unknown) => {
    const entry = JSON.stringify({ level: 'info', message, ..._maskSensitiveData(meta as Record<string, unknown>) });
    console.log(entry);
  },

  warn: (message: string, meta?: unknown) => {
    const entry = JSON.stringify({ level: 'warn', message, ..._maskSensitiveData(meta as Record<string, unknown>) });
    console.warn(entry);
  },

  error: (message: string, error?: unknown, meta?: unknown) => {
    const entry = JSON.stringify({
      level: 'error',
      message,
      error: error instanceof Error ? error.message : error,
      ..._maskSensitiveData(meta as Record<string, unknown>),
    });
    console.error(entry);
  },

  debug: (message: string, meta?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      const entry = JSON.stringify({ level: 'debug', message, ..._maskSensitiveData(meta as Record<string, unknown>) });
      console.debug(entry);
    }
  },
};

export const riskLogger = logger;
