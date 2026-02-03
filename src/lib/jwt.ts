import { logger } from '@/lib/logger';
/**
 * JWT Utilities for Admin Authentication
 * Generates and validates JWTs for sessions and temporary tokens
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET_ENV = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET;

if (!JWT_SECRET_ENV) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('FATAL: SUPABASE_JWT_SECRET is not defined in production environment.');
    }
    logger.warn('⚠️ WARNING: SUPABASE_JWT_SECRET is not defined. Using insecure default for development.');
}

import { ROLES, UserRole } from '@/lib/constants/roles';

const JWT_SECRET = JWT_SECRET_ENV || 'your-secret-key-change-in-production';
const SESSION_EXPIRY = '1h'; // Reduced from 7d for security. TODO: Implement Refresh Token flow.
const TEMP_TOKEN_EXPIRY = '5m'; // 5 minutes for MFA step

export interface SessionTokenPayload {
    email: string;
    type: 'session';
    role: UserRole;
    sub: string;
}

export interface TempTokenPayload {
    email: string;
    type: 'mfa_pending';
}

/**
 * Generate session token (after successful login + MFA)
 */
export function generateSessionToken(email: string, role: UserRole = ROLES.USER, userId: string): string {
    const payload: SessionTokenPayload & { sub: string } = {
        email,
        type: 'session',
        role,
        sub: userId
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: SESSION_EXPIRY });
}

/**
 * Generate temporary token (after password verification, before MFA)
 */
export function generateTempToken(email: string): string {
    const payload: TempTokenPayload = {
        email,
        type: 'mfa_pending'
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: TEMP_TOKEN_EXPIRY });
}

/**
 * Verify and decode session token
 */
export function verifySessionToken(token: string): SessionTokenPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as SessionTokenPayload;

        if (decoded.type !== 'session') {
            return null;
        }

        return decoded;
    } catch (error) {
        return null;
    }
}

/**
 * Verify and decode temp token
 */
export function verifyTempToken(token: string): TempTokenPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as TempTokenPayload;

        if (decoded.type !== 'mfa_pending') {
            return null;
        }

        return decoded;
    } catch (error) {
        return null;
    }
}
