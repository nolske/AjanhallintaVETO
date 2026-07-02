# Security And Privacy Review

This document records the first-pass security and privacy review for the
AjanhallintaVETO MVP. It is a review snapshot, not a guarantee that the
application is secure.

## Scope Reviewed

- `AGENTS.md`
- Supabase migrations
- RLS policies
- Authentication code
- Server actions
- Route handlers
- Middleware/proxy configuration
- Project membership code
- Time-entry mutations
- Report queries
- CSV export
- Administrator code
- Environment variable usage

## Critical Findings

No critical findings were found in this pass.

## High Findings

Status after remediation:

- The auth email redirect origin finding has been addressed by using the
  configured `NEXT_PUBLIC_SITE_URL` instead of request headers.
- Basic server-side rate limiting has been added for login, registration,
  password reset, and member invitation flows.
- The rate limiter is in-memory and best-effort for the MVP. A shared durable
  limiter should be considered before production or multi-instance deployment.

### 1. Password And Email Redirect Origin Is Derived From Request Headers

Status:

Addressed.

Affected files:

- `src/lib/auth/actions.ts`

Risk:

`getRequestOrigin()` trusts the request `Origin` or `Host` header when building
Supabase registration and password-reset redirect URLs. If deployment, proxy, or
Supabase redirect allow-list configuration is loose, a hostile origin could
influence links sent by email.

Example scenario:

An attacker triggers a reset request with a poisoned host. If the generated
email link points to an attacker-controlled domain, an auth code or token could
be sent outside the trusted application.

Recommended remediation:

Use a configured site URL such as `NEXT_PUBLIC_SITE_URL` or a server-only
`APP_SITE_URL`. Validate it on startup and use it for all Supabase email
redirects.

Requires product decision:

No.

### 2. Rate Limiting Is Not Implemented For Auth And Invitation Flows

Status:

Addressed for the MVP with in-memory server-side rate limiting. A production
deployment should review Supabase Auth limits, CAPTCHA settings, and whether a
shared rate-limit store is needed.

Affected files:

- `src/lib/auth/actions.ts`
- `src/lib/projects/actions.ts`

Risk:

Login, registration, password reset, and add-member-by-email can be abused for
brute force attempts, spam, or email probing pressure. Supabase may provide some
protections, but the application does not yet document or enforce app-level
limits.

Example scenario:

An attacker repeatedly submits password reset requests or member invitations for
many email addresses.

Recommended remediation:

Document Supabase Auth rate limits, configure CAPTCHA/rate limits where
available, and consider server-side throttling before production.

Requires product decision:

Yes. The team should decide rate-limit behavior and user experience.

## Medium Findings

### 1. Admin And Owner Views Expose Member/User Email Addresses Broadly

Affected files:

- `supabase/migrations/20260701130000_project_management_helpers.sql`
- `src/lib/admin/queries.ts`
- `src/app/(app)/projects/[projectId]/page.tsx`

Risk:

Email addresses are personal data. Project members and administrators can see
other users' email addresses. This may be justified, but it should be a clear
product and privacy decision.

Example scenario:

A project owner adds users and can then view all member email addresses even if
display names would be enough for normal collaboration.

Recommended remediation:

Decide whether emails are required in member lists. Consider showing display
names by default and email addresses only where needed for owners/admins.
Document this in the privacy notice.

Requires product decision:

Yes.

### 2. Admin Time-Entry Visibility Exists In RLS But Is Not Fully Defined

Affected files:

- `supabase/migrations/20260701110000_initial_schema.sql`

Risk:

Administrators can read time entries through RLS/direct table access, even
though the current UI shows only counts. This may be intended for support, but
the privacy scope should be explicit.

Example scenario:

A future admin page accidentally lists all time-entry descriptions. Descriptions
may contain sensitive study notes.

Recommended remediation:

Define administrator time-entry scope: counts only, metadata only, or full
descriptions. If counts only are needed, narrow RLS or expose admin-only RPCs
with limited columns.

Requires product decision:

Yes.

### 3. Password Reset Page Can Submit With Any Active Session

Affected files:

- `src/app/(auth)/reset-password/page.tsx`
- `src/lib/auth/actions.ts`

Risk:

A logged-in user can change their password from `/reset-password` without proving
they came from a recovery link. This mostly affects the currently signed-in
account, but the flow is weaker than intended.

Example scenario:

On a shared unlocked browser, someone visits `/reset-password` and changes the
account password.

Recommended remediation:

Only show and allow reset after a Supabase recovery session, or create a
separate authenticated change-password flow that requires the current password
if desired.

Requires product decision:

Yes. This affects account-management UX.

### 4. Invalid Report Filters Fall Back To All Personal Entries

Affected files:

- `src/lib/reports/filters.ts`
- `src/app/(app)/reports/export/route.ts`

Risk:

Malformed report filters return all of the current user's entries. This is not a
cross-user exposure, but it can produce broader-than-expected reports or CSV
exports.

Example scenario:

A user exports with a malformed date and receives all their history instead of
an error or empty result.

Recommended remediation:

Reject invalid filters with a visible error, or return an empty filtered result.

Requires product decision:

No.

## Low Findings

### 1. Helper Functions Can Reveal Limited Relationship Booleans

Affected files:

- `supabase/migrations/20260701110000_initial_schema.sql`

Risk:

Authenticated users can call helper functions such as `is_admin`,
`is_project_member`, and `is_project_owner` with arbitrary UUIDs and learn
boolean facts if they know or guess IDs.

Example scenario:

A user tests whether a known UUID belongs to an administrator or project owner.

Recommended remediation:

Avoid granting direct execute permission on low-level helper predicates if only
RLS policies need them, or wrap application-needed checks in narrower RPCs.

Requires product decision:

No.

### 2. No Audit Log For Sensitive Actions

Affected files:

- Project actions
- Member actions
- Time-entry actions
- Profile actions
- Database migrations generally

Risk:

It is hard to investigate who added members, archived projects, changed profile
names, or deleted entries.

Example scenario:

A project member is removed accidentally or maliciously and there is no trace of
who performed the action.

Recommended remediation:

Add an `audit_events` table for security-relevant actions before real
deployment.

Requires product decision:

Yes. The team should decide which events to retain and for how long.

### 3. Data Retention And Deletion Process Is Not Implemented

Affected files:

- Schema and documentation overall

Risk:

Profiles and time entries may remain indefinitely without a documented retention
or deletion process.

Example scenario:

A user asks for correction or deletion and there is no admin workflow or policy.

Recommended remediation:

Define a retention policy, correction/deletion workflow, and whether study-hour
records must be retained for course evidence.

Requires product decision:

Yes.

## Informational Findings

- `.env.local` is ignored and not tracked.
- `.env.example` contains safe placeholders only.
- No service-role key was found in source.
- No `dangerouslySetInnerHTML` or raw HTML rendering was found.
- SQL uses parameterized Supabase queries/RPCs; no obvious SQL injection path was
  found.
- CSV export neutralizes formula injection and escapes quotes, commas, and line
  breaks.
- RLS is enabled on application tables.
- Security definer functions consistently set `search_path = public, pg_temp`.
- Time-entry `user_id` is enforced by trigger and RLS, not trusted from browser
  input.
- Project `owner_id` is set server-side and checked by RLS.
- Owner membership is protected from deletion and duplication.
- Archived projects are blocked from new time entries by database trigger and
  policies.
- Self-promotion to administrator is blocked by RLS/trigger and no admin
  registration path exists.
- Forgot-password response is generic: "if email exists", which is good against
  account enumeration.

## GDPR And Privacy Considerations

Personal data stored:

- Email address
- Display name
- Role
- Project membership
- Time entries
- Time-entry descriptions
- Creation/update timestamps

Purpose:

- Authentication
- Project collaboration
- Study-hour reporting
- ECTS calculation
- Support/admin oversight

Who can view data:

- Users can view their own profile and time entries.
- Project members can view project membership context.
- Project owners can view project-level oversight data.
- Administrators can view support/admin data according to the current RLS and
  admin UI.

Data minimization:

The application collects a modest amount of data for the MVP, but free-text
time-entry descriptions can contain unnecessary sensitive information. The UI and
privacy notice should guide users not to enter sensitive personal data there.

Correction and deletion:

Users can edit their display name. A full account deletion, correction, and
retention workflow is not yet implemented.

Retention:

Retention is not yet defined. The product should decide how long study records,
archived projects, and audit records must be kept.

Privacy notice should document:

- Data categories
- Purposes
- Legal basis
- Who can view data
- Administrator access
- Retention period
- Export rights
- Correction/deletion contact
- Supabase and Vercel as processors, if used

## Security Controls Already Implemented Correctly

- Supabase Auth is used for identity.
- App routes are protected by middleware and server-side checks.
- Admin route is checked server-side against `public.profiles.role`.
- RLS is enabled on all application tables.
- Database constraints validate important invariants.
- Project membership is required before time-entry creation.
- Users can update/delete only their own time entries.
- Time duration is stored as integer minutes.
- ECTS values are calculated, not stored.
- Service-role key is not present in browser code.
- `.env.local` is ignored by Git.
- User-controlled input is validated with Zod in main forms.
- CSV formula injection is mitigated.
- Open redirects are mostly mitigated by internal-path validation.

## Prioritized Remediation Plan

1. Replace request-derived auth redirect origins with a configured site URL.
2. Decide and document administrator/member email and time-entry visibility.
3. Add or document rate limiting for auth and member-invite flows.
4. Tighten the reset-password flow to recovery sessions, or create a separate
   change-password flow.
5. Add audit logging for member changes, project archive/restore, entry
   delete/update, and admin access.
6. Define GDPR retention, deletion, and correction policy, then add a privacy
   notice.
7. Consider narrowing direct execute access to low-level boolean helper RPCs.
