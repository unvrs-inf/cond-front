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

The project uses Geist Sans and Geist Mono fonts from Google Fonts, loaded via `next/font/google` in the root layout. Font variables are:
- `--font-geist-sans`
- `--font-geist-mono`

## Telegram Integration

- `lib/telegram/init.ts` — initializes and expands the WebApp, extracts `initData`
- `lib/telegram/theme.ts` — maps Telegram theme params to CSS variables on `:root`
- `lib/telegram/hooks.ts` — `useTelegramWebApp()` and `useTelegramTheme()` hooks
- `components/providers/TelegramProvider.tsx` — root context provider; consume via `useTelegram()` hook

**Theming:** components use inline `style` props with `var(--tg-theme-*)` CSS variables (e.g., `var(--tg-theme-bg-color)`). The integration gracefully handles non-Telegram environments.

## API Layer

- `lib/api/client.ts` — `ApiClient` class: generic typed fetch wrapper that adds `X-Telegram-Init-Data` auth header
- `lib/api/services.ts` — service functions using `ApiClient`
- `types/api.d.ts` — API response types (`ServiceType`, `ServiceTypesResponse`, `ApiError`, etc.)
- Base URL configured via `NEXT_PUBLIC_API_URL` environment variable

### Data Fetching Pattern

Client components use `useState` + `useEffect` for data fetching:
1. Get `initData` from `useTelegram()` context
2. Pass `initData` to API service functions
3. Handle loading/error states per component using `LoadingSpinner` / `ErrorMessage`

## Component Conventions

- All interactive or data-fetching components require `'use client'` directive
- Reusable UI primitives live in `components/ui/`
- Page-specific components in `components/home/` (or per-page directory)

## Environment Variables

- `NEXT_PUBLIC_API_URL` — backend API base URL (required)

## Code Style

- ESLint is configured with Next.js recommended rules (`eslint-config-next`)
- TypeScript strict mode is enabled
- React 19 Server Components are the default (use `'use client'` directive when needed)
