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

The project uses **Open Sans** loaded from local files in `public/fonts/` via `next/font/local`. Three weights are loaded: 300 (Light), 400 (Regular), 500 (Medium). Font CSS variable: `--font-open-sans`. CSS sets: h1–h6 → weight 500, p → 400, a/small → 300. `KumbhSans-Regular.woff2` is present in `public/fonts/` but not yet loaded or used.

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
- `lib/api/services.ts` — service functions using `ApiClient`:
  - `getServiceTypes(initData, page?, size?)` — fetches available service types (paginated, defaults: page=0, size=20)
  - `getSchedules(initData)` — fetches available schedules
  - `getAvailableSlots(initData, serviceId, date)` — fetches time slots for a given date
  - `createReservation(initData, dto)` — submits a booking (`CreateReservationDto`: `start`, `serviceId`, `clientName`, `clientPhoneNumber`, `clientAddress`)
  - `getUserInfo(initData)` — GET /rest/admin-ui/clients/me; returns `UserInfoDto` (`id`, `name`, `isAdmin`)
  - `getActiveReservations(initData)` / `getCreatedReservations` / `getCancelledReservations` / `getCompletedReservations` — GET admin reservation lists
  - `completeReservation(initData, id)` — PATCH .../complete
  - `cancelReservation(initData, id)` — PATCH .../cancel
  - `confirmReservation(initData, id)` — PATCH .../confirm
- `types/api.d.ts` — API response types: `ServiceType`, `ServiceTypesResponse`, `Schedule` (`id`, `date`, `workBeginning`, `workEnding`), `SchedulesResponse`, `ApiError`, `CreateReservationDto`, `PaginationInfo` (`size`, `number`, `totalElements`, `totalPages`), `UserInfoDto` (`id`, `name`, `isAdmin`), `AdminReservation` (with nested `typeOfService`, `client`), `AdminReservationsResponse`
- Base URL configured via `NEXT_PUBLIC_API_URL` environment variable

**Image optimization:** `next.config.ts` whitelists the `NEXT_PUBLIC_API_URL` hostname for Next.js `<Image>` remote optimization. Add new image domains there when needed.

### Data Fetching Pattern

Client components use `useState` + `useEffect` for data fetching:
1. Get `initData` and `isReady` from `useTelegram()` context
2. Gate the `useEffect` on `isReady` (and include it in the dependency array) to avoid firing before Telegram initialises
3. Pass `initData` to API service functions
4. Handle loading/error states per component using `LoadingSpinner` / `ErrorMessage`

## Component Conventions

- All interactive or data-fetching components require `'use client'` directive
- Reusable UI primitives live in `components/ui/` (`LoadingSpinner`, `ErrorMessage`)
- Page-specific components in `components/home/` (or per-page directory)
- Layout chrome in `components/layout/` (`Header`, `BottomNavBar`)

### In-App Navigation Pattern

`components/home/HomeView.tsx` is the view controller for the home page. It holds `selected: ServiceType | null` state. When a service is selected from `ServiceList`, `HomeView` renders `ServiceDetail`; otherwise it renders `HeroBanner` + `ServiceList`. There is **no Next.js router involved** — navigation is pure React state switching within a single route.

### ServiceCard Clip-Path

`ServiceCard.tsx` uses a `ResizeObserver` to dynamically compute a CSS `clip-path` polygon that cuts a notch in the bottom-right corner of the card — the circular icon button sits in this cutout. Before modifying card dimensions or layout, be aware that the clip-path coordinates are recalculated on every resize and depend on the card's measured dimensions.

### Placeholder Components

- **`BottomNavBar`** — renders a single home icon; placeholder for future multi-tab navigation.

### Booking Flow (full chain)

HomeView → ServiceDetail (`showBooking` state) → BookingSlots (date/slot picker) → BookingForm (address + contact form) → success screen.
BookingSlots shows `BookingForm` when date and slot are both selected and "Продолжить" is clicked.

### Admin Panel

`components/admin/AdminButton.tsx` — floating gear icon button (bottom-right, z-40), visible only to admins.
`components/admin/AdminPanel.tsx` — full-screen modal overlay with four tabs: "Активные", "Созданные", "Отменённые", "Выполненные". Fetches reservations per tab on tab change.

**Access control:** `HomeView` calls `getUserInfo()` on mount; if `user.isAdmin === true`, renders `AdminButton` and `AdminPanel`. Errors are silently ignored (non-admins get no button).

**ReservationCard (nested in AdminPanel):** shows id, service name, status, start/end times (ru-RU locale), client username + Telegram ID, phone (clipboard copy in Telegram, `tel:` link otherwise), address (links to Yandex Maps). Action buttons vary by tab:
- Created: "Подтвердить", "Отменить"
- Active: "Выполнить", "Отменить"
- Cancelled/Completed: display-only

**State in HomeView:** `isAdmin: boolean` + `adminOpen: boolean`.

### BookingForm and Yandex Maps

`components/home/BookingForm.tsx` collects contact info and address, then calls `createReservation`.

**Inner component pattern:** `MapSection` is defined inside the file and rendered inside `<YMaps>` so it can call `useYMaps(['geocode'])`. Never move map logic outside this `<YMaps>` boundary.

**Address search flow:**
1. Debounced (300 ms) `ymaps.geocode(text)` call builds the dropdown
2. Coordinates are extracted via `obj.geometry?.getCoordinates?.()` at search time — objects without coordinates are skipped
3. On select, `item.coords` is used directly (no second `getCoordinates()` call)

**Zone validation:** `pointInPolygon()` (pure JS ray-casting, module-level function in BookingForm.tsx) validates that the chosen point is within `ZONE_COORDS`. Do NOT replace this with `ymaps.geometry.Polygon.contains()` — that API uses pixel coordinates and is unreliable for geographic data.

**`<YMaps>` config:** loaded with `query={{ apikey: NEXT_PUBLIC_YANDEX_MAPS_API_KEY, load: 'package.full' }}`. The `load: 'package.full'` is required for geocoding to work.

### Styling Patterns

- **Glassmorphism:** frosted-glass elements use both `backdrop-filter: blur()` and `-webkit-backdrop-filter: blur()` (both required for WebKit/Safari) with `rgba()` backgrounds (see `Header.tsx`, `BottomNavBar.tsx`)
- **CTA color:** primary action buttons use yellow `#f5c518`
- **Safe area insets:** fixed header/nav use `env(safe-area-inset-top/bottom)` for notch/home-bar compensation; `app/page.tsx` adds matching padding to the scroll container
- **Locale:** monetary values are formatted with `toLocaleString('ru-RU')` and the ruble sign (₽)
- **Language:** UI text is in Russian; metadata lang is `"ru"`
- **Image URLs:** `ServiceCard` handles both relative and absolute image URLs — relative URLs are automatically prefixed with `NEXT_PUBLIC_API_URL`

## Environment Variables

- `NEXT_PUBLIC_API_URL` — backend API base URL (required)
- `NEXT_PUBLIC_YANDEX_MAPS_API_KEY` — Yandex Maps API key; used in `BookingForm.tsx` via `<YMaps query={{ apikey }}>`.

## Code Style

- ESLint is configured with Next.js recommended rules (`eslint-config-next`)
- TypeScript strict mode is enabled
- React 19 Server Components are the default (use `'use client'` directive when needed)
