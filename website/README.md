# Website App

This folder contains the browser-native product scaffold for Mehak's Job Search Model.

## Live Beta URL

- [https://jobsearchmodel.vercel.app](https://jobsearchmodel.vercel.app)

## Current Status

This website is live, but still in active beta stabilization.

Working now:
- homepage deployment on Vercel
- Supabase connection
- Prisma database schema
- invite-only beta gating
- multi-resume onboarding
- multi-role analysis runs
- in-app revised resume output
- `.docx` export for revised resumes

Still being worked on:
- production magic-link sign-in reliability
- fallback auth flow for beta testers when email delivery is restricted
- complete end-to-end onboarding verification in production

For the most current website notes, see [BETA_STATUS.md](./BETA_STATUS.md).

## Product workflow

1. sign in
2. upload or paste multiple resumes
3. submit one or many job URLs
4. extract JD content from those URLs
5. compare every resume against every role
6. review ATS and HR-fit scorecards
7. generate a revised resume in-app only
8. optionally download it as a basic `.docx`
9. revisit the last 10 analysis runs in History

## Zero-cost beta stack

- `Vercel Hobby` for hosting
- `Supabase Free` for Postgres + magic-link auth
- no paid email or dashboard vendors
- lightweight role analysis only
- no dashboard queue or pipeline publishing flow

## Included

- landing page
- magic-link sign-in screen
- multi-step onboarding UI
- analysis workspace
- history section
- resume manager
- settings and feedback page
- basic Word export for revised resumes
- Prisma schema for the website data model

## Not fully wired yet

- real Supabase project credentials and Vercel env vars
- production auth reliability and beta testing hardening
- richer resume rewriting quality beyond the current heuristic draft
- broader upload support beyond pasted text and text-based files
- optional external integrations if added later

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
   - `DIRECT_URL`
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
