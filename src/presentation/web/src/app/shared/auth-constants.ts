export const AUTH_ROLE_INTERNAL = 'internal';
export const AUTH_ROLE_EXTERNAL = 'external';

export const AUTH_ROLE_STORAGE_KEY = 'resolved_auth_role';

export function isInternalEmail(email: string): boolean {
  return email.endsWith('@equiem.com');
}