# Customization Guide

This template is intentionally opinionated for business roles first. The easiest things to customize are:

- your profile
- your resumes
- your ATS matching preferences

## Profile

Edit:

- `config/profile.yml`

This is the source of truth for:
- name and contact info
- target roles
- narrative
- compensation preferences
- location preferences

## ATS matching preferences

Edit:

- `config/matching-preferences.json`

This is where you customize:
- target functions
- preferred locations
- industries of interest
- companies to seed into the watchlist
- positive keywords
- negative keywords
- concept matches

Then regenerate your scanner config:

```bash
npm run refresh-search
```

## Resume variants

Keep your active resume in:

- `cv.md`

Store reusable variants in:

- `resumes/`

Common business-role variants:
- `strategy-ops.md`
- `gtm-ops.md`
- `program-management.md`
- `strategic-finance.md`

Switch variants with:

```bash
npm run resume -- strategy-ops
```

## Dashboard setup

Dashboards are optional. If you want one:

- Google Sheets is the easiest default
- Notion is optional second

See:

- `docs/DASHBOARD_SYNC.md`
