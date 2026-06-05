# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Serve production build
```

No linting, testing, or type-checking is configured.

## Environment

The app requires a `.env.local` file with:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Architecture

Next.js 14 App Router project. JavaScript only (no TypeScript).

**Pages** (`/app`):
- `/` — Home / Supabase connection test
- `/plan` — Weekly meal planner (client component, React state, editable table)
- `/shopping` — Shopping list generated from the weekly plan
- `/recipes` — Recipe CRUD backed by Supabase
- `/stock`, `/cook` — Stubs

**Data layer:**
- `data/meals.js` — Hardcoded weekly plan (`weeklyPlan`) and ingredient-to-quantity map (`ingredientsMap`). This is the source of truth for the Plan and Shopping pages.
- `lib/supabase.js` — Supabase client singleton, used only in the Recipes page and the home connection test.

**Rendering split:** `/plan` and `/recipes` are `'use client'` components with local React state. All other pages are server components (static/template output).

The global nav lives in `app/layout.js`.
