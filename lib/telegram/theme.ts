import type { WebApp } from '@twa-dev/types';

/**
 * Telegram theme CSS variable names
 */
export const TELEGRAM_THEME_VARS = {
  bgColor: '--tg-theme-bg-color',
  textColor: '--tg-theme-text-color',
  hintColor: '--tg-theme-hint-color',
  linkColor: '--tg-theme-link-color',
  buttonColor: '--tg-theme-button-color',
  buttonTextColor: '--tg-theme-button-text-color',
  secondaryBgColor: '--tg-theme-secondary-bg-color',
  headerBgColor: '--tg-theme-header-bg-color',
  bottomBarBgColor: '--tg-theme-bottom-bar-bg-color',
  accentTextColor: '--tg-theme-accent-text-color',
  sectionBgColor: '--tg-theme-section-bg-color',
  sectionHeaderTextColor: '--tg-theme-section-header-text-color',
  sectionSeparatorColor: '--tg-theme-section-separator-color',
  subtitleTextColor: '--tg-theme-subtitle-text-color',
  destructiveTextColor: '--tg-theme-destructive-text-color',
} as const;

/**
 * Applies Telegram theme variables to the document root
 * @param webApp - Telegram WebApp instance
 */
export function applyTelegramTheme(webApp: WebApp): void {
  if (typeof document === 'undefined') {
    return;
  }

  const themeParams = webApp.themeParams;
  const root = document.documentElement;

  // Apply all theme colors
  if (themeParams.bg_color) {
    root.style.setProperty(TELEGRAM_THEME_VARS.bgColor, themeParams.bg_color);
  }
  if (themeParams.text_color) {
    root.style.setProperty(TELEGRAM_THEME_VARS.textColor, themeParams.text_color);
  }
  if (themeParams.hint_color) {
    root.style.setProperty(TELEGRAM_THEME_VARS.hintColor, themeParams.hint_color);
  }
  if (themeParams.link_color) {
    root.style.setProperty(TELEGRAM_THEME_VARS.linkColor, themeParams.link_color);
  }
  if (themeParams.button_color) {
    root.style.setProperty(TELEGRAM_THEME_VARS.buttonColor, themeParams.button_color);
  }
  if (themeParams.button_text_color) {
    root.style.setProperty(TELEGRAM_THEME_VARS.buttonTextColor, themeParams.button_text_color);
  }
  if (themeParams.secondary_bg_color) {
    root.style.setProperty(TELEGRAM_THEME_VARS.secondaryBgColor, themeParams.secondary_bg_color);
  }
  if (themeParams.header_bg_color) {
    root.style.setProperty(TELEGRAM_THEME_VARS.headerBgColor, themeParams.header_bg_color);
  }
  if (themeParams.bottom_bar_bg_color) {
    root.style.setProperty(TELEGRAM_THEME_VARS.bottomBarBgColor, themeParams.bottom_bar_bg_color);
  }
  if (themeParams.accent_text_color) {
    root.style.setProperty(TELEGRAM_THEME_VARS.accentTextColor, themeParams.accent_text_color);
  }
  if (themeParams.section_bg_color) {
    root.style.setProperty(TELEGRAM_THEME_VARS.sectionBgColor, themeParams.section_bg_color);
  }
  if (themeParams.section_header_text_color) {
    root.style.setProperty(TELEGRAM_THEME_VARS.sectionHeaderTextColor, themeParams.section_header_text_color);
  }
  if (themeParams.section_separator_color) {
    root.style.setProperty(TELEGRAM_THEME_VARS.sectionSeparatorColor, themeParams.section_separator_color);
  }
  if (themeParams.subtitle_text_color) {
    root.style.setProperty(TELEGRAM_THEME_VARS.subtitleTextColor, themeParams.subtitle_text_color);
  }
  if (themeParams.destructive_text_color) {
    root.style.setProperty(TELEGRAM_THEME_VARS.destructiveTextColor, themeParams.destructive_text_color);
  }

  // Apply safe area insets
  root.style.setProperty('--tg-safe-area-inset-top', `${webApp.safeAreaInset?.top || 0}px`);
  root.style.setProperty('--tg-safe-area-inset-bottom', `${webApp.safeAreaInset?.bottom || 0}px`);
  root.style.setProperty('--tg-safe-area-inset-left', `${webApp.safeAreaInset?.left || 0}px`);
  root.style.setProperty('--tg-safe-area-inset-right', `${webApp.safeAreaInset?.right || 0}px`);

  root.style.setProperty('--tg-content-safe-area-inset-top', `${webApp.contentSafeAreaInset?.top || 0}px`);
  root.style.setProperty('--tg-content-safe-area-inset-bottom', `${webApp.contentSafeAreaInset?.bottom || 0}px`);
  root.style.setProperty('--tg-content-safe-area-inset-left', `${webApp.contentSafeAreaInset?.left || 0}px`);
  root.style.setProperty('--tg-content-safe-area-inset-right', `${webApp.contentSafeAreaInset?.right || 0}px`);
}
