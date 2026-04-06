# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Yarny is a pattern/yarn management app built as a monorepo with an Expo/React Native mobile frontend and an Express.js backend. Early-stage project — the backend and mobile app are not yet connected.

## Monorepo Structure

- **`/mobile`** — Expo 54 + React Native app (TypeScript)
- **`/backend`** — Express.js API server (JavaScript)

## Development Commands

### Mobile (`/mobile`)
```bash
npm start          # Start Expo dev server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run in browser
npm run lint       # ESLint via expo lint
```

### Backend (`/backend`)
```bash
npm start          # Start Express server (port 3000)
```

## Architecture

### Mobile App
- **Expo Router** with file-based routing in `app/`
- **Bottom tab navigation**: Home (`index.tsx`) and Explore (`explore.tsx`) tabs configured in `app/(tabs)/_layout.tsx`
- **Theme system**: Colors/fonts defined in `constants/theme.ts`, accessed via `useThemeColor()` hook. `ThemedText` and `ThemedView` components auto-apply light/dark mode colors
- **Platform-aware components**: `ui/icon-symbol.tsx` uses SF Symbols on iOS, Material Icons on Android/web (separate `.ios.ts` and `.web.ts` files)
- **Path aliases**: `@/*` maps to mobile root (e.g., `@/components`, `@/hooks`)
- **Experimental features enabled**: React Compiler, New Architecture (in `app.json`)

### Backend
- Standard Express MVC with Jade views, morgan logging, cookie-parser
- Routes in `routes/`, views in `views/`, static files in `public/`
- Entry point: `bin/www`
