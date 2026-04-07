#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
loadDotEnv(path.join(root, ".env"));

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const targetArg = [...args].find((arg) => arg.startsWith("--target="));
const target = targetArg ? targetArg.split("=")[1] : "all";

const views = loadViews(root);

if (dryRun) {
  printSummary(views);
  process.exit(0);
}

if (target === "all" || target === "sheets") {
  await syncGoogleSheets(views);
}

if (target === "all" || target === "notion") {
  await syncNotion(views);
}

printSummary(views);

function loadViews(projectRoot) {
  const scanHistory = parseTsv(path.join(projectRoot, "data", "scan-history.tsv"));
  const historyByUrl = new Map(scanHistory.map((row) => [row.url, row]));
  const historyByCompanyRole = new Map(
    scanHistory.map((row) => [`${normalize(row.company)}::${normalize(row.title)}`, row])
  );

  const pipeline = parseChecklistFile(path.join(projectRoot, "data", "pipeline.md"), "pipeline", historyByUrl, historyByCompanyRole);
  const review = parseChecklistFile(path.join(projectRoot, "data", "review-queue.md"), "review", historyByUrl, historyByCompanyRole);
  const applications = parseApplications(path.join(projectRoot, "data", "applications.md"), historyByUrl, historyByCompanyRole);
  const archive = [...applications, ...parseArchive(scanHistory, applications)];

  return {
    pipeline,
    review,
    archive,
  };
}

function parseChecklistFile(filePath, view, historyByUrl, historyByCompanyRole) {
  if (!existsSync(filePath)) return [];
  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
  const rows = [];

  for (const line of lines) {
    if (!line.startsWith("- [")) continue;
    const body = line.replace(/^- \[[ xX]\]\s*/, "");
    const parts = body.split(" | ").map((part) => part.trim());
    if (parts.length < 4) continue;

    const url = parts[0];
    const company = parts[1];
    const role = parts[2];
    const sourcePlatform = parts[3];
    const meta = Object.fromEntries(
      parts.slice(4).map((part) => {
        const posted = part.match(/^posted\s+(.+)$/i);
        if (posted) return ["posted_date", posted[1]];
        const priority = part.match(/^priority\s+(.+)$/i);
        if (priority) return ["company_priority", priority[1]];
        const reason = part.match(/^reason:\s*(.+)$/i);
        if (reason) return ["notes", reason[1]];
        return [part, part];
      })
    );

    const history = historyByUrl.get(url) || historyByCompanyRole.get(`${normalize(company)}::${normalize(role)}`) || {};
    rows.push(buildRecord({
      externalKey: makeExternalKey(company, role, url),
      title: `${company} - ${role}`,
      company,
      role,
      sourceUrl: url,
      sourcePlatform,
      workflowState: view === "pipeline" ? "Live Pipeline" : "Review Queue",
      freshnessStatus: view === "pipeline" ? "fresh_verified" : "needs_review",
      postedDate: normalizeDate(meta.posted_date || history.posted_date_linkedin || history.posted_date_source),
      freshnessSource: history.freshness_source || "unknown",
      relevanceScore: toNumber(history.relevance_score),
      companyPriority: meta.company_priority || history.company_priority || "",
      location: history.location_normalized || "",
      investorFundingSummary: compactFundingSummary(history),
      notes: meta.notes || history.decision_reason || "",
    }));
  }

  return rows;
}

function parseApplications(filePath, historyByUrl, historyByCompanyRole) {
  if (!existsSync(filePath)) return [];
  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
  const rows = [];

  for (const line of lines) {
    if (!line.startsWith("|")) continue;
    if (line.includes("| # ") || line.includes("|---")) continue;
    const parts = line.split("|").slice(1, -1).map((part) => part.trim());
    if (parts.length < 9) continue;
    const [, date, company, role, scoreRaw, status, pdfCell, reportCell, notes] = parts;
    const linkedUrl = extractMarkdownLink(reportCell) || extractMarkdownLink(notes) || "";
    const history = historyByCompanyRole.get(`${normalize(company)}::${normalize(role)}`) || historyByUrl.get(linkedUrl) || {};

    rows.push(buildRecord({
      externalKey: makeExternalKey(company, role, linkedUrl || reportCell),
      title: `${company} - ${role}`,
      company,
      role,
      sourceUrl: history.url || linkedUrl,
      sourcePlatform: history.portal || "",
      workflowState: "Applications / Archive",
      freshnessStatus: normalizeApplicationStatus(status),
      postedDate: normalizeDate(history.posted_date_linkedin || history.posted_date_source),
      freshnessSource: history.freshness_source || "",
      relevanceScore: toNumber(scoreRaw.replace("/5", "")),
      companyPriority: history.company_priority || "",
      location: history.location_normalized || "",
      investorFundingSummary: compactFundingSummary(history),
      notes: [date, status, pdfCell, notes].filter(Boolean).join(" | "),
    }));
  }

  return rows;
}

function parseArchive(scanHistory, applications) {
  const appKeys = new Set(applications.map((row) => row.externalKey));
  return scanHistory
    .filter((row) => row.status === "skipped_stale")
    .map((row) =>
      buildRecord({
        externalKey: makeExternalKey(row.company, row.title, row.url),
        title: `${row.company} - ${row.title}`,
        company: row.company,
        role: row.title,
        sourceUrl: row.url,
        sourcePlatform: row.portal,
        workflowState: "Applications / Archive",
        freshnessStatus: "stale",
        postedDate: normalizeDate(row.posted_date_linkedin || row.posted_date_source),
        freshnessSource: row.freshness_source || "",
        relevanceScore: toNumber(row.relevance_score),
        companyPriority: row.company_priority || "",
        location: row.location_normalized || "",
        investorFundingSummary: compactFundingSummary(row),
        notes: row.decision_reason || "",
      })
    )
    .filter((row) => !appKeys.has(row.externalKey));
}

function parseTsv(filePath) {
  if (!existsSync(filePath)) return [];
  const lines = readFileSync(filePath, "utf8").split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split("\t");
  return lines.slice(1).map((line) => {
    const values = line.split("\t");
    return Object.fromEntries(headers.map((header, i) => [header, values[i] ?? ""]));
  });
}

function buildRecord(fields) {
  return {
    externalKey: fields.externalKey,
    title: fields.title,
    company: fields.company,
    role: fields.role,
    sourceUrl: fields.sourceUrl,
    sourcePlatform: fields.sourcePlatform,
    workflowState: fields.workflowState,
    freshnessStatus: fields.freshnessStatus,
    postedDate: fields.postedDate,
    freshnessSource: fields.freshnessSource,
    relevanceScore: fields.relevanceScore,
    companyPriority: fields.companyPriority,
    location: fields.location,
    investorFundingSummary: fields.investorFundingSummary,
    notes: fields.notes,
  };
}

async function syncGoogleSheets(views) {
  const spreadsheetId = requiredEnv("GOOGLE_SHEETS_SPREADSHEET_ID");
  const token = await getGoogleAccessToken();
  const metadata = await googleRequest(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, token);
  const existingTabs = new Set((metadata.sheets || []).map((sheet) => sheet.properties?.title));

  const tabConfig = [
    [process.env.GOOGLE_SHEETS_PIPELINE_TAB || "Live Pipeline", views.pipeline],
    [process.env.GOOGLE_SHEETS_REVIEW_TAB || "Review Queue", views.review],
    [process.env.GOOGLE_SHEETS_ARCHIVE_TAB || "Applications Archive", views.archive],
  ];

  for (const [sheetName] of tabConfig) {
    if (!existingTabs.has(sheetName)) {
      await googleRequest(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, token, {
        method: "POST",
        body: JSON.stringify({ requests: [{ addSheet: { properties: { title: sheetName } } }] }),
      });
    }
  }

  for (const [sheetName, rows] of tabConfig) {
    const values = toSheetValues(rows);
    await googleRequest(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A:Z?valueInputOption=RAW`, token, {
      method: "PUT",
      body: JSON.stringify({ values }),
    });
  }
}

async function syncNotion(views) {
  const token = requiredEnv("NOTION_TOKEN");
  const version = process.env.NOTION_VERSION || "2022-06-28";

  const databases = {
    pipeline: await getOrCreateNotionDatabase("NOTION_PIPELINE_DATABASE_ID", "Live Pipeline", token, version),
    review: await getOrCreateNotionDatabase("NOTION_REVIEW_DATABASE_ID", "Review Queue", token, version),
    archive: await getOrCreateNotionDatabase("NOTION_ARCHIVE_DATABASE_ID", "Applications Archive", token, version),
  };

  await upsertNotionRecords(databases.pipeline, views.pipeline, token, version);
  await upsertNotionRecords(databases.review, views.review, token, version);
  await upsertNotionRecords(databases.archive, views.archive, token, version);
}

async function getOrCreateNotionDatabase(envKey, title, token, version) {
  if (process.env[envKey]) return process.env[envKey];
  const parentPageId = process.env.NOTION_PARENT_PAGE_ID;
  if (!parentPageId) {
    throw new Error(`Missing ${envKey} and NOTION_PARENT_PAGE_ID`);
  }
  const response = await fetch("https://api.notion.com/v1/databases", {
    method: "POST",
    headers: notionHeaders(token, version),
    body: JSON.stringify({
      parent: { type: "page_id", page_id: parentPageId },
      title: [{ type: "text", text: { content: title } }],
      properties: notionSchema(),
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create Notion database ${title}: ${await response.text()}`);
  }
  const json = await response.json();
  return json.id;
}

async function upsertNotionRecords(databaseId, records, token, version) {
  const existing = await fetchAllNotionPages(databaseId, token, version);
  const existingByKey = new Map(
    existing
      .map((page) => [extractExternalKey(page), page.id])
      .filter(([key]) => key)
  );

  for (const record of records) {
    const payload = {
      parent: { database_id: databaseId },
      properties: toNotionProperties(record),
    };
    const existingId = existingByKey.get(record.externalKey);
    const url = existingId ? `https://api.notion.com/v1/pages/${existingId}` : "https://api.notion.com/v1/pages";
    const method = existingId ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: notionHeaders(token, version),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Failed to upsert Notion page for ${record.title}: ${await response.text()}`);
    }
  }
}

async function fetchAllNotionPages(databaseId, token, version) {
  const results = [];
  let cursor = undefined;
  while (true) {
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: "POST",
      headers: notionHeaders(token, version),
      body: JSON.stringify(cursor ? { start_cursor: cursor } : {}),
    });
    if (!response.ok) {
      throw new Error(`Failed to query Notion database ${databaseId}: ${await response.text()}`);
    }
    const json = await response.json();
    results.push(...json.results);
    if (!json.has_more) break;
    cursor = json.next_cursor;
  }
  return results;
}

function notionSchema() {
  return {
    Title: { title: {} },
    "External Key": { rich_text: {} },
    Company: { rich_text: {} },
    Role: { rich_text: {} },
    "Source URL": { url: {} },
    "Source Platform": { select: {} },
    "Workflow State": { select: {} },
    "Freshness Status": { select: {} },
    "Posted Date": { date: {} },
    "Freshness Source": { select: {} },
    "Relevance Score": { number: { format: "number_with_commas" } },
    "Company Priority": { select: {} },
    Location: { rich_text: {} },
    "Investor/Funding Summary": { rich_text: {} },
    Notes: { rich_text: {} },
  };
}

function toNotionProperties(record) {
  return {
    Title: { title: [{ text: { content: record.title.slice(0, 2000) } }] },
    "External Key": richText(record.externalKey),
    Company: richText(record.company),
    Role: richText(record.role),
    "Source URL": { url: record.sourceUrl || null },
    "Source Platform": select(record.sourcePlatform),
    "Workflow State": select(record.workflowState),
    "Freshness Status": select(record.freshnessStatus),
    "Posted Date": record.postedDate ? { date: { start: record.postedDate } } : { date: null },
    "Freshness Source": select(record.freshnessSource),
    "Relevance Score": { number: record.relevanceScore ?? null },
    "Company Priority": select(record.companyPriority),
    Location: richText(record.location),
    "Investor/Funding Summary": richText(record.investorFundingSummary),
    Notes: richText(record.notes),
  };
}

function extractExternalKey(page) {
  return page?.properties?.["External Key"]?.rich_text?.[0]?.plain_text || "";
}

function richText(value) {
  return { rich_text: value ? [{ text: { content: String(value).slice(0, 2000) } }] : [] };
}

function select(value) {
  return value ? { select: { name: String(value).slice(0, 100) } } : { select: null };
}

function toSheetValues(records) {
  const headers = [
    "External Key",
    "Title",
    "Company",
    "Role",
    "Source URL",
    "Source Platform",
    "Workflow State",
    "Freshness Status",
    "Posted Date",
    "Freshness Source",
    "Relevance Score",
    "Company Priority",
    "Location",
    "Investor/Funding Summary",
    "Notes",
  ];
  const rows = records.map((r) => [
    r.externalKey,
    r.title,
    r.company,
    r.role,
    r.sourceUrl,
    r.sourcePlatform,
    r.workflowState,
    r.freshnessStatus,
    r.postedDate,
    r.freshnessSource,
    r.relevanceScore ?? "",
    r.companyPriority,
    r.location,
    r.investorFundingSummary,
    r.notes,
  ]);
  return [headers, ...rows];
}

async function getGoogleAccessToken() {
  const email = requiredEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = requiredEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY").replace(/\\n/g, "\n");
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({
    iss: email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  }));
  const unsigned = `${header}.${payload}`;
  const signature = crypto.sign("RSA-SHA256", Buffer.from(unsigned), privateKey);
  const assertion = `${unsigned}.${signature.toString("base64url")}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get Google access token: ${await response.text()}`);
  }
  const json = await response.json();
  return json.access_token;
}

async function googleRequest(url, token, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    throw new Error(`Google Sheets request failed: ${await response.text()}`);
  }
  return response.json();
}

function notionHeaders(token, version) {
  return {
    Authorization: `Bearer ${token}`,
    "Notion-Version": version,
    "Content-Type": "application/json",
  };
}

function compactFundingSummary(row) {
  const pieces = [row.funding_stage, row.funding_recency, row.investor_signals].filter(Boolean).filter((v) => v !== "unknown");
  return pieces.join(" | ");
}

function extractMarkdownLink(value) {
  const match = String(value || "").match(/\[[^\]]+\]\(([^)]+)\)/);
  return match ? match[1] : "";
}

function normalizeApplicationStatus(value) {
  const normalized = normalize(value).replace(/-/g, "_");
  return normalized || "application";
}

function normalizeDate(value) {
  if (!value || value === "unknown" || value === "n/a") return "";
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function toNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function makeExternalKey(company, role, url) {
  return `${normalize(company)}::${normalize(role)}::${normalize(url)}`;
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function printSummary(views) {
  console.log("Dashboard sync summary");
  console.log(`- Live Pipeline: ${views.pipeline.length}`);
  console.log(`- Review Queue: ${views.review.length}`);
  console.log(`- Applications / Archive: ${views.archive.length}`);
  if (views.pipeline[0]) {
    console.log(`- Sample pipeline row: ${views.pipeline[0].title}`);
  }
}

function loadDotEnv(filePath) {
  if (!existsSync(filePath)) return;
  const content = readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}
