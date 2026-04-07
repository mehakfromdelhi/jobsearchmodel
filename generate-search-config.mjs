#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const prefsPath = path.join(projectRoot, "config", "matching-preferences.json");
const outputPath = path.join(projectRoot, "portals.yml");

if (!fs.existsSync(prefsPath)) {
  console.error("config/matching-preferences.json not found.");
  console.error("Run `npm run onboard` first or create the file from config/matching-preferences.example.json.");
  process.exit(1);
}

const prefs = JSON.parse(fs.readFileSync(prefsPath, "utf8"));
fs.writeFileSync(outputPath, buildPortalsYaml(prefs));
console.log("Generated portals.yml from config/matching-preferences.json");

function buildPortalsYaml(input) {
  const targetFunctions = listOrDefault(input.targetFunctions, [
    "Strategy & Operations",
    "GTM / Revenue Operations",
    "Program Management",
  ]);
  const preferredLocations = listOrDefault(input.preferredLocations, ["San Francisco", "New York"]);
  const industries = listOrDefault(input.industriesOfInterest, ["B2B SaaS"]);
  const companies = listOrDefault(input.companiesOfInterest, []);
  const positiveKeywords = dedupe([
    ...listOrDefault(input.positiveKeywords, []),
    ...targetFunctions.flatMap(functionToKeywords),
  ]);
  const negativeKeywords = dedupe(listOrDefault(input.negativeKeywords, []));
  const conceptMatches = dedupe(listOrDefault(input.conceptMatches, []));
  const includeRemote = input.includeRemote !== false;
  const freshnessDays = Number(input.freshnessDays) || 5;
  const dashboardPreference = input.dashboardPreference || "local-only";

  const highLocations = dedupe(preferredLocations.flatMap((loc) => expandLocation(loc).high));
  const mediumLocations = dedupe(preferredLocations.flatMap((loc) => expandLocation(loc).medium));

  const searchQueries = [
    {
      name: "Greenhouse - business roles",
      platform: "greenhouse",
      query: `site:boards.greenhouse.io OR site:job-boards.greenhouse.io ${orGroup(positiveKeywords.slice(0, 10))} ${locationGroup(preferredLocations, includeRemote)}`,
    },
    {
      name: "Ashby - business roles",
      platform: "ashby",
      query: `site:jobs.ashbyhq.com ${orGroup(positiveKeywords.slice(0, 10))} ${locationGroup(preferredLocations, includeRemote)}`,
    },
    {
      name: "Lever - business roles",
      platform: "lever",
      query: `site:jobs.lever.co ${orGroup(positiveKeywords.slice(0, 10))} ${locationGroup(preferredLocations, includeRemote)}`,
    },
    {
      name: "SmartRecruiters and iCIMS - business roles",
      platform: "smartrecruiters",
      query: `site:jobs.smartrecruiters.com OR site:jobs.icims.com OR site:careers.icims.com ${orGroup(positiveKeywords.slice(0, 10))} ${locationGroup(preferredLocations, includeRemote)}`,
    },
    {
      name: "Remote business roles",
      platform: "websearch",
      query: `("remote" OR "remote us" OR "hybrid") ${orGroup(positiveKeywords.slice(0, 8))} ${orGroup(targetFunctions)}`,
    },
    {
      name: "Industry discovery",
      platform: "websearch",
      query: `${orGroup(industries)} ${orGroup(positiveKeywords.slice(0, 8))} ${locationGroup(preferredLocations, includeRemote)}`,
    },
  ];

  if (companies.length) {
    searchQueries.push({
      name: "Company-specific discovery",
      platform: "websearch",
      query: `${orGroup(companies)} ${orGroup(positiveKeywords.slice(0, 8))} ${locationGroup(preferredLocations, includeRemote)}`,
    });
  }

  const trackedCompanies = companies.length
    ? [
        "tracked_companies:",
        ...companies.flatMap((company) => [
          `  - name: ${yamlString(company)}`,
          '    careers_url: ""',
          '    platform: "websearch"',
          "    enabled: true",
          "    seeded_watchlist: true",
          "",
        ]),
      ]
    : ["tracked_companies: []"];

  return [
    "# Public business-role scanner policy for Mehak's Job Search Model",
    "# Generated from config/matching-preferences.json",
    "",
    "discovery:",
    '  mode: "hybrid"',
    "  auto_promote_companies: true",
    '  note: "Use broad business-role discovery first, then promote strong matches into tracked companies."',
    "",
    "platforms:",
    "  priority:",
    ...["greenhouse", "ashby", "lever", "smartrecruiters", "icims", "workday", "workable", "wellfound", "websearch"].map((p) => `    - "${p}"`),
    "  source_quality:",
    "    canonical_primary:",
    ...["greenhouse", "ashby", "lever", "smartrecruiters", "icims", "workday", "workable", "wellfound", "company-careers"].map((p) => `      - "${p}"`),
    "    verification_only:",
    '      - "linkedin-public"',
    "    avoid_as_primary_when_possible:",
    '      - "generic websearch aggregators"',
    '      - "ev.careers"',
    '      - "ziprecruiter"',
    '      - "indeed"',
    '      - "talent.com"',
    "  enabled:",
    ...["greenhouse", "ashby", "lever", "smartrecruiters", "icims", "workday", "workable", "wellfound", "websearch"].map((p) => `    ${p}: true`),
    "",
    "freshness:",
    `  max_age_days: ${freshnessDays}`,
    '  on_missing_date: "review"',
    "  pipeline_gate:",
    "    require_canonical_job_url: true",
    '    canonical_url_note: "Only direct ATS or company careers links belong in the live pipeline."',
    '    closed_role_rule: "Closed or expired roles should be treated as stale immediately."',
    "",
    "linkedin_verification:",
    "  enabled: true",
    '  mode: "public_only"',
    `  relative_date_max_days: ${freshnessDays}`,
    '  fallback_on_block: "review"',
    "  matching_requirements:",
    "    require_same_company: true",
    "    require_same_or_materially_equivalent_title: true",
    "    require_location_alignment: true",
    "    reject_aggregator_search_pages: true",
    "    reject_when_status_says_closed: true",
    "",
    "relevance:",
    "  title_weight: 0.25",
    "  jd_weight: 0.75",
    "  minimum_relevance_score_for_pipeline: 0.8",
    "  title_filter:",
    "    suppress_only: true",
    "    negative:",
    ...negativeKeywords.map((keyword) => `      - ${yamlString(keyword)}`),
    "  keyword_profiles:",
    "    business_roles:",
    ...positiveKeywords.map((keyword) => `      - ${yamlString(keyword)}`),
    "  concept_matches:",
    ...conceptMatches.map((concept) => `    - ${yamlString(concept)}`),
    "",
    "location:",
    "  priority_weight: 0.2",
    `  include_remote_national: ${includeRemote ? "true" : "false"}`,
    "  priority_hubs:",
    "    high:",
    ...highLocations.map((loc) => `      - ${yamlString(loc)}`),
    "    medium:",
    ...mediumLocations.map((loc) => `      - ${yamlString(loc)}`),
    `  remote_policy: ${yamlString(includeRemote ? "Keep remote roles in scope and boost them when tied to target hubs." : "Focus on the listed locations.")}`,
    "",
    "search_queries:",
    ...searchQueries.flatMap((item) => [
      `  - name: ${yamlString(item.name)}`,
      `    platform: ${yamlString(item.platform)}`,
      `    query: ${yamlString(item.query)}`,
      "    enabled: true",
      "",
    ]),
    "verification:",
    "  source_of_truth_order:",
    '    - "direct ATS/company job page"',
    '    - "company careers page metadata"',
    '    - "LinkedIn public job page"',
    "  canonical_url_policy:",
    "    use_direct_job_page_in_pipeline: true",
    "    store_linkedin_only_in_history: true",
    "    keep_aggregator_urls_out_of_pipeline: true",
    "  stale_signals:",
    '    - "no longer accepting applications"',
    '    - "job expired"',
    '    - "posting removed"',
    '    - "position filled"',
    "  review_triggers:",
    '    - "ATS page missing"',
    '    - "LinkedIn match ambiguous"',
    '    - "only aggregator result found"',
    '    - "location mismatch"',
    "",
    "public_template:",
    `  dashboard_preference: ${yamlString(dashboardPreference)}`,
    "  target_functions:",
    ...targetFunctions.map((role) => `    - ${yamlString(role)}`),
    "  industries_of_interest:",
    ...industries.map((industry) => `    - ${yamlString(industry)}`),
    ...trackedCompanies,
  ].join("\n");
}

function listOrDefault(value, fallback) {
  return Array.isArray(value) && value.length ? value : fallback;
}

function dedupe(values) {
  return [...new Set(values.map((value) => String(value).trim()).filter(Boolean))];
}

function functionToKeywords(label) {
  const normalized = label.toLowerCase();
  if (normalized.includes("strategy")) return ["strategy", "business operations", "strategic initiatives"];
  if (normalized.includes("gtm") || normalized.includes("revenue")) return ["go-to-market", "revenue operations", "enablement"];
  if (normalized.includes("program")) return ["program management", "portfolio management", "cross-functional"];
  if (normalized.includes("finance")) return ["strategic finance", "financial modeling", "budget"];
  return [label];
}

function expandLocation(location) {
  const normalized = String(location).toLowerCase();
  if (normalized.includes("san francisco") || normalized.includes("bay area")) {
    return {
      high: ["San Francisco", "Palo Alto", "Mountain View"],
      medium: ["Bay Area", "Oakland", "San Jose", "Remote - San Francisco"],
    };
  }
  if (normalized.includes("new york")) {
    return {
      high: ["New York", "New York City", "Brooklyn", "Manhattan"],
      medium: ["New York Metro", "Jersey City", "Remote - New York"],
    };
  }
  return { high: [location], medium: [] };
}

function orGroup(items) {
  const values = dedupe(items);
  return values.length
    ? `(${values.map((value) => `"${String(value).replace(/"/g, '\\"')}"`).join(" OR ")})`
    : "";
}

function locationGroup(locations, includeRemote) {
  const values = [...locations];
  if (includeRemote) values.push("remote", "hybrid");
  return orGroup(values);
}

function yamlString(value) {
  return JSON.stringify(String(value));
}
