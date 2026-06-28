/**
 * Curated SEO data — the seed catalogue for programmatic pages.
 *
 * The page templates first read from this file, then merge any matching
 * row from IndustryPage / CityPage / Company tables so the admin can
 * override per-slug content without redeploying. This file ships with the
 * launch set; new entries are appended here rather than via the database.
 *
 * Slugs are stable URL-safe identifiers. Changing one is a permanent SEO
 * regression — add a 301 redirect first.
 */

export interface IndustrySeed {
  slug: string
  name: string
  // 100-160 char meta description
  metaDescription: string
  // 600-1000 word body paragraphs
  body: string[]
  // Template registry keys we feature on the page (from lib/pdf/registry.ts)
  templateKeys: string[]
  // 3-4 frequently-asked Q&A pairs
  faqs: Array<{ q: string; a: string }>
}

export const INDUSTRIES: IndustrySeed[] = [
  {
    slug: 'banking',
    name: 'Banking',
    metaDescription:
      'ATS-ready CV templates for banking roles in Dubai and Abu Dhabi. Tailored to CBUAE, Basel III, and Gulf compliance vocabulary.',
    body: [
      'UAE banking recruiters scan for regulatory fluency, certifications, and quantified impact. A CV that opens with a clear specialty (retail credit risk, AML, wealth management) tends to clear the first filter at HSBC, Emirates NBD, ADCB, and the regional offices of Citi and Standard Chartered.',
      'Build your bullets around outcomes the team can verify: portfolios managed, NPL ratios moved, audit findings closed, capital ratios improved. Generic phrases like "strong communicator" rarely make the shortlist.',
      'Certifications matter. CFA, FRM, CAMS, and ACCA are the ones we see weighted most heavily in Gulf banking interviews. Put them in a dedicated section near the top of page one, not buried near the bottom.',
    ],
    templateKeys: ['dubai-classic', 'abu-dhabi-executive'],
    faqs: [
      {
        q: 'What ATS keywords matter most for UAE banking jobs?',
        a: 'KYC, AML, Basel III, IFRS, credit risk, CBUAE, retail banking, corporate banking, wealth management, CFA — woven into experience bullets, not stockpiled in a skills list.',
      },
      {
        q: 'Should I add a photo to a UAE banking CV?',
        a: 'It is still common in regional banks but optional. Modern ATS pipelines strip images; some reject CVs that include them. Our ATS-safe templates omit the photo by design.',
      },
      {
        q: 'How long should a banking CV be?',
        a: 'Two pages for mid-career. One page for fresh graduates. Three pages only at senior leadership level with a board-level summary.',
      },
    ],
  },
  {
    slug: 'tech',
    name: 'Technology',
    metaDescription:
      'CV templates for software, data, and product roles across the UAE. Optimised for stack keywords and quantified delivery.',
    body: [
      "Tech teams in Dubai's Internet City, Silicon Oasis, and Abu Dhabi's Hub71 cluster scan for stack matches first, outcomes second. Lead with the languages and platforms you actually shipped in production.",
      'Quantify what you delivered: latency reduced, deployments per day, defect rate, NPS, monthly active users. Recruiters at Careem, Talabat, Property Finder, and the regional offices of AWS, Microsoft, and Google specifically look for these numbers.',
      "Open-source contributions and a public portfolio matter more in tech than in any other UAE industry. Include a link near your name — recruiters will click.",
    ],
    templateKeys: ['sharjah-minimal', 'gulf-modern'],
    faqs: [
      {
        q: 'Which tech keywords should I prioritise for UAE roles?',
        a: 'TypeScript, React, Node.js, Python, AWS, Kubernetes, PostgreSQL, CI/CD, microservices — match exactly to the job ad. Acronyms must appear verbatim; ATS systems do not stem.',
      },
      {
        q: 'Do UAE tech companies prefer GitHub links or a portfolio site?',
        a: "Either, but include one. A GitHub profile with three pinned repositories beats a buzzword-heavy skills list.",
      },
      {
        q: 'What about visa sponsorship — should I mention it?',
        a: 'If you already have a transferable UAE visa or NOC, state it once near the contact block. If you need sponsorship, omit the topic — it belongs to the interview conversation.',
      },
    ],
  },
  {
    slug: 'hospitality',
    name: 'Hospitality',
    metaDescription:
      'Hospitality CVs built for Dubai and Abu Dhabi hotel groups. Forbes 5-star, Opera PMS, F&B operations vocabulary.',
    body: [
      "Dubai and Abu Dhabi's hotel pipeline is one of the largest in the world. Recruiters at Jumeirah, Emaar Hospitality, Marriott, Hilton, and Address scan for property scale (room count), service level (Forbes / Leading Hotels), and tangible guest-experience metrics.",
      'Open with a property-and-tenure line: "Front Office Manager · The Address Downtown · 240 keys · 2022-Present". That single line tells a recruiter what you can step into.',
      'Include guest scores. Marriott uses GSI, Hilton uses SALT, Jumeirah uses their internal index. Each is a credible proxy for performance.',
    ],
    templateKeys: ['gulf-modern', 'dubai-classic'],
    faqs: [
      {
        q: 'How do I structure a hospitality CV for UAE 5-star properties?',
        a: 'Lead with property scale (room count, F&B outlets), then a metrics line (guest satisfaction, occupancy, RevPAR), then experience.',
      },
      {
        q: 'Should I list languages on a hospitality CV?',
        a: 'Yes — name them with proficiency. Russian, Arabic, Mandarin, and German command premium for guest-facing roles in Dubai.',
      },
      {
        q: 'What hospitality keywords do ATS systems pick up?',
        a: 'Opera PMS, Micros, OnQ, guest experience, F&B, banquet, concierge, occupancy, RevPAR, Forbes 5-star.',
      },
    ],
  },
  {
    slug: 'construction',
    name: 'Construction',
    metaDescription:
      'Engineering and construction CVs aligned with FIDIC, Primavera P6, and UAE site supervision standards.',
    body: [
      "UAE construction recruiters at Arabtec, ALEC, Khansaheb, ASGC, and Trojan look for project scale (value in AED), discipline (MEP, civil, structural), and contract familiarity (FIDIC, NEC).",
      'Quantify project scale — project budget, GFA built, headcount supervised, programme variance closed. "Delivered $40M MEP scope, three months early" beats "managed large project".',
      "Safety credentials are non-negotiable for site roles. NEBOSH IGC, IOSH, OSHAD are the three most commonly checked. If you have them, list them prominently.",
    ],
    templateKeys: ['dubai-classic', 'abu-dhabi-executive'],
    faqs: [
      {
        q: 'Which construction ATS keywords matter in the UAE?',
        a: 'FIDIC, BOQ, Primavera P6, AutoCAD, MEP, HSE, NEBOSH, IOSH, tendering, cost control, site supervision.',
      },
      {
        q: 'How important are safety certifications on a UAE construction CV?',
        a: 'Critical for site-based roles. NEBOSH IGC or IOSH Managing Safely is usually a hard filter for supervisor and PM positions.',
      },
      {
        q: 'Should I list project values in AED or USD?',
        a: 'AED — UAE recruiters expect it. Convert from USD if your prior work was abroad.',
      },
    ],
  },
  {
    slug: 'healthcare',
    name: 'Healthcare',
    metaDescription:
      'Clinical and allied-health CVs for DHA, HAAD, and MOH licensure in the UAE.',
    body: [
      "Licensure is the gating filter. DHA (Dubai), DOH (Abu Dhabi, formerly HAAD), and MOH (Northern Emirates) eligibility letters or active licences must be stated at the top of page one — not in a notes section.",
      "Clinical recruiters at SEHA, Mediclinic, Cleveland Clinic Abu Dhabi, and NMC verify case load and accreditation before opening the second page. Include patient volume, complexity, and JCI / Joint Commission familiarity.",
      'Continuing education matters. List the CME hours by year if you are revalidating soon — UAE licensing authorities count them.',
    ],
    templateKeys: ['abu-dhabi-executive', 'dubai-classic'],
    faqs: [
      {
        q: 'Do I need DHA or DOH eligibility before applying?',
        a: 'Not always before applying, but a passing primary-source verification helps. State your current status candidly — "DataFlow in progress, June 2026".',
      },
      {
        q: 'Should I include patient volume on a clinical CV?',
        a: 'Yes. Procedures per year, inpatients managed, ICU admissions covered — recruiters use these to gauge fit for the role level.',
      },
      {
        q: 'Which healthcare keywords pass UAE ATS systems?',
        a: 'DHA, DOH, MOH, EMR, JCI accreditation, infection control, clinical governance, plus your specialty-specific terms.',
      },
    ],
  },
  {
    slug: 'finance',
    name: 'Finance & Accounting',
    metaDescription:
      'Finance and accounting CVs aligned with IFRS, VAT, and UAE corporate-tax requirements.',
    body: [
      "Recruiters at PwC, EY, KPMG, Deloitte, and corporate FP&A teams scan for qualification first (ACCA, CMA, CPA, ICAEW), then for closing experience (month-end, year-end), then for system fluency (SAP, Oracle Fusion, NetSuite, Tally).",
      'Quantify what you closed. "Owned month-end close for a 4-entity consolidation in 6 working days" is more credible than "responsible for monthly accounts".',
      'UAE corporate tax went live in 2023. Familiarity with VAT, ESR, and the new corporate-tax regime is now a routine ATS keyword for senior accounting roles.',
    ],
    templateKeys: ['dubai-classic', 'abu-dhabi-executive'],
    faqs: [
      {
        q: 'Which accounting certifications do UAE employers value most?',
        a: 'ACCA leads, then CMA, CPA (US), and ICAEW. CIMA is well-recognised at the FP&A level.',
      },
      {
        q: 'Should I list VAT and corporate tax experience separately?',
        a: 'Yes. They are distinct skill sets and recruiters filter on both in 2026.',
      },
      {
        q: 'What finance keywords does the UAE ATS pick up?',
        a: 'IFRS, IFRS 16, VAT, ESR, financial modelling, P&L, consolidation, audit, ACCA, CMA, CPA, SAP, Oracle Fusion.',
      },
    ],
  },
]

// ─── Roles (job-title pages: /cv-for/[role]) ─────────────────────────────────

export interface RoleSeed {
  slug: string
  title: string
  industry: string // matches IndustrySeed.slug if applicable
  metaDescription: string
  body: string[]
  templateKeys: string[]
}

export const ROLES: RoleSeed[] = [
  {
    slug: 'software-engineer',
    title: 'Software Engineer',
    industry: 'tech',
    metaDescription:
      'Software Engineer CV templates for UAE tech roles. Stack-keyword optimised and ATS-ready.',
    body: [
      'Open with three things: years of experience, primary stack, and a verifiable artifact. "Five years, TypeScript + Node, three production launches" reads better than a long objective.',
      'Bullets should be cause-and-effect: "Migrated payments service from REST to gRPC; latency dropped from 240ms to 80ms at p95."',
      "Include systems you've designed, not just code you've written. UAE tech recruiters at Careem, Talabat, and Property Finder hire for systems thinking.",
    ],
    templateKeys: ['sharjah-minimal', 'gulf-modern'],
  },
  {
    slug: 'accountant',
    title: 'Accountant',
    industry: 'finance',
    metaDescription:
      'Accountant CV templates for UAE finance roles, aligned with IFRS, VAT, and corporate-tax fluency.',
    body: [
      'State your qualification clearly on line one (ACCA, CMA, CPA, ICAEW) and your closing cadence in the summary.',
      'Quantify in days and entities: "Owned 6-day month-end close across 4 entities on Oracle Fusion".',
      'List the UAE-specific compliance you have run — VAT returns, ESR notifications, corporate-tax registration.',
    ],
    templateKeys: ['dubai-classic'],
  },
  {
    slug: 'project-manager',
    title: 'Project Manager',
    industry: 'construction',
    metaDescription:
      'Project Manager CV templates for UAE construction, engineering, and infrastructure programmes.',
    body: [
      'Lead with project value, programme, and discipline mix. "PMP-certified PM with $80M MEP and infrastructure delivery across Dubai South" beats "experienced PM seeking opportunities".',
      'Include FIDIC contract familiarity and Primavera P6 fluency explicitly.',
      'List safety certifications (NEBOSH IGC, IOSH) — these are routinely required to even shortlist.',
    ],
    templateKeys: ['abu-dhabi-executive', 'dubai-classic'],
  },
  {
    slug: 'sales-manager',
    title: 'Sales Manager',
    industry: 'tech',
    metaDescription:
      'Sales Manager CV templates for UAE B2B and SaaS sales roles. Quota-attainment-led structure.',
    body: [
      'Open with quota attainment, average deal size, and pipeline you owned. Anything else is filler.',
      'Quantify cycle length, win rates, and named accounts. UAE buying committees are smaller than US/EU; show you can navigate them.',
      'List the CRM you ran (HubSpot, Salesforce, Pipedrive) and any sales methodology you actually used (MEDDIC, Challenger, SPIN).',
    ],
    templateKeys: ['gulf-modern', 'dubai-classic'],
  },
  {
    slug: 'nurse',
    title: 'Registered Nurse',
    industry: 'healthcare',
    metaDescription:
      'Nursing CV templates for DHA, DOH, and MOH licensure in the UAE.',
    body: [
      'State licensure status at the top: country of qualification, DataFlow status, eligibility letter status.',
      'Include patient cohort and ward complexity. "ICU, 14-bed, mixed surgical/medical" reads better than "ICU nurse".',
      'Continuing professional development matters. List CPD hours by year and any specialty certifications (BLS, ACLS, PALS).',
    ],
    templateKeys: ['dubai-classic'],
  },
  {
    slug: 'marketing-manager',
    title: 'Marketing Manager',
    industry: 'tech',
    metaDescription:
      'Marketing Manager CV templates for UAE brand, growth, and digital roles.',
    body: [
      'Lead with channels owned and the metric you moved. "Owned paid social, MQL volume from 800 to 2,400/mo at flat CAC" is the right shape.',
      'Specify the markets you ran — UAE-only? GCC? MENA? Each implies a different operating model and recruiters read it that way.',
      'List the stack: HubSpot, Google Ads, Meta Ads, GA4, attribution model. Vague references to "digital marketing" do not pass ATS.',
    ],
    templateKeys: ['gulf-modern', 'sharjah-minimal'],
  },
]

// ─── Cities (UAE emirates: /jobs/[city]) ─────────────────────────────────────

export interface CitySeed {
  slug: string
  name: string
  metaDescription: string
  body: string[]
  industries: string[] // industry slugs strongest in this city
}

export const CITIES: CitySeed[] = [
  {
    slug: 'dubai',
    name: 'Dubai',
    metaDescription:
      'CV templates and job-application tips for Dubai roles across finance, tech, retail, and hospitality.',
    body: [
      "Dubai's hiring market is broad — financial services in DIFC, tech in Internet City and Silicon Oasis, hospitality across Downtown and Palm Jumeirah, retail headquartered around Festival City and Dubai Mall.",
      'Visa and emirate of residence matter. State your current location candidly. "Dubai, UAE — transferable employment visa" removes a question the recruiter would otherwise ask.',
      "Salary norms move with the cluster. Tech and finance in DIFC index higher than retail or hospitality at the same seniority. Calibrate expectations before the salary conversation.",
    ],
    industries: ['banking', 'tech', 'hospitality', 'finance'],
  },
  {
    slug: 'abu-dhabi',
    name: 'Abu Dhabi',
    metaDescription:
      'CV templates and job-application advice for Abu Dhabi roles in energy, government, finance, and healthcare.',
    body: [
      "Abu Dhabi's hiring is anchored by ADNOC, sovereign-wealth groups (Mubadala, ADQ), government entities, and the Cleveland Clinic / SEHA healthcare network.",
      'Emiratization quotas weigh on private-sector roles in Abu Dhabi more than in Dubai. UAE-national candidates should highlight this prominently; non-nationals should not engage with the topic on the CV.',
      'Government and SOE roles use formal language. The Abu Dhabi Executive template fits this register better than the more modern layouts.',
    ],
    industries: ['banking', 'finance', 'healthcare', 'construction'],
  },
  {
    slug: 'sharjah',
    name: 'Sharjah',
    metaDescription:
      'CV templates for Sharjah roles in education, logistics, and manufacturing.',
    body: [
      "Sharjah's economy is anchored by education (American University of Sharjah, University of Sharjah), media (Sharjah Media City), light manufacturing, and logistics — Hamriyah and Sharjah Airport Free Zone.",
      'Recruiters in Sharjah skew slightly more conservative on tone — the Dubai Classic or Abu Dhabi Executive templates work well for senior roles.',
      "Commute matters more than in Dubai or Abu Dhabi. State that you can commute or are willing to relocate; it removes a real friction.",
    ],
    industries: ['construction', 'finance', 'healthcare'],
  },
  {
    slug: 'ras-al-khaimah',
    name: 'Ras Al Khaimah',
    metaDescription:
      'CV templates and roles guidance for Ras Al Khaimah, with hospitality and manufacturing focus.',
    body: [
      "Ras Al Khaimah's growth is hospitality-led — Marjan Island, Al Hamra, and the new Wynn integrated resort due 2027. Manufacturing in RAK Industrial Free Zone is the other anchor.",
      'Hospitality CVs for RAK should highlight resort-scale guest experience and pre-opening team experience — there is a lot of pre-opening hiring in 2026-27.',
      'Tax-free residency, lower cost of living, and proximity to Dubai keep RAK attractive for mid-senior expat candidates open to a 90-minute commute or relocation.',
    ],
    industries: ['hospitality', 'construction'],
  },
  {
    slug: 'ajman',
    name: 'Ajman',
    metaDescription:
      'CV templates for roles in Ajman across light industry, education, and SME services.',
    body: [
      "Ajman's job market is SME-heavy: family-owned trading houses, manufacturing in Ajman Free Zone, and the City University of Ajman / Gulf Medical University education cluster.",
      'Recruiters here value adaptability and breadth — list every functional area you have credibly owned, not just the title.',
      'Commute distance from Dubai is the deciding factor for many candidates. If you live in Dubai and are open to the drive, say so.',
    ],
    industries: ['construction', 'healthcare'],
  },
  {
    slug: 'fujairah',
    name: 'Fujairah',
    metaDescription:
      'CV templates for Fujairah port, shipping, and energy roles.',
    body: [
      "Fujairah's economy revolves around the port — bunker fuel, ship-to-ship transfers, and oil storage. Roles cluster around shipping agents, port operations, and the petroleum bunkering complex.",
      'Maritime certifications matter: STCW, ISGOTT, OCIMF familiarity. List them in their own section.',
      'Logistics CVs for Fujairah benefit from quantifying TEU throughput, bunker volumes, or vessel turnaround time.',
    ],
    industries: ['construction'],
  },
  {
    slug: 'umm-al-quwain',
    name: 'Umm Al Quwain',
    metaDescription:
      'CV templates for Umm Al Quwain SME and tourism roles.',
    body: [
      "Umm Al Quwain's hiring market is the smallest of the seven emirates but growing — small-scale manufacturing in UAQ Free Zone, the AlMarjan Island development, and emerging eco-tourism.",
      'CVs for UAQ roles benefit from a strong adaptability narrative: SMEs hire generalists.',
      'List proximity to UAQ or willingness to relocate openly. It is a real factor in shortlisting.',
    ],
    industries: [],
  },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

export function findIndustry(slug: string): IndustrySeed | null {
  return INDUSTRIES.find((i) => i.slug === slug) ?? null
}

export function findRole(slug: string): RoleSeed | null {
  return ROLES.find((r) => r.slug === slug) ?? null
}

export function findCity(slug: string): CitySeed | null {
  return CITIES.find((c) => c.slug === slug) ?? null
}
