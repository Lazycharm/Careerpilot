/**
 * Shared atomic components for all React-PDF resume templates.
 *
 * These components keep ATS-safe behavior consistent (proper text layer, no
 * tables, single-pass reading order) across templates so designers can focus
 * on look-and-feel without re-implementing the parsing-sensitive bits.
 */

import { Text, View } from '@react-pdf/renderer'
import type { Style } from '@react-pdf/types'
import type { ResumeData } from '@/types'

export function ContactRow({
  data,
  style,
  separator = '·',
}: {
  data: ResumeData['personalInfo']
  style?: Style
  separator?: string
}) {
  const parts: string[] = []
  if (data.email) parts.push(data.email)
  if (data.phone) parts.push(data.phone)
  if (data.location) parts.push(data.location)
  if (data.linkedIn) parts.push(data.linkedIn.replace(/^https?:\/\//, ''))
  if (data.website) parts.push(data.website.replace(/^https?:\/\//, ''))

  return (
    <View style={[{ flexDirection: 'row', flexWrap: 'wrap' }, style ?? {}]}>
      {parts.map((p, i) => (
        <Text key={`${p}-${i}`}>
          {i > 0 ? `  ${separator}  ` : ''}
          {p}
        </Text>
      ))}
    </View>
  )
}

export function Section({
  title,
  titleStyle,
  containerStyle,
  children,
}: {
  title: string
  titleStyle?: Style
  containerStyle?: Style
  children: React.ReactNode
}) {
  return (
    <View style={containerStyle} wrap>
      <Text style={titleStyle}>{title}</Text>
      {children}
    </View>
  )
}

export function BulletList({
  items,
  rowStyle,
  dotStyle,
  textStyle,
}: {
  items: string[]
  rowStyle?: Style
  dotStyle?: Style
  textStyle?: Style
}) {
  return (
    <>
      {items.filter(Boolean).map((item, i) => (
        <View key={i} style={rowStyle} wrap={false}>
          <Text style={dotStyle}>•</Text>
          <Text style={textStyle}>{item}</Text>
        </View>
      ))}
    </>
  )
}

/** Two-line experience header: role + dates on line 1, company + location on line 2. */
export function ExperienceHeader({
  position,
  company,
  location,
  startDate,
  endDate,
  current,
  roleStyle,
  companyStyle,
  datesStyle,
}: {
  position: string
  company: string
  location?: string
  startDate?: string
  endDate?: string | null
  current?: boolean
  roleStyle?: Style
  companyStyle?: Style
  datesStyle?: Style
}) {
  const dateRange =
    startDate && (current || endDate)
      ? `${startDate} — ${current ? 'Present' : endDate}`
      : startDate || ''
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={roleStyle}>{position || 'Position'}</Text>
        <Text style={datesStyle}>{dateRange}</Text>
      </View>
      <Text style={companyStyle}>
        {company || 'Company'}
        {location ? ` — ${location}` : ''}
      </Text>
    </View>
  )
}
