import type { WebApp } from '@twa-dev/types';

/**
 * Initializes the Telegram WebApp
 * @returns WebApp instance or null if not available
 */
export function initTelegramWebApp(): WebApp | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const webApp = window.Telegram?.WebApp;

  if (!webApp) {
    console.warn('Telegram WebApp is not available');
    return null;
  }

  // Notify Telegram that the Mini App is ready
  webApp.ready();

  // Expand the Mini App to full height
  webApp.expand();

  return webApp;
}

/**
 * Gets the Telegram initData string for authentication
 * @returns initData string or empty string if not available
 */
export function getTelegramInitData(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.Telegram?.WebApp?.initData || '';
}
