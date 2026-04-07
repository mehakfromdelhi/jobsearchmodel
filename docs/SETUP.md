# Setup Guide

This guide is for someone cloning the repo for the first time and trying to get to a working job-search workflow quickly.

## Who this is for

Mehak's Job Search Model is optimized for business-role job seekers first:

- Strategy & Operations
- GTM / Revenue Operations
- Program Management
- Strategic Finance / planning-adjacent roles

If you are targeting those paths, the defaults should feel useful right away.

## What you need before starting

You should have:

- Node.js installed
- npm available in your terminal
- Claude Code available in the folder you will use
- your resume text ready to paste

Optional:

- a Google Sheet if you want a dashboard
- a Notion workspace if you want a Notion dashboard

## Step 1: Clone the repo

```bash
git clone https://github.com/mehakfromdelhi/jobsearchmodel.git
cd jobsearchmodel
```

## Step 2: Install dependencies

```bash
npm install
npx playwright install chromium
```

Why this matters:
- `npm install` installs the local scripts and dependencies
- Playwright Chromium is needed for PDF generation and some browser-based flows

## Step 3: Run onboarding

```bash
npm run onboard
```

The onboarding flow creates your core personal files:

- `config/profile.yml`
- `config/matching-preferences.json`
- `config/resume-map.md`
- `cv.md`
- `resumes/base.md`

During onboarding, you will paste:

- your resume
- your target functions
- your preferred locations
- your ATS keywords
- industries or companies you care about

## Step 4: Generate your search config

```bash
npm run refresh-search
node cv-sync-check.mjs
```

This step turns your onboarding answers into your live search setup.

## Step 5: Open Claude Code in this repo

Once onboarding is complete, open Claude Code in this folder and use prompts like:

- `Run a fresh job scan for me`
- `Rank the jobs in my live pipeline`
- `Tailor my resume for this job URL`
- `Draft a cover letter for this role`

## Step 6: Optional dashboard setup

You do not need a dashboard to use this repo.

If you want Google Sheets or Notion later:

```bash
cp .env.example .env
node sync-dashboard.mjs --dry-run
node sync-dashboard.mjs --target=sheets
```

Full instructions live in [DASHBOARD_SYNC.md](C:/Users/bmeha/OneDrive/Documents/New%20project/jobsearchmodel-publish/docs/DASHBOARD_SYNC.md).

## Recommended workflow

Use the model in this order:

1. Run a job scan
2. Publish results to your dashboard if you use one
3. Review and rank the roles
4. Pick a target job
5. Tailor your resume
6. Generate your application materials

In plain language:
- ask Claude to find fresh roles
- review the best ones
- tailor only when you have picked a real target

## What success looks like

If setup worked, you should now have:

- a populated `config/profile.yml`
- a `cv.md` file in the repo root
- a `config/matching-preferences.json` file
- a generated `portals.yml`

And you should be able to:

- ask Claude to run a scan
- see results in `data/pipeline.md`
- switch resume variants with `npm run resume -- <variant>`

## Common mistakes

### 1. Skipping onboarding

If you do not run `npm run onboard`, the repo will not know who you are or what roles you want.

### 2. Forgetting `npm run refresh-search`

Onboarding creates your inputs. `npm run refresh-search` turns those inputs into the actual search config.

### 3. Expecting the dashboard before setting up `.env`

Google Sheets and Notion sync are optional. They will not work until you create a local `.env` from `.env.example` and fill in real credentials.

### 4. Using the default keywords without editing them

The defaults are a starting point. The better your keywords match your background and target roles, the better the role matching will be.

### 5. Treating the dashboard as the source of truth

The local repo files are the real source of truth. The dashboard is a published view of that data.

## Next docs to read

- [Guided Onboarding](C:/Users/bmeha/OneDrive/Documents/New%20project/jobsearchmodel-publish/docs/ONBOARDING.md)
- [ATS Keywords](C:/Users/bmeha/OneDrive/Documents/New%20project/jobsearchmodel-publish/docs/ATS_KEYWORDS.md)
- [Dashboard Sync](C:/Users/bmeha/OneDrive/Documents/New%20project/jobsearchmodel-publish/docs/DASHBOARD_SYNC.md)
