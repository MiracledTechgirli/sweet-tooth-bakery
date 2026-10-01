# Golden Crumb Bakery

Bakery e-commerce site: Next.js + Supabase (Postgres + Google Auth) + Mailgun confirmation emails.

> This README is a starter. The build agent must finalize it (setup, env vars, deployment, screenshots) as the last step in `docs/TASKS.md`.

## Quick start
1. Copy `.env.example` → `.env.local` and fill in values.
2. Run `supabase/migrations/0001_init.sql`, then `supabase/seed.sql`, in the Supabase SQL editor.
3. Configure Google OAuth: `docs/AUTH_GOOGLE_SETUP.md`.
4. Configure Mailgun: `docs/EMAIL_MAILGUN.md`.
5. `npm install && npm run dev`

## For the coding agent
Start with `AGENT.md`.
