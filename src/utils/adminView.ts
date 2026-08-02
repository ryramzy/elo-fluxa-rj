/**
 * Global Admin View State Manager
 * Manages view toggling between Admin Dashboard and Student View.
 * Wrapped in try/catch for environments with restricted storage access
 * (private browsing, cross-origin iframes, disabled cookies).
 */

export function getAdminViewMode(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const saved = sessionStorage.getItem('elo_admin_view');
    return saved === null ? true : saved === 'true';
  } catch {
    return true;
  }
}

export function setAdminViewMode(isAdminView: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem('elo_admin_view', String(isAdminView));
  } catch {
    // sessionStorage unavailable — continue with event dispatch only
  }
  window.dispatchEvent(new CustomEvent('elo_admin_view_changed', { detail: isAdminView }));
}
