import type { ResumeData } from './schema'

/**
 * Realistic UAE sample resume used for template thumbnail previews.
 * Contains enough data to show all template sections at a glance.
 */
export const SAMPLE_RESUME_DATA: ResumeData = {
  personalInfo: {
    fullName: 'Sarah Al-Mansoori',
    email: 'sarah.m@email.com',
    phone: '+971 50 123 4567',
    location: 'Dubai, UAE',
    linkedIn: 'linkedin.com/in/sarah-mansoori',
  },
  summary:
    'Results-driven marketing professional with 7+ years of experience leading digital initiatives across the UAE and GCC. Proven track record in brand strategy, digital transformation, and measurable revenue growth.',
  workExperience: [
    {
      company: 'Emirates NBD',
      position: 'Senior Marketing Manager',
      location: 'Dubai, UAE',
      startDate: 'Jan 2021',
      endDate: null,
      current: true,
      description: [
        'Led digital marketing strategy resulting in 45% increase in online customer acquisition',
        'Managed AED 8M annual marketing budget across digital, print, and outdoor campaigns',
        'Mentored cross-functional team of 12 specialists across UAE and KSA operations',
      ],
    },
    {
      company: 'Majid Al Futtaim',
      position: 'Marketing Manager',
      location: 'Dubai, UAE',
      startDate: 'Mar 2018',
      endDate: 'Dec 2020',
      current: false,
      description: [
        'Developed omnichannel campaigns for 5 major retail brands across GCC',
        'Increased social media engagement by 180% through targeted content strategy',
      ],
    },
  ],
  education: [
    {
      institution: 'American University of Sharjah',
      degree: 'Bachelor of Business Administration',
      field: 'Marketing',
      startDate: '2012',
      endDate: '2016',
      gpa: '3.8',
    },
  ],
  skills: [
    {
      category: 'Marketing',
      items: ['Digital Strategy', 'Brand Management', 'Content Marketing', 'SEO / SEM'],
    },
    {
      category: 'Tools',
      items: ['Google Analytics', 'Salesforce', 'Adobe Creative Suite', 'HubSpot'],
    },
  ],
  certifications: [
    { name: 'Google Analytics 4 Certification', issuer: 'Google', date: '2023' },
  ],
  languages: [
    { language: 'Arabic', proficiency: 'Native' },
    { language: 'English', proficiency: 'Fluent' },
  ],
}
