import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import type { PersonalInfo, ExperienceEntry, ProjectEntry, EducationEntry, Skills, CertificationEntry } from '@placeai/db';

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, lineHeight: 1.4, paddingTop: 40, paddingBottom: 40, paddingLeft: 50, paddingRight: 50, backgroundColor: '#fff', color: '#1a1a1a' },
  header: { borderBottomWidth: 1.5, borderBottomColor: '#1a1a1a', paddingBottom: 8, marginBottom: 10, alignItems: 'center' },
  name: { fontSize: 20, fontFamily: 'Helvetica-Bold', letterSpacing: 1, textTransform: 'uppercase' },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4, color: '#555', fontSize: 9 },
  sectionTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1.5, color: '#444', borderBottomWidth: 0.8, borderBottomColor: '#ccc', paddingBottom: 2, marginBottom: 6, marginTop: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bold: { fontFamily: 'Helvetica-Bold' },
  italic: { fontFamily: 'Helvetica-Oblique', color: '#555' },
  muted: { color: '#666', fontSize: 9 },
  bullet: { flexDirection: 'row', gap: 4, marginTop: 1 },
  bulletDot: { width: 10, flexShrink: 0, color: '#333' },
  skillRow: { flexDirection: 'row', gap: 4, marginBottom: 2 },
  skillLabel: { fontFamily: 'Helvetica-Bold', minWidth: 80 },
});

type Data = {
  personalInfo: PersonalInfo;
  summary: string;
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  education: EducationEntry[];
  skills: Skills;
  certifications: CertificationEntry[];
};

export function ClassicTemplate({ data }: { data: Data }) {
  const { personalInfo: p, summary, experience, projects, education, skills, certifications } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{p.name}</Text>
          <View style={styles.contactRow}>
            {p.email ? <Text>{p.email}</Text> : null}
            {p.phone ? <Text>· {p.phone}</Text> : null}
            {p.location ? <Text>· {p.location}</Text> : null}
            {p.linkedin ? <Text>· {p.linkedin}</Text> : null}
            {p.github ? <Text>· {p.github}</Text> : null}
          </View>
        </View>

        {/* Summary */}
        {summary ? (
          <View>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text>{summary}</Text>
          </View>
        ) : null}

        {/* Experience */}
        {experience.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>Experience</Text>
            {experience.map((e, i) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <View style={styles.row}>
                  <Text style={styles.bold}>{e.role}</Text>
                  <Text style={styles.muted}>{[e.startDate, e.isCurrent ? 'Present' : e.endDate].filter(Boolean).join(' – ')}</Text>
                </View>
                <Text style={styles.italic}>{e.company}{e.location ? ` · ${e.location}` : ''}</Text>
                {e.bullets.filter(Boolean).map((b, j) => (
                  <View key={j} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={{ flex: 1 }}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {/* Projects */}
        {projects.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((proj, i) => (
              <View key={i} style={{ marginBottom: 6 }}>
                <View style={styles.row}>
                  <Text style={styles.bold}>{proj.name}</Text>
                  {proj.url ? <Text style={styles.muted}>{proj.url}</Text> : null}
                </View>
                {(proj.technologies ?? []).length > 0 ? <Text style={styles.italic}>{proj.technologies!.join(', ')}</Text> : null}
                {(proj.bullets ?? []).filter(Boolean).map((b, j) => (
                  <View key={j} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={{ flex: 1 }}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {/* Education */}
        {education.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((e, i) => (
              <View key={i} style={{ ...styles.row, marginBottom: 4 }}>
                <View>
                  <Text style={styles.bold}>{e.institution}</Text>
                  <Text style={styles.italic}>{[e.degree, e.branch].filter(Boolean).join(', ')}{e.gpa ? ` · GPA: ${e.gpa}` : ''}</Text>
                </View>
                <Text style={styles.muted}>{[e.startDate, e.endDate].filter(Boolean).join(' – ')}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Skills */}
        {(skills.languages?.length ?? 0) + (skills.frameworks?.length ?? 0) > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>Technical Skills</Text>
            {skills.languages?.length ? <View style={styles.skillRow}><Text style={styles.skillLabel}>Languages:</Text><Text style={{ flex: 1 }}>{skills.languages.join(', ')}</Text></View> : null}
            {skills.frameworks?.length ? <View style={styles.skillRow}><Text style={styles.skillLabel}>Frameworks:</Text><Text style={{ flex: 1 }}>{skills.frameworks.join(', ')}</Text></View> : null}
            {skills.databases?.length ? <View style={styles.skillRow}><Text style={styles.skillLabel}>Databases:</Text><Text style={{ flex: 1 }}>{skills.databases.join(', ')}</Text></View> : null}
            {skills.tools?.length ? <View style={styles.skillRow}><Text style={styles.skillLabel}>Tools:</Text><Text style={{ flex: 1 }}>{skills.tools.join(', ')}</Text></View> : null}
            {skills.cloud?.length ? <View style={styles.skillRow}><Text style={styles.skillLabel}>Cloud:</Text><Text style={{ flex: 1 }}>{skills.cloud.join(', ')}</Text></View> : null}
          </View>
        ) : null}

        {/* Certifications */}
        {certifications.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {certifications.map((c, i) => (
              <View key={i} style={{ ...styles.row, marginBottom: 2 }}>
                <Text><Text style={styles.bold}>{c.name}</Text>{c.issuer ? ` — ${c.issuer}` : ''}</Text>
                {c.issueDate ? <Text style={styles.muted}>{c.issueDate}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
