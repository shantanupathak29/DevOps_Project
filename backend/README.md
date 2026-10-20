# CampusRide Supabase backend

This folder contains the Supabase CLI project for the existing CampusRide
project (`nqqnymcmdhxtiebbnwfy`). No database or function deployment is performed
automatically by the frontend.

## Configure the frontend

Copy `frontend/.env.example` to `frontend/.env.local` and fill in the existing
project's project URL and publishable/anon key. Never use a service-role key in
the frontend.

## Review and apply the migration

The migration creates `public.profiles`, links each row to `auth.users`, applies
case-insensitive unique usernames, enables RLS, and creates a trigger that
assigns new users the non-privileged `student` role and backfills valid,
non-conflicting usernames for accounts that already exist. Username lookup is not
available to browser clients. Driver access must be granted by an administrator
in the database; choosing the driver tab does not grant that role. For example,
an administrator can assign a provisioned driver in the SQL Editor:

```sql
update public.profiles
set role = 'driver'
where id = 'authenticated-user-uuid';
```

The bus operations migration creates `public.buses` for vehicle, route, capacity,
status, stop, and ETA fields, plus `public.bus_passengers` for active boarding
records. It seeds the ten existing shuttle schedules. RLS allows authenticated
users to read bus schedules, students to create/release their own reservation,
and assigned drivers to manage passenger records and operational bus fields.
Database triggers update available-seat counts atomically as passengers board
and deboard. Sample passenger names from the old in-memory demo are not seeded;
real reservation records are created as users book or drivers check in passengers.

Before applying these migrations to another project, inspect its current
`public.profiles`, `public.buses`, and `public.bus_passengers` tables and
policies. Resolve any schema or data conflicts rather than replacing existing
data. To use the Supabase CLI, authenticate and link to the target project, then
review the pending SQL before applying:

```powershell
npx supabase login
npx supabase link --project-ref nqqnymcmdhxtiebbnwfy
npx supabase db push --dry-run
npx supabase db push
```

### Apply the migrations in the Supabase SQL Editor

1. Open the existing CampusRide project in the Supabase Dashboard and inspect
   its current `public.profiles`, `public.buses`, and `public.bus_passengers`
   schema and policies. Resolve any existing tables or data conflicts before
   applying these migrations; do not drop existing data to make them run.
2. Open **SQL Editor** and select **New query**.
3. Open
   `backend/supabase/migrations/20261020214500_create_profiles.sql` from this
   repository, copy its complete contents into the query, and select **Run**.
   Confirm it succeeds before continuing. This creates the profile table,
   username uniqueness constraint, RLS policies, signup trigger, and valid
   username backfill.
4. Create a second new query. Open
   `backend/supabase/migrations/20261020223000_create_bus_operations.sql`, copy
   its complete contents into the query, and select **Run**. This creates the
   bus and passenger tables, their indexes, RLS policies and seat-count
   triggers, then seeds the ten schedules used by the current frontend.
5. Return to CampusRide and choose **Retry connection** or reload the page.

Apply the profile migration first because the bus migration's authorization
policies use `public.profiles` to distinguish students from drivers. The bus
table columns and seeded IDs/schedules match the frontend's current
`buses`/`bus_passengers` queries and bus display fields. Do not seed the old
in-memory demo passengers; passenger rows represent actual reservations and
driver check-ins.

For the configured CampusRide project, both migrations were applied on
2026-10-20 and verified: `public.profiles`, `public.buses`, and
`public.bus_passengers` exist; the ten bus schedules are present; RLS and
policies are enabled; and the signup, seat-count, and bus-update triggers are
installed. They were executed through the Supabase Management API rather than
`db push`, so the CLI migration history table was not initialized. Before a
future `db push`, reconcile the remote migration history with the actual schema;
otherwise the CLI may attempt to run these idempotent migrations again.

## Deploy the password recovery Edge Function

Sign-in uses Supabase Auth's email/password flow directly. The
`request-password-reset` function resolves a username privately (or accepts an
email) and responds identically whether an account exists or not. It uses
Supabase-provided environment values, including the service-role key, which
must never be copied to the client.

Set the public application origin to the deployed frontend origin (scheme and
host only), then deploy the recovery function to the linked project:

```powershell
npx supabase secrets set APP_ORIGIN=https://your-app.example.com
npx supabase functions deploy request-password-reset
```

For local development, `http://localhost:5173` and `http://127.0.0.1:5173` are
allowed by the functions. For a different deployed frontend origin, update
`APP_ORIGIN` and redeploy.

## Supabase Dashboard settings

In **Authentication → URL Configuration**, set the Site URL to the frontend's
origin and add exact redirect URLs for `/login?verified=1` and `/reset-password`
(plus local Vite URLs while testing). The local CLI configuration enables email
confirmation; set **Authentication → Providers → Email → Confirm email** to
match on the hosted project and set the minimum password length to 8. Configure
SMTP under **Authentication → SMTP
Settings** for production email delivery; Supabase's default email service is
rate-limited and intended for testing.

In **Authentication → Email Templates**, keep the confirmation template's
`{{ .ConfirmationURL }}` link intact. The password recovery template should use
the Supabase recovery link (`{{ .ConfirmationURL }}`), which returns to
`/reset-password`; never send or store an old password.

With email confirmation enabled, a newly registered account cannot sign in
until its email link is completed. The login screen now offers **Resend
verification** after this response and after signup; check spam and wait before
resending if Supabase's email rate limit was reached. A confirmation link must
redirect to the current app origin, which must be allow-listed above.

Configure the frontend host to serve `frontend/index.html` for unknown paths so
direct requests to `/login` and `/reset-password` reach the Vite SPA.

## Manual verification

1. Start the frontend with `npm --prefix frontend run dev`.
2. Sign up with a new username, email, and password. Confirm the verification
   email if enabled; check the user's matching row in `public.profiles`.
3. Retry the username and email. A username conflict is enforced by the
   database; Supabase Auth may intentionally respond generically for duplicate
   emails when email confirmation is enabled.
4. Sign in with the email. Try an incorrect password and verify access is
   denied.
5. Refresh after sign-in, then sign out and verify the login view returns.
6. Request password recovery with both email and username, open the email link,
   set and confirm a new password, then sign in with the new password.
7. Open an expired/used recovery link and confirm the app offers a new reset
   request without changing the password.
8. In the SQL editor, verify `profiles` has RLS enabled and that an
   authenticated user can only select/update their own profile. Verify an
   authenticated client cannot change `id` or `role`.
9. After both migrations are applied, sign in and confirm the shuttle rows load
   from `public.buses`. Book and release a seat, refresh the page, and verify
   both the reservation in `public.bus_passengers` and the seat count persist.
   Verify student accounts cannot change bus status or edit other passengers.

The hosted database schema and seed rows are verified. Complete the manual
frontend reservation and authentication checks above, deploy the password
recovery function if it is not already deployed, and verify email/redirect
configuration in the Dashboard.
