# React + Vite

## Supabase authentication

Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` using the existing Supabase project's public
publishable/anon key. Never put a service-role key in a `VITE_*` variable.
Database migration, Edge Function deployment, redirect allow-list, email
verification, and recovery email setup are documented in `../backend/README.md`.

## Deploy to Vercel

Vite embeds `VITE_*` variables into the frontend when it builds. The ignored
local `.env.local` file is not deployed, so configure both variables in the
Vercel project's **Settings → Environment Variables**:

- `VITE_SUPABASE_URL`: the existing Supabase project's URL.
- `VITE_SUPABASE_ANON_KEY`: that project's public publishable/anon key (never a
  service-role key).

Enable both variables for every deployment target that should use
authentication: **Production**, **Preview**, and **Development** as applicable.
If the Vercel project is connected to this repository's root, set its **Root
Directory** to `frontend`. Use the Vite build command `npm run build` and output
directory `dist`.

Save the variables, then create a new deployment (redeploy the latest commit or
push a new commit). Updating Vercel variables does not change an already-built
deployment. If either variable is absent from a build, the app shows an
authentication configuration message instead of initializing the Supabase
client.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
