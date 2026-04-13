# Website Beta Status

## Live URL

- [https://jobsearchmodel.vercel.app](https://jobsearchmodel.vercel.app)

## What This Website Is

This is the web version of Mehak's Job Search Model.

It is being built as a lightweight, invite-only role-matching workspace for business-role candidates. The intended user flow is:

1. sign in
2. onboard with multiple resumes and ATS preferences
3. submit one or many job URLs
4. analyze ATS fit and HR fit across all resume-role pairs
5. inspect the best matching resume for each role
6. generate a revised resume in-app
7. optionally download it as a basic `.docx`
8. review the last 10 runs in History

## Current Status

Working now:
- Vercel production deployment is live
- Supabase project is connected
- Prisma schema is pushed to the database
- homepage is reachable
- invite-only checks are wired
- website pages build successfully in production mode
- multiple resumes can be stored during onboarding
- multiple URLs can be analyzed in one run
- history is limited to the last 10 analyses
- revised resumes are shown in-app instead of being saved locally

Still being tested or debugged:
- live magic-link sign-in flow
- fallback beta sign-in link behavior when Supabase email delivery is restricted
- end-to-end beta flow in production with real users

## What We Are Doing

The current phase is product refocus plus beta stabilization.

That means the main goals right now are:
- make sign-in reliable
- make onboarding complete successfully
- confirm multi-resume analysis works in production
- confirm revised resume generation and `.docx` download work
- make the product understandable for first-time testers

## Intended Beta Workflow

The website is meant to replace the external dashboard for early testers.

The workflow is:

1. open the live app
2. sign in with an invite-listed email
3. complete onboarding
4. choose one or more stored resumes
5. optionally paste a new one-off resume for that run
6. paste one or more job URLs
7. review ATS and HR-fit results
8. generate a revised resume in-app and optionally export it as `.docx`

## For Testers

If you are testing the live beta:
- expect invite-only access
- expect some flows to still be under active debugging
- use the live homepage first, then try sign-in
- report exactly which page broke, what you clicked, and what error you saw
