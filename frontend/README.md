# CampusRide frontend

The frontend is a React application built with Vite. It uses Supabase Auth for
account access and the existing Supabase database for profiles and shuttle
operations.

## Local development

From the repository root, install dependencies and copy the environment
template:

```powershell
npm --prefix frontend install
Copy-Item frontend/.env.example frontend/.env.local
```

Set these values in `frontend/.env.local`:

- `VITE_SUPABASE_URL` — the existing Supabase project URL.
- `VITE_SUPABASE_ANON_KEY` — the project's public anon/publishable key.

Never use a service-role key in the browser or any `VITE_*` variable. The local
environment file is ignored by Git.

Start the development server and run the production build with:

```powershell
npm --prefix frontend run dev
npm --prefix frontend run build
npm --prefix frontend run lint
```

## Supabase authentication

The client is initialized once in `src/lib/supabase.js`. The app handles
email/password sign-in and registration, email verification, password recovery,
session restoration, and local sign-out. If either required environment value
is missing, the login view displays a configuration message instead of
initializing the client.

After sign-in, the profile role in `public.profiles` determines the portal:
`student` opens the student portal and `driver` opens Driver Operations. New
profiles default to `student`; selecting the Driver Operations tab does not
grant driver permissions. A Supabase administrator must assign the role. See
[`../backend/README.md`](../backend/README.md).

## Vercel deployment

In the Vercel project's **Settings → Environment Variables**, configure
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for each environment that
should authenticate (Production, Preview, and Development as applicable).
These variables are embedded by Vite during the build; after changing them,
redeploy so the new build receives them.

For this repository, set the Vercel **Root Directory** to `frontend`, build
command to `npm run build`, and output directory to `dist`. Configure the
deployment to serve `index.html` for SPA paths including `/login` and
`/reset-password`.

Supabase migrations, email and redirect configuration, and deployment of the
password recovery Edge Function are covered in
[`../backend/README.md`](../backend/README.md).
