import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Map your app's color IDs to actual hex values
const hexMap = {
  blue: "#0ea5e9", emerald: "#10b981", violet: "#8b5cf6",
  rose: "#f43f5e", amber: "#f59e0b", slate: "#475569"
};

const getStyles = (template: string, color: string) => {
  const accent = hexMap[color as keyof typeof hexMap] || hexMap.blue;

  return StyleSheet.create({
    page: { 
      padding: 40, 
      fontFamily: template === 'classic' ? 'Times-Bold' : 'Helvetica', // Simple font fallback
      backgroundColor: '#FFFFFF' 
    },
    // Header Styles
    header: {
      marginBottom: 20,
      textAlign: template === 'classic' ? 'center' : 'left',
      backgroundColor: template === 'modern' ? '#111827' : 'transparent',
      padding: template === 'modern' ? 25 : 0,
      marginLeft: template === 'modern' ? -40 : 0, // Flush with page edges
      marginRight: template === 'modern' ? -40 : 0,
      marginTop: template === 'modern' ? -40 : 0,
    },
    name: { 
      fontSize: 24, 
      fontWeight: 'bold', 
      color: template === 'modern' ? '#FFFFFF' : '#111827',
      textTransform: 'uppercase'
    },
    jobTitle: { 
      fontSize: 12, 
      color: template === 'modern' ? accent : '#64748b', 
      marginTop: 4 
    },
    // Section Styles
    sectionTitle: {
      fontSize: 10,
      fontWeight: 'bold',
      color: accent,
      borderBottomWidth: template === 'minimal' ? 0 : 1,
      borderBottomColor: '#e2e8f0',
      paddingBottom: 3,
      marginTop: 15,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 1
    },
    entryTitle: { fontSize: 11, fontWeight: 'bold', color: '#1e293b' },
    company: { fontSize: 10, color: accent, marginBottom: 2 },
    date: { fontSize: 9, color: '#94a3b8' },
    text: { fontSize: 9, color: '#334155', lineHeight: 1.5 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
    // Skill Badge Styles
    badgeContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 },
    badge: {
      backgroundColor: template === 'minimal' ? '#f8fafc' : '#f0f9ff',
      padding: '3 8',
      borderRadius: 4,
      fontSize: 8,
      color: accent,
      marginRight: 6,
      marginBottom: 6,
      borderWidth: 1,
      borderColor: '#e0f2fe'
    }
  });
};

export const ResumePDF = ({ data, template, color }: { data: any, template: string, color: string }) => {
  const styles = getStyles(template, color);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.contact.firstName} {data.contact.lastName}</Text>
          <Text style={styles.jobTitle}>{data.contact.jobTitle}</Text>
          <View style={{ flexDirection: 'row', marginTop: 5, gap: 10 }}>
            <Text style={styles.date}>{data.contact.email}</Text>
            <Text style={styles.date}>{data.contact.phone}</Text>
            <Text style={styles.date}>{data.contact.city}, {data.contact.country}</Text>
          </View>
        </View>

        {/* SUMMARY */}
        {data.summary && (
          <View>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.text}>{data.summary}</Text>
          </View>
        )}

        {/* EXPERIENCE */}
        {data.experience.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Experience</Text>
            {data.experience.map((exp: any) => (
              <View key={exp.id} style={{ marginBottom: 10 }}>
                <View style={styles.row}>
                  <Text style={styles.entryTitle}>{exp.position}</Text>
                  <Text style={styles.date}>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</Text>
                </View>
                <Text style={styles.company}>{exp.company}</Text>
                <Text style={styles.text}>{exp.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* EDUCATION */}
        {data.education.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((edu: any) => (
              <View key={edu.id} style={{ marginBottom: 8 }}>
                <View style={styles.row}>
                  <Text style={styles.entryTitle}>{edu.degree} in {edu.field}</Text>
                  <Text style={styles.date}>{edu.endDate}</Text>
                </View>
                <Text style={styles.text}>{edu.institution} | Grade: {edu.grade}</Text>
              </View>
            ))}
          </View>
        )}

        {/* SKILLS */}
        {data.skills.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.badgeContainer}>
              {data.skills.map((s: any) => (
                <Text key={s.id} style={styles.badge}>{s.name}</Text>
              ))}
            </View>
          </View>
        )}

        {/* PROJECTS */}
        {data.projects.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Projects</Text>
            {data.projects.map((proj: any) => (
              <View key={proj.id} style={{ marginBottom: 8 }}>
                <Text style={styles.entryTitle}>{proj.title}</Text>
                {proj.link && <Text style={[styles.date, { color: '#3b82f6' }]}>{proj.link}</Text>}
                <Text style={styles.text}>{proj.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* CERTIFICATIONS */}
        {data.certs.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {data.certs.map((c: any) => (
              <View key={c.id} style={styles.row}>
                <Text style={styles.text}><Text style={{fontWeight: 'bold'}}>{c.name}</Text> - {c.issuer}</Text>
                <Text style={styles.date}>{c.year}</Text>
              </View>
            ))}
          </View>
        )}

        {/* CUSTOM SECTIONS */}
        {data.custom.length > 0 && data.custom.map((sec: any) => (
          <View key={sec.id}>
            <Text style={styles.sectionTitle}>{sec.heading}</Text>
            <Text style={styles.text}>{sec.content}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
};