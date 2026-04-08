/**
 * AUTO-GENERATED FILE. Do not edit directly.
 * Source: src/shared/auth-constants.ts
 */
/**
 * Centralized authentication configuration
 * Single source of truth for auth allowlists and constants
 */

export const INTERNAL_EMAIL_DOMAIN = '@getequiem.com';
export const AUTH_ROLE_STORAGE_KEY = 'resolved_auth_role';
export const AUTH_ROLE_INTERNAL = 'internal';
export const AUTH_ROLE_EXTERNAL = 'external';

function readEnv(name: string): string | undefined {
  return (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.[name];
}

function resolveAdminEmail(): string {
  return "equiem.onboarding@gmail.com";
}

const internalTestEmailValues = [resolveAdminEmail()].filter(
  (email): email is string => Boolean(email)
);

export const INTERNAL_TEST_EMAILS = new Set(internalTestEmailValues);

function normalizeEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}

/**
 * Check if an email is marked as an internal allowlisted email
 */
export function isInternalTestEmail(email: string): boolean {
  return INTERNAL_TEST_EMAILS.has(normalizeEmail(email));
}

/**
 * Internal users are Equiem domain users or explicit allowlisted test emails.
 */
export function isInternalEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  return normalized.endsWith(INTERNAL_EMAIL_DOMAIN) || isInternalTestEmail(normalized);
}
