# Website App

This folder contains the browser-native product scaffold for Mehak's Job Search Model.

## Zero-cost beta stack

- `Vercel Hobby` for hosting
- `Supabase Free` for Postgres + magic-link auth
- no paid email or dashboard vendors
- manual scans only
- website dashboard is the main workspace

## Included

- landing page
- magic-link sign-in screen
- multi-step onboarding UI
- dashboard home
- job detail page
- resume manager
- settings and integrations page
- Prisma schema for the future multi-user data model

## Not fully wired yet

- real Supabase project credentials and Vercel env vars
- production ATS scanning beyond the lightweight beta scan flow
- recurring scans
- Google Sheets and Notion integrations
- richer AI generation backed by a model provider

## Run locally

```bash
cd website
npm install
npm run dev
```

## Configure for beta

1. Copy `.env.example` to `.env.local`
2. Fill in:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`
   - `BETA_INVITE_EMAILS`
   - `MAX_SCANS_PER_DAY`
3. Run:

```bash
npx prisma generate
npm run dev
```

If env vars are missing, the app falls back to demo mode locally so the UI still works.
