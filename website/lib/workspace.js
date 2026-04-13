import { maxScansPerDay, hasDatabase } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import {
  analysisHistory as demoAnalysisHistory,
  appUser,
  getAnalysisRun as getDemoAnalysisRun,
  latestAnalysisRun,
  resumeVariants as demoResumeVariants
} from "@/lib/mock-data";

const ATS_GOOD_THRESHOLD = 70;
const HR_GOOD_THRESHOLD = 70;

export async function getWorkspaceData(user, demoMode = false) {
  if (demoMode || !hasDatabase()) {
    return {
      user: appUser,
      analysisStats: toAnalysisStats(demoAnalysisHistory, demoResumeVariants.length),
      analysisHistory: demoAnalysisHistory,
      latestAnalysisRun,
      resumeVariants: demoResumeVariants,
      profileComplete: false,
      betaMode: true
    };
  }

  if (!user) {
    return {
      user: null,
      analysisStats: toAnalysisStats([], 0),
      analysisHistory: [],
      latestAnalysisRun: null,
      resumeVariants: [],
      profileComplete: false,
      betaMode: false
    };
  }

  try {
    const prisma = await getPrisma();
    const dbUser = await ensureDatabaseUser(prisma, user);
    const [profile, preferences, resumeVariants, analysisRuns] = await Promise.all([
      prisma.profile.findUnique({ where: { userId: dbUser.id } }),
      prisma.matchingPreferences.findUnique({ where: { userId: dbUser.id } }),
      prisma.resumeVariant.findMany({ where: { userId: dbUser.id }, orderBy: { updatedAt: "desc" } }),
      prisma.analysisRun.findMany({
        where: { userId: dbUser.id },
        orderBy: { createdAt: "desc" },
        take: 10
      })
    ]);

    const normalizedHistory = analysisRuns.map(normalizeAnalysisRun);

    return {
      user: {
        ...dbUser,
        location: profile?.location || "",
        targetFunctions: preferences?.targetFunctions || []
      },
      analysisStats: toAnalysisStats(normalizedHistory, resumeVariants.length),
      analysisHistory: normalizedHistory,
      latestAnalysisRun: normalizedHistory[0] || null,
      resumeVariants: resumeVariants.map((item) => ({
        id: item.id,
        name: item.name,
        roleFamily: item.intendedRoleFamily || "General business roles",
        active: item.isActive,
        lastUpdated: new Date(item.updatedAt).toLocaleDateString(),
        summary: item.isTailored ? "Stored tailored source resume." : "Saved resume variant.",
        content: item.contentMarkdown
      })),
      profileComplete: Boolean(profile?.onboardingCompletedAt),
      betaMode: false,
      degradedMode: false
    };
  } catch (error) {
    console.error("getWorkspaceData: falling back to empty workspace", error);
    return {
      user,
      analysisStats: toAnalysisStats([], 0),
      analysisHistory: [],
      latestAnalysisRun: null,
      resumeVariants: [],
      profileComplete: false,
      betaMode: false,
      degradedMode: true
    };
  }
}

export async function getAnalysisRun(user, runId, demoMode = false) {
  if (demoMode || !hasDatabase()) {
    return getDemoAnalysisRun(runId);
  }

  const prisma = await getPrisma();
  const run = await prisma.analysisRun.findFirst({
    where: { id: runId, userId: user.id }
  });

  return run ? normalizeAnalysisRun(run) : null;
}

export async function saveOnboarding(user, payload) {
  if (!hasDatabase()) {
    return { ok: true, demoMode: true };
  }

  const prisma = await getPrisma();
  const dbUser = await ensureDatabaseUser(prisma, user, payload.name);
  const targetFunctions = splitCsv(payload.targetFunctions);
  const preferredLocations = splitCsv(payload.preferredLocations);
  const industries = splitCsv(payload.industries);
  const companies = splitCsv(payload.companies);
  const positiveKeywords = splitCsv(payload.positiveKeywords);
  const negativeKeywords = splitCsv(payload.negativeKeywords);
  const conceptMatches = splitCsv(payload.conceptMatches);
  const resumes = normalizeSubmittedResumes(payload);

  if (!resumes.length) {
    return {
      ok: false,
      error: "Add at least one valid resume before creating the workspace."
    };
  }

  await prisma.profile.upsert({
    where: { userId: dbUser.id },
    update: {
      location: payload.location,
      targetSeniority: payload.seniority,
      industries,
      companies,
      remotePreference: payload.includeRemote,
      onboardingCompletedAt: new Date(),
      headline: `${targetFunctions[0] || "Business-role"} candidate`
    },
    create: {
      userId: dbUser.id,
      location: payload.location,
      targetSeniority: payload.seniority,
      industries,
      companies,
      remotePreference: payload.includeRemote,
      onboardingCompletedAt: new Date(),
      headline: `${targetFunctions[0] || "Business-role"} candidate`
    }
  });

  await prisma.matchingPreferences.upsert({
    where: { userId: dbUser.id },
    update: {
      targetFunctions,
      preferredLocations,
      includeRemote: /^y(es)?$/i.test(String(payload.includeRemote || "yes")),
      positiveKeywords,
      negativeKeywords,
      conceptMatches
    },
    create: {
      userId: dbUser.id,
      targetFunctions,
      preferredLocations,
      includeRemote: /^y(es)?$/i.test(String(payload.includeRemote || "yes")),
      positiveKeywords,
      negativeKeywords,
      conceptMatches
    }
  });

  const existingResumes = await prisma.resumeVariant.findMany({
    where: { userId: dbUser.id }
  });

  if (existingResumes.length) {
    await prisma.resumeVariant.deleteMany({
      where: { userId: dbUser.id }
    });
  }

  for (const [index, resume] of resumes.entries()) {
    await prisma.resumeVariant.create({
      data: {
        userId: dbUser.id,
        name: resume.name,
        slug: slugify(resume.name || `resume-${index + 1}`),
        intendedRoleFamily: resume.roleFamily || "General business roles",
        contentMarkdown: resume.content,
        isActive: index === 0
      }
    });
  }

  return { ok: true, resumesSaved: resumes.length };
}

export async function runRoleAnalysis(user, payload) {
  if (!hasDatabase()) {
    return { ok: true, demoMode: true, run: latestAnalysisRun };
  }

  const prisma = await getPrisma();
  const dbUser = await ensureDatabaseUser(prisma, user);
  const analysisMode = normalizeAnalysisMode(payload.analysisMode);
  const analysesToday = await prisma.analysisRun.count({
    where: {
      userId: dbUser.id,
      createdAt: { gte: startOfToday() }
    }
  });

  if (analysesToday >= maxScansPerDay()) {
    return { ok: false, error: `Daily analysis limit reached (${maxScansPerDay()}/day).` };
  }

  const [profile, preferences, storedResumes] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: dbUser.id } }),
    prisma.matchingPreferences.findUnique({ where: { userId: dbUser.id } }),
    prisma.resumeVariant.findMany({ where: { userId: dbUser.id } })
  ]);

  const selectedResumeIds = uniqueValues(Array.isArray(payload.resumeIds) ? payload.resumeIds : []);
  const selectedResumes = storedResumes
    .filter((resume) => selectedResumeIds.includes(resume.id))
    .map((resume) => ({
      id: resume.id,
      name: resume.name,
      roleFamily: resume.intendedRoleFamily || "General business roles",
      content: resume.contentMarkdown
    }));

  const transientResume = normalizeTransientResume(payload);
  const resumes = transientResume ? [...selectedResumes, transientResume] : selectedResumes;
  if (!resumes.length) {
    return { ok: false, error: "Select at least one stored resume or provide a new resume for analysis." };
  }

  const submittedUrls = parseSubmittedUrls(payload.urls);
  if (!submittedUrls.length) {
    return { ok: false, error: "Add at least one job URL to analyze." };
  }

  const roles = [];
  for (const url of submittedUrls) {
    roles.push(await extractRoleFromUrl(url));
  }

  const results = buildAnalysisResults({
    roles,
    resumes,
    preferences,
    profile,
    analysisMode
  });

  const run = await prisma.analysisRun.create({
    data: {
      userId: dbUser.id,
      submittedUrls,
      includedResumeIds: selectedResumeIds,
      transientResumeName: transientResume?.name || null,
      roleCount: results.roles.length,
      resumeCount: resumes.length,
      atsMatchCount: results.roles.reduce((sum, role) => sum + role.atsMatchCount, 0),
      hrMatchCount: results.roles.reduce((sum, role) => sum + role.hrMatchCount, 0),
      topRecommendation: summarizeTopRecommendation(results.pairs),
      resultsJson: results
    }
  });

  await trimAnalysisHistory(prisma, dbUser.id);

  return {
    ok: true,
    run: normalizeAnalysisRun(run)
  };
}

export async function generateResumeDraft(user, payload) {
  const { role, resume } = payload;
  const roleSummary = role?.jdSummary || role?.description || "";
  const strengths = Array.isArray(payload.strengths) ? payload.strengths : [];
  const gaps = Array.isArray(payload.gaps) ? payload.gaps : [];
  const missingKeywords = Array.isArray(payload.missingKeywords) ? payload.missingKeywords : [];

  if (!resume?.content || !role?.role || !role?.company) {
    return { ok: false, error: "Missing role or resume content." };
  }

  const draft = [
    `${resume.name || "Resume"} - tailored for ${role.company} (${role.role})`,
    "",
    "TARGETED SUMMARY",
    `Business-role candidate aligned to ${role.role} with strengths in ${strengths.slice(0, 3).join(", ") || "cross-functional execution, planning, and stakeholder management"}.`,
    roleSummary ? `Role focus: ${roleSummary}` : "",
    "",
    "PRIORITY ATS KEYWORDS TO WORK IN",
    missingKeywords.length ? missingKeywords.join(", ") : "No major missing ATS keywords flagged.",
    "",
    "RECOMMENDED CHANGES",
    ...toBullets([
      `Lead with experience most relevant to ${role.role}.`,
      strengths[0] ? `Make ${strengths[0].toLowerCase()} more explicit in the top third of the resume.` : "",
      gaps[0] ? `Close the gap on ${gaps[0].replace(/\.$/, "").toLowerCase()}.` : "",
      "Keep the format concise and recruiter-friendly."
    ]),
    "",
    "CURRENT RESUME CONTENT",
    resume.content
  ]
    .filter(Boolean)
    .join("\n");

  return {
    ok: true,
    title: `${resume.name || "Resume"} - ${role.company}`,
    content: draft
  };
}

export async function activateResume(user, resumeId) {
  if (!hasDatabase()) return { ok: true, demoMode: true };

  const prisma = await getPrisma();
  const dbUser = await ensureDatabaseUser(prisma, user);
  const resume = await prisma.resumeVariant.findFirst({
    where: { id: resumeId, userId: dbUser.id }
  });

  if (!resume) {
    return { ok: false, error: "Resume not found." };
  }

  await prisma.resumeVariant.updateMany({
    where: { userId: dbUser.id },
    data: { isActive: false }
  });

  await prisma.resumeVariant.update({
    where: { id: resume.id },
    data: { isActive: true }
  });

  return { ok: true };
}

export async function saveFeedback(user, message, context = "beta-feedback") {
  if (!hasDatabase()) return { ok: true, demoMode: true };

  const prisma = await getPrisma();
  const dbUser = await ensureDatabaseUser(prisma, user);
  await prisma.feedback.create({
    data: {
      userId: dbUser.id,
      message,
      context
    }
  });

  return { ok: true };
}

export async function runManualScan() {
  return {
    ok: false,
    error: "Scan-first workflow has been removed. Use the Analyze Roles flow instead."
  };
}

export async function updateJobState() {
  return {
    ok: false,
    error: "Job queue actions are no longer part of the website workflow."
  };
}

export async function createTailoredResume(user, jobId) {
  return {
    ok: false,
    error: `Role-specific job actions are deprecated on the website. Use in-app resume revision from Analyze Roles instead (${jobId || "no role id"}).`
  };
}

export async function createCoverLetter() {
  return {
    ok: false,
    error: "Cover-letter generation is not part of this website flow yet."
  };
}

function buildAnalysisResults({ roles, resumes, preferences, profile, analysisMode = "comprehensive" }) {
  const normalizedPreferences = {
    targetFunctions: toArray(preferences?.targetFunctions),
    positiveKeywords: toArray(preferences?.positiveKeywords),
    negativeKeywords: toArray(preferences?.negativeKeywords),
    conceptMatches: toArray(preferences?.conceptMatches),
    preferredLocations: toArray(preferences?.preferredLocations),
    industries: toArray(profile?.industries),
    companies: toArray(profile?.companies),
    seniority: profile?.targetSeniority || ""
  };

  const pairs = [];

  for (const role of roles) {
    for (const resume of resumes) {
      pairs.push(scoreResumeRolePair(resume, role, normalizedPreferences, analysisMode));
    }
  }

  const rolesWithCounts = roles.map((role) => {
    const rolePairs = pairs.filter((pair) => pair.roleId === role.id);
    const best = [...rolePairs].sort((a, b) => scoreForMode(b, analysisMode) - scoreForMode(a, analysisMode))[0];
    return {
      ...role,
      atsMatchCount: rolePairs.filter((pair) => pair.atsScore >= ATS_GOOD_THRESHOLD).length,
      hrMatchCount: rolePairs.filter((pair) => pair.hrScore >= HR_GOOD_THRESHOLD).length,
      bestResumeId: best?.resumeId || null,
      bestResumeName: best?.resumeName || null
    };
  });

  const resumesWithCounts = resumes.map((resume) => {
    const resumePairs = pairs.filter((pair) => pair.resumeId === resume.id);
    const strongest = [...resumePairs].sort((a, b) => scoreForMode(b, analysisMode) - scoreForMode(a, analysisMode)).slice(0, 3);
    const weakest = [...resumePairs].sort((a, b) => scoreForMode(a, analysisMode) - scoreForMode(b, analysisMode)).slice(0, 2);
    return {
      id: resume.id,
      name: resume.name,
      roleFamily: resume.roleFamily,
      strongestRoles: strongest.map((pair) => ({
        roleId: pair.roleId,
        roleName: pair.roleName,
        company: pair.company,
        recommendation: pair.recommendation
      })),
      weakestRoles: weakest.map((pair) => ({
        roleId: pair.roleId,
        roleName: pair.roleName,
        company: pair.company,
        recommendation: pair.recommendation
      }))
    };
  });

  return {
    analysisMode,
    roles: rolesWithCounts,
    resumeInputs: resumes.map((resume) => ({
      id: resume.id,
      name: resume.name,
      roleFamily: resume.roleFamily,
      content: resume.content
    })),
    resumes: resumesWithCounts,
    pairs
  };
}

function scoreResumeRolePair(resume, role, preferences, analysisMode = "comprehensive") {
  const resumeText = normalizeText(resume.content);
  const roleText = normalizeText([role.role, role.jdSummary, role.description, role.location].join(" "));
  const positiveKeywords = preferences.positiveKeywords.filter((keyword) => roleText.includes(normalizeText(keyword)));
  const conceptMatches = preferences.conceptMatches.filter((keyword) => roleText.includes(normalizeText(keyword)));
  const matchedPositive = positiveKeywords.filter((keyword) => resumeText.includes(normalizeText(keyword)));
  const matchedConcepts = conceptMatches.filter((keyword) => resumeText.includes(normalizeText(keyword)));
  const missingKeywords = positiveKeywords.filter((keyword) => !resumeText.includes(normalizeText(keyword)));
  const negativeHits = preferences.negativeKeywords.filter(
    (keyword) => roleText.includes(normalizeText(keyword)) && resumeText.includes(normalizeText(keyword))
  );
  const functionSignals = preferences.targetFunctions.filter(
    (item) => roleText.includes(normalizeText(item)) || resumeText.includes(normalizeText(item))
  );
  const preferredLocationHit = preferences.preferredLocations.some((location) =>
    normalizeText(role.location).includes(normalizeText(location))
  );
  const industrySignal = preferences.industries.some((industry) =>
    roleText.includes(normalizeText(industry))
  );
  const familySignal = resume.roleFamily && roleText.includes(normalizeText(resume.roleFamily));

  const atsScore = clampScore(
    35 +
      matchedPositive.length * 8 +
      matchedConcepts.length * 6 +
      (preferredLocationHit ? 8 : 0) +
      (familySignal ? 6 : 0) -
      negativeHits.length * 10
  );

  const hrScore = clampScore(
    32 +
      matchedConcepts.length * 8 +
      functionSignals.length * 5 +
      (industrySignal ? 6 : 0) +
      (preferredLocationHit ? 6 : 0) +
      (resumeText.includes("stakeholder") ? 4 : 0) +
      (resumeText.includes("cross-functional") ? 4 : 0) -
      negativeHits.length * 8
  );

  const strengths = uniqueValues([
    matchedPositive[0] ? `${matchedPositive[0]} is clearly reflected in the resume.` : "",
    matchedConcepts[0] ? `${matchedConcepts[0]} aligns well with the job description.` : "",
    preferredLocationHit ? `Location preference aligns with ${role.location}.` : "",
    familySignal ? `Resume role family aligns with ${resume.roleFamily}.` : ""
  ]).filter(Boolean);

  const gaps = uniqueValues([
    missingKeywords[0] ? `Missing ATS emphasis on ${missingKeywords[0]}.` : "",
    missingKeywords[1] ? `Consider adding ${missingKeywords[1]} evidence.` : "",
    !industrySignal && preferences.industries.length ? "Industry alignment is not obvious from the role description." : ""
  ]).filter(Boolean);

  const redFlags = uniqueValues([
    negativeHits[0] ? `Negative overlap on ${negativeHits[0]}.` : "",
    atsScore < 55 ? "ATS alignment is currently weak." : "",
    hrScore < 55 ? "Recruiter fit may read as a stretch." : ""
  ]).filter(Boolean);

  return {
    pairId: `${role.id}:${resume.id}`,
    roleId: role.id,
    roleName: role.role,
    company: role.company,
    resumeId: resume.id,
    resumeName: resume.name,
    atsScore,
    hrScore,
    totalScore: Math.round((atsScore + hrScore) / 2),
    recommendation: classifyRecommendation(atsScore, hrScore, analysisMode),
    strengths,
    gaps,
    redFlags,
    missingKeywords: missingKeywords.slice(0, 8)
  };
}

async function extractRoleFromUrl(url) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MehakJobSearchModel/1.0)"
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      return fallbackRole(url, `Could not fetch the role page (${response.status}).`);
    }

    const html = await response.text();
    const text = stripHtml(html);
    const title = extractTag(html, "title") || "";
    const h1 = extractFirstHeading(html) || "";
    const roleName = pickRoleName(h1, title, url);
    const company = pickCompany(title, url);
    const location = extractLocation(text);
    const summary = text.split(". ").slice(0, 3).join(". ").slice(0, 420);

    return {
      id: slugify(`${company}-${roleName}-${url}`).slice(0, 80),
      company,
      role: roleName,
      sourceUrl: url,
      sourcePlatform: detectPlatform(url),
      location,
      jdSummary: summary || "Role summary unavailable.",
      description: text.slice(0, 6000) || "Role content unavailable."
    };
  } catch (error) {
    return fallbackRole(url, `Could not extract the role content: ${error.message}`);
  }
}

async function trimAnalysisHistory(prisma, userId) {
  const runs = await prisma.analysisRun.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true }
  });

  if (runs.length <= 10) return;

  const excessIds = runs.slice(10).map((item) => item.id);
  await prisma.analysisRun.deleteMany({
    where: {
      id: { in: excessIds }
    }
  });
}

function normalizeAnalysisRun(run) {
  const results = run.resultsJson || { roles: [], resumes: [], pairs: [] };
  return {
    id: run.id,
    createdAt: new Date(run.createdAt).toLocaleString(),
    roleCount: run.roleCount,
    resumeCount: run.resumeCount,
    atsMatchCount: run.atsMatchCount,
    hrMatchCount: run.hrMatchCount,
    topRecommendation: run.topRecommendation || "Analysis complete",
    submittedUrls: toArray(run.submittedUrls),
    includedResumeIds: toArray(run.includedResumeIds),
    transientResumeName: run.transientResumeName,
    analysisMode: results.analysisMode || "comprehensive",
    results
  };
}

async function ensureDatabaseUser(prisma, user, preferredName = "") {
  if (!user?.email) {
    throw new Error("Authenticated user is missing an email address.");
  }

  return prisma.user.upsert({
    where: { email: user.email },
    update: {
      name: preferredName || user.name || user.email,
      betaAccessGranted: true,
      emailVerifiedAt: new Date()
    },
    create: {
      email: user.email,
      name: preferredName || user.name || user.email,
      betaAccessGranted: true,
      emailVerifiedAt: new Date()
    }
  });
}

function normalizeSubmittedResumes(payload) {
  const incoming = Array.isArray(payload.resumes) ? payload.resumes : [];
  const normalized = incoming
    .map((resume, index) => ({
      name: String(resume?.name || `Resume ${index + 1}`).trim(),
      roleFamily: String(resume?.roleFamily || "General business roles").trim(),
      content: String(resume?.content || "").trim()
    }))
    .filter((resume) => resume.content);

  if (normalized.length) return normalized;

  if (payload.resume) {
    return [
      {
        name: "Base Resume",
        roleFamily: "General business roles",
        content: String(payload.resume).trim()
      }
    ].filter((item) => item.content);
  }

  return [];
}

function normalizeTransientResume(payload) {
  const content = String(payload.transientResumeContent || "").trim();
  if (!content) return null;
  return {
    id: "transient-resume",
    name: String(payload.transientResumeName || "Ad hoc resume").trim(),
    roleFamily: String(payload.transientResumeRoleFamily || "General business roles").trim(),
    content
  };
}

function parseSubmittedUrls(rawValue) {
  const values = Array.isArray(rawValue) ? rawValue : String(rawValue || "").split(/\r?\n|,/);
  return uniqueValues(
    values
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .filter((item) => item.startsWith("http://") || item.startsWith("https://"))
  );
}

function fallbackRole(url, message) {
  const hostname = safeHostname(url);
  return {
    id: slugify(url).slice(0, 80),
    company: hostname ? hostname.split(".")[0] : "Unknown Company",
    role: "Role extraction incomplete",
    sourceUrl: url,
    sourcePlatform: detectPlatform(url),
    location: "Unknown",
    jdSummary: message,
    description: message
  };
}

function detectPlatform(url) {
  const value = url.toLowerCase();
  if (value.includes("greenhouse")) return "Greenhouse";
  if (value.includes("ashby")) return "Ashby";
  if (value.includes("lever")) return "Lever";
  if (value.includes("workday")) return "Workday";
  if (value.includes("smartrecruiters")) return "SmartRecruiters";
  return "Company careers";
}

function pickRoleName(h1, title, url) {
  const primary = [h1, title]
    .map((item) => String(item || "").trim())
    .find(Boolean);

  if (!primary) {
    return safeHostname(url) || "Unknown role";
  }

  return primary
    .split("|")[0]
    .split(" - ")[0]
    .trim()
    .slice(0, 140);
}

function pickCompany(title, url) {
  const titleParts = String(title || "")
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  if (titleParts.length > 1) return titleParts[1];
  return safeHostname(url)?.split(".")[0] || "Unknown Company";
}

function extractLocation(text) {
  const patterns = [
    /location[:\s]+([a-z ,.-]{4,80})/i,
    /(san francisco|new york|remote|bay area|brooklyn|manhattan|oakland|palo alto|mountain view)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return toTitleCase(match[1].trim());
  }

  return "Unknown";
}

function stripHtml(html) {
  return decodeHtmlEntities(
    String(html || "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function extractTag(html, tag) {
  const match = String(html || "").match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeHtmlEntities(match[1].replace(/\s+/g, " ").trim()) : "";
}

function extractFirstHeading(html) {
  const match = String(html || "").match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return match ? decodeHtmlEntities(match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()) : "";
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function classifyRecommendation(atsScore, hrScore, analysisMode = "comprehensive") {
  if (analysisMode === "ats") {
    if (atsScore >= 80) return "Strong ATS fit";
    if (atsScore >= 65) return "Stretch ATS fit";
    if (atsScore >= 55) return "Weak ATS fit";
    return "Low ATS fit";
  }
  if (analysisMode === "hr") {
    if (hrScore >= 80) return "Strong HR fit";
    if (hrScore >= 65) return "Stretch HR fit";
    if (hrScore >= 55) return "Weak HR fit";
    return "Low HR fit";
  }
  if (atsScore >= 80 && hrScore >= 75) return "Strong fit";
  if (atsScore >= 65 && hrScore >= 60) return "Stretch but viable";
  if (atsScore >= 55 || hrScore >= 55) return "Weak fit";
  return "Not recommended";
}

function summarizeTopRecommendation(pairs) {
  const strong = pairs.filter((pair) => pair.recommendation.toLowerCase().includes("strong")).length;
  const stretch = pairs.filter((pair) => pair.recommendation.toLowerCase().includes("stretch")).length;
  if (strong) return `${strong} strong-fit pair${strong === 1 ? "" : "s"}${stretch ? ` and ${stretch} stretch-fit pair${stretch === 1 ? "" : "s"}` : ""}`;
  if (stretch) return `${stretch} stretch-fit pair${stretch === 1 ? "" : "s"} found`;
  return "No strong matches yet";
}

function toAnalysisStats(history, storedResumeCount = 0) {
  if (!history.length) {
    return [
      { label: "Analyses run", value: "0", detail: "No role comparisons yet" },
      { label: "ATS matches", value: "0", detail: "Pairs above ATS threshold" },
      { label: "HR matches", value: "0", detail: "Pairs above HR threshold" },
      { label: "Resumes stored", value: String(storedResumeCount), detail: "Ready for analysis" }
    ];
  }

  const latest = history[0];
  const totalAts = history.reduce((sum, item) => sum + item.atsMatchCount, 0);
  const totalHr = history.reduce((sum, item) => sum + item.hrMatchCount, 0);
  const latestResumeCount = latest.resumeCount || 0;

  return [
    { label: "Analyses run", value: String(history.length), detail: "Last 10 runs only" },
    { label: "ATS matches", value: String(totalAts), detail: "Strong keyword-aligned pairs" },
    { label: "HR matches", value: String(totalHr), detail: "Role-profile fit signals" },
    { label: "Resumes stored", value: String(Math.max(storedResumeCount, latestResumeCount)), detail: "Available for future analysis" }
  ];
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitCsv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function uniqueValues(items) {
  return [...new Set(items.filter(Boolean))];
}

function safeHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function toTitleCase(value) {
  return String(value || "")
    .split(" ")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1).toLowerCase() : ""))
    .join(" ");
}

function toBullets(items) {
  return items.filter(Boolean).map((item) => `- ${item}`);
}

function normalizeAnalysisMode(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "ats" || normalized === "hr") return normalized;
  return "comprehensive";
}

function scoreForMode(pair, analysisMode) {
  if (analysisMode === "ats") return pair.atsScore;
  if (analysisMode === "hr") return pair.hrScore;
  return pair.totalScore;
}
