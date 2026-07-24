/**
 * Global Admin View State Manager
 * Manages view toggling between Admin Dashboard and Student View
 */

export function getAdminViewMode(): boolean {
  if (typeof window === 'undefined') return true;
  const saved = sessionStorage.getItem('elo_admin_view');
  return saved === null ? true : saved === 'true';
}

export function setAdminViewMode(isAdminView: boolean): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('elo_admin_view', String(isAdminView));
  window.dispatchEvent(new CustomEvent('elo_admin_view_changed', { detail: isAdminView }));
}
