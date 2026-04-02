import {
  Document,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import { CandidateProfile } from "@/lib/types";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#111827",
    lineHeight: 1.45,
  },
  section: {
    marginBottom: 18,
  },
  header: {
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: 700,
  },
  headline: {
    marginTop: 4,
    fontSize: 11,
    color: "#374151",
  },
  meta: {
    marginTop: 8,
    fontSize: 10,
    color: "#6B7280",
  },
  title: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    color: "#4F46E5",
  },
  row: {
    marginBottom: 10,
  },
  roleTitle: {
    fontSize: 11,
    fontWeight: 700,
  },
  bullet: {
    marginLeft: 10,
    marginTop: 4,
  },
  skillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  skill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
  },
});

export function ResumeDocument({ profile }: { profile: CandidateProfile }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.headline}>{profile.headline}</Text>
          <Text style={styles.meta}>
            {profile.email} • {profile.availability}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Summary</Text>
          <Text>{profile.aiSummary || profile.summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Experience</Text>
          {profile.experiences.length > 0 ? (
            profile.experiences.map((experience) => (
              <View style={styles.row} key={experience.id}>
                <Text style={styles.roleTitle}>
                  {experience.title} • {experience.company}
                </Text>
                <Text>
                  {experience.startDate || "Start date not set"} —{" "}
                  {experience.current ? "Present" : experience.endDate || "End date not set"}
                </Text>
                <Text>{experience.description}</Text>
                {experience.structuredPoints.map((point) => (
                  <Text key={point} style={styles.bullet}>
                    • {point}
                  </Text>
                ))}
              </View>
            ))
          ) : (
            <Text>Formal experience not yet added. Stronger evidence appears in projects.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Projects</Text>
          {profile.projects.map((project) => (
            <View style={styles.row} key={project.id}>
              <Text style={styles.roleTitle}>{project.title}</Text>
              <Text>{project.description}</Text>
              <Text>{project.techStack.join(", ")}</Text>
              {project.link ? <Link src={project.link}>{project.link}</Link> : null}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Skills</Text>
          <View style={styles.skillWrap}>
            {profile.skills
              .filter((skill) => skill.confirmed)
              .map((skill) => (
                <Text key={skill.id} style={styles.skill}>
                  {skill.name}
                </Text>
              ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Education</Text>
          {profile.education.map((item) => (
            <View style={styles.row} key={item.id}>
              <Text style={styles.roleTitle}>
                {item.degree} {item.field ? `in ${item.field}` : ""}
              </Text>
              <Text>
                {item.institution}
                {item.year ? ` • ${item.year}` : ""}
              </Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
