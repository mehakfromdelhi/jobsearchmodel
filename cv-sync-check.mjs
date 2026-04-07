#!/usr/bin/env node

import { readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = __dirname;

const warnings = [];
const errors = [];

const cvPath = join(projectRoot, "cv.md");
if (!existsSync(cvPath)) {
  errors.push("cv.md not found in project root. Run `npm run onboard` or create it with your resume in markdown.");
} else {
  const cvContent = readFileSync(cvPath, "utf8");
  if (cvContent.trim().length < 100) {
    warnings.push("cv.md seems too short. Make sure it contains your full resume.");
  }
}

const profilePath = join(projectRoot, "config", "profile.yml");
if (!existsSync(profilePath)) {
  errors.push("config/profile.yml not found. Run `npm run onboard` or copy from config/profile.example.yml.");
} else {
  const profileContent = readFileSync(profilePath, "utf8");
  const requiredFields = ["full_name", "email", "location"];
  for (const field of requiredFields) {
    if (!profileContent.includes(field) || profileContent.includes('"Alex Candidate"')) {
      warnings.push(`config/profile.yml may still contain template data. Check field: ${field}`);
      break;
    }
  }
}

const matchingPath = join(projectRoot, "config", "matching-preferences.json");
if (!existsSync(matchingPath)) {
  warnings.push("config/matching-preferences.json not found. Run `npm run onboard` for the easiest setup flow.");
}

const filesToCheck = [
  { path: join(projectRoot, "modes", "_shared.md"), name: "_shared.md" },
  { path: join(projectRoot, "batch", "batch-prompt.md"), name: "batch-prompt.md" },
];
const metricPattern = /\b\d{2,4}\+?\s*(hours?|%|evals?|layers?|tests?|fields?|bases?)\b/gi;

for (const { path, name } of filesToCheck) {
  if (!existsSync(path)) continue;
  const content = readFileSync(path, "utf8");
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("NEVER hardcode") || line.startsWith("#") || line.startsWith("<!--")) continue;
    const matches = line.match(metricPattern);
    if (matches) {
      warnings.push(`${name}:${i + 1} - Possible hardcoded metric: "${matches[0]}". Should this be read from cv.md or article-digest.md?`);
    }
  }
}

const digestPath = join(projectRoot, "article-digest.md");
if (existsSync(digestPath)) {
  const stats = statSync(digestPath);
  const daysSinceModified = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24);
  if (daysSinceModified > 30) {
    warnings.push(`article-digest.md is ${Math.round(daysSinceModified)} days old. Consider updating it if your proof points changed.`);
  }
}

console.log("\n=== Mehak's Job Search Model sync check ===\n");

if (errors.length === 0 && warnings.length === 0) {
  console.log("All checks passed.");
} else {
  if (errors.length) {
    console.log(`ERRORS (${errors.length}):`);
    errors.forEach((error) => console.log(`  ERROR: ${error}`));
  }
  if (warnings.length) {
    console.log(`\nWARNINGS (${warnings.length}):`);
    warnings.forEach((warning) => console.log(`  WARN: ${warning}`));
  }
}

console.log("");
process.exit(errors.length ? 1 : 0);
