export const appUser = {
  id: "user_mehak_demo",
  name: "Mehak Demo User",
  email: "mehak@example.com",
  location: "San Francisco, CA",
  targetFunctions: [
    "Strategy & Operations",
    "GTM / Revenue Operations",
    "Program Management",
    "Strategic Finance"
  ]
};

export const dashboardStats = [
  { label: "Fresh roles", value: "12", detail: "Verified within last 5 days" },
  { label: "Need review", value: "5", detail: "Relevant but lower confidence" },
  { label: "Recent scans", value: "3", detail: "Manual scans this week" },
  { label: "Tailored resumes", value: "7", detail: "Saved to this workspace" }
];

export const jobs = [
  {
    id: "together-senior-program-manager",
    company: "Together AI",
    role: "Senior Program Manager, Infrastructure Strategy and Business Operations",
    workflowState: "live_pipeline",
    freshness: "3 days ago",
    freshnessSource: "LinkedIn public verification",
    location: "San Francisco",
    relevanceScore: 92,
    priority: "High",
    sourcePlatform: "Greenhouse",
    sourceUrl: "https://job-boards.greenhouse.io/togetherai",
    reason: "Strong fit across program management, business operations, and infrastructure strategy.",
    funding: "Recent funding led by General Catalyst",
    jdSummary: "Cross-functional infrastructure planning, operating cadence, and leadership reporting.",
    description: "Own strategic programs across infrastructure business operations, planning, and execution. Drive leadership updates, KPI reporting, and cross-functional alignment."
  },
  {
    id: "smithrx-strategic-finance",
    company: "SmithRx",
    role: "Senior Strategic Finance Manager",
    workflowState: "live_pipeline",
    freshness: "2 days ago",
    freshnessSource: "Direct ATS page",
    location: "Remote / Bay Area",
    relevanceScore: 88,
    priority: "High",
    sourcePlatform: "Greenhouse",
    sourceUrl: "https://job-boards.greenhouse.io/smithrx",
    reason: "Strong overlap on financial modeling, capacity planning, and business partnering.",
    funding: "Growth-stage healthtech with investor momentum",
    jdSummary: "Strategic finance, operating models, budgeting, and executive decision support.",
    description: "Lead strategic finance workstreams, support annual planning, and partner cross-functionally on key growth decisions."
  },
  {
    id: "lucid-strategy-business-ops",
    company: "Lucid",
    role: "Strategy & Business Operations Manager",
    workflowState: "live_pipeline",
    freshness: "4 days ago",
    freshnessSource: "Direct company page",
    location: "Bay Area",
    relevanceScore: 85,
    priority: "Medium",
    sourcePlatform: "Company careers",
    sourceUrl: "https://careers.lucidmotors.com",
    reason: "Very good strategy and operating cadence fit with strong Bay Area alignment.",
    funding: "Public company, lower startup priority but strong role fit",
    jdSummary: "Strategic planning, KPI management, and cross-functional execution.",
    description: "Support operating rhythms, strategic analyses, and organizational planning across business functions."
  },
  {
    id: "canva-program-manager-review",
    company: "Canva",
    role: "Program Manager, Strategy and Enablement",
    workflowState: "review_queue",
    freshness: "Unknown",
    freshnessSource: "Review needed",
    location: "Remote / US",
    relevanceScore: 81,
    priority: "Medium",
    sourcePlatform: "SmartRecruiters",
    sourceUrl: "https://jobs.smartrecruiters.com/Canva",
    reason: "Needs date verification before pipeline promotion.",
    funding: "Established company, lower funding priority",
    jdSummary: "Program execution, enablement, and strategic coordination.",
    description: "Drive enablement and strategic initiatives while coordinating across multiple teams."
  },
  {
    id: "mixpanel-revops-review",
    company: "Mixpanel",
    role: "Revenue Strategy & Operations Manager",
    workflowState: "review_queue",
    freshness: "Unknown",
    freshnessSource: "LinkedIn match ambiguous",
    location: "San Francisco",
    relevanceScore: 84,
    priority: "Medium",
    sourcePlatform: "Greenhouse",
    sourceUrl: "https://job-boards.greenhouse.io/mixpanel",
    reason: "Strong GTM and strategy fit, but freshness still needs confirmation.",
    funding: "Backed by a16z, Sequoia, Y Combinator",
    jdSummary: "Revenue operations, planning, and executive-facing analytics.",
    description: "Build revenue insights, partner with GTM leaders, and drive operating rigor across sales and marketing."
  }
];

export const applications = [
  {
    id: "vise-business-ops",
    company: "Vise",
    role: "Business Operations Lead",
    status: "Archived",
    freshness: "Closed",
    note: "No longer accepting applications"
  },
  {
    id: "kardigan-corporate-strategy",
    company: "Kardigan",
    role: "Corporate Strategy",
    status: "Tailored",
    note: "Resume and cover letter drafted"
  }
];

export const resumeVariants = [
  {
    id: "base",
    name: "Base Resume",
    roleFamily: "General business roles",
    active: true,
    lastUpdated: "2 days ago",
    summary: "General strategy, operations, and leadership narrative."
  },
  {
    id: "strategy-ops",
    name: "Strategy & Ops",
    roleFamily: "Strategy & Operations",
    active: false,
    lastUpdated: "1 day ago",
    summary: "Best for strategic planning, operating cadence, and executive support roles."
  },
  {
    id: "gtm-ops",
    name: "GTM / Revenue Ops",
    roleFamily: "GTM / Revenue Operations",
    active: false,
    lastUpdated: "5 days ago",
    summary: "Best for rev ops, enablement, and commercial planning roles."
  },
  {
    id: "strategic-finance",
    name: "Strategic Finance",
    roleFamily: "Strategic Finance",
    active: false,
    lastUpdated: "3 days ago",
    summary: "Best for planning, modeling, and finance-partnering roles."
  }
];

export const generatedMaterials = [
  {
    id: "together-resume",
    kind: "Tailored Resume",
    title: "Together AI - Infrastructure Strategy Resume Draft",
    status: "Ready for review"
  },
  {
    id: "lucid-cover-letter",
    kind: "Cover Letter",
    title: "Lucid - Strategy & Business Operations Cover Letter",
    status: "Drafted"
  }
];

export function getJob(jobId) {
  return jobs.find((job) => job.id === jobId);
}
