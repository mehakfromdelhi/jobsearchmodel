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

export const resumeVariants = [
  {
    id: "resume-strategy",
    name: "Strategy Resume",
    roleFamily: "Strategy & Operations",
    active: true,
    lastUpdated: "4/10/2026",
    summary: "Best for strategy, business operations, and leadership-facing planning work.",
    content:
      "Mehak Bhatia\nStrategy and operations leader with experience across planning, stakeholder management, KPI ownership, and cross-functional execution."
  },
  {
    id: "resume-finance",
    name: "Strategic Finance Resume",
    roleFamily: "Strategic Finance",
    active: false,
    lastUpdated: "4/09/2026",
    summary: "Best for financial modeling, planning, and business partnering roles.",
    content:
      "Mehak Bhatia\nStrategic finance and planning operator with budgeting, capacity planning, business reviews, and operating model experience."
  }
];

export const latestAnalysisRun = {
  id: "analysis-latest",
  createdAt: "4/10/2026, 9:15 AM",
  roleCount: 2,
  resumeCount: 2,
  atsMatchCount: 3,
  hrMatchCount: 2,
  topRecommendation: "2 strong-fit pairs, 1 stretch-fit pair",
  submittedUrls: [
    "https://jobs.example.com/clay/gtm-strategy",
    "https://jobs.example.com/together/program-manager"
  ],
  results: {
    resumeInputs: [
      {
        id: "resume-strategy",
        name: "Strategy Resume",
        roleFamily: "Strategy & Operations",
        content: resumeVariants[0].content
      },
      {
        id: "resume-finance",
        name: "Strategic Finance Resume",
        roleFamily: "Strategic Finance",
        content: resumeVariants[1].content
      }
    ],
    roles: [
      {
        id: "role-clay",
        company: "Clay",
        role: "GTM Strategy Lead",
        sourceUrl: "https://jobs.example.com/clay/gtm-strategy",
        sourcePlatform: "Greenhouse",
        location: "New York",
        jdSummary: "Drive GTM planning, enablement, segmentation, and execution cadence.",
        description:
          "Lead GTM strategy, build operating rhythms, partner with sales and marketing leaders, and improve execution against company goals.",
        atsMatchCount: 2,
        hrMatchCount: 1,
        bestResumeId: "resume-strategy"
      },
      {
        id: "role-together",
        company: "Together AI",
        role: "Senior Program Manager, Infrastructure Strategy and Business Operations",
        sourceUrl: "https://jobs.example.com/together/program-manager",
        sourcePlatform: "Greenhouse",
        location: "San Francisco",
        jdSummary: "Program management, cross-functional execution, operating cadence, and leadership reporting.",
        description:
          "Own strategic programs, infrastructure planning, KPI reporting, and leadership communications across multiple technical and business stakeholders.",
        atsMatchCount: 1,
        hrMatchCount: 1,
        bestResumeId: "resume-strategy"
      }
    ],
    pairs: [
      {
        pairId: "pair-1",
        roleId: "role-clay",
        resumeId: "resume-strategy",
        resumeName: "Strategy Resume",
        atsScore: 88,
        hrScore: 82,
        recommendation: "Strong fit",
        strengths: [
          "Strong overlap on GTM planning and execution cadence.",
          "Resume shows stakeholder management and business planning language."
        ],
        gaps: ["Add more explicit enablement and segmentation language."],
        redFlags: []
      },
      {
        pairId: "pair-2",
        roleId: "role-clay",
        resumeId: "resume-finance",
        resumeName: "Strategic Finance Resume",
        atsScore: 71,
        hrScore: 64,
        recommendation: "Stretch but viable",
        strengths: ["Planning and business review language is relevant."],
        gaps: ["Resume does not emphasize GTM or enablement strongly enough."],
        redFlags: ["Role is more commercial than finance-forward."]
      },
      {
        pairId: "pair-3",
        roleId: "role-together",
        resumeId: "resume-strategy",
        resumeName: "Strategy Resume",
        atsScore: 92,
        hrScore: 86,
        recommendation: "Strong fit",
        strengths: [
          "Program management, operating cadence, and stakeholder alignment map closely.",
          "Leadership-facing execution narrative is strong."
        ],
        gaps: ["Could add more infrastructure or technical program language."],
        redFlags: []
      },
      {
        pairId: "pair-4",
        roleId: "role-together",
        resumeId: "resume-finance",
        resumeName: "Strategic Finance Resume",
        atsScore: 68,
        hrScore: 60,
        recommendation: "Not recommended",
        strengths: ["Business review and planning vocabulary overlaps."],
        gaps: ["Resume does not show enough program-management ownership."],
        redFlags: ["Likely recruiter mismatch on role family."]
      }
    ]
  }
};

export const analysisHistory = [
  latestAnalysisRun,
  {
    id: "analysis-older",
    createdAt: "4/09/2026, 4:20 PM",
    roleCount: 1,
    resumeCount: 2,
    atsMatchCount: 1,
    hrMatchCount: 1,
    topRecommendation: "1 strong-fit role found",
    submittedUrls: ["https://jobs.example.com/notion/strategy-ops"],
    results: latestAnalysisRun.results
  }
];

export function getAnalysisRun(runId) {
  return analysisHistory.find((item) => item.id === runId) || latestAnalysisRun;
}
