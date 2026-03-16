'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { WebApp } from '@twa-dev/types';
import { initTelegramWebApp, getTelegramInitData } from '@/lib/telegram/init';
import { applyTelegramTheme } from '@/lib/telegram/theme';

interface TelegramContextValue {
  webApp: WebApp | null;
  initData: string;
  isReady: boolean;
}

const TelegramContext = createContext<TelegramContextValue>({
  webApp: null,
  initData: '',
  isReady: false,
});

interface TelegramProviderProps {
  children: ReactNode;
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  const [webApp, setWebApp] = useState<WebApp | null>(null);
  const [initData, setInitData] = useState<string>('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    function initialize(): (() => void) | null {
      const app = initTelegramWebApp();

      if (!app) return null;

      setWebApp(app);
      setInitData(getTelegramInitData());
      applyTelegramTheme(app);

      const handleThemeChange = () => applyTelegramTheme(app);
      app.onEvent('themeChanged', handleThemeChange);
      setIsReady(true);

      return () => app.offEvent('themeChanged', handleThemeChange);
    }

    // Try immediately (works when Telegram injects WebApp natively)
    const cleanup = initialize();
    if (cleanup) return cleanup;

    // Script not ready yet — wait for it to load
    const handleLoad = () => {
      initialize();
      setIsReady(true);
    };
    window.addEventListener('telegram-loaded', handleLoad);

    return () => window.removeEventListener('telegram-loaded', handleLoad);
  }, []);

  return (
    <TelegramContext.Provider value={{ webApp, initData, isReady }}>
      {children}
    </TelegramContext.Provider>
  );
}

/**
 * Hook to access Telegram context
 */
export function useTelegram() {
  const context = useContext(TelegramContext);

  if (!context) {
    throw new Error('useTelegram must be used within TelegramProvider');
  }

  return context;
}
