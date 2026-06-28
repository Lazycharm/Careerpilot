/**
 * Template 02 — Abu Dhabi Executive
 * Audience: Senior leadership, government, energy, finance.
 * Layout: serif (Times-Roman), centered name, refined accent. ATS-safe.
 */

import { Document, Page, Text, View } from '@react-pdf/renderer'
import type { ResumeData } from '@/types'
import { THEMES, buildStyles } from '@/lib/pdf/theme'
import { ContactRow, Section, BulletList, ExperienceHeader } from './_shared'

export interface TemplateProps {
  data: ResumeData
}

export function Template02_AbuDhabiExecutive({ data }: TemplateProps) {
  const theme = THEMES['abu-dhabi-executive']
  const s = buildStyles(theme)

  return (
    <Document
      author={data.personalInfo.fullName}
      title={`${data.personalInfo.fullName || 'CV'} — CareerPilot`}
      creator="CareerPilot"
      producer="CareerPilot"
    >
      <Page size="A4" style={s.page}>
        <View style={{ alignItems: 'center', marginBottom: 6 }}>
          <Text style={s.name}>{data.personalInfo.fullName || 'Your Name'}</Text>
          <ContactRow
            data={data.personalInfo}
            style={{ ...s.contactRow, justifyContent: 'center' }}
          />
        </View>

        {data.summary ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Executive Summary</Text>
            <Text style={s.summaryText}>{data.summary}</Text>
          </View>
        ) : null}

        {data.workExperience.length > 0 && (
          <Section
            title="Professional Experience"
            titleStyle={s.sectionTitle}
            containerStyle={s.section}
          >
            {data.workExperience.map((exp, i) => (
              <View key={i} style={i === 0 ? undefined : { marginTop: 12 }} wrap={false}>
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
                  <View style={{ marginTop: 4 }}>
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
              <View key={i} style={i === 0 ? undefined : { marginTop: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={s.role}>
                    {ed.degree}
                    {ed.field ? `, ${ed.field}` : ''}
                  </Text>
                  <Text style={s.dates}>
                    {ed.startDate}
                    {ed.endDate ? ` — ${ed.endDate}` : ''}
                  </Text>
                </View>
                <Text style={s.company}>
                  {ed.institution}
                  {ed.gpa ? ` · GPA ${ed.gpa}` : ''}
                </Text>
              </View>
            ))}
          </Section>
        )}

        {data.skills.length > 0 && (
          <Section title="Core Competencies" titleStyle={s.sectionTitle} containerStyle={s.section}>
            {data.skills.map((group, i) => (
              <View key={i} style={i === 0 ? undefined : { marginTop: 4 }}>
                <Text>
                  <Text style={s.role}>{group.category}: </Text>
                  <Text>{group.items.join(', ')}</Text>
                </Text>
              </View>
            ))}
          </Section>
        )}

        {data.certifications.length > 0 && (
          <Section
            title="Certifications & Awards"
            titleStyle={s.sectionTitle}
            containerStyle={s.section}
          >
            {data.certifications.map((cert, i) => (
              <View key={i} style={i === 0 ? undefined : { marginTop: 4 }}>
                <Text>
                  <Text style={s.role}>{cert.name}</Text>
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
              {data.languages.map((l) => `${l.language} (${l.proficiency})`).join('   ·   ')}
            </Text>
          </Section>
        )}
      </Page>
    </Document>
  )
}
