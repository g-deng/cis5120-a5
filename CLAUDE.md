# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Yarny is a knitting/crochet pattern management app built as a monorepo for a CIS 5120 HCI class final project. Users upload pattern PDFs which are parsed by AI into row-by-row instructions, then track progress as they work through projects. The codebase is structured to satisfy 6 technical requirements for Assignment 5 (Implementation Prototypes).

## Monorepo Structure

- **`/mobile`** — Expo 54 + React Native app (TypeScript)
- **`/backend`** — Express.js API server (JavaScript), PostgreSQL via Supabase
- **`/docs`** — Assignment specs and project requirements

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
npm run db:init    # Initialize PostgreSQL database schema
```

## Environment Variables (backend `.env`)

- `DATABASE_URL` — PostgreSQL connection string (SSL required)
- `GEMINI_API_KEY` — Google Generative AI key (for PDF parsing)
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` — Supabase project credentials
- `PORT` — Express port (default 3000)

## Architecture

### Mobile App
- **Expo Router** with file-based routing in `app/`
- **4-tab navigation** in `app/(tabs)/_layout.tsx`: Home, Community, Stats, Demo
- **Demo tab**: Links to Hello World and Hello Styles screens (Req 1 & 2)
- **Project flow**: `new-project.tsx` → title → image → PDF upload → API parses PDF → `project/[id]/active.tsx` for row-by-row tracking
- **Active screen**: Shows pattern image, current row instruction, Previous/Next Row buttons, row counter
- **Theme system**: Colors (`#AEC9D7`, `#457C99`, `#0F374E`), fonts (Marko One, Montserrat), sizes in `constants/theme.ts`
- **Icons**: Material Icons from `@expo/vector-icons` + SF Symbols on iOS via `IconSymbol`
- **Path aliases**: `@/*` maps to mobile root
- **API layer**: All backend calls go through `services/api.ts`; Supabase client in `services/supabase.ts`
- **User identity**: No auth — UUID generated on first launch, stored in AsyncStorage

### Backend
- Standard Express app with entry point `bin/www`, app config in `app.js`
- Routes in `routes/` — users, projects, pdf, progress, upload, comments
- PostgreSQL connection pool in `db.js`, schema in `db-init.js`
- Supabase client in `supabase.js` (storage for images/PDFs)

### AI PDF Parsing
- Route: `POST /api/projects/:id/parse-pdf`
- Uses Google Gemini 2.5 Flash (`@google/generative-ai`)
- PDF uploaded to Supabase → backend fetches → Gemini extracts structured JSON (total_yards, sections, rows)
- Results saved to DB in a transaction

## Database

Schema defined in `backend/db-init.js`. Key tables: `users`, `projects`, `sections`, `rows`, `progress`, `progress_log`, `comments`. All use UUID primary keys. Progress has a unique constraint on `(user_id, project_id)`.

## API Routes

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/users` | Create user |
| GET | `/api/users/:userId` | Get user |
| POST | `/api/projects` | Create project |
| GET | `/api/projects` | Public projects (community feed) |
| GET | `/api/projects/:id` | Project with sections/rows |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/projects/:id/parse-pdf` | Upload & parse PDF with AI |
| GET | `/api/projects/:id/comments` | Get project comments |
| POST | `/api/projects/:id/comments` | Post a comment |
| GET | `/api/users/:userId/projects` | User's projects with progress |
| PATCH | `/api/users/:userId/projects/:id/progress` | Increment/decrement progress |
| GET | `/api/users/:userId/stats` | Aggregated stats |
| POST | `/api/upload/image` | Upload image to Supabase |

## Assignment 5 Requirement Mapping

| Req | Description | Key Files |
|-----|-------------|-----------|
| 1 — Hello World | "Hello World!" screen on iPhone | `app/demo/hello-world.tsx` |
| 2 — Hello Styles | Colors, fonts, Material Icons, bento grid | `app/demo/hello-styles.tsx`, `constants/theme.ts` |
| 3 — AI (PDF) | Upload PDF → AI parses into sections/rows | `app/new-project.tsx`, `backend/routes/pdf.js` |
| 4 — Global DB | Community feed + comments (GET/POST) | `app/(tabs)/search.tsx`, `app/project/[id]/details.tsx`, `backend/routes/comments.js` |
| 5 — Local State | Progress tracking + stats display | `app/(tabs)/index.tsx`, `app/(tabs)/stats.tsx`, `backend/routes/progress.js` |
| 6 — Display & Nav | Pattern display with Previous/Next Row + counter | `app/project/[id]/active.tsx` |
