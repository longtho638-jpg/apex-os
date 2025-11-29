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
    'private_key'
];

function maskSensitiveData(data: any): any {
    if (!data) return data;

    if (typeof data === 'string') {
        // Basic heuristic: if it looks like a JWT or long secret, mask it
        // This is hard to do perfectly on strings without context, so we focus on objects.
        return data;
    }

    if (Array.isArray(data)) {
        return data.map(maskSensitiveData);
    }

    if (typeof data === 'object') {
        const masked: any = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const lowerKey = key.toLowerCase();
                if (SENSITIVE_KEYS.some(k => lowerKey.includes(k))) {
                    masked[key] = '***REDACTED***';
                } else {
                    masked[key] = maskSensitiveData(data[key]);
                }
            }
        }
        return masked;
    }

    return data;
}

export const logger = {
    info: (message: string, meta?: any) => {
        console.log(JSON.stringify({
            level: 'info',
            message,
            timestamp: new Date().toISOString(),
            meta: maskSensitiveData(meta)
        }));
    },

    warn: (message: string, meta?: any) => {
        console.warn(JSON.stringify({
            level: 'warn',
            message,
            timestamp: new Date().toISOString(),
            meta: maskSensitiveData(meta)
        }));
    },

    error: (message: string, error?: any, meta?: any) => {
        console.error(JSON.stringify({
            level: 'error',
            message,
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? {
                name: error.name,
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            } : error,
            meta: maskSensitiveData(meta)
        }));
    },

    debug: (message: string, meta?: any) => {
        if (process.env.NODE_ENV === 'development') {
            console.debug(JSON.stringify({
                level: 'debug',
                message,
                timestamp: new Date().toISOString(),
                meta: maskSensitiveData(meta)
            }));
        }
    }
};

export const riskLogger = logger;
