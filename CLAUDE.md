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

Next.js App Router (not Pages Router). All routes are in `app/`:
- `app/layout.tsx` - Root layout with global fonts and metadata
- `app/page.tsx` - Home page component
- `app/globals.css` - Global styles and Tailwind configuration

### Tailwind CSS v4

**No `tailwind.config.js`** — configuration is done via CSS. Tailwind is imported in `app/globals.css` with `@import "tailwindcss"`. Theme customization uses the `@theme inline` directive in that file.

### TypeScript Configuration

- Path alias `@/*` maps to the root directory
- Strict mode enabled; `JSX` transform is `react-jsx`

### Fonts

**Nunito** loaded from `public/fonts/` via `next/font/local`. Three weights: 400, 500, 600. CSS variable: `--font-nunito`. `KumbhSans-Regular.woff2` and OpenSans (Light/Regular/Medium woff2) are present in `public/fonts/` but not yet wired up.

## Telegram Integration

- `lib/telegram/init.ts` — initializes and expands the WebApp, extracts `initData`
- `lib/telegram/theme.ts` — maps Telegram theme params to CSS variables on `:root`
- `lib/telegram/hooks.ts` — `useTelegramWebApp()` and `useTelegramTheme()` hooks
- `components/providers/TelegramProvider.tsx` — root context provider; consume via `useTelegram()`. Uses **two-phase init**: immediate init for native injection, then falls back to `telegram-loaded` event from `TelegramScript`
- `components/providers/TelegramScript.tsx` — loads `telegram-web-app.js` via Next.js `<Script>`
- `types/telegram.d.ts` — global `window.Telegram` type declaration

**Theming:** components use inline `style` props with `var(--tg-theme-*)` CSS variables. Provide fallback values: `var(--tg-theme-button-color, #f5c518)` — the CSS variable may not exist outside Telegram.

## API Layer

- `lib/api/client.ts` — `ApiClient` class: generic typed fetch wrapper, adds `X-Telegram-Init-Data` auth header, **30-second AbortController timeout** (throws `'Превышено время ожидания запроса'` on abort)
- `lib/api/services.ts` — service functions:
  - `getServiceTypes(initData, page?, size?)` — paginated, defaults page=0, size=20
  - `getSchedules(initData)` — available schedules
  - `getAvailableSlots(initData, serviceId, date)` — time slots for a date
  - `createReservation(initData, dto)` — `CreateReservationDto`: `start`, `serviceId`, `clientName`, `clientPhoneNumber`, `clientAddress`
  - `getUserInfo(initData)` — GET `/rest/admin-ui/clients/me`; returns `UserInfoDto` (`id`, `name`, `isAdmin`)
  - `getActiveReservations` / `getCreatedReservations` / `getCancelledReservations` / `getCompletedReservations` — admin reservation lists
  - `completeReservation` / `cancelReservation` / `confirmReservation` — PATCH actions
  - `createSchedule` / `deleteSchedule` / `updateSchedule` — schedule CRUD
  - `getClientActiveReservations(initData)` — client's own active reservations
  - `cancelClientReservation(initData, id)` — client cancel
  - `getAdminServiceTypes(initData, page?, size?)` — admin service type list
  - `createServiceType(initData, dto)` / `updateServiceType(initData, id, dto)` / `deleteServiceType(initData, id)` — service type CRUD
  - `hideServiceType(initData, id)` / `showServiceType(initData, id)` — toggle active/inactive
- `lib/utils/reservationStatus.ts` — `translateStatus(status)` maps enums to Russian; returns `'Неизвестный статус'` for unknown values
- `types/api.d.ts` — all API types (`ServiceType`, `ServiceTypesResponse`, `Schedule`, `SchedulesResponse`, `CreateScheduleDto`, `ApiError`, `CreateReservationDto`, `PaginationInfo`, `UserInfoDto`, `AdminReservation`, `AdminReservationsResponse`, `ClientReservation`, `TypeOfServiceDto`)
- Base URL: `NEXT_PUBLIC_API_URL` env var

**Image optimization:** `next.config.ts` whitelists the `NEXT_PUBLIC_API_URL` hostname for `<Image>`. Add new image domains there.

### Data Fetching Pattern

All client components follow this pattern:
1. Destructure `{ initData, isReady }` from `useTelegram()`
2. **Gate the `useEffect` on `isReady`** and include it in the dependency array — without this, effects fire before Telegram initialises (empty `initData`)
3. Pass `initData` to API service functions
4. Handle loading/error states with `LoadingSpinner` / `ErrorMessage`

**Pagination:** When loading all items, use `response.page.totalPages` and loop: see `ServiceList.tsx` for the pattern.

## Component Conventions

- All interactive or data-fetching components require `'use client'` directive
- Reusable UI primitives: `components/ui/` (`LoadingSpinner`, `ErrorMessage`, `ConfirmDialog`)
- Layout chrome: `components/layout/` (`Header`, `BottomNavBar`). Note: `BottomNavBar` is a placeholder stub — not currently mounted in the app.

### In-App Navigation Pattern

`HomeView.tsx` is the view controller. It holds `selected: ServiceType | null` state — when set, renders `ServiceDetail`; otherwise renders `HeroBanner` + `MyReservations` + `ServiceList`. **No Next.js router** — navigation is pure React state within one route.

**`goHome` event:** `Header.tsx` logo dispatches `new Event('goHome')`. `HomeView` listens for it to reset `selected` to `null` **and** close the admin panel (`setAdminOpen(false)`). This is the only cross-component communication bypassing React props.

**Header phone copy:** `Header.tsx` renders a hardcoded phone number button that copies to clipboard with "Скопировано" feedback (same `useRef` timer pattern as AdminPanel). Only works inside Telegram WebApp (`window.Telegram?.WebApp`).

### ServiceCard Clip-Path

`ServiceCard.tsx` uses a `ResizeObserver` to compute a CSS `clip-path` polygon for a notch in the bottom-right corner where the icon button sits. The polygon is recalculated on every resize. Don't modify card dimensions without accounting for this.

### ConfirmDialog

`components/ui/ConfirmDialog.tsx` — glassmorphism overlay with customisable message, yellow confirm button, grey cancel. Clicking the backdrop also cancels. Used for all destructive actions.

### Booking Flow

HomeView → ServiceDetail (`showBooking` state) → BookingSlots (date/slot picker) → BookingForm → success screen.

### BookingForm

`components/home/BookingForm.tsx` — collects client name, phone, and address as plain text inputs. No map integration (Yandex Maps was removed for Telegram WebView compatibility).

**Phone validation:** `validate()` checks the phone field with `/^\+?[78]\d{10}$/` after stripping spaces, dashes, and parentheses.

**Address assembly:** Final `clientAddress` string: `город, улица, д.{building}, подъезд {entrance}, домофон {intercom}, кв.{apt}, этаж {floor}` — empty optional fields are omitted.

### MyReservations

`components/home/MyReservations.tsx` — shows the client's own active reservations. Collapsed to 2 items by default with a "Показать все" toggle. Inner `ReservationCard` handles cancellation via `ConfirmDialog`.

### BookingSlots

`components/home/BookingSlots.tsx` — date picker fetches available dates from `getSchedules`; selecting a date fetches slots from `getAvailableSlots`. Time strings have seconds stripped before display. Slot grid uses 3 columns; Back/Continue buttons are fixed to the bottom.

### Admin Panel

`AdminPanel.tsx` — full-screen modal, six tabs: "Активные", "Созданные", "Отменённые", "Выполненные", "Расписание", "Типы услуг".

- On tab change, **`setReservations([])` is called immediately** before the fetch to avoid old data flickering
- `ReservationCard` — setTimeout for clipboard feedback stored in `useRef` and cleared before each new copy to avoid multiple concurrent timers
- `formatScheduleDate` — parses with `new Date(year, month-1, day)` (not `dateStr + 'T00:00:00'`) to avoid UTC timezone offset shifting dates

**Access control:** `HomeView` calls `getUserInfo()` on mount; if `user.isAdmin === true`, renders `AdminButton` + `AdminPanel`. Errors silently ignored (non-admins see nothing).

**ReservationCard actions (by tab):**
- Created: "Подтвердить", "Отменить"
- Active: "Выполнить", "Отменить" (+ "Подтвердить" if status is still CREATED)
- Cancelled/Completed: display-only
- Типы услуг: service type cards with edit, delete, and hide/show toggle buttons

### Styling Patterns

- **Glassmorphism:** use both `backdropFilter: 'blur()'` and `WebkitBackdropFilter: 'blur()'` with `rgba()` backgrounds — typical values: `rgba(15,25,65,0.85)` for cards, `rgba(5,15,50,0.55)` for overlays
- **CTA color:** `#f5c518` (yellow)
- **Error color:** `#ff5f5f` (inline validation errors)
- **Secondary text:** white at `opacity: 0.7`
- **Safe area insets:** fixed header/nav use `env(safe-area-inset-top/bottom)`; `app/page.tsx` adds matching padding to the scroll container
- **Locale:** Russian UI text, `toLocaleString('ru-RU')`, ruble sign ₽
- **Image URLs:** `ServiceCard` handles both relative and absolute URLs — relative ones are prefixed with `NEXT_PUBLIC_API_URL`

## Environment Variables

- `NEXT_PUBLIC_API_URL` — backend API base URL (required)
