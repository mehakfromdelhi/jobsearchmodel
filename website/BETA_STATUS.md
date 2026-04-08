# Website Beta Status

## Live URL

- [https://jobsearchmodel.vercel.app](https://jobsearchmodel.vercel.app)

## What This Website Is

This is the web version of Mehak's Job Search Model.

It is being built as a lightweight, invite-only recruiting operating system for business-role candidates. The intended user flow is:

1. sign in
2. onboard
3. upload resume and preferences
4. run a manual scan
5. review live pipeline and review queue
6. tailor a resume for one selected role
7. track application status

## Current Status

Working now:
- Vercel production deployment is live
- Supabase project is connected
- Prisma schema is pushed to the database
- homepage is reachable
- invite-only checks are wired
- website pages build successfully in production mode

Still being tested or debugged:
- live magic-link sign-in flow
- fallback beta sign-in link behavior when Supabase email delivery is restricted
- end-to-end onboarding in production

## What We Are Doing

The current phase is not feature expansion. It is beta stabilization.

That means the main goals right now are:
- make sign-in reliable
- make onboarding complete successfully
- confirm dashboard and scan flow work in production
- make the product understandable for first-time testers

## Intended Beta Workflow

The website is meant to replace the external dashboard for early testers.

The workflow is:

1. open the live app
2. sign in with an invite-listed email
3. complete onboarding
4. run a scan from the dashboard
5. review live pipeline and review queue
6. open a job detail page
7. tailor a resume or generate a cover letter
8. mark roles applied or archive them

## For Testers

If you are testing the live beta:
- expect invite-only access
- expect some flows to still be under active debugging
- use the live homepage first, then try sign-in
- report exactly which page broke, what you clicked, and what error you saw
