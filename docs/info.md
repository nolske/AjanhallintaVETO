# Project Info

This file records the current foundation work for future development tasks.

## Project Purpose

AjanhallintaVETO is an MVP web application for tracking study-related project hours and calculating ECTS credits.

The planned app is intended for approximately 100 users.

Core rules:

- Time durations are stored as integer minutes.
- 27 hours equals 1 ECTS credit.
- One ECTS credit equals 1,620 minutes.
- ECTS values are calculated from minutes and are not stored as duplicated database data.
- Users can modify only their own time entries.
- Project membership is required before a user can create an entry for a project.
- Project owners manage project members.
- Authorization must be enforced server-side and with Supabase Row Level Security, not only in the UI.

## Repository State Before Foundation Work

The repository started as an almost-empty Git repository with:

- `README.md`
- `.gitignore`
- `.git/`

It was not yet a Next.js application. There was no `package.json`, TypeScript config, Tailwind config, application code, Supabase setup, or test/lint/build scripts.

The actual project root is the inner folder:

```bash
/Users/nolske/Desktop/Git/AjanhallintaVETO/AjanhallintaVETO
```

## Foundation Work Completed

The first foundation phase was implemented directly in the existing repository root. No nested project directory was created.

Created and configured:

- Next.js App Router
- TypeScript with strict mode
- Tailwind CSS
- ESLint
- npm package setup
- Supabase browser and server client helper files
- Zod validation folder and starter schemas
- Shared TypeScript type folder
- ECTS calculation utility
- Basic responsive application shell
- Header, main content area, footer, and placeholder navigation
- Placeholder pages for dashboard, projects, time entries, reports, profile, and admin
- Documentation and durable Codex instructions

Authentication and database tables have not been implemented yet.

## Installed Dependencies

Runtime dependencies:

- `next`
- `react`
- `react-dom`
- `@supabase/supabase-js`
- `@supabase/ssr`
- `zod`
- `react-hook-form`

Development dependencies:

- `typescript`
- `eslint`
- `eslint-config-next`
- `tailwindcss`
- `@tailwindcss/postcss`
- `@types/node`
- `@types/react`
- `@types/react-dom`

## Important Files Created

Configuration:

- `package.json`
- `package-lock.json`
- `next.config.ts`
- `tsconfig.json`
- `next-env.d.ts`
- `eslint.config.mjs`
- `postcss.config.mjs`
- `.env.example`

Documentation:

- `AGENTS.md`
- `docs/implementation-plan.md`
- `docs/info.md`
- Updated `README.md`

Application shell:

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/components/layout/app-shell.tsx`
- `src/components/layout/header.tsx`
- `src/components/ui/placeholder-panel.tsx`

Placeholder route pages:

- `src/app/(app)/dashboard/page.tsx`
- `src/app/(app)/projects/page.tsx`
- `src/app/(app)/time-entries/page.tsx`
- `src/app/(app)/reports/page.tsx`
- `src/app/(app)/profile/page.tsx`
- `src/app/(admin)/admin/page.tsx`

Supabase and shared code:

- `src/lib/env.ts`
- `src/lib/supabase/browser.ts`
- `src/lib/supabase/server.ts`
- `src/lib/calculations/ects.ts`
- `src/lib/validation/common.ts`
- `src/lib/validation/auth.ts`
- `src/lib/validation/projects.ts`
- `src/lib/validation/time-entries.ts`
- `src/lib/validation/reports.ts`
- `src/types/database.ts`
- `src/types/domain.ts`

## Environment Variables

`.env.example` contains only safe placeholder public Supabase variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-or-publishable-key
```

No Supabase service-role key was added. Do not add one unless a later server-only feature genuinely requires it.

Never commit real credentials or `.env.local`.

## Current Application Behavior

The app currently has:

- A home page explaining the study time tracking MVP
- A responsive header with placeholder navigation
- Static placeholder pages for the planned main areas
- ECTS calculation utility showing that 810 minutes equals 0.5 ECTS
- Supabase client helper files ready for later auth/database work

The app does not yet have:

- User registration
- Login/logout
- Password reset
- Database schema
- Supabase Row Level Security policies
- Project creation
- Time entry CRUD
- Reports or CSV export
- Admin role behavior

## Verification Already Run

The following checks passed after the foundation work:

```bash
npm run lint
npm run typecheck
npm run build
```

Note: the first sandboxed `npm run build` failed because Turbopack was blocked from binding an internal port in the sandbox. Running the same build with permission outside the sandbox passed.

## Commands Used During Setup

Important setup and verification commands included:

```bash
npm install next react react-dom @supabase/supabase-js @supabase/ssr zod react-hook-form
npm install --save-dev typescript @types/node @types/react @types/react-dom eslint eslint-config-next tailwindcss @tailwindcss/postcss
npm install --package-lock-only
npm prune
npm run lint
npm run typecheck
npm run build
```

## Manual Setup Still Needed

Before Supabase-backed features can be implemented:

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local`.
3. Fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Keep `.env.local` uncommitted.
5. Decide how the first administrator will be assigned later.

## Next Recommended Phase

The next implementation phase should be the Supabase foundation:

- Add database migrations.
- Create `profiles`, `projects`, `project_members`, and `time_entries`.
- Enable Row Level Security on every application table.
- Add database constraints for ownership, membership, and integer minutes.
- Keep ECTS calculated in application/query logic, not stored in the database.

Do not implement a separate backend server, Docker, microservices, real-time subscriptions, PDF generation, or mobile app for this MVP unless requirements change clearly.
