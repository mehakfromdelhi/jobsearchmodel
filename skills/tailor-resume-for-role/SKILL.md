---
name: tailor-resume-for-role
description: Use this skill when a user shares a job description, role URL, or hiring brief and wants help tailoring a resume for ATS keywords and human recruiter fit. Trigger it for repeatable recruiting tasks such as ATS keyword extraction, resume-to-role gap analysis, resume rewriting that stays truthful to the candidate's real experience, and creating a local Word document draft for further editing.
---

# Tailor resume for role

## Overview

Use this skill to run a repeatable resume-tailoring workflow: understand the role, score ATS alignment, assess human fit, identify gaps, rewrite the resume honestly, and create a local Word draft when the user wants an editable file.

## Core workflow

1. Collect the minimum inputs.
2. Deconstruct the role into ATS and recruiter signals.
3. Compare the role against the current resume.
4. Identify fit, gaps, and rewrite priorities.
5. Rewrite the resume without inventing experience.
6. Create a local Word document when requested.

## Inputs to collect

Collect these inputs before rewriting:
- Job description text, role URL, or pasted hiring brief.
- Current resume text or the resume file the user wants edited.
- Optional context: target function, geography, seniority, industry, or priorities.

If the user only shares a role and not a resume, stop after fit analysis and ask for the resume before rewriting.

## Role analysis

Break the role into these buckets:
- Must-have ATS keywords.
- Nice-to-have ATS keywords.
- Core responsibilities.
- Functional themes.
- Seniority cues.
- Cross-functional or leadership signals.
- Industry or domain preferences.

Then produce two views:
- ATS view: explicit keywords, concepts, missing terms, and likely parsing concerns.
- Human-fit view: experience relevance, business context, stakeholder credibility, and likely recruiter objections.

## Resume comparison

Compare the resume against the role in this order:
1. Headline and summary alignment.
2. Skills section coverage.
3. Experience bullets that match the core responsibilities.
4. Metrics and outcomes that strengthen credibility.
5. Missing keywords, missing concepts, or weak framing.

Classify the result in plain language, for example:
- Strong fit.
- Good fit with a few gaps.
- Stretch but viable.
- Weak fit.

## Rewrite rules

When rewriting the resume:
- Keep every claim truthful to the source resume and user-provided context.
- Do not invent employers, titles, metrics, or responsibilities.
- Prefer clearer wording, sharper business impact, and stronger role alignment.
- Prioritize ATS keyword coverage, but keep the resume natural for a human reader.
- Emphasize bullets that directly match the role's core responsibilities.
- De-emphasize low-relevance details when they distract from the target role.
- Preserve a professional, concise resume tone.

## Recommended output structure

Default to this response structure when the user asks for analysis and rewriting:
1. ATS fit summary.
2. Human-fit summary.
3. Key gaps and risks.
4. Resume rewrite strategy.
5. Revised resume draft.
6. Optional next-step suggestions.

## Word document output

If the user asks for a local editable file:
- Generate the revised resume draft first in the response or working context.
- Then create a local `.docx` file in the active workspace or user-specified folder.
- Name it clearly with company or role context when possible.
- Tell the user exactly where the file was saved.
- Use `scripts/export_resume_docx.ps1` when the draft already exists as plain text or markdown in a local file. Pass the input text file, output `.docx` path, and a clear document title.

Example:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/export_resume_docx.ps1 `
  -InputPath C:\path\to\resume-draft.txt `
  -OutputPath C:\path\to\Tailored-Resume.docx `
  -Title "Tailored Resume - Company Role"
```

## Guardrails

- Never optimize for ATS by making the resume dishonest.
- Never fabricate experience to close a gap.
- Flag real gaps clearly instead of hiding them.
- If the role is a weak fit, say so and explain why.
- If the job description is incomplete or noisy, state the uncertainty.
- If the user asks for a Word draft, ensure the edited content exists before exporting.

## Practical defaults

- If the user asks for "ATS fit," include both exact keyword coverage and concept coverage.
- If the user asks for "human fit," focus on likely recruiter interpretation, relevance, and credibility.
- If the user asks for "edit my resume," provide both the rewrite strategy and the rewritten draft.
- If the user asks for a document, create a local `.docx` instead of only leaving the answer in chat.
