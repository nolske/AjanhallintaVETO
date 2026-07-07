# Implementation Plan

## Phase 1: Scaffold The App

Goal: Create the base Next.js App Router project with TypeScript strict mode, Tailwind CSS, ESLint, Supabase client dependencies, Zod, and a clean folder structure.

Likely files created or modified: `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `src/app/*`, `src/components/*`, `src/lib/*`, `src/types/*`, `.env.example`, `.gitignore`, `README.md`, `AGENTS.md`.

Database work: none.

Validation and security work: enable strict TypeScript, add Zod dependency and validation folder, document safe environment handling, and create public Supabase client helpers without service-role keys.

Commands and tests: `npm run lint`, `npm run typecheck`, `npm run build`.

Acceptance criteria: app starts locally, strict TypeScript is enabled, Tailwind works, lint/typecheck/build pass, no secrets are committed.

Risks or decisions: confirm Supabase key naming in the dashboard, and keep working in the inner repository root.

## Phase 2: Supabase Foundation

Goal: Add Supabase project configuration and database migrations.

Likely files created or modified: `supabase/migrations/*`, `src/lib/supabase/*`, `src/lib/env.ts`, `.env.example`.

Database work: create `profiles`, `projects`, `project_members`, and `time_entries`; enable RLS; add primary keys, foreign keys, indexes, and constraints.

Validation and security work: RLS on every app table, server-side auth checks, no service-role key in browser code.

Commands and tests: `npm run lint`, `npm run typecheck`, `npm run build`, Supabase migration validation once the CLI is introduced.

Acceptance criteria: schema applies cleanly, RLS is enabled, and anonymous users cannot access protected data.

Risks or decisions: decide how the first administrator is assigned.

## Phase 3: Authentication

Goal: Implement registration, login, logout, and password reset using Supabase Auth.

Likely files created or modified: auth route group pages, auth server actions, middleware, auth validation schemas.

Database work: profile creation for authenticated users.

Validation and security work: Zod for auth forms, protected routes, server-side redirects, safe password reset flow.

Commands and tests: `npm run lint`, `npm run typecheck`, `npm run build`.

Acceptance criteria: users can register, log in, log out, request password resets, and access only authenticated areas.

Risks or decisions: choose Supabase email confirmation settings.

## Phase 4: Projects And Membership

Goal: Allow authenticated users to create projects, archive projects, and manage members as project owners.

Likely files created or modified: project pages, project actions, member management forms, project validation schemas.

Database work: `projects` and `project_members` policies for owners and members.

Validation and security work: owners manage members; members read only their projects; archived projects block new entries.

Commands and tests: `npm run lint`, `npm run typecheck`, `npm run build`.

Acceptance criteria: owners can create/archive projects and add existing users; non-members cannot access project data.

Risks or decisions: define whether archived projects remain visible in reports.

## Phase 5: Time Entries

Goal: Let project members create, edit, and delete only their own time entries.

Likely files created or modified: time entry pages, time entry actions, time validation schemas, calculation utilities.

Database work: `time_entries` table with integer `minutes`, ownership policies, membership insert checks, and constraints.

Validation and security work: server derives `user_id` from auth, validates minutes as positive integers, and blocks writes for archived projects.

Commands and tests: `npm run lint`, `npm run typecheck`, `npm run build`.

Acceptance criteria: members can add their own entries; users cannot modify entries owned by others.

Risks or decisions: keep MVP as date plus minutes, not start/end timers.

## Phase 6: Reports And CSV Export

Goal: Show filtered personal reports and export them as CSV.

Likely files created or modified: report page, CSV route handler, report queries, report validation schemas.

Database work: indexes or views for efficient user/project/date reporting.

Validation and security work: RLS and server queries limit reports to the authenticated user; opintopisteet lasketaan, not stored.

Commands and tests: `npm run lint`, `npm run typecheck`, `npm run build`.

Acceptance criteria: users can filter by date range and project, see total minutes and opintopisteet, and export only their own report.

Risks or decisions: choose opintopisteiden näyttötarkkuus.

## Phase 7: Basic Admin Role

Goal: Add a minimal admin area for oversight.

Likely files created or modified: admin pages, admin queries, profile role policies.

Database work: add or enforce a `profiles.role` value such as `user` or `admin`.

Validation and security work: admin authorization in RLS and server code; users cannot self-assign admin access.

Commands and tests: `npm run lint`, `npm run typecheck`, `npm run build`.

Acceptance criteria: admins can view basic users/projects data, while normal users cannot access admin data.

Risks or decisions: first admin should be assigned manually in Supabase for the MVP.

## Phase 8: Polish, Tests, And Deployment

Goal: Prepare the MVP for demo and deployment.

Likely files created or modified: `README.md`, test files if added, deployment notes.

Database work: review policies, indexes, and optional seed data.

Validation and security work: check all mutations, confirm no secrets are exposed, and verify CSV isolation.

Commands and tests: `npm run lint`, `npm run typecheck`, `npm run build`, `npm audit`.

Acceptance criteria: app deploys to Vercel, required environment variables are documented, and the main flows work from the deployed URL.

Risks or decisions: decide the minimum automated test coverage expected for the final student project.
