# Supabase Setup

Use these steps for a development Supabase project. Do not run migrations against production unless that is explicitly approved.

## 1. Create A Supabase Project

1. Go to the Supabase dashboard.
2. Create a new project.
3. Save the project reference and database password somewhere secure.
4. Keep email/password authentication enabled for the MVP.

## 2. Configure Environment Variables

Copy the example file:

```bash
cp .env.example .env.local
```

Fill in only the public values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Find the Supabase values under project API settings. `NEXT_PUBLIC_SITE_URL`
must be the canonical application URL used in Supabase email confirmation and
password reset links. Use `http://localhost:3000` for local development and the
real Vercel/app URL for deployment.

Do not add a service-role key at this stage. Never commit `.env.local`.

## 3. Install Or Use Supabase CLI

The project stores migrations in `supabase/migrations`.

You can run the CLI with `npx`:

```bash
npx supabase --version
```

Or install it using Supabase's official installation instructions.

## 4. Link The Development Project

From the repository root:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

Only link to a development project unless production changes are explicitly approved.

## 5. Apply Migrations

Apply the local migration files to the linked development project:

```bash
npx supabase db push
```

Review the SQL diff shown by the CLI before confirming.

## 6. Generate TypeScript Types

After migrations are applied, regenerate the database types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_REF --schema public > src/types/database.ts
```

For a local Supabase instance:

```bash
npx supabase gen types typescript --local --schema public > src/types/database.ts
```

## 7. Create The First Admin

The default role for new users is `user`. Users cannot promote themselves.

For the MVP, create the first admin manually from the Supabase SQL editor after the user has registered:

```sql
update public.profiles
set role = 'admin'
where email = 'admin@example.com';
```

Use the real admin email for the development project. Do not put that email or any credentials into the repository.

This manual SQL procedure is only for a controlled development or support
environment. Do not expose role changes through a public route, form, server
action, or API endpoint.

To test safely, keep one normal account with `role = 'user'` and one admin
account with `role = 'admin'`. The normal user should not be able to open
`/admin`; the admin user should be able to view the administrator dashboard.

## 8. Verify Locally

Run:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Then start the app:

```bash
npm run dev
```

Authentication, project, time-entry, report, and admin MVP flows are now
implemented. Keep `.env.local` local only.
