# Mehak's Job Search Model -- Public Business-Role Template

## Purpose

This system is a public, self-serve template for business-role job seekers using Claude Code. The default audience is people targeting Strategy & Operations, GTM / Revenue Operations, Program Management, and Strategic Finance-adjacent roles.

The easiest user-editable surfaces are:
- `config/profile.yml`
- `config/matching-preferences.json`
- `cv.md` and `resumes/`

### Main Files

| File | Function |
|------|----------|
| `data/applications.md` | Application tracker |
| `data/pipeline.md` | Live inbox for fresh jobs |
| `data/review-queue.md` | Relevant jobs with unknown or unverified posting dates |
| `data/scan-history.tsv` | Scanner dedup history |
| `portals.yml` | Live scanner policy, discovery config, and promoted companies |
| `.env` / `.env.example` | Optional Google Sheets and Notion dashboard sync config |
| `sync-dashboard.mjs` | One-way publisher for Live Pipeline, Review Queue, and Applications / Archive |
| `templates/cv-template.html` | HTML template for CVs |
| `generate-pdf.mjs` | Puppeteer HTML-to-PDF utility |
| `article-digest.md` | Compact proof points from portfolio or projects (optional) |
| `interview-prep/story-bank.md` | Accumulated STAR stories across evaluations |
| `reports/` | Evaluation reports (format: `{###}-{company-slug}-{YYYY-MM-DD}.md`) |

### First Run - Onboarding

Before doing anything else, check whether the system is set up. Run these checks silently every session:

1. Does `cv.md` exist?
2. Does `config/profile.yml` exist?
3. Does `portals.yml` exist?

If any of these is missing, enter onboarding mode. Do not proceed with scans or evaluations until the basics are in place.

#### Step 1: CV

If `cv.md` is missing, ask:

> "I do not have your resume yet. You can either:
> 1. Paste your resume here and I will convert it to markdown
> 2. Paste your LinkedIn URL and I will extract the key information
> 3. Tell me about your experience and I will draft a resume for you
>
> Which do you prefer?"

Create `cv.md` from what the user provides. Keep it clean markdown with standard sections such as Summary, Experience, Projects, Education, and Skills.

#### Step 2: Profile

If `config/profile.yml` is missing, copy from `config/profile.example.yml` and ask:

> "I need a few details to personalize the system:
> - Your full name and email
> - Your location and timezone
> - What business roles are you targeting?
> - Your salary target range
>
> I will set everything up for you."

Fill in `config/profile.yml` with their answers. Map target roles to the closest business-role archetypes and update `modes/_shared.md` when needed.

#### Step 3: Search Config

If `portals.yml` is missing, say:

> "I will set up the live scanner so it can discover relevant business roles across ATS platforms, prioritize fresh jobs, and customize the keyword matching for your target roles."

Copy `templates/portals.example.yml` to `portals.yml`. If the user already provided target roles, customize the scan policy, relevance keywords, freshness rules, and ATS search queries.

#### Step 4: Tracker

If `data/applications.md` does not exist, create it:

```markdown
# Applications Tracker

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
|---|------|---------|------|-------|--------|-----|--------|-------|
```

#### Step 4b: Dashboard Sync

If the user wants Google Sheets or Notion dashboards, say:

> "I can keep the local files as the source of truth and publish three clean dashboard views: Live Pipeline, Review Queue, and Applications / Archive."

Use `.env.example` as the template and then configure `sync-dashboard.mjs`.

#### Step 5: Ready

Once all files exist, confirm:

> "You are all set. You can now:
> - Paste a job URL to evaluate it
> - Ask me to run a job scan across live ATS sources
> - Ask me to publish the latest results to your dashboard
>
> Everything is customizable, so ask me to change anything you want.
>
> Tip: A simple personal portfolio, deal sheet, or project page can strengthen business-role applications, especially for strategy, operations, GTM, and program management roles."

Then suggest automation:

> "Want me to scan for new roles automatically? I can set up a recurring scan every few days so you do not miss anything. Just say 'scan every 3 days' and I will configure it."

If the user accepts, use the `/loop` or `/schedule` skill when available to set up a recurring job scan. Otherwise, suggest adding a scheduled reminder or recurring task.

### Personalization

This system is designed to be customized directly. When the user asks to change role families, scoring logic, companies, keywords, or document templates, edit the files directly.

Common customization requests:
- "Change the target functions to strategy ops, GTM, program management, or strategic finance" -> edit `modes/_shared.md`
- "Translate the modes to English" -> edit files in `modes/`
- "Add these companies to my watchlist" -> edit `portals.yml`
- "Update my profile" -> edit `config/profile.yml`
- "Change the CV template design" -> edit `templates/cv-template.html`
- "Adjust the scoring weights" -> edit `modes/_shared.md` and `batch/batch-prompt.md`

### Skill Modes

| If the user... | Mode |
|----------------|------|
| Pastes a JD or URL | auto-pipeline |
| Asks to evaluate an offer | `oferta` |
| Asks to compare offers | `ofertas` |
| Wants LinkedIn outreach | `contacto` |
| Asks for company research | `deep` |
| Wants to generate CV or PDF | `pdf` |
| Evaluates a course or cert | `training` |
| Evaluates a portfolio project | `project` |
| Asks about application status | `tracker` |
| Fills out an application form | `apply` |
| Searches for new offers | `scan` |
| Processes pending URLs | `pipeline` |
| Batch processes offers | `batch` |

### CV Source of Truth

- `cv.md` in the project root is the canonical CV
- `article-digest.md` can hold detailed proof points
- Never hardcode metrics; read them from the user files at evaluation time

---

## Ethical Use

This system is designed for quality, not quantity. The goal is to help the user find and apply to roles where there is a genuine match.

- Never submit an application without the user reviewing it first
- Discourage low-fit applications when the score is weak
- Favor fewer, stronger applications over broad volume
- Respect recruiters' time by keeping applications thoughtful and relevant

---

## Offer Verification

Do not rely on generic search results alone to verify whether a role is still active. Prefer the direct ATS or company careers page, and use LinkedIn only as a secondary freshness signal when appropriate.

---

## Stack and Conventions

- Node.js (`.mjs` modules), Playwright, YAML, HTML/CSS, Markdown
- Scripts live in `.mjs` files
- Output goes in `output/` (gitignored), reports in `reports/`
- Job descriptions can be stored in `jds/`
- Batch tooling lives in `batch/`
- Report numbering is sequential and zero-padded
- After a batch of evaluations, run `node merge-tracker.mjs`
- Do not create duplicate entries in `applications.md` for the same company and role

### TSV Format for Tracker Additions

Write one TSV file per evaluation to `batch/tracker-additions/{num}-{company-slug}.tsv`. Use a single line with nine tab-separated columns:

```
{num}\t{date}\t{company}\t{role}\t{status}\t{score}/5\t{pdf_emoji}\t[{num}](reports/{num}-{slug}-{date}.md)\t{note}
```

Column order:
1. `num`
2. `date`
3. `company`
4. `role`
5. `status`
6. `score`
7. `pdf`
8. `report`
9. `notes`

### Pipeline Integrity

1. Do not add new tracker entries directly to `applications.md`; write TSV rows and merge them
2. You may update status or notes for existing entries
3. Reports should include `URL` in the header
4. Status values should stay canonical
5. Useful maintenance commands:
   - `node verify-pipeline.mjs`
   - `node normalize-statuses.mjs`
   - `node dedup-tracker.mjs`
   - `node sync-dashboard.mjs --dry-run`

### Canonical States

Source of truth: `templates/states.yml`

| State | When to use |
|-------|-------------|
| `Evaluated` | Report completed, pending decision |
| `Applied` | Application sent |
| `Responded` | Company responded |
| `Interview` | In interview process |
| `Offer` | Offer received |
| `Rejected` | Rejected by company |
| `Discarded` | Discarded by candidate or role closed |
| `SKIP` | Not a fit |

Rules:
- No markdown bold in status values
- No dates in the status field
- Put extra detail in notes, not status
