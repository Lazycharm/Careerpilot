import type { ResumeData } from '@/types'

/** Realistic ATS-friendly resume — used by ATS scorer tests as the "good" baseline. */
export const fullResume: ResumeData = {
  personalInfo: {
    fullName: 'Yasmin Khan',
    email: 'yasmin.khan@example.com',
    phone: '+971501234567',
    location: 'Dubai, UAE',
    linkedIn: 'https://linkedin.com/in/yasmin-khan',
  },
  summary:
    'Operations manager with seven years in UAE retail. Led a cross-functional team of 14 across Dubai and Abu Dhabi, rebuilt the supply chain runbook, and shipped a vendor onboarding process the team still uses. Comfortable working in English and Arabic with multinational stakeholders.',
  workExperience: [
    {
      company: 'Carrefour UAE',
      position: 'Operations Manager',
      location: 'Dubai, UAE',
      startDate: '2022-03',
      endDate: null,
      current: true,
      description: [
        'Led a team of 14 across two emirates, reducing average vendor onboarding time from 21 days to 6.',
        'Rebuilt the weekly operations review into a single shared dashboard adopted by the regional team.',
        'Negotiated three vendor contracts that saved 220,000 AED in annual logistics costs.',
        'Recovered a stalled compliance audit by partnering with legal; closed all 11 findings in 5 weeks.',
      ],
    },
    {
      company: 'Noon',
      position: 'Senior Operations Analyst',
      location: 'Dubai, UAE',
      startDate: '2019-01',
      endDate: '2022-02',
      current: false,
      description: [
        'Built the supply forecast model that improved stock-out rates by 18% across 240 SKUs.',
        'Designed the warehouse exception workflow now used by every site in the GCC.',
        'Mentored four junior analysts; two were promoted within 18 months.',
      ],
    },
  ],
  education: [
    {
      institution: 'American University of Sharjah',
      degree: 'Bachelor of Business Administration',
      field: 'Supply Chain Management',
      startDate: '2014',
      endDate: '2018',
      gpa: '3.7',
    },
  ],
  skills: [
    {
      category: 'Operations',
      items: ['supply chain', 'WMS', 'SAP', 'vendor management', 'cost control'],
    },
    {
      category: 'Tools',
      items: ['Excel', 'Power BI', 'JIRA', 'Notion'],
    },
  ],
  certifications: [
    {
      name: 'Certified Supply Chain Professional (CSCP)',
      issuer: 'APICS',
      date: '2021',
    },
  ],
  languages: [
    { language: 'English', proficiency: 'Fluent' },
    { language: 'Arabic', proficiency: 'Intermediate' },
  ],
}

/** Bare-bones resume — should trigger many "missing" issues. */
export const minimalResume: ResumeData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
  },
  summary: '',
  workExperience: [],
  education: [],
  skills: [],
  certifications: [],
  languages: [],
}

/** AI-cliché resume — should trigger recruiter and AI-tell deductions. */
export const cliCheResume: ResumeData = {
  ...fullResume,
  summary:
    'Results-driven professional with a proven track record of delivering results in today\'s fast-paced dynamic environment. Passionate about leveraging cross-functional synergy to drive impactful outcomes.',
  workExperience: [
    {
      company: 'X',
      position: 'Manager',
      location: 'Dubai',
      startDate: '2020-01',
      endDate: null,
      current: true,
      description: [
        'Responsible for managing the team.',
        'Team player and self-motivated go-getter.',
        'Duties included handling things.',
      ],
    },
  ],
}
