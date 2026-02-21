# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 application using React 19, TypeScript, and Tailwind CSS v4. The project uses the App Router architecture introduced in Next.js 13+.

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

## Code Style

- ESLint is configured with Next.js recommended rules (`eslint-config-next`)
- TypeScript strict mode is enabled
- React 19 Server Components are the default (use `'use client'` directive when needed)
