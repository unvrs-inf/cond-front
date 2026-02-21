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
    // Initialize Telegram WebApp
    const app = initTelegramWebApp();

    if (app) {
      setWebApp(app);
      setInitData(getTelegramInitData());

      // Apply initial theme
      applyTelegramTheme(app);

      // Listen for theme changes
      const handleThemeChange = () => {
        applyTelegramTheme(app);
      };

      app.onEvent('themeChanged', handleThemeChange);

      setIsReady(true);

      // Cleanup
      return () => {
        app.offEvent('themeChanged', handleThemeChange);
      };
    } else {
      // Not in Telegram, but mark as ready for development
      setIsReady(true);
    }
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
