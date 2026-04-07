# Dashboard Sync

Mehak's Job Search Model keeps local files as the source of truth and can publish three clean external views:

- `Live Pipeline`
- `Review Queue`
- `Applications / Archive`

Use the exporter from the project root:

```bash
npm run sync-dashboard -- --dry-run
```

Then publish to one or both targets:

```bash
npm run sync-dashboard -- --target=sheets
npm run sync-dashboard -- --target=notion
npm run sync-dashboard -- --target=all
```

## Local source files

The exporter reads:

- `data/pipeline.md`
- `data/review-queue.md`
- `data/applications.md`
- `data/scan-history.tsv`

## Google Sheets setup

1. Create a Google Cloud service account with Sheets access.
2. Share the target spreadsheet with the service-account email.
3. Copy `.env.example` to `.env`.
4. Fill in:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
   - `GOOGLE_SHEETS_SPREADSHEET_ID`
   - optional tab names for pipeline, review, and archive

The committed `.env.example` file should always contain placeholders only. Never commit real credentials.

The sync command creates tabs if they do not already exist and then overwrites each tab from local canonical data.

## Notion setup

You can use either pre-created databases or let the exporter create them under a parent page.

Required:

- `NOTION_TOKEN`
- either:
  - `NOTION_PIPELINE_DATABASE_ID`, `NOTION_REVIEW_DATABASE_ID`, and `NOTION_ARCHIVE_DATABASE_ID`
  - or `NOTION_PARENT_PAGE_ID`

The Notion exporter upserts records by stable external key so re-running sync updates rows instead of duplicating them.

## Exported fields

Every external record is normalized to the same shape:

- `External Key`
- `Title`
- `Company`
- `Role`
- `Source URL`
- `Source Platform`
- `Workflow State`
- `Freshness Status`
- `Posted Date`
- `Freshness Source`
- `Relevance Score`
- `Company Priority`
- `Location`
- `Investor/Funding Summary`
- `Notes`

## Workflow notes

- `Live Pipeline` only contains fresh verified roles.
- `Review Queue` contains relevant roles with uncertain freshness.
- `Applications / Archive` combines your tracked applications with stale roles preserved from scan history.
- This is a one-way export. Edit local files first, then publish outward.
