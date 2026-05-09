# Panini World Cup 2026 Checklist

A production-ready MVP skeleton for tracking an official/base Panini FIFA World Cup 2026 sticker album. Users can register, log in, view the checklist, mark stickers as owned or repeated, and persist progress per user with Supabase.

## Tech Stack

- Vite
- React
- TypeScript
- Supabase Auth and Postgres
- React Router
- Tailwind CSS

## Project Structure

```text
src/
  app/
    App.tsx
    router.tsx
  components/
    auth/
    layout/
    stickers/
    ui/
  data/
    stickers.json
  features/
    auth/
    stickers/
  lib/
    supabase.ts
  pages/
  types/
supabase/
  schema.sql
```

## Install

```bash
npm install
```

## Environment

Create a local `.env` file from the example:

```bash
cp .env.example .env
```

Fill in your Supabase values:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Do not commit real Supabase credentials.

## Supabase Setup

Create a Supabase project, then run the SQL in `supabase/schema.sql` in the Supabase SQL editor.

The schema creates `public.user_sticker_progress` with:

- One row per user and sticker number.
- A unique constraint on `user_id, sticker_number`.
- An `updated_at` trigger.
- Row Level Security policies using `auth.uid()` so users can only read and write their own progress.

## Run Locally

```bash
npm run dev
```

Then open the local Vite URL shown in your terminal.

## Build

```bash
npm run build
```

## Authentication

Authentication is handled with Supabase email/password auth. The frontend uses Supabase session persistence and does not manually store passwords or auth tokens.

Routes:

- `/` redirects authenticated users to `/dashboard` and unauthenticated users to `/login`.
- `/login` and `/register` redirect authenticated users to `/dashboard`.
- `/dashboard` is protected by `ProtectedRoute`.

## Progress Persistence

Sticker progress is stored in Supabase in `user_sticker_progress`. The dashboard loads progress for the authenticated user, keeps it in React state keyed by sticker number, updates the UI optimistically, and persists changes with Supabase `upsert` using the unique key `user_id, sticker_number`.

## Replacing Sticker Data

The current `src/data/stickers.json` file contains sample official/base stickers only. Replace it later with the full official checklist JSON using the same shape:

```json
{
  "number": "MEX1",
  "name": "Team Badge",
  "team": "Mexico",
  "category": "Official"
}
```

The scraper/importer is intentionally not implemented in this MVP.

## Deployment Notes

For Vercel deployment:

1. Connect the repository to Vercel.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as project environment variables.
3. Use `npm run build` as the build command.
4. Use `dist` as the output directory.

## Known Limitations

- Sticker data is sample data and must be replaced with the full official checklist JSON.
- Admin panel features are intentionally excluded from this MVP.
- Sharing and collaboration features are intentionally excluded from this MVP.
- Payments, custom backend services, Redux, and Zustand are intentionally not included.
