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
assigns new users the non-privileged `student` role, and backfills valid,
non-conflicting usernames for accounts that already exist. Username lookup is not
available to browser clients. Driver access must be granted by an administrator
in the database; choosing the driver tab does not grant that role. For example,
an administrator can assign a provisioned driver in the SQL Editor:

```sql
update public.profiles
set role = 'driver'
where id = 'authenticated-user-uuid';
```

The repository contained no schema migrations before this change. Before
applying this migration to the hosted project, inspect its current
`public.profiles` table and policies in the Supabase Dashboard. Resolve any
existing table/schema or username conflicts rather than replacing existing
data. From this folder, authenticate and link to the existing project, then
review the pending SQL before applying:

```powershell
npx supabase login
npx supabase link --project-ref nqqnymcmdhxtiebbnwfy
npx supabase db push --dry-run
npx supabase db push
```

## Deploy the Edge Functions

The `username-login` function accepts the username and password, resolves the
email only inside the trusted function, and returns a Supabase Auth session only
after Auth verifies the password. `request-password-reset` resolves a username
privately and responds identically whether an account exists or not. Both
functions use Supabase-provided environment values, including the service-role
key, which must never be copied to the client.

Set the public application origin to the deployed frontend origin (scheme and
host only), then deploy both functions to the linked project:

```powershell
npx supabase secrets set APP_ORIGIN=https://your-app.example.com
npx supabase functions deploy username-login
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
4. Sign in once with the email and once with the username. Try an incorrect
   password; username failures must remain generic.
5. Refresh after sign-in, then sign out and verify the login view returns.
6. Request password recovery with both email and username, open the email link,
   set and confirm a new password, then sign in with the new password.
7. Open an expired/used recovery link and confirm the app offers a new reset
   request without changing the password.
8. In the SQL editor, verify `profiles` has RLS enabled and that an
   authenticated user can only select/update their own profile. Verify an
   authenticated client cannot change `id` or `role`.

The hosted project cannot be introspected or deployed from this workspace.
Review its existing schema before `db push`, apply the migration, deploy the
functions, and verify email/redirect configuration in the Dashboard.
