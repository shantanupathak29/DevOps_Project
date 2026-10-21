# CampusRide

CampusRide is a React application for campus shuttle schedules, student
reservations, and driver operations. The frontend is built with Vite and uses
the existing Supabase project for authentication and persistent bus data.

## Features

- Email/password sign-up and sign-in
- Persistent Supabase sessions, email verification, and password recovery
- Role-based student and driver portals
- Live shuttle schedules, seat reservations, and driver check-in/operations
- Clear configuration messaging when Supabase frontend settings are missing

## Project layout

- `frontend/` — React + Vite application and browser Supabase client
- `backend/supabase/` — Supabase migrations and Edge Functions
- `login.html` — legacy static page; the active Vite application is in `frontend/`

## Run locally

Use Node.js and npm. From the repository root:

```powershell
npm --prefix frontend install
Copy-Item frontend/.env.example frontend/.env.local
```

Set the actual existing Supabase project's URL and public anon/publishable key
in `frontend/.env.local`, then start the frontend:

```powershell
npm --prefix frontend run dev
```

Build and lint the frontend:

```powershell
npm --prefix frontend run build
npm --prefix frontend run lint
```

Never put a Supabase service-role key in the frontend or in any `VITE_*`
variable. `frontend/.env.local` is ignored by Git.

## Authentication and driver access

The browser client is initialized in `frontend/src/lib/supabase.js` from
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Login, registration,
verification, recovery, session restoration, and logout are handled by the
frontend using the existing Supabase project.

The selected portal tab does not grant a role. After authentication, the
application reads `public.profiles.role`: `student` opens the student portal and
`driver` opens Driver Operations. New profiles default to `student`. An
administrator must grant driver access in Supabase; see
[`backend/README.md`](backend/README.md) for the safe assignment procedure.

## Deploy to Vercel

Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Vercel
project's **Settings → Environment Variables** for every applicable target
(Production, Preview, and Development). Vite embeds these variables at build
time, so changing them requires a new deployment.

Set the Vercel project root directory to `frontend`, build command to
`npm run build`, and output directory to `dist`. Ensure the host serves
`index.html` for application routes such as `/login` and `/reset-password`.
Supabase redirect URLs, email setup, migrations, and recovery Edge Function
deployment are documented in [`backend/README.md`](backend/README.md).

## Supabase setup

Review the migration and deployment instructions in
[`backend/README.md`](backend/README.md) before applying changes to a Supabase
project. Do not replace an existing schema or apply migrations blindly. The
frontend does not deploy Supabase migrations or Edge Functions automatically.
