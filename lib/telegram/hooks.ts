import { useEffect, useState } from 'react';
import type { WebApp, ThemeParams } from '@twa-dev/types';
import { initTelegramWebApp } from './init';

/**
 * Hook to initialize and get Telegram WebApp instance
 * @returns WebApp instance or null
 */
export function useTelegramWebApp(): WebApp | null {
  const [webApp, setWebApp] = useState<WebApp | null>(null);

  useEffect(() => {
    const app = initTelegramWebApp();
    setWebApp(app);
  }, []);

  return webApp;
}

/**
 * Hook to get Telegram theme params with reactive updates
 * @returns ThemeParams object
 */
export function useTelegramTheme(): ThemeParams {
  const [themeParams, setThemeParams] = useState<ThemeParams>({} as ThemeParams);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const webApp = window.Telegram?.WebApp;
    if (!webApp) {
      return;
    }

    // Set initial theme
    setThemeParams(webApp.themeParams);

    // Listen for theme changes
    const handleThemeChange = () => {
      setThemeParams(webApp.themeParams);
    };

    webApp.onEvent('themeChanged', handleThemeChange);

    // Cleanup
    return () => {
      webApp.offEvent('themeChanged', handleThemeChange);
    };
  }, []);

  return themeParams;
}
