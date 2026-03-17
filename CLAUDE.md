# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Telegram Mini App** for air conditioning maintenance services, built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4. It uses the App Router architecture and integrates with Telegram's WebApp API via `@twa-dev/types`.

## Development Commands

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Create production build
- `npm start` - Start production server (requires build first)
- `npm run lint` - Run ESLint

## Architecture

### App Router Structure

This project uses Next.js App Router (not Pages Router). All routes are defined in the `app/` directory:
- `app/layout.tsx` - Root layout with global fonts and metadata
- `app/page.tsx` - Home page component
- `app/globals.css` - Global styles and Tailwind configuration

### Tailwind CSS v4

This project uses **Tailwind CSS v4**, which has a different configuration approach than v3:

- **No `tailwind.config.js` file** - Configuration is done via CSS
- Tailwind is imported directly in `app/globals.css` with `@import "tailwindcss"`
- Theme customization uses inline `@theme` directive in CSS
- Custom CSS properties (e.g., `--background`, `--foreground`) are defined in `:root` and referenced in the theme

When adding Tailwind customizations, modify `app/globals.css` using the `@theme inline` block, not a config file.

### TypeScript Configuration

- Path alias `@/*` maps to the root directory (use `@/app/...`, `@/components/...`, etc.)
- Strict mode enabled
- JSX transform set to `react-jsx` (automatic runtime)

### Fonts

The project uses **Open Sans** loaded from local files in `public/fonts/` via `next/font/local`. Three weights are loaded: 300 (Light), 400 (Regular), 500 (Medium). Font CSS variable: `--font-open-sans`. CSS sets: h1–h6 → weight 500, p → 400, a/small → 300.

## Telegram Integration

- `lib/telegram/init.ts` — initializes and expands the WebApp, extracts `initData`
- `lib/telegram/theme.ts` — maps Telegram theme params to CSS variables on `:root`
- `lib/telegram/hooks.ts` — `useTelegramWebApp()` and `useTelegramTheme()` hooks
- `components/providers/TelegramProvider.tsx` — root context provider; consume via `useTelegram()` hook
- `components/providers/TelegramScript.tsx` — loads `telegram-web-app.js` via Next.js `<Script>` and dispatches a `telegram-loaded` event
- `types/telegram.d.ts` — global `window.Telegram` type declaration

**Theming:** components use inline `style` props with `var(--tg-theme-*)` CSS variables (e.g., `var(--tg-theme-bg-color)`). The integration gracefully handles non-Telegram environments.

## API Layer

- `lib/api/client.ts` — `ApiClient` class: generic typed fetch wrapper that adds `X-Telegram-Init-Data` auth header
- `lib/api/services.ts` — service functions using `ApiClient`
- `types/api.d.ts` — API response types (`ServiceType`, `ServiceTypesResponse`, `ApiError`, etc.)
- Base URL configured via `NEXT_PUBLIC_API_URL` environment variable

**Image optimization:** `next.config.ts` whitelists the `NEXT_PUBLIC_API_URL` hostname for Next.js `<Image>` remote optimization. Add new image domains there when needed.

### Data Fetching Pattern

Client components use `useState` + `useEffect` for data fetching:
1. Get `initData` from `useTelegram()` context
2. Pass `initData` to API service functions
3. Handle loading/error states per component using `LoadingSpinner` / `ErrorMessage`

## Component Conventions

- All interactive or data-fetching components require `'use client'` directive
- Reusable UI primitives live in `components/ui/` (`LoadingSpinner`, `ErrorMessage`)
- Page-specific components in `components/home/` (or per-page directory)
- Layout chrome in `components/layout/` (`Header`, `BottomNavBar`)

### Styling Patterns

- **Glassmorphism:** frosted-glass elements use `backdrop-filter: blur()` with `rgba()` backgrounds (see `Header.tsx`, `BottomNavBar.tsx`)
- **Safe area insets:** fixed header/nav use `env(safe-area-inset-top/bottom)` for notch/home-bar compensation; `app/page.tsx` adds matching padding to the scroll container
- **Locale:** monetary values are formatted with `toLocaleString('ru-RU')` and the ruble sign (₽)
- **Language:** UI text is in Russian; metadata lang is `"ru"`
- **Image URLs:** `ServiceCard` handles both relative and absolute image URLs — relative URLs are automatically prefixed with `NEXT_PUBLIC_API_URL`

## Environment Variables

- `NEXT_PUBLIC_API_URL` — backend API base URL (required)

## Code Style

- ESLint is configured with Next.js recommended rules (`eslint-config-next`)
- TypeScript strict mode is enabled
- React 19 Server Components are the default (use `'use client'` directive when needed)
