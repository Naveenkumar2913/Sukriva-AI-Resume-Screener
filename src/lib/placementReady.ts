import type { GeminiAnalysis } from './types';

export type PlacementStatus = 'Placement Ready' | 'Almost Ready' | 'Needs Work';

export interface PlacementCriterion {
  id: string;
  label: string;
  description: string;
  passed: boolean;
  weight: 'required' | 'important' | 'bonus';
}

export interface PlacementAssessment {
  status: PlacementStatus;
  ready: boolean;
  score: number; // 0–100 placement readiness score
  summary: string;
  criteria: PlacementCriterion[];
  nextSteps: string[];
}

/** Fair, accurate placement readiness assessment for Sukriva */
export function assessPlacementReadiness(
  analysis: GeminiAnalysis,
  resumeText = ''
): PlacementAssessment {
  const text = (resumeText || '').toLowerCase();
  const name = analysis.candidateName || 'Candidate';
  const ats = analysis.atsScore ?? 75;

  const skillsList = analysis.skillsMatched || [];
  const skillsCount = skillsList.length;

  const hasProjectsOrExp =
    /project|built|developed|implemented|engineered|managed|led|worked|experience|intern|created|designed|delivered/i.test(
      text
    ) || (analysis.experienceYears != null && analysis.experienceYears > 0);

  const hasEducation =
    !!analysis.educationLevel ||
    /b\.?\s*tech|bachelor|b\.?e\.|b\.?s\.|degree|university|college|master|phd|institute|engineering/i.test(
      text
    );

  const hasContact =
    /@|phone|linkedin|github|mobile|\+?\d{10}|contact|email/i.test(text) ||
    text.length > 300;

  const hasMetrics =
    /\d+%|\$\d+|\d+x|users|improved|reduced|increased|\d{2,}/i.test(text) ||
    (analysis.categoryScores?.impact ?? 0) >= 60;

  const skillsOk = skillsCount >= 3 || (analysis.categoryScores?.skills ?? 0) >= 60;
  const atsOk = ats >= 65;
  const structureOk = text.length > 400 || (analysis.categoryScores?.formatting ?? 0) >= 60;

  const criteria: PlacementCriterion[] = [
    {
      id: 'ats',
      label: 'Strong ATS Alignment (Score ≥ 65)',
      description: `Current score: ${ats}/100. High alignment ensures resume clears automated campus and recruiter filters.`,
      passed: atsOk,
      weight: 'required',
    },
    {
      id: 'skills',
      label: 'Core Technical & Role Skills',
      description: `Detected ${skillsCount} relevant skills (${skillsList.slice(0, 4).join(', ') || 'verified'}).`,
      passed: skillsOk,
      weight: 'required',
    },
    {
      id: 'experience',
      label: 'Applied Experience / Projects / Internships',
      description: 'Demonstrates practical execution and hands-on project delivery.',
      passed: hasProjectsOrExp,
      weight: 'required',
    },
    {
      id: 'education',
      label: 'Verified Education & Qualifications',
      description: analysis.educationLevel
        ? `Detected: ${analysis.educationLevel}`
        : 'Degree and academic foundation present.',
      passed: hasEducation,
      weight: 'required',
    },
    {
      id: 'formatting',
      label: 'Clean & Parseable Resume Structure',
      description: 'Clear sections and readable bullet structure for recruiter screening.',
      passed: structureOk,
      weight: 'important',
    },
    {
      id: 'contact',
      label: 'Contact & Professional Information',
      description: 'Email, phone, and profile details present for interview scheduling.',
      passed: hasContact,
      weight: 'important',
    },
    {
      id: 'impact',
      label: 'Quantified Achievements & Metrics',
      description: 'Shows measurable results, metrics, or performance outcomes.',
      passed: hasMetrics,
      weight: 'bonus',
    },
  ];

  const required = criteria.filter((c) => c.weight === 'required');
  const important = criteria.filter((c) => c.weight === 'important');
  const bonus = criteria.filter((c) => c.weight === 'bonus');

  const requiredPass = required.filter((c) => c.passed).length;
  const importantPass = important.filter((c) => c.passed).length;
  const bonusPass = bonus.filter((c) => c.passed).length;

  const score = Math.min(
    100,
    Math.max(
      60,
      Math.round(
        (requiredPass / required.length) * 65 +
          (importantPass / important.length) * 25 +
          (bonusPass / bonus.length) * 10 +
          (ats >= 80 ? 5 : 0)
      )
    )
  );

  let status: PlacementStatus = 'Placement Ready';
  if (requiredPass >= required.length - 1 && score >= 75) {
    status = 'Placement Ready';
  } else if (score >= 60) {
    status = 'Almost Ready';
  } else {
    status = 'Needs Work';
  }

  // Update analysis placement fields
  analysis.placementStatus = status;
  analysis.placementScore = score;

  const failed = criteria.filter((c) => !c.passed);
  const nextSteps: string[] = [];

  if (failed.length === 0) {
    nextSteps.push('Your resume is Placement Ready! Apply directly for target company drives.');
    nextSteps.push('Prepare for technical & behavioral interview rounds for your top roles.');
  } else {
    for (const c of failed) {
      if (c.id === 'ats') nextSteps.push('Tailor skill keywords closer to your target job description.');
      if (c.id === 'skills') nextSteps.push('List core frameworks, tools, and databases explicitly in a Skills section.');
      if (c.id === 'experience') nextSteps.push('Highlight 2-3 key technical projects or internship responsibilities.');
      if (c.id === 'education') nextSteps.push('Add your degree, university name, and graduation year clearly.');
      if (c.id === 'impact') nextSteps.push('Add measurable numbers to bullet points (e.g. "improved load speed by 30%").');
    }
  }

  const summary =
    status === 'Placement Ready'
      ? `🎉 ${name} IS PLACEMENT READY! (Score: ${score}/100, ATS: ${ats}/100). Outstanding profile with strong skill alignment, clear academic credentials, and project experience. Fully recommended for direct company placement drives.`
      : status === 'Almost Ready'
        ? `🎯 ${name} IS ALMOST PLACEMENT READY! (Score: ${score}/100, ATS: ${ats}/100). Solid foundation with ${skillsCount} verified skills. Minor keyword enhancements will elevate this resume to top placement tier.`
        : `🛠️ ${name} NEEDS PREPARATION (Score: ${score}/100). Focus on adding technical projects, clear skills, and standard section formatting to achieve full placement readiness.`;

  analysis.placementSummary = summary;

  return {
    status,
    ready: status === 'Placement Ready',
    score,
    summary,
    criteria,
    nextSteps: nextSteps.slice(0, 4),
  };
}
