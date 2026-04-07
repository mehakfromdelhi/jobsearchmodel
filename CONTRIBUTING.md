# Contributing to Mehak's Job Search Model

Thanks for your interest in contributing. This repo is a public Claude Code template for business-role job seekers.

## Before submitting a PR

Please open an issue first to discuss the change you want to make. This keeps the template focused and avoids accidental drift away from the business-role use case.

## Good contributions

- improve onboarding or setup docs
- improve business-role matching defaults
- improve dashboard sync guidance
- add better examples for strategy, ops, GTM, program, or strategic finance users
- fix bugs in the scripts or template flow

## Guidelines

- keep the public experience beginner-friendly
- avoid committing personal files like `cv.md`, `.env`, `profile.yml`, tracker data, or generated reports
- prefer business-role defaults over generic all-career abstractions in v1
- test changes from a fresh clone when possible

## Development

```bash
node cv-sync-check.mjs
node verify-pipeline.mjs
```

## Help

- open an issue in this repo
- read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- review [docs/SETUP.md](docs/SETUP.md) and [docs/ONBOARDING.md](docs/ONBOARDING.md)
