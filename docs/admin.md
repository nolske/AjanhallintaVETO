# Administrator Area

The MVP administrator area is available at `/admin`.

Access is based only on the trusted `public.profiles.role` value loaded on the server. Do not trust browser form data, local storage, URL parameters, application-created cookies, or client state for administrator access.

Administrators can inspect basic support data:

- User profile rows, excluding passwords and Auth secrets.
- Project metadata.
- Counts for users, active projects, archived projects, and time entries.

Administrators must not silently edit another user's hours in the MVP. User impersonation is not implemented.

The MVP admin scope is read-only. Project updates and project membership
changes remain owner actions.

## Creating The First Development Admin

1. Register and confirm a normal user through the application.
2. Open the Supabase dashboard for the development project.
3. Go to the SQL editor.
4. Run this statement with the real development admin email:

```sql
update public.profiles
set role = 'admin'
where email = 'admin@example.com';
```

5. Confirm exactly one row was updated.
6. Sign out and sign back in.
7. Visit `/admin`.

Never expose this role update as a public route, server action, API endpoint, or browser feature. Normal registration must always create `user` accounts.

## Testing

Create two accounts in the development Supabase project:

- One normal user with `role = 'user'`.
- One administrator with `role = 'admin'`, assigned manually as shown above.

Expected behavior:

- The normal user can log in but cannot access `/admin`.
- The administrator can access `/admin`.
- The administrator can inspect users and projects.
- No password information, tokens, service-role key, or private credentials are shown.
- The administrator page does not include controls for editing another user's time entries.

## Future Account Suspension

Suspending users is a future feature. It should use a controlled server-only integration if needed. Do not add an insecure browser-side workaround or expose the Supabase service-role key.
