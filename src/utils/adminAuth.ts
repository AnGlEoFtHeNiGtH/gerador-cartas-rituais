/**
 * Admin Authentication and Session Management for Grimório Paranormal.
 * Credentials fixed as requested:
 * Login: Gauss0413
 * Senha: Alv04130211LVA
 */

const ADMIN_STORAGE_KEY = 'grimorio_paranormal_admin_auth';
const ADMIN_USER_EXPECTED = 'Gauss0413';
const ADMIN_PASS_EXPECTED = 'Alv04130211LVA';

export const ADMIN_CREDENTIALS = {
  login: ADMIN_USER_EXPECTED,
};

/**
 * Checks if admin session is currently active in sessionStorage.
 */
export function isAdminAuthenticated(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    return (
      sessionStorage.getItem(ADMIN_STORAGE_KEY) === 'true' ||
      localStorage.getItem(ADMIN_STORAGE_KEY) === 'true'
    );
  } catch {
    return false;
  }
}

/**
 * Attempts authentication with the provided credentials.
 */
export function authenticateAdmin(user: string, pass: string): { success: boolean; error?: string } {
  const cleanUser = (user || '').trim();
  const cleanPass = (pass || '').trim();

  if (cleanUser === ADMIN_USER_EXPECTED && cleanPass === ADMIN_PASS_EXPECTED) {
    try {
      sessionStorage.setItem(ADMIN_STORAGE_KEY, 'true');
      localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
      window.dispatchEvent(new CustomEvent('admin-auth-changed', { detail: { isAuthenticated: true } }));
    } catch (e) {
      console.warn('Failed to save admin session:', e);
    }
    return { success: true };
  }

  return {
    success: false,
    error: 'Credenciais inválidas. Verifique o usuário e senha de administrador.',
  };
}

/**
 * Terminates the admin session.
 */
export function logoutAdmin(): void {
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(ADMIN_STORAGE_KEY);
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('admin-auth-changed', { detail: { isAuthenticated: false } }));
    }
  } catch (e) {
    console.warn('Failed to remove admin session:', e);
  }
}
