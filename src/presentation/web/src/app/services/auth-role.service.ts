import { Injectable } from '@angular/core';
import {
  AUTH_ROLE_INTERNAL,
  AUTH_ROLE_EXTERNAL,
  AUTH_ROLE_STORAGE_KEY,
  isInternalEmail,
} from '../shared/auth-constants';

@Injectable({
  providedIn: 'root',
})
export class AuthRoleService {

  resolveRole(email: string | undefined | null): string {
    const normalizedEmail = (email || '').trim().toLowerCase();

    const role = isInternalEmail(normalizedEmail)
      ? AUTH_ROLE_INTERNAL
      : AUTH_ROLE_EXTERNAL;

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(AUTH_ROLE_STORAGE_KEY, role);
    }

    return role;
  }

  getStoredRole(): string {
    if (typeof sessionStorage === 'undefined') {
      return '';
    }

    return sessionStorage.getItem(AUTH_ROLE_STORAGE_KEY) || '';
  }

  clearRole(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(AUTH_ROLE_STORAGE_KEY);
    }
  }
}