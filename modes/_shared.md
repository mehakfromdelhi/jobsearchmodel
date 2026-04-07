# Shared Context -- Mehak's Job Search Model

## Sources of Truth (ALWAYS read before evaluating)

| File | Path | When |
|------|------|------|
| cv.md | `cv.md` (project root) | ALWAYS |
| resume map | `config/resume-map.md` | Before selecting the active CV for a JD |
| resume variants | `resumes/*.md` | When choosing the best role-specific resume |
| article-digest.md | `article-digest.md` (if exists) | ALWAYS (detailed proof points) |
| profile.yml | `config/profile.yml` | ALWAYS (candidate identity and targets) |

**RULE: NEVER hardcode metrics from proof points.** Read them from `cv.md` + `article-digest.md` at evaluation time.
**RULE: For article/project metrics, `article-digest.md` takes precedence over `cv.md`.**
**RULE: Before each evaluation or PDF generation, detect the JD's function and industry, then select the best approved resume variant using `config/resume-map.md`. If a clear match exists, sync it into `cv.md` with `npm run resume -- <variant>` before continuing.**

---

## North Star -- Target Roles

The skill applies with highest priority to the candidate's core search lanes from `config/profile.yml` and `config/matching-preferences.json`. The public default is business roles: Strategy & Operations, GTM / Revenue Operations, Program Management, and Strategic Finance.

| Archetype | Thematic axes | What they buy |
|-----------|---------------|---------------|
| **Strategy & Operations** | business rhythm, problem solving, operating model, KPI ownership | Someone who turns ambiguity into execution and measurable outcomes |
| **GTM Strategy / GTM Operations** | launch planning, segmentation, pricing, growth, commercial execution | Someone who helps teams find revenue, prioritize bets, and scale go-to-market |
| **Program Management** | cross-functional delivery, workback plans, stakeholder alignment, risk management | Someone who drives complex initiatives from idea to outcome |
| **Business Operations / Strategic Initiatives** | executive support, portfolio management, planning, transformation | Someone who translates leadership priorities into durable execution |
| **Healthtech Operations / Strategy** | healthcare access, service design, process improvement, public-private coordination | Someone who improves operations in mission-driven healthcare environments |
| **Fintech / Analytics Strategy** | financial modeling, pricing, scenario analysis, investment logic | Someone who brings rigor to growth, allocation, and commercial decisions |

### Adaptive Framing by Archetype

> Concrete metrics: read from `cv.md` + `article-digest.md` at evaluation time. Never hardcode numbers here.

| If the role is... | Emphasize about the candidate... | Resume preference |
|-------------------|----------------------------------|-------------------|
| Strategy & Operations | Structured problem solving, executive communication, KPI ownership, operational rigor | strongest strategy/ops variant from `config/resume-map.md` |
| GTM Strategy / GTM Operations | Pricing, segmentation, commercialization, customer insights, launch readiness | strongest GTM / revenue / enablement variant from `config/resume-map.md` |
| Program Management | Cross-functional execution, risk management, cadence, stakeholder orchestration | strongest program-focused variant from `config/resume-map.md` |
| Business Operations / Strategic Initiatives | Portfolio planning, strategic initiatives, operating cadence, leadership enablement | strongest business operations variant from `config/resume-map.md` |
| Healthtech operations or strategy | Service delivery, process optimization, healthcare scale, mission-driven execution | strongest healthcare-aware variant from `config/resume-map.md` |
| Fintech / analytics strategy | Financial modeling, pricing, scenario analysis, investment logic | strongest finance-aware variant from `config/resume-map.md` |

### Exit Narrative (use in ALL framings)

Use the candidate's exit story from `config/profile.yml` to frame all content:
- In PDF summaries: bridge from past to future
- In STAR stories: reference concrete proof points from `cv.md` and `article-digest.md`
- In draft answers: make the transition narrative explicit in the opening answer
- When the JD asks for ownership, strategic thinking, analytical rigor, or cross-functional leadership: increase match weight

### Cross-cutting Advantage

Frame profile as **"operator-strategist who can translate messy problems into structured execution"**:
- For Strategy & Ops: emphasize operating rigor, analytics, and decision support
- For GTM: emphasize market-facing execution, pricing, segmentation, and growth levers
- For Program Management: emphasize cross-functional orchestration, timelines, risks, and delivery
- For industry-specific roles: pull in healthcare, fintech, retail, or enterprise-tech proof points as relevant

Use AI fluency as an enhancer, not the headline, unless the JD explicitly prioritizes AI transformation or workflow automation.

### Comp Intelligence

Use market data by title and level, not by generic skill overlap. Prioritize current benchmarks for:
- Strategy & Operations Manager
- GTM Strategy / GTM Operations
- Program Manager
- Business Operations / Strategic Initiatives

### Location Policy

- Use the actual flexibility from `config/profile.yml`
- Do not over-penalize hybrid roles if commute or relocation is realistic

### Time-to-offer priority

- Strong role match over broad application volume
- Fast, role-specific tailoring over generic perfection
- Apply earlier when the fit is real

---

## Global Rules

### NEVER

1. Invent experience or metrics
2. Rewrite or embellish source resume files
3. Submit applications on behalf of the candidate
4. Share phone number in generated messages
5. Recommend comp below market rate
6. Generate a PDF without reading the JD first
7. Use corporate-speak
8. Ignore the tracker

### ALWAYS

1. Select the best approved resume variant for the JD, then read `cv.md` and `article-digest.md` (if exists) before evaluating any offer
2. Detect the role archetype and adapt framing
3. Cite exact lines from the active CV when matching
4. Use web research for comp and company data when needed
5. Register every evaluated offer in the tracker
6. Generate content in the language of the JD (English default)
7. Be direct and actionable
8. When generating English text, use concise native business English with strong verbs

### Tools

| Tool | Use |
|------|-----|
| WebSearch | Compensation research, company data, and fallback JD discovery |
| WebFetch | Static-page JD extraction fallback |
| Playwright | Offer verification and SPA extraction |
| Read | `cv.md`, `article-digest.md`, `config/profile.yml`, `config/resume-map.md` |
| Write | Temporary HTML for PDF, reports, tracker artifacts |
| Bash | `node generate-pdf.mjs`, `npm run resume -- <variant>` |
