import { hasDatabase, maxScansPerDay } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import {
  appUser,
  applications as demoApplications,
  dashboardStats as demoStats,
  generatedMaterials as demoMaterials,
  jobs as demoJobs,
  resumeVariants as demoResumeVariants
} from "@/lib/mock-data";

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function toDashboardStats(jobs, scanRuns, resumeVariants) {
  return [
    {
      label: "Fresh roles",
      value: String(jobs.filter((job) => job.workflowState === "live_pipeline").length),
      detail: "Verified within last 5 days"
    },
    {
      label: "Need review",
      value: String(jobs.filter((job) => job.workflowState === "review_queue").length),
      detail: "Relevant but lower confidence"
    },
    {
      label: "Recent scans",
      value: String(scanRuns.length),
      detail: "Manual scans this week"
    },
    {
      label: "Tailored resumes",
      value: String(resumeVariants.filter((resume) => resume.isTailored).length),
      detail: "Saved to this workspace"
    }
  ];
}

function serializeJob(job) {
  return {
    id: job.id,
    company: job.company,
    role: job.role,
    workflowState: job.workflowState,
    freshness: job.postedDate ? new Date(job.postedDate).toLocaleDateString() : job.freshnessStatus || "Unknown",
    freshnessSource: job.freshnessSource || "Unknown",
    location: job.location || "Unknown",
    relevanceScore: job.relevanceScore || 0,
    priority: job.companyPriority || "Medium",
    sourcePlatform: job.sourcePlatform || "Unknown",
    sourceUrl: job.sourceUrl,
    reason: job.notes || "",
    funding: job.investorFundingSummary || "",
    jdSummary: job.jdSummary || "",
    description: job.fullDescription || job.jdSummary || ""
  };
}

export async function getWorkspaceData(user, demoMode = false) {
  if (demoMode || !hasDatabase()) {
    return {
      user: appUser,
      dashboardStats: demoStats,
      jobs: demoJobs,
      applications: demoApplications,
      generatedMaterials: demoMaterials,
      resumeVariants: demoResumeVariants,
      profileComplete: false,
      betaMode: true
    };
  }

  const prisma = await getPrisma();

  const [profile, preferences, jobs, applications, resumeVariants, scanRuns, generatedMaterials] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    prisma.matchingPreferences.findUnique({ where: { userId: user.id } }),
    prisma.job.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.application.findMany({
      where: { userId: user.id },
      include: { job: true },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.resumeVariant.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" } }),
    prisma.scanRun.findMany({
      where: { userId: user.id, createdAt: { gte: startOfToday() } },
      orderBy: { createdAt: "desc" }
    }),
    prisma.generatedMaterial.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" } })
  ]);

  return {
    user: {
      ...user,
      location: profile?.location || user.location || "",
      targetFunctions: preferences?.targetFunctions || user.targetFunctions || []
    },
    dashboardStats: toDashboardStats(jobs, scanRuns, resumeVariants),
    jobs: jobs.map(serializeJob),
    applications: applications.map((application) => ({
      id: application.id,
      company: application.job.company,
      role: application.job.role,
      status: application.status,
      note: application.notes || ""
    })),
    generatedMaterials: generatedMaterials.map((item) => ({
      id: item.id,
      kind: item.kind,
      title: item.title,
      status: "Saved"
    })),
    resumeVariants: resumeVariants.map((item) => ({
      id: item.id,
      name: item.name,
      roleFamily: item.intendedRoleFamily || "General business roles",
      active: item.isActive,
      lastUpdated: new Date(item.updatedAt).toLocaleDateString(),
      summary: item.isTailored ? "Tailored for a selected role." : "Saved resume variant."
    })),
    profileComplete: Boolean(profile?.onboardingCompletedAt),
    betaMode: false
  };
}

export async function saveOnboarding(user, payload) {
  if (!hasDatabase()) {
    return { ok: true, demoMode: true };
  }

  const prisma = await getPrisma();

  const targetFunctions = splitCsv(payload.targetFunctions);
  const preferredLocations = splitCsv(payload.preferredLocations);
  const industries = splitCsv(payload.industries);
  const companies = splitCsv(payload.companies);
  const positiveKeywords = splitCsv(payload.positiveKeywords);
  const negativeKeywords = splitCsv(payload.negativeKeywords);
  const conceptMatches = splitCsv(payload.conceptMatches);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: payload.name,
      betaAccessGranted: true
    }
  });

  await prisma.profile.upsert({
    where: { userId: user.id },
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
      userId: user.id,
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
    where: { userId: user.id },
    update: {
      targetFunctions,
      preferredLocations,
      includeRemote: /^y(es)?$/i.test(String(payload.includeRemote || "yes")),
      positiveKeywords,
      negativeKeywords,
      conceptMatches
    },
    create: {
      userId: user.id,
      targetFunctions,
      preferredLocations,
      includeRemote: /^y(es)?$/i.test(String(payload.includeRemote || "yes")),
      positiveKeywords,
      negativeKeywords,
      conceptMatches
    }
  });

  const existingBase = await prisma.resumeVariant.findFirst({
    where: { userId: user.id, slug: "base" }
  });

  const resumePayload = {
    name: "Base Resume",
    slug: "base",
    intendedRoleFamily: "General business roles",
    contentMarkdown: payload.resume || "",
    isActive: true
  };

  if (existingBase) {
    await prisma.resumeVariant.update({
      where: { id: existingBase.id },
      data: resumePayload
    });
  } else {
    await prisma.resumeVariant.create({
      data: {
        userId: user.id,
        ...resumePayload
      }
    });
  }

  return { ok: true };
}

export async function runManualScan(user) {
  if (!hasDatabase()) {
    return { ok: true, demoMode: true, inserted: demoJobs.length };
  }

  const prisma = await getPrisma();

  const scansToday = await prisma.scanRun.count({
    where: {
      userId: user.id,
      createdAt: { gte: startOfToday() }
    }
  });

  if (scansToday >= maxScansPerDay()) {
    return { ok: false, error: `Daily scan limit reached (${maxScansPerDay()}/day).` };
  }

  const scanRun = await prisma.scanRun.create({
    data: {
      userId: user.id,
      status: "completed",
      summary: "Manual beta scan using lightweight seeded discovery.",
      jobsFound: demoJobs.length,
      jobsPromoted: demoJobs.filter((job) => job.workflowState === "live_pipeline").length,
      completedAt: new Date()
    }
  });

  let inserted = 0;

  for (const job of demoJobs) {
    await prisma.job.upsert({
      where: {
        userId_sourceUrl: {
          userId: user.id,
          sourceUrl: `${job.sourceUrl}/${job.id}`
        }
      },
      update: {
        scanRunId: scanRun.id,
        company: job.company,
        role: job.role,
        sourcePlatform: job.sourcePlatform,
        workflowState: job.workflowState,
        freshnessStatus: job.workflowState === "live_pipeline" ? "fresh_verified" : "needs_review",
        freshnessSource: job.freshnessSource,
        relevanceScore: job.relevanceScore,
        companyPriority: job.priority,
        location: job.location,
        investorFundingSummary: job.funding,
        jdSummary: job.jdSummary,
        fullDescription: job.description,
        notes: job.reason,
        postedDate: new Date()
      },
      create: {
        userId: user.id,
        scanRunId: scanRun.id,
        company: job.company,
        role: job.role,
        sourceUrl: `${job.sourceUrl}/${job.id}`,
        sourcePlatform: job.sourcePlatform,
        workflowState: job.workflowState,
        freshnessStatus: job.workflowState === "live_pipeline" ? "fresh_verified" : "needs_review",
        freshnessSource: job.freshnessSource,
        relevanceScore: job.relevanceScore,
        companyPriority: job.priority,
        location: job.location,
        investorFundingSummary: job.funding,
        jdSummary: job.jdSummary,
        fullDescription: job.description,
        notes: job.reason,
        postedDate: new Date()
      }
    });
    inserted += 1;
  }

  return { ok: true, inserted, demoMode: false };
}

export async function updateJobState(user, jobId, action) {
  if (!hasDatabase()) return { ok: true, demoMode: true };

  const prisma = await getPrisma();

  const job = await prisma.job.findFirst({
    where: { id: jobId, userId: user.id }
  });

  if (!job) return { ok: false, error: "Job not found." };

  if (action === "apply") {
    await prisma.job.update({
      where: { id: job.id },
      data: { workflowState: "application" }
    });
    await prisma.application.upsert({
      where: { jobId: job.id },
      update: { status: "Applied", appliedAt: new Date() },
      create: {
        userId: user.id,
        jobId: job.id,
        status: "Applied",
        appliedAt: new Date()
      }
    });
    return { ok: true };
  }

  if (action === "archive") {
    await prisma.job.update({
      where: { id: job.id },
      data: { workflowState: "archive" }
    });
    return { ok: true };
  }

  if (action === "promote") {
    await prisma.job.update({
      where: { id: job.id },
      data: { workflowState: "live_pipeline", freshnessStatus: "fresh_verified" }
    });
    return { ok: true };
  }

  return { ok: false, error: "Unsupported action." };
}

export async function createTailoredResume(user, jobId) {
  if (!hasDatabase()) {
    return { ok: true, demoMode: true, title: "Demo tailored resume created." };
  }

  const prisma = await getPrisma();

  const [job, baseResume] = await Promise.all([
    prisma.job.findFirst({ where: { id: jobId, userId: user.id } }),
    prisma.resumeVariant.findFirst({ where: { userId: user.id, isActive: true } })
  ]);

  if (!job || !baseResume) {
    return { ok: false, error: "Missing job or active base resume." };
  }

  const slug = `${slugify(job.company)}-${slugify(job.role)}`.slice(0, 80);
  const contentMarkdown = [
    `# ${job.company} - ${job.role}`,
    "",
    "## Base narrative",
    baseResume.contentMarkdown,
    "",
    "## Tailoring notes",
    `- Target company: ${job.company}`,
    `- Target role: ${job.role}`,
    `- Why it fits: ${job.notes || "Strong business-role alignment."}`,
    `- Job summary: ${job.jdSummary || ""}`
  ].join("\n");

  const variant = await prisma.resumeVariant.create({
    data: {
      userId: user.id,
      name: `${job.company} Tailored Resume`,
      slug,
      intendedRoleFamily: job.role,
      contentMarkdown,
      isActive: false,
      isTailored: true,
      sourceJobId: job.id
    }
  });

  await prisma.generatedMaterial.create({
    data: {
      userId: user.id,
      jobId: job.id,
      kind: "Tailored Resume",
      title: `${job.company} - ${job.role} resume draft`,
      body: contentMarkdown
    }
  });

  return { ok: true, title: variant.name };
}

export async function createCoverLetter(user, jobId) {
  if (!hasDatabase()) {
    return { ok: true, demoMode: true, title: "Demo cover letter created." };
  }

  const prisma = await getPrisma();

  const job = await prisma.job.findFirst({ where: { id: jobId, userId: user.id } });
  if (!job) return { ok: false, error: "Job not found." };

  const body = [
    `Dear ${job.company} hiring team,`,
    "",
    `I am excited about the ${job.role} role because it aligns with my background in strategy, operations, and cross-functional execution.`,
    "",
    `What stands out most is the opportunity to contribute to ${job.jdSummary || "high-impact business priorities"} while bringing structured planning, stakeholder management, and operating rigor.`,
    "",
    "Sincerely,",
    user.name || user.email
  ].join("\n");

  const material = await prisma.generatedMaterial.create({
    data: {
      userId: user.id,
      jobId: job.id,
      kind: "Cover Letter",
      title: `${job.company} - ${job.role} cover letter`,
      body
    }
  });

  return { ok: true, title: material.title };
}

export async function activateResume(user, resumeId) {
  if (!hasDatabase()) return { ok: true, demoMode: true };

  const prisma = await getPrisma();

  const resume = await prisma.resumeVariant.findFirst({
    where: { id: resumeId, userId: user.id }
  });

  if (!resume) return { ok: false, error: "Resume not found." };

  await prisma.resumeVariant.updateMany({
    where: { userId: user.id },
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

  await prisma.feedback.create({
    data: {
      userId: user.id,
      message,
      context
    }
  });

  return { ok: true };
}

function splitCsv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
