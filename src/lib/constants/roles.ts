/**
 * Standardized Role Definitions (RBAC)
 * Use these constants instead of hardcoded strings.
 */

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  USER: 'user',
  TRADER: 'trader',
  MODERATOR: 'moderator', // Future proofing
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export function isValidRole(role: string): role is UserRole {
  return Object.values(ROLES).includes(role as UserRole);
}
