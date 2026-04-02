import { CandidateProfile } from "@/lib/types";

function scoreExperience(profile: CandidateProfile) {
  if (profile.experiences.length === 0) {
    return 0;
  }

  const complete = profile.experiences.filter(
    (item) => item.company && item.title && item.description,
  ).length;

  return Math.round((Math.min(complete, 2) / 2) * 30);
}

function scoreSkills(profile: CandidateProfile) {
  if (profile.skills.length === 0) {
    return 0;
  }

  const confirmed = profile.skills.filter((item) => item.confirmed).length;

  return Math.round((Math.min(Math.max(confirmed, 1), 5) / 5) * 25);
}

function scoreProjects(profile: CandidateProfile) {
  if (profile.projects.length === 0) {
    return 0;
  }

  const complete = profile.projects.filter(
    (item) => item.title && item.description && item.highlights.length > 0,
  ).length;

  return Math.round((Math.min(complete, 2) / 2) * 20);
}

function scoreEducation(profile: CandidateProfile) {
  if (profile.education.length === 0) {
    return 0;
  }

  const complete = profile.education.filter(
    (item) => item.institution && item.degree,
  ).length;

  return Math.round((Math.min(complete, 1) / 1) * 15);
}

function scoreSummary(profile: CandidateProfile) {
  return profile.summary.trim().length > 0 ? 10 : 0;
}

export function calculateCompletionScore(profile: CandidateProfile) {
  return Math.min(
    100,
    scoreExperience(profile) +
      scoreSkills(profile) +
      scoreProjects(profile) +
      scoreEducation(profile) +
      scoreSummary(profile),
  );
}

export function getMissingSections(profile: CandidateProfile) {
  const missing: string[] = [];

  if (scoreExperience(profile) < 30) {
    missing.push("experience");
  }

  if (scoreSkills(profile) < 25) {
    missing.push("skills");
  }

  if (scoreProjects(profile) < 20) {
    missing.push("projects");
  }

  if (scoreEducation(profile) < 15) {
    missing.push("education");
  }

  if (scoreSummary(profile) < 10) {
    missing.push("summary");
  }

  return missing;
}

export function getExperienceYears(profile: CandidateProfile) {
  const totalMonths = profile.experiences.reduce((months, item) => {
    if (!item.startDate) {
      return months;
    }

    const start = new Date(item.startDate);
    const end = item.current || !item.endDate ? new Date() : new Date(item.endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return months;
    }

    const diff =
      end.getFullYear() * 12 +
      end.getMonth() -
      (start.getFullYear() * 12 + start.getMonth());

    return months + Math.max(diff, 1);
  }, 0);

  return Number((totalMonths / 12).toFixed(1));
}

export function computeMatchScore(profile: CandidateProfile) {
  const advancedSkills = profile.skills.filter(
    (item) => item.proficiency === "advanced" && item.confirmed,
  ).length;

  const achievementSignals = profile.experiences.reduce(
    (count, item) => count + item.structuredPoints.length,
    0,
  );

  return Math.min(
    100,
    Math.round(
      profile.completionScore * 0.55 +
        Math.min(advancedSkills * 8, 24) +
        Math.min(achievementSignals * 2, 16),
    ),
  );
}
