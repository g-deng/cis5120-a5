# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Yarny is a pattern/yarn management app built as a monorepo with an Expo/React Native mobile frontend and an Express.js backend. 

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

## Database Schema
-- Users (no auth, just a device-generated UUID stored locally)
CREATE TABLE users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username    text UNIQUE NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- Projects
CREATE TABLE projects (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES users(id) ON DELETE CASCADE,
  title           text NOT NULL,
  image_url       text,
  is_public       boolean DEFAULT false,
  total_yards     numeric,          -- extracted by AI from PDF
  total_rows      int,              -- extracted by AI (sum of all rows)
  created_at      timestamptz DEFAULT now(),
  last_worked_at  timestamptz
);

-- Sections (e.g. "Granny Squares", "Cup (R)", "Cup (L)")
CREATE TABLE sections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid REFERENCES projects(id) ON DELETE CASCADE,
  title       text NOT NULL,
  position    int NOT NULL
);

-- Rows (individual instructions within a section)
CREATE TABLE rows (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id   uuid REFERENCES sections(id) ON DELETE CASCADE,
  row_number   int NOT NULL,
  instruction  text NOT NULL,
  position     int NOT NULL          -- global position across whole project, for % calc
);

-- Progress (one record per user+project, tracks current position)
CREATE TABLE progress (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES users(id) ON DELETE CASCADE,
  project_id          uuid REFERENCES projects(id) ON DELETE CASCADE,
  current_row_id      uuid REFERENCES rows(id),
  rows_completed      int DEFAULT 0,
  updated_at          timestamptz DEFAULT now(),
  UNIQUE(user_id, project_id)
);

-- Progress log (append-only, for stats history chart)
CREATE TABLE progress_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES users(id) ON DELETE CASCADE,
  project_id  uuid REFERENCES projects(id) ON DELETE CASCADE,
  rows_added  int NOT NULL,           -- how many rows done in this session
  logged_at   timestamptz DEFAULT now()
);

-- Comments
CREATE TABLE comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES users(id) ON DELETE CASCADE,
  project_id  uuid REFERENCES projects(id) ON DELETE CASCADE,
  row_id      uuid REFERENCES rows(id),   -- nullable, comment on specific row
  body        text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

## Backend API Routes
# Users
POST   /api/users                          create user (username), returns id
GET    /api/users/:userId                  get user info

# Projects
POST   /api/projects                       create project shell (title, image_url, is_public, user_id)
GET    /api/projects                       all public projects (community feed)
GET    /api/projects/:id                   project + sections + rows + derived stats
DELETE /api/projects/:id                   delete project

# PDF Parsing (the AI step)
POST   /api/projects/:id/parse-pdf         multipart: upload PDF → AI extracts → saves sections/rows/total_yards/total_rows

# Progress
GET    /api/users/:userId/projects         user's own projects with current progress
PATCH  /api/users/:userId/projects/:id/progress    body: { rows_to_add: 1 } → increments rows_completed, appends log
GET    /api/users/:userId/stats            aggregated: today/week/all-time rows + yards

## Implementation Notes

- User auth: no login, UUID generated on first launch stored in AsyncStorage
- PDFs: parsed on backend by Claude API, instructions stored in DB, PDF discarded
- Yards used: derived at read time as (rows_completed / total_rows) * total_yards
- Image uploads: expo-image-picker → Supabase Storage → store public URL in projects.image_url
- Supabase client initialized in backend via @supabase/supabase-js

## AI PDF Parsing

- Route: POST /api/projects/:id/parse-pdf
- Uses Anthropic SDK, model claude-opus-4-5
- Extracts: total_yards, sections[], rows[] per section
- Returns and saves structured JSON to DB