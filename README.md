# Mehak's Job Search Model

Public, self-serve job search template for business-role candidates using Claude Code.

This repo is designed for people targeting:
- Strategy & Operations
- GTM / Revenue / Enablement-adjacent roles
- Program Management
- Strategic Finance and planning-adjacent roles

It helps you:
- tailor resumes faster
- match jobs using ATS keywords and JD signals
- scan modern ATS platforms for fresh roles
- track your search locally or in Google Sheets / Notion

## Default Workflow

The intended workflow is:

1. Scan for jobs
2. Publish fresh results to your dashboard
3. Review and rank the roles
4. Pick one role to target
5. Review your resume fit
6. Tailor your resume
7. Generate application materials

In practice, that usually looks like:

```bash
/career-ops scan
node sync-dashboard.mjs --target=sheets
```

Then use Claude to:
- review the jobs in your dashboard
- choose the best-fit role
- tailor `cv.md` or a resume variant
- draft a cover letter or application answers

## Quick Start

```bash
git clone https://github.com/mehakfromdelhi/jobsearchmodel.git
cd jobsearchmodel
npm install
npx playwright install chromium
npm run onboard
npm run refresh-search
node cv-sync-check.mjs
```

Then open Claude Code in this folder and:
- run `/career-ops scan`
- publish results to your dashboard if you want one
- review the best-fit roles
- ask for a tailored resume or cover letter

## First 10 Minutes

1. Run `npm run onboard`
2. Paste your resume when prompted
3. Enter your target functions, ATS keywords, and preferred locations
4. Run `npm run refresh-search`
5. Run your first scan
6. Optionally connect Google Sheets
7. Review the jobs before tailoring your resume

## What you edit

You only need to care about three things:

1. `config/profile.yml`
   Your identity and target roles
2. `cv.md` and `resumes/`
   Your base resume and role-specific variants
3. `config/matching-preferences.json`
   Your ATS keywords, target functions, locations, industries, and watchlist companies

Everything else is engine logic.

## Public Quick Start Flow

```bash
npm run onboard
npm run refresh-search
/career-ops scan
node sync-dashboard.mjs --target=sheets
```

Then:
- review the dashboard
- pick a role
- tailor your resume

## Docs

- [Setup](docs/SETUP.md)
- [Guided Onboarding](docs/ONBOARDING.md)
- [ATS Keywords](docs/ATS_KEYWORDS.md)
- [Dashboard Sync](docs/DASHBOARD_SYNC.md)
- [Example Personas](docs/PERSONAS.md)

## Resume Variants

Start with one base resume:

- `cv.md`
- `resumes/base.md`

Later, add variants like:

- `resumes/strategy-ops.md`
- `resumes/gtm-ops.md`
- `resumes/strategic-finance.md`

Switch the active version with:

```bash
npm run resume -- base
```

## Dashboard Options

Dashboards are optional.

- easiest path: use local files only
- next easiest: connect Google Sheets
- optional: connect Notion too

The local files remain the source of truth.

## Hosted Version Later

This public repo is the source design for a future hosted product. The long-term product entities are:

- profile
- resumes
- keyword sets
- search preferences
- dashboard connections

For now, the repo is the product.

## Public Readiness Notes

- This repo ships with placeholders only in `.env.example`
- Do not commit your real `.env`, `cv.md`, or generated tracker files
- If you connect Google Sheets or Notion, keep those credentials local
