/**
 * Template 03 — Sharjah Minimal
 * Audience: Tech, design, startup-friendly. Quiet, hierarchical, no rules.
 * Layout: single column, tight spacing, monochrome. ATS-safe.
 */

import { Document, Page, Text, View } from '@react-pdf/renderer'
import type { ResumeData } from '@/types'
import { THEMES, buildStyles } from '@/lib/pdf/theme'
import { ContactRow, Section, BulletList, ExperienceHeader } from './_shared'

export interface TemplateProps {
  data: ResumeData
}

export function Template03_SharjahMinimal({ data }: TemplateProps) {
  const theme = THEMES['sharjah-minimal']
  const s = buildStyles(theme)

  return (
    <Document
      author={data.personalInfo.fullName}
      title={`${data.personalInfo.fullName || 'CV'} — CareerPilot`}
      creator="CareerPilot"
      producer="CareerPilot"
    >
      <Page size="A4" style={s.page}>
        <View>
          <Text style={s.name}>{data.personalInfo.fullName || 'Your Name'}</Text>
          <ContactRow data={data.personalInfo} style={s.contactRow} separator="/" />
        </View>

        {data.summary ? (
          <View style={s.section}>
            <Text style={s.summaryText}>{data.summary}</Text>
          </View>
        ) : null}

        {data.workExperience.length > 0 && (
          <Section title="Experience" titleStyle={s.sectionTitle} containerStyle={s.section}>
            {data.workExperience.map((exp, i) => (
              <View key={i} style={i === 0 ? undefined : { marginTop: 8 }} wrap={false}>
                <ExperienceHeader
                  position={exp.position}
                  company={exp.company}
                  location={exp.location}
                  startDate={exp.startDate}
                  endDate={exp.endDate}
                  current={exp.current}
                  roleStyle={s.role}
                  companyStyle={s.company}
                  datesStyle={s.dates}
                />
                {exp.description?.length > 0 && (
                  <View style={{ marginTop: 3 }}>
                    <BulletList
                      items={exp.description}
                      rowStyle={s.bulletRow}
                      dotStyle={s.bulletDot}
                      textStyle={s.bulletText}
                    />
                  </View>
                )}
              </View>
            ))}
          </Section>
        )}

        {data.education.length > 0 && (
          <Section title="Education" titleStyle={s.sectionTitle} containerStyle={s.section}>
            {data.education.map((ed, i) => (
              <View key={i} style={i === 0 ? undefined : { marginTop: 6 }}>
                <Text>
                  <Text style={s.role}>
                    {ed.degree}
                    {ed.field ? `, ${ed.field}` : ''}
                  </Text>
                  <Text style={s.company}>
                    {' — '}
                    {ed.institution}
                  </Text>
                </Text>
                <Text style={s.dates}>
                  {ed.startDate}
                  {ed.endDate ? ` — ${ed.endDate}` : ''}
                  {ed.gpa ? ` · GPA ${ed.gpa}` : ''}
                </Text>
              </View>
            ))}
          </Section>
        )}

        {data.skills.length > 0 && (
          <Section title="Skills" titleStyle={s.sectionTitle} containerStyle={s.section}>
            {data.skills.map((group, i) => (
              <View key={i} style={i === 0 ? undefined : { marginTop: 3 }}>
                <Text>
                  <Text style={s.role}>{group.category} · </Text>
                  <Text>{group.items.join(', ')}</Text>
                </Text>
              </View>
            ))}
          </Section>
        )}

        {data.certifications.length > 0 && (
          <Section title="Certifications" titleStyle={s.sectionTitle} containerStyle={s.section}>
            {data.certifications.map((cert, i) => (
              <View key={i} style={i === 0 ? undefined : { marginTop: 3 }}>
                <Text>
                  {cert.name}
                  <Text style={s.company}>
                    {' — '}
                    {cert.issuer}
                    {cert.date ? ` · ${cert.date}` : ''}
                  </Text>
                </Text>
              </View>
            ))}
          </Section>
        )}

        {data.languages.length > 0 && (
          <Section title="Languages" titleStyle={s.sectionTitle} containerStyle={s.section}>
            <Text>
              {data.languages.map((l) => `${l.language} (${l.proficiency})`).join(' · ')}
            </Text>
          </Section>
        )}
      </Page>
    </Document>
  )
}
