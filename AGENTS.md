# Project Instructions

This is an MVP study time tracking application for approximately 100 users.

The approved stack is Next.js App Router, TypeScript, Tailwind CSS, Supabase Auth, PostgreSQL, and Row Level Security.

Do not introduce a separate backend server unless a future requirement clearly requires it.

Use server-side authorization and database RLS instead of trusting client-side checks.

Never expose a Supabase service-role key to browser code.

Never commit real credentials or `.env.local`.

Time durations are stored as integer minutes.

27 hours equals 1 ECTS credit.

One ECTS credit equals 1,620 minutes.

ECTS values are calculated, not stored in the database.

Users can modify only their own time entries.

Project membership is required before a user can create an entry for a project.

Project owners manage project members.

Keep components reasonably small and strongly typed.

Validate user-controlled input with Zod and database constraints.

Run linting, type checking, tests, and a production build after meaningful changes.

Do not commit or push changes unless the user explicitly requests it.

Explain security-sensitive changes clearly.
