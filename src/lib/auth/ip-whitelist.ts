import { logger } from '@/lib/logger';

/**
 * IP Whitelist Helper Functions
 * Handles IP-based access control for admin accounts
 */

import type { NextRequest } from 'next/server';
import { getSupabaseClient } from '../supabase';

const supabase = getSupabaseClient();

/**
 * Extract client IP from request headers
 * Handles various proxy headers (Vercel, Cloudflare, etc.)
 */
export function getClientIP(request: NextRequest): string {
  // Priority order for IP detection
  const headers = [
    'x-forwarded-for', // Standard proxy header
    'x-real-ip', // Nginx
    'cf-connecting-ip', // Cloudflare
    'x-vercel-forwarded-for', // Vercel
  ];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // x-forwarded-for can be comma-separated, take first IP
      return value.split(',')[0].trim();
    }
  }

  // Fallback to unknown if no headers found
  return 'unknown';
}

/**
 * Check if IP matches CIDR range
 * Supports IPv4 CIDR and IPv6 Exact Match
 */
export function isIPInCIDR(ip: string, cidr: string): boolean {
  try {
    // Handle IPv6 (Simple exact match for now)
    if (ip.includes(':') || cidr.includes(':')) {
      return ip === cidr.split('/')[0];
    }

    if (!cidr.includes('/')) {
      // Exact match (no CIDR notation)
      return ip === cidr;
    }

    const [range, bits] = cidr.split('/');
    const ipParts = ip.split('.').map(Number);
    const rangeParts = range.split('.').map(Number);
    const mask = parseInt(bits, 10);

    // Convert to 32-bit integers
    const ipInt = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
    const rangeInt = (rangeParts[0] << 24) | (rangeParts[1] << 16) | (rangeParts[2] << 8) | rangeParts[3];

    // Create mask
    const maskInt = mask === 0 ? 0 : (-1 << (32 - mask)) >>> 0;

    return (ipInt & maskInt) === (rangeInt & maskInt);
  } catch (error) {
    logger.error('CIDR matching error:', error);
    return false;
  }
}

/**
 * Validate IP address format (basic check)
 */
function isValidIP(ip: string): boolean {
  // IPv6 Check (Simple)
  if (ip.includes(':')) {
    return true; // Allow all IPv6 for now (including ::1)
  }

  // Check for CIDR notation
  if (ip.includes('/')) {
    const [address, bits] = ip.split('/');
    const bitsNum = parseInt(bits, 10);
    return isValidIPv4(address) && bitsNum >= 0 && bitsNum <= 32;
  }

  return isValidIPv4(ip);
}

/**
 * Validate IPv4 address
 */
function isValidIPv4(ip: string): boolean {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;

  return parts.every((part) => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255 && part === num.toString();
  });
}

/**
 * Check if admin's IP is whitelisted
 * @param adminId - Admin user ID
 * @param clientIP - IP address to check
 * @returns true if allowed, false if blocked
 *
 * Fail-open: Returns true on errors to prevent lockouts
 */
export async function checkIPWhitelist(adminId: string, clientIP: string): Promise<boolean> {
  try {
    // Get admin's IP whitelist settings
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('ip_whitelist_enabled, allowed_ips')
      .eq('id', adminId)
      .single();

    if (error || !admin) {
      logger.error('IP whitelist check error:', error);
      return true; // Fail-open: allow access on DB errors
    }

    // If IP whitelisting is disabled, allow all IPs
    if (!admin.ip_whitelist_enabled) {
      return true;
    }

    // If no IPs whitelisted yet, block (except first setup)
    if (!admin.allowed_ips || admin.allowed_ips.length === 0) {
      logger.warn('IP whitelist enabled but no IPs configured for admin:', adminId);
      return true; // Fail-open to allow adding first IP
    }

    // Check if client IP matches any whitelisted IP/range
    const allowedIPs: string[] = admin.allowed_ips;

    for (const allowedIP of allowedIPs) {
      if (isIPInCIDR(clientIP, allowedIP)) {
        return true; // IP is whitelisted
      }
    }

    // IP not in whitelist
    return false;
  } catch (error) {
    logger.error('IP whitelist check exception:', error);
    return true; // Fail-open: allow access on exceptions
  }
}

/**
 * Add IP to admin's whitelist
 */
export async function addIPToWhitelist(adminId: string, ip: string): Promise<boolean> {
  try {
    // Validate IP format (basic check)
    if (!isValidIP(ip)) {
      throw new Error('Invalid IP format');
    }

    // Get current allowed IPs
    const { data: admin } = await supabase.from('admin_users').select('allowed_ips').eq('id', adminId).single();

    const currentIPs = admin?.allowed_ips || [];

    // Check if IP already exists
    if (currentIPs.includes(ip)) {
      return true; // Already whitelisted
    }

    // Add new IP
    const newIPs = [...currentIPs, ip];

    const { error } = await supabase.from('admin_users').update({ allowed_ips: newIPs }).eq('id', adminId);

    if (error) {
      logger.error('Error adding IP to whitelist:', error);
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Add IP exception:', error);
    return false;
  }
}

/**
 * Remove IP from admin's whitelist
 */
export async function removeIPFromWhitelist(adminId: string, ip: string): Promise<boolean> {
  try {
    // Get current allowed IPs
    const { data: admin } = await supabase.from('admin_users').select('allowed_ips').eq('id', adminId).single();

    const currentIPs = admin?.allowed_ips || [];

    // Remove IP
    const newIPs = currentIPs.filter((allowedIP: string) => allowedIP !== ip);

    const { error } = await supabase.from('admin_users').update({ allowed_ips: newIPs }).eq('id', adminId);

    if (error) {
      logger.error('Error removing IP from whitelist:', error);
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Remove IP exception:', error);
    return false;
  }
}

/**
 * Log security event
 */
export async function logSecurityEvent(event: {
  type: 'IP_BLOCKED' | 'NEW_IP_DETECTED' | 'IP_WHITELIST_CHANGED' | 'UNAUTHORIZED_ACCESS' | 'MFA_FAILED';
  adminId: string;
  ipAddress: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    await supabase.from('security_events').insert({
      event_type: event.type,
      admin_id: event.adminId,
      ip_address: event.ipAddress,
      user_agent: event.userAgent,
      metadata: event.metadata || {},
    });
  } catch (error) {
    logger.error('Error logging security event:', error);
    // Don't throw - logging failure shouldn't break app
  }
}
