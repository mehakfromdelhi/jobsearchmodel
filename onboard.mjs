#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const projectRoot = process.cwd();
const rl = readline.createInterface({ input, output });

console.log("\nMehak's Job Search Model -- guided onboarding\n");

const fullName = await ask("Full name");
const email = await ask("Email");
const phone = await ask("Phone (optional)", "");
const location = await ask("Current location", "San Francisco, CA");
const linkedin = await ask("LinkedIn URL (optional)", "");
const portfolio = await ask("Portfolio URL (optional)", "");
const targetFunctions = splitList(await ask(
  "Target functions (comma separated)",
  "Strategy & Operations, GTM / Revenue Operations, Program Management"
));
const preferredLocations = splitList(await ask(
  "Preferred locations (comma separated)",
  "San Francisco, New York"
));
const industriesOfInterest = splitList(await ask(
  "Industries of interest (comma separated)",
  "B2B SaaS, Healthtech, Fintech"
));
const companiesOfInterest = splitList(await ask(
  "Companies to seed into the watchlist (comma separated, optional)",
  ""
));
const positiveKeywords = splitList(await ask(
  "Positive ATS keywords (comma separated)",
  "strategy, operations, business operations, program management, go-to-market, revenue operations, strategic finance, financial modeling, enablement, cross-functional"
));
const negativeKeywords = splitList(await ask(
  "Negative ATS keywords (comma separated)",
  "intern, junior, software engineer, account executive, sales development"
));
const conceptMatches = splitList(await ask(
  "Concepts that matter even if the title varies (comma separated)",
  "business planning, KPI ownership, stakeholder management, dashboards, budget ownership, execution cadence"
));
const includeRemote = normalizeYesNo(await ask("Include remote roles? (yes/no)", "yes"));
const dashboardPreference = await ask("Dashboard preference (local-only / google-sheets / notion / both)", "local-only");

console.log("\nPaste your resume text below. Finish by typing END_RESUME on its own line.\n");
const resumeLines = [];
while (true) {
  const line = await rl.question("");
  if (line.trim() === "END_RESUME") break;
  resumeLines.push(line);
}

await rl.close();

const resumeText = resumeLines.join("\n").trim();
if (!resumeText) {
  console.error("\nNo resume text was provided.");
  process.exit(1);
}

ensureDir(path.join(projectRoot, "config"));
ensureDir(path.join(projectRoot, "resumes"));
ensureDir(path.join(projectRoot, "data"));

fs.writeFileSync(path.join(projectRoot, "config", "profile.yml"), buildProfileYaml({
  fullName,
  email,
  phone,
  location,
  linkedin,
  portfolio,
  targetFunctions,
}));

fs.writeFileSync(
  path.join(projectRoot, "config", "matching-preferences.json"),
  JSON.stringify({
    targetFunctions,
    preferredLocations,
    includeRemote,
    industriesOfInterest,
    companiesOfInterest,
    positiveKeywords,
    negativeKeywords,
    conceptMatches,
    dashboardPreference,
    freshnessDays: 5,
  }, null, 2) + "\n"
);

const normalizedResume = resumeText.endsWith("\n") ? resumeText : `${resumeText}\n`;
fs.writeFileSync(path.join(projectRoot, "cv.md"), normalizedResume);
fs.writeFileSync(path.join(projectRoot, "resumes", "base.md"), normalizedResume);
fs.writeFileSync(path.join(projectRoot, "config", "resume-map.md"), buildResumeMap(targetFunctions));

const applicationsPath = path.join(projectRoot, "data", "applications.md");
if (!fs.existsSync(applicationsPath)) {
  fs.writeFileSync(
    applicationsPath,
    "# Applications Tracker\n\n| # | Date | Company | Role | Score | Status | PDF | Report | Notes |\n|---|------|---------|------|-------|--------|-----|--------|-------|\n"
  );
}

console.log("\nCreated:");
console.log("- config/profile.yml");
console.log("- config/matching-preferences.json");
console.log("- config/resume-map.md");
console.log("- cv.md");
console.log("- resumes/base.md");
console.log("- data/applications.md");
console.log("\nNext steps:");
console.log("1. Run `npm run refresh-search`");
console.log("2. Run `node cv-sync-check.mjs`");
console.log("3. Open Claude Code here and paste a job URL or run /career-ops scan");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

async function ask(label, fallback = "") {
  const prompt = fallback ? `${label} [${fallback}]: ` : `${label}: `;
  const answer = (await rl.question(prompt)).trim();
  return answer || fallback;
}

function splitList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeYesNo(value) {
  return !/^n(o)?$/i.test(String(value).trim());
}

function buildProfileYaml(values) {
  return [
    "# Mehak's Job Search Model profile",
    "",
    "candidate:",
    `  full_name: ${yamlString(values.fullName)}`,
    `  email: ${yamlString(values.email)}`,
    `  phone: ${yamlString(values.phone)}`,
    `  location: ${yamlString(values.location)}`,
    `  linkedin: ${yamlString(values.linkedin)}`,
    `  portfolio_url: ${yamlString(values.portfolio)}`,
    '  github: ""',
    '  twitter: ""',
    "",
    "target_roles:",
    "  primary:",
    ...values.targetFunctions.map((role) => `    - ${yamlString(role)}`),
    "  archetypes:",
    ...values.targetFunctions.map((role) => `    - name: ${yamlString(role)}\n      level: "Mid-Senior"\n      fit: "primary"`),
    "",
    "narrative:",
    `  headline: ${yamlString(`${values.targetFunctions[0] || "Business-role"} candidate focused on high-fit opportunities`)}`,
    '  exit_story: "Replace this with your own career narrative."',
    "  superpowers:",
    '    - "Structured problem solving"',
    '    - "Cross-functional execution"',
    '    - "Clear communication"',
    "  proof_points: []",
    "",
    "compensation:",
    '  target_range: ""',
    '  currency: "USD"',
    '  minimum: ""',
    '  location_flexibility: ""',
    "",
    "location:",
    '  country: "United States"',
    `  city: ${yamlString(values.location.split(",")[0] || values.location)}`,
    '  timezone: "America/New_York"',
    '  visa_status: ""',
    "",
  ].join("\n");
}

function buildResumeMap(targetFunctions) {
  return [
    "# Resume Selection Map",
    "",
    "Use the files in `resumes/` as your approved variants.",
    "",
    "## Default",
    "",
    "- Default active resume in `cv.md`: `resumes/base.md`",
    "",
    "## Suggested variants to add later",
    "",
    "- `strategy-ops.md`",
    "- `gtm-ops.md`",
    "- `program-management.md`",
    "- `strategic-finance.md`",
    "",
    "## Current target functions",
    "",
    ...targetFunctions.map((role) => `- ${role}`),
    "",
    "## Manual commands",
    "",
    "```bash",
    "npm run resume -- --list",
    "npm run resume -- base",
    "```",
    "",
  ].join("\n");
}

function yamlString(value) {
  return JSON.stringify(String(value || ""));
}
