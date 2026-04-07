# Guided Onboarding

Mehak's Job Search Model is designed to be usable without manual YAML editing.

## First-time setup

From the project root:

```bash
npm install
npx playwright install chromium
npm run onboard
npm run refresh-search
node cv-sync-check.mjs
```

The onboarding flow asks for:

- contact info
- target business functions
- preferred locations
- industries and companies of interest
- ATS keywords and exclusions
- resume text
- dashboard preference

It generates:

- `config/profile.yml`
- `config/matching-preferences.json`
- `config/resume-map.md`
- `cv.md`
- `resumes/base.md`
- `portals.yml` after `npm run refresh-search`

## How you should use it day to day

After onboarding, the default workflow is:

1. Scan for jobs
2. Publish results to your dashboard
3. Review and rank the jobs
4. Choose the best-fit role
5. Tailor `cv.md` or a resume variant
6. Generate a cover letter or application answers

Typical commands:

```bash
/career-ops scan
node sync-dashboard.mjs --target=sheets
```

## Updating your setup later

- Update your resume in `cv.md` or add role-specific files under `resumes/`
- Update ATS keywords, industries, companies, or locations in `config/matching-preferences.json`
- Regenerate the scanner config with:

```bash
npm run refresh-search
```

## Resume variants

Start with `resumes/base.md`. Later, add targeted versions like:

- `strategy-ops.md`
- `gtm-ops.md`
- `strategic-finance.md`

Switch the active version with:

```bash
npm run resume -- strategy-ops
```
