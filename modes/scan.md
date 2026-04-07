# Mode: scan -- Live ATS Discovery and Prioritized Tracking

Scan modern job platforms, score jobs primarily from JD content, enrich companies with funding and location signals, and route only fresh jobs into the live pipeline.

## Core intent

The scanner is not a static company watchlist anymore. It should:
- discover jobs broadly across ATS platforms
- keep all relevant companies in scope
- prioritize, not reject, based on funding, investor quality, and geography
- prefer JD-content relevance over title matching
- keep the main tracker fresh by only inserting jobs posted within the last 5 days

## Configuration

Read `portals.yml` before doing anything. Treat these sections as mandatory:
- `discovery`
- `platforms`
- `freshness`
- `linkedin_verification`
- `funding`
- `relevance`
- `location`
- `verification`
- `search_queries`
- `tracked_companies`

Read these data files too:
- `data/scan-history.tsv` -- all previously seen jobs and enrichment metadata
- `data/pipeline.md` -- live inbox for fresh jobs
- `data/review-queue.md` -- relevant jobs with missing/unverified posting dates
- `data/applications.md` if it exists -- dedup against already-evaluated jobs and support archive publishing

## Discovery model

Use hybrid discovery:
1. Broad discovery across enabled ATS/search sources to find new companies and jobs
2. Seed scans with the watchlists in `portals.yml` so early discovery is not limited to already-promoted companies
3. Promote any newly relevant company into `tracked_companies` for future direct scans
4. Prefer direct company-career-page checks for seeded and promoted companies on later scans

Do not require a manual company list first.

## Supported platforms

Treat these as the primary ATS sources, in this order:
1. Greenhouse
2. Ashby
3. Lever
4. SmartRecruiters
5. iCIMS
6. Workday

Supplemental discovery sources:
- Workable
- Wellfound
- general web search

## Output record shape

Normalize every discovered job into this record before filtering:

`{title, url, company, platform, jd_text, location_raw, location_normalized, posted_date_source, posted_date_linkedin, freshness_source, date_confidence, funding_stage, funding_recency, preferred_investor_match, investor_signals, linkedin_url, linkedin_posted_text, company_priority, relevance_score, decision_reason, status}`

## Workflow

1. Read `portals.yml`
2. Read `data/scan-history.tsv`
3. Read `data/pipeline.md`, `data/review-queue.md`, and `data/applications.md` if present

4. Discover jobs from 2 channels:
   - Broad ATS/search discovery using every enabled `search_queries` entry
   - Direct company scan for any company already present in `tracked_companies`

5. Expand direct scanning coverage intentionally:
   - use `watchlists` and `tracked_companies` together as the direct ATS crawl seed set
   - favor canonical ATS pages and APIs where detectable
   - treat investor portfolios, startup ecosystem lists, and prior promoted companies as compounding sources for new direct scans

6. For each discovered job:
   - extract title, URL, company, platform
   - prefer a canonical ATS or direct company-careers job URL as the primary job record whenever available
   - do not use LinkedIn or aggregator URLs as the live pipeline URL if a direct job page exists
   - open the job page when needed and read the JD body
   - extract or estimate location from JD text, metadata, or company careers page
   - extract or confirm posted date from the page, metadata, or platform signals
   - if the ATS/source date is missing or weak, search LinkedIn Jobs publicly for the same company + role and optionally location
   - if a public LinkedIn match is found, extract relative freshness text such as `posted today`, `4 days ago`, or `1 week ago`
   - normalize that LinkedIn freshness into `posted_date_linkedin` or a bounded freshness outcome
   - reject LinkedIn matches that are only search or category pages, have ambiguous role/company alignment, or say the role is no longer accepting applications
   - enrich company with funding and investor metadata using sources listed in `portals.yml`

7. Score relevance using JD content first and title second:
   - title is only a weak heuristic
   - responsibilities, qualifications, tools, and operating-scope language are the primary match signal
   - use the keyword profiles and concept matches in `portals.yml`
   - suppress only obvious mismatches from the negative title filter

8. Compute company and job priority:
   - funding priority from recency + preferred-investor signals
   - location priority from Bay Area / San Francisco / New York hub matching
   - relevance priority from JD-content score
   - combine these into an overall job priority label such as `high`, `medium`, or `low`

9. Apply freshness routing:
   - prefer an explicit ATS/source date when it is reliable
   - if ATS/source date is missing or weak, use LinkedIn public freshness if the match is clear
   - if either ATS/source date or LinkedIn verifies freshness within `freshness.max_age_days`, the job is eligible for the live pipeline only if a canonical direct job URL is available
   - if LinkedIn indicates `1 week ago` or older, treat the role as stale even when the ATS page has no date
   - if any source says `no longer accepting applications`, `job expired`, `posting removed`, or equivalent, treat the role as stale
   - if neither ATS/source nor LinkedIn can verify freshness, route the job to `data/review-queue.md`
   - if only an aggregator result exists and no canonical direct job page is available, route to review instead of pipeline

10. Deduplicate against:
   - exact URL in `data/scan-history.tsv`
   - exact URL in `data/pipeline.md`
   - exact URL in `data/review-queue.md`
   - normalized company + role pairs in `data/applications.md`

11. Persist outcomes:
   - fresh + relevant jobs with canonical direct job pages -> append to `data/pipeline.md`
   - relevant but unknown-date jobs -> append to `data/review-queue.md`
   - every seen job -> append one record to `data/scan-history.tsv`
   - applications or stale-but-important roles can remain out of the live pipeline and still be published later through the external dashboard archive view

12. Promotion rule:
   - if a company yields a relevant job and is not already in `tracked_companies`, add it to `tracked_companies`
   - save canonical careers URL and platform when detectable
   - this promotion is for future live scans, not filtering

## Relevance scoring guidance

Use JD-body evidence to score relevance. Strong signals include:
- strategy
- operations
- GTM
- go-to-market
- revenue operations
- growth operations
- program management
- strategic initiatives
- enablement
- financial modeling / financial modelling
- budget
- finance
- capacity planning
- portfolio management
- KPI ownership
- dashboards
- SQL
- cross-functional execution
- business reviews
- launch and commercialization

Title matching should never exclude a role that has strong JD overlap.

## LinkedIn freshness verification

LinkedIn is a secondary freshness-verification layer only. It is not a discovery source of truth.

Use only public-access LinkedIn job pages:
- do not depend on a logged-in session
- if LinkedIn is blocked, inaccessible, or ambiguous, fall back to review

LinkedIn verification is acceptable only when the match is clear:
- same company
- same or materially equivalent role
- plausible same location or remote pattern
- direct public job page, not a generic search/category page

Normalize LinkedIn relative date phrases like this:
- `posted today`, `1 day ago`, `4 days ago` -> eligible
- `5 days ago` -> eligible
- `1 week ago` or older -> stale
- `reposted`, partial labels, or ambiguous language -> review unless another strong source date exists
- `no longer accepting applications` -> stale

## Funding and investor enrichment

Do not reject any company due to stage or maturity. Use funding data only for prioritization.

Priority sources:
- PitchBook
- Crunchbase
- company funding pages
- recent press releases
- investor portfolio pages
- funding-news coverage

Preferred investor examples:
- Sequoia
- Andreessen Horowitz / a16z
- General Catalyst
- Khosla Ventures
- Founders Fund
- Alumni Ventures
- Y Combinator
- similar firms

Priority interpretation:
- high: recent funding and/or strong preferred-investor signal
- medium: credible growth signal with weaker funding evidence
- low: no clear funding signal but still relevant

## Location prioritization

Do not reject jobs by location. Use location for ranking only.

High-priority hubs:
- San Francisco
- broader Bay Area cities
- New York City / Manhattan / Brooklyn

Medium-priority locations:
- broader Bay Area / New York metro
- remote roles tied to Bay Area or New York offices

## File formats

### `data/pipeline.md`

Append fresh jobs under `## Pending` using:

`- [ ] {url} | {company} | {title} | {platform} | posted {YYYY-MM-DD} | priority {high|medium|low}`

Pipeline URL rule:
- `{url}` should be the canonical ATS or direct company-careers job page whenever possible
- do not use LinkedIn or aggregator URLs in the pipeline if a direct job page exists

### `data/review-queue.md`

Append relevant jobs with unverified dates under `## Needs Review` using:

`- [ ] {url} | {company} | {title} | {platform} | date unknown | priority {high|medium|low} | reason: ATS date missing, LinkedIn public date unavailable`

### `data/scan-history.tsv`

Write every seen job with this header:

`url	first_seen	portal	title	company	status	posted_date_source	posted_date_linkedin	freshness_source	date_confidence	funding_stage	funding_recency	preferred_investor_match	investor_signals	linkedin_url	linkedin_posted_text	location_normalized	location_priority	company_priority	relevance_score	decision_reason`

Status values:
- `added_pipeline`
- `added_review`
- `skipped_dup`
- `skipped_irrelevant`
- `skipped_stale`

## Output summary

At the end of a scan, report:
- sources scanned
- watchlists seeded
- jobs discovered
- relevant jobs scored
- fresh jobs added to pipeline
- unknown-date jobs added to review queue
- stale jobs skipped
- jobs verified by LinkedIn
- companies promoted into tracked live-watch
