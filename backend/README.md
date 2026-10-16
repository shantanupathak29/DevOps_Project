# CampusRide Supabase backend

This folder contains the Supabase CLI project for CampusRide. The hosted Supabase
project is `https://nqqnymcmdhxtiebbnwfy.supabase.co` (project ref:
`nqqnymcmdhxtiebbnwfy`).

## Link this folder to the hosted project

Install or run the Supabase CLI, then authenticate and link this local project:

```powershell
npx supabase login
npx supabase link --project-ref nqqnymcmdhxtiebbnwfy
```

The project URL alone does not authenticate the CLI. Linking may ask for the
hosted database password; use the password set in the Supabase Dashboard.

## Local development

From this `backend` folder:

```powershell
npx supabase start
npx supabase status
```

Create database changes as migrations under `supabase/migrations`, then apply
them to the linked hosted project with:

```powershell
npx supabase db push
```

Review migrations and enable Row Level Security before exposing tables to the
frontend. Never put a `service_role` key or database password in frontend code
or commit either secret to this repository.
