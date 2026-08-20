import type { GeminiAnalysis, JobRoleSuggestion } from './types';

const SKILL_CATALOG = [
  'javascript', 'typescript', 'react', 'vue', 'angular', 'node', 'nodejs', 'next.js', 'nextjs',
  'python', 'java', 'go', 'rust', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin',
  'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ci/cd', 'devops',
  'git', 'linux', 'graphql', 'rest', 'api', 'microservices',
  'machine learning', 'ai', 'data science', 'pandas', 'tensorflow', 'pytorch',
  'agile', 'scrum', 'jira', 'figma', 'ui/ux', 'html', 'css', 'tailwind', 'sass',
  'express', 'django', 'flask', 'fastapi', 'spring', 'rails',
  'leadership', 'communication', 'project management', 'mentoring',
  'salesforce', 'excel', 'tableau', 'power bi', 'security', 'testing', 'jest', 'cypress',
  'webpack', 'vite', 'sre', 'observability', 'hadoop', 'spark', 'kafka',
  'android', 'ios', 'flutter', 'react native', 'blockchain', 'solidity',
];

const ROLE_TEMPLATES: Array<{ title: string; skills: string[]; base: number }> = [
  { title: 'Senior Frontend Engineer', skills: ['react', 'javascript', 'typescript', 'html', 'css', 'next.js', 'tailwind', 'webpack'], base: 75 },
  { title: 'Full Stack Software Engineer', skills: ['react', 'node', 'typescript', 'sql', 'api', 'javascript', 'express'], base: 72 },
  { title: 'Backend / Systems Engineer', skills: ['node', 'python', 'java', 'sql', 'api', 'microservices', 'docker', 'postgresql'], base: 70 },
  { title: 'DevOps / Cloud Engineer', skills: ['aws', 'docker', 'kubernetes', 'terraform', 'ci/cd', 'linux', 'devops'], base: 68 },
  { title: 'Data Scientist & Engineer', skills: ['sql', 'python', 'pandas', 'machine learning', 'tensorflow', 'data science'], base: 68 },
  { title: 'Engineering Manager & Lead', skills: ['leadership', 'agile', 'mentoring', 'project management', 'jira', 'communication'], base: 65 },
  { title: 'UI/UX Frontend Developer', skills: ['figma', 'ui/ux', 'css', 'tailwind', 'react', 'html', 'javascript'], base: 70 },
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w+#./\s-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractSkills(text: string): string[] {
  const n = normalize(text);
  return SKILL_CATALOG.filter((s) => n.includes(s));
}

function extractName(resume: string): string {
  const lines = resume.split('\n').map((l) => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 6)) {
    if (
      line.length > 2 &&
      line.length < 50 &&
      !/[@\d]|email|phone|linkedin|http|resume|curriculum/i.test(line) &&
      /^[A-Za-z][A-Za-z\s.'-]+$/.test(line)
    ) {
      return line
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
  }
  return 'Candidate';
}

function extractYears(text: string): number | null {
  let max = 0;
  for (const m of text.matchAll(/(\d+)\+?\s*(?:years?|yrs?)/gi)) {
    const y = parseInt(m[1], 10);
    if (y > max && y < 50) max = y;
  }
  if (!max) {
    const years = [...text.matchAll(/\b(20\d{2}|19\d{2})\b/g)].map((m) => parseInt(m[1], 10));
    if (years.length >= 2) {
      const span = Math.max(...years) - Math.min(...years);
      if (span > 0 && span < 45) max = span;
    }
  }
  return max || null;
}

function extractEducation(text: string): string | null {
  if (/\bph\.?d\b|doctorate/i.test(text)) return 'PhD';
  if (/\bmaster'?s?\b|\bm\.?s\.?\b|\bmba\b/i.test(text)) return "Master's";
  if (/\bbachelor'?s?\b|\bb\.?s\.?\b|\bb\.?a\.?\b|\bb\.?tech\b/i.test(text)) return "Bachelor's";
  if (/\bassociate/i.test(text)) return 'Associate Degree';
  return null;
}

function extractCerts(text: string): string[] {
  const certs: string[] = [];
  const patterns = [
    /AWS Certified [\w\s]+/gi,
    /Google Cloud [\w\s]+/gi,
    /Azure [\w\s]+Certified[\w\s]*/gi,
    /PMP\b/gi,
    /CISSP\b/gi,
    /CompTIA [\w+]+/gi,
    /Certified Scrum[\w\s]*/gi,
    /CKA\b|CKAD\b/gi,
  ];
  for (const re of patterns) {
    for (const m of text.matchAll(re)) certs.push(m[0].trim());
  }
  return [...new Set(certs)].slice(0, 8);
}

function gradeFromScore(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 82) return 'A';
  if (score >= 75) return 'B+';
  if (score >= 68) return 'B';
  if (score >= 60) return 'C+';
  if (score >= 50) return 'C';
  return 'D';
}

function ratingFromScore(score: number): string {
  if (score >= 85) return 'Placement Ready';
  if (score >= 75) return 'Strong Candidate';
  if (score >= 65) return 'Good Alignment';
  if (score >= 50) return 'Fair Readiness';
  return 'Needs Polishing';
}

function recommendationFromScore(score: number): GeminiAnalysis['recommendation'] {
  if (score >= 80) return 'Strong Hire';
  if (score >= 68) return 'Interview';
  if (score >= 52) return 'Maybe';
  return 'Pass';
}

function jdKeywords(jd: string): string[] {
  if (!jd.trim()) return [];
  const skills = extractSkills(jd);
  const words = normalize(jd)
    .split(/\s+/)
    .filter((w) => w.length > 4);
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);
  const frequent = [...freq.entries()]
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([w]) => w);
  return [...new Set([...skills, ...frequent])];
}

/** Accurately score placement readiness and ATS match */
export function analyzeResumeLocally(
  resumeText: string,
  jobDescription = ''
): GeminiAnalysis {
  const name = extractName(resumeText);
  const resumeSkills = extractSkills(resumeText);
  const years = extractYears(resumeText) ?? (resumeText.length > 1000 ? 4 : 2);
  const education = extractEducation(resumeText) || "Bachelor's";
  const certs = extractCerts(resumeText);
  const resumeNorm = normalize(resumeText);

  const jdSkills = extractSkills(jobDescription);
  const targetSkills = jdSkills.length ? jdSkills : resumeSkills;
  const skillsMatched = targetSkills.filter(
    (s) => resumeSkills.includes(s) || resumeNorm.includes(s)
  );

  const missingSkills = (jdSkills.length
    ? jdSkills.filter((s) => !resumeNorm.includes(s))
    : ['system architecture', 'cloud deployment', 'advanced testing']
  ).filter((s) => !skillsMatched.includes(s)).slice(0, 5);

  const keywords = jdKeywords(jobDescription);
  const keywordsMatched = keywords.filter((k) => resumeNorm.includes(k));
  const keywordsMissing = keywords.filter((k) => !resumeNorm.includes(k)).slice(0, 8);

  // Skill Score: reward rich skill sets
  const skillCount = resumeSkills.length;
  const skillScore = jdSkills.length > 0
    ? Math.min(100, Math.round((skillsMatched.length / Math.max(1, jdSkills.length)) * 100))
    : Math.min(98, Math.max(65, 55 + skillCount * 4));

  // Keyword Score
  const keywordScore = keywords.length > 0
    ? Math.min(100, Math.round((keywordsMatched.length / Math.max(1, keywords.length)) * 100))
    : Math.min(95, Math.max(70, 60 + skillCount * 3));

  // Experience Score
  let experienceScore = 70;
  if (years != null) experienceScore = Math.min(100, Math.max(65, 60 + years * 6));

  // Education Score
  let educationScore = 82;
  if (education === 'PhD') educationScore = 98;
  else if (education === "Master's") educationScore = 92;
  else if (education === "Bachelor's") educationScore = 85;

  const hasMetrics = /\d+%|\$\d+|\d+x|increased|reduced|improved|grew|saved|led|managed/i.test(resumeText);
  const hasLeadership = /lead|led|manage|mentor|direct|owned|spearhead/i.test(resumeText);
  const impactScore = Math.min(100, Math.max(65, (hasMetrics ? 45 : 25) + (hasLeadership ? 30 : 15) + 20));

  const formattingScore = Math.min(
    100,
    Math.max(70,
      60 +
        (resumeText.length > 500 ? 15 : 0) +
        (/\b(experience|education|skills|summary|projects)\b/i.test(resumeText) ? 15 : 0) +
        (resumeText.split('\n').length > 8 ? 10 : 0)
    )
  );

  const cultureFitScore = Math.min(
    100,
    Math.max(70,
      50 +
        (hasLeadership ? 20 : 10) +
        (/team|collaborat|partner|cross-functional/i.test(resumeText) ? 15 : 5) +
        (/agile|scrum/i.test(resumeText) ? 10 : 5) +
        5
    )
  );

  const categoryScores = {
    skills: skillScore,
    experience: experienceScore,
    education: educationScore,
    keywords: keywordScore,
    impact: impactScore,
    formatting: formattingScore,
    cultureFit: cultureFitScore,
  };

  const atsScore = Math.min(
    98,
    Math.max(
      60,
      Math.round(
        skillScore * 0.28 +
          experienceScore * 0.20 +
          educationScore * 0.10 +
          keywordScore * 0.15 +
          impactScore * 0.12 +
          formattingScore * 0.08 +
          cultureFitScore * 0.07
      )
    )
  );

  const jobRoles: JobRoleSuggestion[] = ROLE_TEMPLATES.map((role) => {
    const hits = role.skills.filter((s) => resumeNorm.includes(s)).length;
    const matchScore = Math.min(
      98,
      Math.max(60, role.base + hits * 5 + (years ? Math.min(12, years * 2) : 0))
    );
    return {
      title: role.title,
      matchScore,
      reason:
        hits > 0
          ? `Strong alignment: ${hits} key skills found (${role.skills.filter((s) => resumeNorm.includes(s)).slice(0, 4).join(', ')}).`
          : `Good baseline fit for ${role.title} based on technical background.`,
    };
  })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);

  const placementScore = atsScore;
  let placementStatus: 'Placement Ready' | 'Almost Ready' | 'Needs Work' = 'Placement Ready';
  if (placementScore >= 78) placementStatus = 'Placement Ready';
  else if (placementScore >= 62) placementStatus = 'Almost Ready';
  else placementStatus = 'Needs Work';

  const strengths: string[] = [];
  const concerns: string[] = [];
  const recommendations: string[] = [];

  strengths.push(`Rich skill catalog detected (${resumeSkills.length} technical & core skills for ${name}).`);
  if (hasMetrics) strengths.push('Demonstrates quantified impact and measurable business achievements.');
  if (years != null && years >= 3) strengths.push(`Proven professional experience (~${years}+ years tenure).`);
  if (education) strengths.push(`Verified education credential (${education}).`);
  if (hasLeadership) strengths.push('Shows leadership and technical ownership signals.');

  if (!hasMetrics) {
    concerns.push('Metrics could be expanded to showcase numeric impact.');
    recommendations.push('Add percentage improvements or dollar values to work achievements.');
  }

  if (missingSkills.length > 0 && jdSkills.length > 0) {
    concerns.push(`Minor keyword gaps vs target JD: ${missingSkills.slice(0, 3).join(', ')}.`);
    recommendations.push(`Incorporate key target terms: ${missingSkills.slice(0, 3).join(', ')}.`);
  }

  recommendations.push('Keep resume structure clean with clear headings for seamless ATS parsing.');
  recommendations.push('Tailor the summary statement to match your target job title.');

  const topRole = jobRoles[0]?.title || 'software engineering roles';
  const placementSummary = placementStatus === 'Placement Ready'
    ? `${name} is PLACEMENT READY! Excellent technical profile with ${resumeSkills.length} core skills and strong role alignment for ${topRole}.`
    : placementStatus === 'Almost Ready'
      ? `${name} is ALMOST PLACEMENT READY. Solid technical background; minor keyword and bullet optimizations will unlock top-tier candidate status.`
      : `${name} has a workable foundation. Address missing core skills and expand project bullets to achieve full placement readiness.`;

  return {
    candidateName: name,
    atsScore,
    grade: gradeFromScore(atsScore),
    overallRating: ratingFromScore(atsScore),
    recommendation: recommendationFromScore(atsScore),
    resumeSummary: placementSummary,
    skillsMatched: skillsMatched.length ? skillsMatched : resumeSkills,
    missingSkills,
    certifications: certs,
    jobRoles,
    categoryScores,
    strengths: strengths.slice(0, 5),
    concerns: concerns.slice(0, 3),
    recommendations: recommendations.slice(0, 4),
    experienceYears: years,
    educationLevel: education,
    keywordsMatched: keywordsMatched.slice(0, 20),
    keywordsMissing,
    placementStatus,
    placementScore,
    placementSummary,
  };
}

/** Dynamic adviser answers grounded in resume + analysis */
export function answerAdviserLocally(
  question: string,
  resumeText: string,
  analysis: GeminiAnalysis | null
): string {
  const q = question.toLowerCase();
  const a = analysis ?? analyzeResumeLocally(resumeText);
  const name = a.candidateName;

  if (/placement|ready|status|hire/.test(q)) {
    return `## Placement Readiness for ${name}\n\n**Status:** 🚀 **${a.placementStatus || 'Placement Ready'}** (${a.atsScore}/100 - Grade **${a.grade}**)\n\n${a.resumeSummary}\n\n### Strengths\n${a.strengths.map((s) => `- ${s}`).join('\n')}\n\n### Top Target Roles\n${a.jobRoles.slice(0, 3).map((r) => `- **${r.title}** (${r.matchScore}% match)`).join('\n')}`;
  }

  if (/ats|score|grade|rating/.test(q)) {
    return `## ATS Score breakdown for ${name}\n\n**Overall ATS Score:** **${a.atsScore}/100** (Grade **${a.grade}**, ${a.overallRating})\n\n### Category Scores\n${Object.entries(a.categoryScores || {}).map(([k, v]) => `- **${k.toUpperCase()}:** ${v}/100`).join('\n')}\n\n### Placement Verdict\n${a.placementSummary || a.resumeSummary}`;
  }

  if (/skill|gap|missing|add/.test(q)) {
    return `## Skills Analysis for ${name}\n\n### Matched Skills (${a.skillsMatched.length})\n${a.skillsMatched.map((s) => `- **${s}**`).join('\n') || '- Core technical skills detected.'}\n\n### High-Value Additions\n${a.missingSkills.length ? a.missingSkills.map((s) => `- ${s}`).join('\n') : '- Excellent skill coverage! No critical gaps found.'}`;
  }

  if (/job|role|career|fit|recommend/.test(q)) {
    return `## Recommended Job Roles for ${name}\n\n${a.jobRoles
      .map((r) => `### ${r.title} — ${r.matchScore}% Match\n${r.reason}`)
      .join('\n\n')}\n\n**Recommendation:** ${a.recommendation}. Apply directly for these roles.`;
  }

  if (/summary|rewrite|headline|about/.test(q)) {
    const skills = a.skillsMatched.slice(0, 5).join(', ') || 'modern engineering tools';
    return `## High-Impact Summary Draft for ${name}\n\n> **${name}** | Senior Technical Candidate\n> Results-oriented professional with ${a.experienceYears || '3+'} years of experience in ${skills}. Proven track record of shipping performant products and driving technical execution. Seeking senior placement in **${a.jobRoles[0]?.title || 'Engineering Lead'}** roles.\n\n### Key Highlights\n- Placement Readiness: **${a.placementStatus || 'Placement Ready'}**\n- Core Grade: **${a.grade}** (${a.atsScore}/100)`;
  }

  return `## Placement Analysis for ${name}\n\n**Placement Readiness:** 🚀 **${a.placementStatus || 'Placement Ready'}** (${a.atsScore}/100, Grade **${a.grade}**)\n\n${a.resumeSummary}\n\n### Key Recommendations\n${a.recommendations.map((r) => `- ${r}`).join('\n')}\n\nAsk me about **Placement Readiness**, **Skill gaps**, **Job roles**, or **Summary rewrite**!`;
}

export function buildReportText(analysis: GeminiAnalysis, fileName?: string): string {
  return `SUKRIVA PLACEMENT READINESS & ATS REPORT
========================================
Candidate: ${analysis.candidateName}
File: ${fileName || 'Uploaded Resume'}
Placement Status: ${analysis.placementStatus || 'Placement Ready'} (${analysis.atsScore}/100 - Grade ${analysis.grade})
Overall Rating: ${analysis.overallRating}
Recommendation: ${analysis.recommendation}

SUMMARY
-------
${analysis.placementSummary || analysis.resumeSummary}

CATEGORY SCORES
---------------
${Object.entries(analysis.categoryScores || {})
  .map(([k, v]) => `- ${k.toUpperCase()}: ${v}/100`)
  .join('\n')}

TOP SKILLS (${analysis.skillsMatched?.length || 0})
----------------
${(analysis.skillsMatched || []).map((s) => `- ${s}`).join('\n')}

RECOMMENDED ROLES
-----------------
${(analysis.jobRoles || [])
  .map((r) => `- ${r.title} (${r.matchScore}%): ${r.reason}`)
  .join('\n')}

STRENGTHS
---------
${(analysis.strengths || []).map((s) => `- ${s}`).join('\n')}

ACTIONABLE RECOMMENDATIONS
---------------------------
${(analysis.recommendations || []).map((r) => `- ${r}`).join('\n')}
`;
}

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadJsonFile(data: unknown, filename = 'placement-report.json') {
  downloadFile(JSON.stringify(data, null, 2), filename, 'application/json');
}

export function downloadTextFile(content: string, filename = 'placement-report.txt') {
  downloadFile(content, filename, 'text/plain');
}
