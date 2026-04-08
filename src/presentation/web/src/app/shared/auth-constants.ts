export const INTERNAL_EMAIL_DOMAIN = '@getequiem.com';
export const AUTH_ROLE_STORAGE_KEY = 'resolved_auth_role';
export const AUTH_ROLE_INTERNAL = 'internal';
export const AUTH_ROLE_EXTERNAL = 'external';

export const INTERNAL_TEST_EMAILS = new Set([
  'yudi@equiem.com',
  'jaime.almeida@sou.inteli.edu.br',
  'ana.jardim@sou.inteli.edu.br',
  'matheus.silva@sou.inteli.edu.br'
]);

function normalizeEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}



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