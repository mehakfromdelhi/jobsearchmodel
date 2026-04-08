# Zero-Cost Beta Deployment

This app is now prepared for a free-tier beta with:

- `Vercel Hobby`
- `Supabase Free`
- magic-link auth
- manual scans only
- website-first dashboard

## What has already been done in code

- invite-only magic-link request route
- onboarding save route
- manual scan route with daily cap
- DB-aware dashboard, resumes, settings, and job detail pages
- feedback capture route
- lazy Prisma loading so local demo mode still works without DB credentials

## What still requires your account access

These steps cannot be completed from inside the repo because they require ownership of your accounts:

1. Create a Supabase project
2. Enable email magic-link auth in Supabase
3. Copy the Supabase credentials into local and Vercel env vars
4. Create a Vercel project connected to this repo
5. Add the same env vars in Vercel

## Supabase setup

Create a new Supabase project and collect:

- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Then create:

```bash
website/.env.local
```

using `website/.env.example` as the template.

Recommended beta values:

- `NEXT_PUBLIC_APP_URL=http://localhost:3000` locally
- `BETA_INVITE_EMAILS=comma,separated,list@emails.com`
- `MAX_SCANS_PER_DAY=3`

## Database setup

Once env vars exist:

```bash
cd website
npx prisma generate
npx prisma db push
npm run dev
```

`db push` is enough for the beta. You do not need a full migration pipeline yet.

## Vercel setup

In Vercel:

1. Import the GitHub repo
2. Set the root directory to `website`
3. Add these env vars:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`
   - `BETA_INVITE_EMAILS`
   - `MAX_SCANS_PER_DAY`
4. Deploy

For production:

- set `NEXT_PUBLIC_APP_URL` to the actual Vercel site URL

## Beta guardrails

To stay within free-tier limits:

- keep users under 15
- keep scans manual only
- keep `MAX_SCANS_PER_DAY` low
- do not add recurring scans yet
- do not add Sheets/Notion sync yet

## Beta launch checklist

- Supabase project created
- magic-link auth enabled
- local `.env.local` created
- Prisma pushed to Supabase
- Vercel project created
- Vercel env vars set
- invite list populated
- first test user receives login email
- first scan works from dashboard

## If you want the absolute next step

The next step is to create the Supabase project and paste those env vars into:

```bash
website/.env.local
```

That is the only true blocker left between the current codebase and a live beta.
