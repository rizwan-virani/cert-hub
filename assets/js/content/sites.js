/* ===========================================================================
   STUDY-PLATFORM REGISTRY  ::  the sites this hub launches into.
   Single source of truth for the launcher cards and the cross-site dashboard.

   `slug` is the repo / directory name; `port` is the local dev port from the
   root .claude/launch.json. URL resolution (local vs. deployed) is handled by
   resolveSiteUrl() in hub.js, so this file stays deployment-agnostic.

   `progressKey` is the localStorage key each site writes its standardized
   examProgress.v1 object to. The hub only ever READS it.

   `short`        — friendly display name (e.g. "Security+", "CySA+", "CC").
   `studyHours`   — realistic average prep-time benchmark.
   `prereq`       — recommended prior cert (micro-tag on the card), or omitted.
   `objectivesUrl`— official exam-objectives page (the blueprint download).
   =========================================================================== */
window.SITES = [
  {
    slug: "a-plus-c1", port: 8103, vendor: "CompTIA", name: "CompTIA A+ Core 1",
    short: "A+ Core 1", abbr: "A+ C1", examCode: "220-1201", track: "Foundations", level: 1,
    blurb: "Hardware, networking basics, mobile, and cloud — the hands-on entry point to IT.",
    accent: "#e23b3b", progressKey: "aplus1.examProgress.v1", studyHours: "60–90 hrs",
    objectivesUrl: "https://www.comptia.org/certifications/a",
    counts: { domains: 5, questions: 500, cards: 500, pbqs: 150, labs: 20, reading: 80 }
  },
  {
    slug: "a-plus-c2", port: 8123, vendor: "CompTIA", name: "CompTIA A+ Core 2",
    short: "A+ Core 2", abbr: "A+ C2", examCode: "220-1202", track: "Foundations", level: 1,
    blurb: "Operating systems, security, software troubleshooting, and operational procedures.",
    accent: "#e2553b", progressKey: "aplus2.examProgress.v1", studyHours: "60–90 hrs",
    objectivesUrl: "https://www.comptia.org/certifications/a",
    counts: { domains: 4, questions: 500, cards: 500, pbqs: 100, labs: 20, reading: 42 }
  },
  {
    slug: "ai-fundamentals", port: 8124, vendor: "CompTIA", name: "CompTIA AI Fundamentals",
    short: "AI Fundamentals", abbr: "AI FUND", examCode: "AI Fundamentals", track: "Foundations", level: 1,
    blurb: "AI literacy for every field — use generative AI effectively, responsibly, and transparently across six study domains.",
    accent: "#10b981", progressKey: "aifund.examProgress.v1", studyHours: "40–55 hrs",
    objectivesUrl: "https://www.comptia.org/",
    counts: { domains: 6, questions: 600, cards: 600, pbqs: 30, labs: 20, reading: 86 }
  },
  {
    slug: "ai-essentials", port: 8125, vendor: "CompTIA", name: "CompTIA AI Essentials",
    short: "AI Essentials", abbr: "AI ESS", examCode: "AI Essentials", track: "Foundations", level: 1,
    blurb: "Practical AI fluency for any role — use generative AI effectively, verify outputs, and work responsibly across five study domains.",
    accent: "#8b5cf6", progressKey: "aiess.examProgress.v1", studyHours: "20–30 hrs",
    objectivesUrl: "https://www.comptia.org/en-us/certifications/ai-essentials/",
    counts: { domains: 5, questions: 500, cards: 500, pbqs: 30, labs: 20, reading: 86 }
  },
  {
    slug: "network-plus", port: 8102, vendor: "CompTIA", name: "CompTIA Network+",
    short: "Network+", abbr: "NET+", examCode: "N10-009", track: "Infrastructure", level: 2,
    blurb: "Network architecture, implementation, operations, and troubleshooting.",
    accent: "#3b8ee2", progressKey: "netplus.examProgress.v1", studyHours: "60–90 hrs", prereq: "A+",
    objectivesUrl: "https://www.comptia.org/certifications/network",
    counts: { domains: 5, questions: 500, cards: 500, pbqs: 210, labs: 20, reading: 82 }
  },
  {
    slug: "server-plus", port: 8108, vendor: "CompTIA", name: "CompTIA Server+",
    short: "Server+", abbr: "SRV+", examCode: "SK0-005", track: "Infrastructure", level: 2,
    blurb: "Server hardware, administration, storage, security, and disaster recovery.",
    accent: "#5a6acf", progressKey: "srvplus.examProgress.v1", studyHours: "40–60 hrs", prereq: "A+",
    objectivesUrl: "https://www.comptia.org/certifications/server",
    counts: { domains: 4, questions: 400, cards: 400, pbqs: 30, labs: 20, reading: 58 }
  },
  {
    slug: "linux-plus", port: 8109, vendor: "CompTIA", name: "CompTIA Linux+",
    short: "Linux+", abbr: "LNX+", examCode: "XK0-006", track: "Infrastructure", level: 2,
    blurb: "Linux system management, security, scripting, automation, and troubleshooting.",
    accent: "#d6a02a", progressKey: "linuxplus.examProgress.v1", studyHours: "60–90 hrs", prereq: "A+",
    objectivesUrl: "https://www.comptia.org/certifications/linux",
    counts: { domains: 5, questions: 500, cards: 500, pbqs: 30, labs: 20, reading: 78 }
  },
  {
    slug: "cloud-plus", port: 8104, vendor: "CompTIA", name: "CompTIA Cloud+",
    short: "Cloud+", abbr: "CLD+", examCode: "CV0-004", track: "Infrastructure", level: 2,
    blurb: "Cloud architecture, deployment, operations, security, and DevOps fundamentals.",
    accent: "#2aaed6", progressKey: "cloudplus.examProgress.v1", studyHours: "50–70 hrs", prereq: "Network+",
    objectivesUrl: "https://www.comptia.org/certifications/cloud",
    counts: { domains: 6, questions: 500, cards: 500, pbqs: 30, labs: 20, reading: 87 }
  },
  {
    slug: "security-plus", port: 8101, vendor: "CompTIA", name: "CompTIA Security+",
    short: "Security+", abbr: "SEC+", examCode: "SY0-701", track: "Security", level: 2,
    blurb: "The industry-standard security baseline: threats, architecture, operations, GRC.",
    accent: "#2ad6a5", progressKey: "secplus.examProgress.v1", flagship: true, studyHours: "60–80 hrs", prereq: "Network+",
    objectivesUrl: "https://www.comptia.org/certifications/security",
    counts: { domains: 5, questions: 500, cards: 500, pbqs: 150, labs: 20, reading: 86 }
  },
  {
    slug: "cc", port: 8105, vendor: "ISC2", name: "ISC2 Certified in Cybersecurity",
    short: "CC", abbr: "CC", examCode: "CC", track: "Security", level: 1,
    blurb: "ISC2's entry-level cybersecurity credential across five security domains.",
    accent: "#33b1a3", progressKey: "ISC2CC.examProgress.v1", studyHours: "20–30 hrs",
    objectivesUrl: "https://www.isc2.org/certifications/cc",
    counts: { domains: 5, questions: 500, cards: 500, pbqs: 30, labs: 20, reading: 81 }
  },
  {
    slug: "cysa-plus", port: 8110, vendor: "CompTIA", name: "CompTIA CySA+",
    short: "CySA+", abbr: "CYSA+", examCode: "CS0-004", track: "Security", level: 3,
    blurb: "Security analytics, threat detection, incident response, and SOC operations.",
    accent: "#6a5acf", progressKey: "cysaplus.examProgress.v1", studyHours: "60–90 hrs", prereq: "Security+",
    objectivesUrl: "https://www.comptia.org/certifications/cybersecurity-analyst",
    counts: { domains: 4, questions: 400, cards: 400, pbqs: 30, labs: 20, reading: 51 }
  },
  {
    slug: "pentest-plus", port: 8848, vendor: "CompTIA", name: "CompTIA PenTest+",
    short: "PenTest+", abbr: "PEN+", examCode: "PT0-003", track: "Security", level: 3,
    blurb: "Offensive security: engagement management, reconnaissance, vulnerability discovery, attacks, and post-exploitation.",
    accent: "#cf3b6a", progressKey: "pentest.examProgress.v1", studyHours: "60–90 hrs", prereq: "Security+",
    objectivesUrl: "https://www.comptia.org/certifications/pentest",
    counts: { domains: 5, questions: 500, cards: 500, pbqs: 150, labs: 20, reading: 86 }
  },
  {
    slug: "secai-plus", port: 8107, vendor: "CompTIA", name: "CompTIA SecAI+",
    short: "SecAI+", abbr: "SECAI+", examCode: "CY0-001", track: "Security", level: 3,
    blurb: "Securing and defending AI systems — the emerging AI-security specialty.",
    accent: "#b14fd6", progressKey: "secai.examProgress.v1", studyHours: "40–60 hrs", prereq: "Security+",
    objectivesUrl: "https://www.comptia.org/certifications",
    counts: { domains: 4, questions: 400, cards: 400, pbqs: 36, labs: 20, reading: 54 }
  },
  {
    slug: "data-plus", port: 8112, vendor: "CompTIA", name: "CompTIA Data+",
    short: "Data+", abbr: "DATA+", examCode: "DA0-002", track: "Specialty", level: 2,
    blurb: "Data analytics: mining, analysis, visualization, and data governance.",
    accent: "#2a8fd6", progressKey: "dataplus.examProgress.v1", studyHours: "40–60 hrs",
    objectivesUrl: "https://www.comptia.org/certifications/data",
    counts: { domains: 5, questions: 500, cards: 500, pbqs: 30, labs: 20, reading: 66 }
  },
  {
    slug: "project-plus", port: 8111, vendor: "CompTIA", name: "CompTIA Project+",
    short: "Project+", abbr: "PROJ+", examCode: "PK0-005", track: "Specialty", level: 2,
    blurb: "Project lifecycle, communication, change, and IT project management.",
    accent: "#d68a2a", progressKey: "projplus.examProgress.v1", studyHours: "30–50 hrs",
    objectivesUrl: "https://www.comptia.org/certifications/project",
    counts: { domains: 4, questions: 400, cards: 400, pbqs: 30, labs: 20, reading: 24 }
  },
  {
    slug: "cissp", port: 8115, vendor: "ISC2", name: "ISC2 CISSP",
    short: "CISSP", abbr: "CISSP", examCode: "CISSP", track: "Security", level: 4,
    blurb: "The gold-standard credential for experienced security leaders across eight domains.",
    accent: "#34d5e6", progressKey: "cissp.examProgress.v1", studyHours: "120–180 hrs", prereq: "Security+",
    objectivesUrl: "https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline",
    counts: { domains: 8, questions: 800, cards: 800, pbqs: 30, labs: 20, reading: 84 }
  },
  {
    slug: "ccsp", port: 8116, vendor: "ISC2", name: "ISC2 CCSP",
    short: "CCSP", abbr: "CCSP", examCode: "CCSP", track: "Security", level: 4,
    blurb: "The gold-standard vendor-neutral credential for cloud security architects across six domains.",
    accent: "#34d5e6", progressKey: "ccsp.examProgress.v1", studyHours: "100–140 hrs", prereq: "CISSP or Security+",
    objectivesUrl: "https://www.isc2.org/certifications/ccsp/ccsp-certification-exam-outline",
    counts: { domains: 6, questions: 600, cards: 600, pbqs: 30, labs: 20, reading: 72 }
  },
  {
    slug: "cisa", port: 8119, vendor: "ISACA", name: "ISACA CISA",
    short: "CISA", abbr: "CISA", examCode: "CISA", track: "Governance", level: 4,
    blurb: "The leading credential for IS audit, assurance, and control professionals across five domains.",
    accent: "#34d5e6", progressKey: "cisa.examProgress.v1", studyHours: "80–120 hrs", prereq: "Security+ or equivalent",
    objectivesUrl: "https://www.isaca.org/credentialing/cisa",
    counts: { domains: 5, questions: 500, cards: 500, pbqs: 30, labs: 20, reading: 60 }
  },
  {
    slug: "cism", port: 8120, vendor: "ISACA", name: "ISACA CISM",
    short: "CISM", abbr: "CISM", examCode: "CISM", track: "Governance", level: 4,
    blurb: "The leading management credential for information security leaders across four domains.",
    accent: "#34d5e6", progressKey: "cism.examProgress.v1", studyHours: "100–150 hrs", prereq: "Security+ or CISA",
    objectivesUrl: "https://www.isaca.org/credentialing/cism",
    counts: { domains: 4, questions: 400, cards: 400, pbqs: 30, labs: 20, reading: 56 }
  },
  {
    slug: "cdpse", port: 8121, vendor: "ISACA", name: "ISACA CDPSE",
    short: "CDPSE", abbr: "CDPSE", examCode: "CDPSE", track: "Governance", level: 4,
    blurb: "ISACA's technical privacy credential — build privacy into systems and the data life cycle across four domains.",
    accent: "#34d5e6", progressKey: "cdpse.examProgress.v1", studyHours: "100–150 hrs", prereq: "Security+ or privacy/data-protection experience",
    objectivesUrl: "https://www.isaca.org/credentialing/cdpse",
    counts: { domains: 4, questions: 400, cards: 400, pbqs: 30, labs: 20, reading: 56 }
  },
  {
    slug: "crisc", port: 8122, vendor: "ISACA", name: "ISACA CRISC",
    short: "CRISC", abbr: "CRISC", examCode: "CRISC", track: "Governance", level: 4,
    blurb: "ISACA's leading IT-risk credential — identify, assess, respond to, and report enterprise IT risk across four domains.",
    accent: "#34d5e6", progressKey: "crisc.examProgress.v1", studyHours: "100–150 hrs", prereq: "Security+ or CISA / IT-risk experience",
    objectivesUrl: "https://www.isaca.org/credentialing/crisc",
    counts: { domains: 4, questions: 400, cards: 400, pbqs: 30, labs: 20, reading: 56 }
  }
];

/* Track metadata — drives the learning-pathway view and the explorer filters. */
window.SITE_TRACKS = [
  { id: "Foundations",   label: "Foundations",        hint: "Start here if you're new to IT." },
  { id: "Infrastructure", label: "Infrastructure & Ops", hint: "Networks, servers, Linux, cloud." },
  { id: "Security",      label: "Cybersecurity",      hint: "From entry security to specialist." },
  { id: "Governance",    label: "Governance & Audit", hint: "IS audit, assurance, and IT governance credentials." },
  { id: "Specialty",     label: "Specialty",          hint: "Data and project management." }
];
