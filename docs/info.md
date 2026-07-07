# Project Info

This file is the handoff note for continuing the project later.

## Current Status

AjanhallintaVETO is now a working MVP foundation for study project time tracking.

Implemented so far:

- Next.js App Router application
- TypeScript strict mode
- Tailwind CSS
- ESLint
- Supabase Auth
- Supabase PostgreSQL schema
- Supabase Row Level Security policies
- Registration, login, logout, password reset flow
- Protected application routes
- Profile viewing and display-name editing
- Project creation, listing, details, settings, archive/restore
- Project membership management by email
- Time-entry creation, listing, editing, deletion
- Project-specific time-entry lists
- Personal time-entry list
- opintopistelaskenta utilities
- Unit tests for validation, duration conversion, opintopisteet, and simple authorization helpers

User-facing UI text is Finnish. Source code identifiers and docs are mostly English.

## Important Project Rules

- Time durations are stored as integer minutes.
- 27 hours equals 1 opintopiste.
- One opintopiste equals 1,620 minutes.
- opintopisteet are calculated, not stored in the database.
- Users can modify only their own time entries.
- Project membership is required before a user can create an entry for a project.
- Project owners manage project members.
- Archived projects do not accept new time entries.
- Existing entries in archived projects remain visible.
- Authorization is enforced server-side and with Supabase RLS, not only in the UI.
- Never expose a Supabase service-role key to browser code.
- Never commit real credentials or `.env.local`.

## Project Root

Use the inner repository folder:

```bash
/Users/nolske/Desktop/Git/AjanhallintaVETO/AjanhallintaVETO
```

## Environment

`.env.local` should contain only public Supabase values:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

No service-role key is currently needed.

## Supabase Migrations

The project currently has these migration files:

```text
20260701110000_initial_schema.sql
20260701130000_project_management_helpers.sql
20260701150000_time_entry_helpers.sql
20260701160000_ensure_current_profile.sql
```

What they do:

- `20260701110000_initial_schema.sql`
  - Creates `profiles`, `projects`, `project_members`, and `time_entries`.
  - Enables RLS.
  - Adds profile creation trigger for new Auth users.
  - Adds ownership, membership, and time-entry policies.

- `20260701130000_project_management_helpers.sql`
  - Adds project summary/detail helper RPCs.
  - Adds project member listing.
  - Adds safe add/remove member functions by email.

- `20260701150000_time_entry_helpers.sql`
  - Adds time-entry listing helper RPCs.
  - Adds editable-entry lookup.
  - Blocks future entry dates.
  - Blocks new entries into archived projects.

- `20260701160000_ensure_current_profile.sql`
  - Adds `ensure_current_profile()`.
  - Fixes the issue where a logged-in Auth user might not yet have a matching `profiles` row.
  - Project creation now calls this before inserting a project.

If you pull this project fresh or continue on another machine, apply pending migrations with:

```bash
npx supabase db push
```

After applying migrations, regenerate Supabase types if desired:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_REF --schema public > src/types/database.ts
```

## Auth Status

Implemented routes:

- `/register`
- `/login`
- `/forgot-password`
- `/reset-password`
- `/auth/callback`

Implemented behavior:

- Register with email, password, display name
- Login/logout
- Forgot-password request
- Reset-password flow
- Middleware-protected app routes
- Authenticated users redirected away from login/register
- Unauthenticated users redirected to login
- Server-side user loading with `supabase.auth.getUser()`

Development testing note:

- You can disable email confirmation in the Supabase development project.
- Or create test users manually in Supabase Auth.
- For three test users, fake dev emails such as `x@example.com`, `y@example.com`, `z@example.com` are fine if confirmation is disabled.

## Project Features

Implemented routes:

- `/projects`
- `/projects/new`
- `/projects/[projectId]`
- `/projects/[projectId]/settings`
- `/projects/[projectId]/members`

Implemented behavior:

- Authenticated users can create projects.
- Project name validation: 2-100 characters.
- Description is optional.
- Server determines `owner_id`; browser does not submit it.
- Owner membership is created by database trigger.
- Projects are listed as active and archived.
- Project cards show owner, member count, own hours, total hours when allowed.
- Owners can edit name/description.
- Owners can archive/restore projects.
- Owners can add registered users by email.
- Owners can remove normal members.
- Owner cannot be removed.
- Duplicate member additions are handled.

Important fix made:

- Project creation originally showed `Projektin tallennus ei onnistunut`.
- Likely causes were missing `profiles` rows and/or RLS friction from `insert(...).select("id").single()`.

## Administrator Area

- Added a minimal `/admin` dashboard.
- Access is checked on the server from the trusted `public.profiles.role` value.
- Normal users do not see the admin navigation link and cannot access `/admin`.
- Admins can see counts for users, active projects, archived projects, and time entries.
- Admins can inspect basic user profile rows and project metadata.
- The admin page does not expose passwords, Auth tokens, private credentials, service-role keys, or user impersonation.
- The admin page does not allow editing another user's hours.
- First admin creation is manual through Supabase SQL:

```sql
update public.profiles
set role = 'admin'
where email = 'admin@example.com';
```

- This SQL must never be exposed as a public endpoint or browser feature.
- Fixed by:
  - Adding `ensure_current_profile()`.
  - Calling it before project creation.
  - Generating `projectId` in server code with `crypto.randomUUID()`.
  - Using plain insert without returning row data.

## Time-Entry Features

Implemented routes:

- `/time-entries`
- `/time-entries/new`
- `/time-entries/[entryId]/edit`
- Project-specific list inside `/projects/[projectId]`

Implemented behavior:

- Users can create entries only for projects where they are members.
- New entries can be added only to active projects.
- Users can edit/delete only their own entries.
- Project owners can view project entries for oversight.
- Personal time-entry list is available at `/time-entries`.
- Duration input uses separate hours and minutes fields.
- Duration is converted to integer `duration_minutes`.
- Duration must be 1-1440 minutes.
- Future dates are rejected.
- Description is optional and max 500 characters.
- Delete action asks for browser confirmation.

Display behavior:

- `90` minutes displays as `1 h 30 min`.
- opintopisteet lasketaan with `totalMinutes / 1620`.
- opintopisteitä ei tallenneta.

## Important Files

Core Supabase:

- `src/lib/supabase/server.ts`
- `src/lib/supabase/browser.ts`
- `src/lib/supabase/middleware.ts`
- `middleware.ts`
- `src/types/database.ts`

Auth:

- `src/lib/auth/actions.ts`
- `src/lib/auth/server.ts`
- `src/lib/auth/messages.ts`
- `src/lib/auth/redirects.ts`
- `src/app/(auth)/*`
- `src/app/auth/callback/route.ts`

Projects:

- `src/lib/projects/actions.ts`
- `src/lib/projects/queries.ts`
- `src/lib/projects/authz.ts`
- `src/components/projects/project-form.tsx`
- `src/components/projects/project-card.tsx`
- `src/app/(app)/projects/*`

Time entries:

- `src/lib/time-entries/actions.ts`
- `src/lib/time-entries/queries.ts`
- `src/lib/time-entries/duration.ts`
- `src/components/time-entries/time-entry-form.tsx`
- `src/components/time-entries/time-entry-list.tsx`
- `src/components/time-entries/delete-time-entry-form.tsx`
- `src/app/(app)/time-entries/*`

Validation:

- `src/lib/validation/auth.ts`
- `src/lib/validation/projects.ts`
- `src/lib/validation/time-entries.ts`
- `src/lib/validation/reports.ts`
- `src/lib/validation/common.ts`

Tests:

- `tests/auth-validation.test.ts`
- `tests/project-validation.test.ts`
- `tests/time-entry-validation.test.ts`

## Verification Commands

These have been run successfully during development:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

`npm test` currently passes, but Node prints a harmless ESM warning because tests use TypeScript imports with Node's experimental type stripping.

`npm run build` may need permission outside the sandbox because Turbopack tries to use an internal process/port.

## Manual Testing That Already Worked

- User login worked.
- Project creation started working after the `ensure_current_profile()` fix and the project insert change.

## What To Do Next

Recommended next phase: **Reports and CSV export**.

Build:

- `/reports`
- Date-range filter
- Project filter
- Personal total minutes
- Henkilökohtaiset opintopisteet yhteensä
- CSV export for the authenticated user's own report

Security requirements:

- Reports must show only the authenticated user's own entries.
- Project owners seeing project-wide entries is fine in project detail, but personal reports should stay personal unless a separate owner report is intentionally added.
- CSV export must not leak other users' entries.
- opintopisteet must be calculated, not stored.

Suggested implementation files:

- `src/app/(app)/reports/page.tsx`
- `src/app/(app)/reports/export/route.ts`
- `src/lib/reports/queries.ts`
- `src/lib/reports/csv.ts`
- `src/lib/validation/reports.ts`
- `tests/reports.test.ts`

After that:

1. Polish dashboard summaries.
2. Add basic admin pages.
3. Improve README setup instructions.
4. Consider adding a small seed/dev testing guide.
5. Prepare Vercel deployment.

## Useful Manual Test Scenario

For testing projects and time entries:

1. Create or use users X, Y, and Z.
2. Log in as X.
3. Create project `Testi`.
4. Add Y and Z as members by email.
5. As X, add a time entry: 1 h 30 min.
6. Log in as Y.
7. Confirm Y can see `Testi`.
8. Confirm Y can add their own entry.
9. Confirm Y cannot edit/delete X's entry.
10. Log in as Z.
11. Confirm Z can see `Testi` and add their own entry.
12. Log in as X.
13. Archive `Testi`.
14. Confirm no new entries can be added to archived `Testi`.
15. Confirm existing entries remain visible.

## Things To Remember

- Run `npx supabase db push` after adding migrations.
- Keep `.env.local` private.
- Do not add a service-role key unless there is a clearly server-only feature that truly needs it.
- Do not commit or push unless explicitly requested.
- If project creation fails again, check:
  - Was `20260701160000_ensure_current_profile.sql` applied?
  - Does the current Auth user have a row in `public.profiles`?
  - Supabase Dashboard -> Logs -> Database/Auth logs.
