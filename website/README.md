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
- standard email/password auth flow
- multi-resume onboarding with `.docx` parsing
- multi-role analysis runs
- per-run analysis mode selection: ATS, HR fit, or comprehensive
- in-app revised resume output
- `.docx` export for revised resumes

Still being worked on:
- production auth reliability
- password reset flow verification
- complete end-to-end onboarding verification in production

For the most current website notes, see [BETA_STATUS.md](./BETA_STATUS.md).

## Product workflow

1. sign in
2. upload one or more `.docx` resumes or paste resume text
3. review the extracted text before creating the workspace
4. create the workspace
5. submit one or many job URLs
6. choose ATS-only, HR-fit-only, or comprehensive analysis
7. compare every resume against every role
8. review ATS and HR-fit scorecards
9. generate one revised resume draft per role in-app only
10. optionally download drafts as basic `.docx` files
11. revisit the last 10 analysis runs in History

## Zero-cost beta stack

- `Vercel Hobby` for hosting
- `Supabase Free` for Postgres + auth
- no paid email or dashboard vendors
- lightweight role analysis only
- no dashboard queue or pipeline publishing flow

## Included

- landing page
- sign-in and sign-up screens
- multi-step onboarding UI with `.docx` resume parsing
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
- PDF upload support and OCR
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
