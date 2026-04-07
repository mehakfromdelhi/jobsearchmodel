# Setup Guide

## Who this is for

Mehak's Job Search Model is optimized for business-role job seekers first:

- Strategy & Operations
- GTM / Revenue Operations
- Program Management
- Strategic Finance / planning-adjacent roles

## Basic setup

```bash
git clone <your-template-repo>
cd <your-template-repo>
npm install
npx playwright install chromium
```

## Guided onboarding

Run:

```bash
npm run onboard
```

That creates your core personal files:

- `config/profile.yml`
- `config/matching-preferences.json`
- `config/resume-map.md`
- `cv.md`
- `resumes/base.md`

Then generate your starter scanner config:

```bash
npm run refresh-search
node cv-sync-check.mjs
```

## Start using it

Open Claude Code in this folder and:

- run `/career-ops scan`
- publish results to a dashboard if you want one
- review the roles that surfaced
- ask for a tailored resume or cover letter for the best-fit role

## Recommended workflow

Use the model in this order:

1. Run a job scan
2. Publish results to your dashboard
3. Review and rank the roles
4. Pick a target job
5. Tailor your resume
6. Generate your application materials

Example:

```bash
/career-ops scan
node sync-dashboard.mjs --target=sheets
```

## Optional dashboard sync

You can use the repo without any dashboard integration.

If you want Google Sheets or Notion later:

```bash
cp .env.example .env
node sync-dashboard.mjs --dry-run
node sync-dashboard.mjs --target=sheets
```

Full instructions: `docs/DASHBOARD_SYNC.md`
