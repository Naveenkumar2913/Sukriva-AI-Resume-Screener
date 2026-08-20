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

const ROLE_TEMPLATES = [
  { title: 'Frontend Engineer', skills: ['react', 'javascript', 'typescript', 'html', 'css', 'next.js', 'tailwind'], base: 55 },
  { title: 'Full Stack Engineer', skills: ['react', 'node', 'typescript', 'sql', 'api', 'javascript'], base: 50 },
  { title: 'Backend Engineer', skills: ['node', 'python', 'java', 'sql', 'api', 'microservices', 'docker'], base: 50 },
  { title: 'DevOps / SRE', skills: ['aws', 'docker', 'kubernetes', 'terraform', 'ci/cd', 'linux', 'devops'], base: 48 },
  { title: 'Data Analyst', skills: ['sql', 'python', 'excel', 'tableau', 'power bi', 'pandas'], base: 48 },
  { title: 'Product Manager', skills: ['product management', 'agile', 'jira', 'communication', 'strategy'], base: 45 },
  { title: 'Mobile Engineer', skills: ['react native', 'swift', 'kotlin', 'android', 'ios', 'flutter'], base: 48 },
  { title: 'ML Engineer', skills: ['python', 'machine learning', 'tensorflow', 'pytorch', 'ai', 'data science'], base: 48 },
];

function normalize(text) {
  return String(text || '').toLowerCase().replace(/[^\w+#./\s-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractSkills(text) {
  const n = normalize(text);
  return SKILL_CATALOG.filter((s) => n.includes(s));
}

function extractName(resume) {
  const lines = String(resume || '').split('\n').map((l) => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 6)) {
    if (
      line.length > 2 &&
      line.length < 50 &&
      !/[@\d]|email|phone|linkedin|http|resume|curriculum/i.test(line) &&
      /^[A-Za-z][A-Za-z\s.'-]+$/.test(line)
    ) {
      return line.split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
  }
  return 'Candidate';
}

function extractEducation(text) {
  const str = String(text || '');
  if (/\bph\.?d\b|doctorate/i.test(str)) return 'PhD';
  if (/\bmaster'?s?\b|\bm\.?s\.?\b|\bmba\b/i.test(str)) return "Master's";
  if (/\bbachelor'?s?\b|\bb\.?s\.?\b|\bb\.?a\.?\b|\bb\.?tech\b/i.test(str)) return "Bachelor's";
  if (/\bassociate/i.test(str)) return 'Associate';
  return null;
}

function extractCerts(text) {
  const str = String(text || '');
  const certs = [];
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
    for (const m of str.matchAll(re)) certs.push(m[0].trim());
  }
  return [...new Set(certs)].slice(0, 8);
}

function gradeFromScore(score) {
  if (score >= 92) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 78) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 62) return 'C+';
  if (score >= 55) return 'C';
  if (score >= 45) return 'D';
  return 'F';
}

function ratingFromScore(score) {
  if (score >= 85) return 'Excellent';
  if (score >= 75) return 'Strong';
  if (score >= 65) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Poor';
}

function recommendationFromScore(score) {
  if (score >= 80) return 'Strong Hire';
  if (score >= 65) return 'Interview';
  if (score >= 45) return 'Maybe';
  return 'Pass';
}

function jdKeywords(jd) {
  if (!String(jd || '').trim()) return [];
  const skills = extractSkills(jd);
  const words = normalize(jd).split(/\s+/).filter((w) => w.length > 4);
  const freq = new Map();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
  const frequent = [...freq.entries()].filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([w]) => w);
  return [...new Set([...skills, ...frequent])];
}

function analyzeResumeLocally(resumeText, jobDescription = '') {
  const name = extractName(resumeText);
  const resumeSkills = extractSkills(resumeText);
  const education = extractEducation(resumeText);
  const certs = extractCerts(resumeText);
  const resumeNorm = normalize(resumeText);
  const jdSkills = extractSkills(jobDescription);
  const targetSkills = jdSkills.length ? jdSkills : resumeSkills.slice(0, 12);
  const skillsMatched = targetSkills.filter((s) => resumeSkills.includes(s) || resumeNorm.includes(s));
  const missingSkills = (jdSkills.length ? jdSkills : ['cloud architecture', 'system design', 'leadership', 'ci/cd', 'testing'])
    .filter((s) => !resumeNorm.includes(s) && !skillsMatched.includes(s))
    .slice(0, 8);
  const keywords = jdKeywords(jobDescription);
  const keywordsMatched = keywords.filter((k) => resumeNorm.includes(k));
  const keywordsMissing = keywords.filter((k) => !resumeNorm.includes(k)).slice(0, 10);
  const skillScore = targetSkills.length === 0
    ? Math.min(90, 40 + resumeSkills.length * 4)
    : Math.round((skillsMatched.length / targetSkills.length) * 100);
  const keywordScore = keywords.length === 0
    ? Math.min(88, 50 + resumeSkills.length * 2)
    : Math.round((keywordsMatched.length / keywords.length) * 100);

  const hasProjects = /project|built|developed|implemented|github|portfolio/i.test(resumeText);
  const hasInternship = /intern(ship)?|trainee|apprentice|co-?op/i.test(resumeText);
  const experienceScore = Math.min(100, 50 + (hasProjects ? 25 : 0) + (hasInternship ? 20 : 0));

  let educationScore = 55;
  if (education === 'PhD') educationScore = 98;
  else if (education === "Master's") educationScore = 90;
  else if (education === "Bachelor's") educationScore = 82;
  else if (education === 'Associate') educationScore = 60;
  const hasMetrics = /\d+%|\$\d+|\d+x|increased|reduced|improved|grew|saved|led|managed/i.test(resumeText);
  const hasLeadership = /lead|led|manage|mentor|direct|owned|spearhead/i.test(resumeText);
  const impactScore = Math.min(100, (hasMetrics ? 60 : 35) + (hasLeadership ? 25 : 5) + 10);
  const formattingScore = Math.min(100, 50 + (resumeText.length > 600 ? 15 : 0) + (/\b(projects?|education|skills)\b/i.test(resumeText) ? 20 : 0) + (resumeText.split('\n').length > 10 ? 10 : 0));
  const cultureFitScore = Math.min(100, 40 + (hasLeadership ? 20 : 0) + (/team|collaborat|partner|cross-functional/i.test(resumeText) ? 20 : 0) + (/agile|scrum/i.test(resumeText) ? 10 : 0) + 10);
  const categoryScores = { skills: skillScore, experience: experienceScore, education: educationScore, keywords: keywordScore, impact: impactScore, formatting: formattingScore, cultureFit: cultureFitScore };
  const atsScore = Math.round(skillScore * 0.28 + experienceScore * 0.18 + educationScore * 0.1 + keywordScore * 0.16 + impactScore * 0.12 + formattingScore * 0.08 + cultureFitScore * 0.08);
  const jobRoles = ROLE_TEMPLATES.map((role) => {
    const hits = role.skills.filter((s) => resumeNorm.includes(s)).length;
    const matchScore = Math.min(98, role.base + hits * 8);
    return {
      title: role.title,
      matchScore,
      reason: hits > 0
        ? `Resume shows ${hits} overlapping skill(s) with ${role.title} (${role.skills.filter((s) => resumeNorm.includes(s)).slice(0, 4).join(', ')}).`
        : `Limited direct evidence for ${role.title}; consider targeted upskilling.`,
    };
  }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);

  const strengths = [];
  const concerns = [];
  const recommendations = [];
  if (skillScore >= 70) strengths.push(`Strong skill coverage (${skillsMatched.length} relevant skills detected for ${name}).`);
  else concerns.push('Skill coverage against the target profile is limited.');
  if (hasMetrics) strengths.push('Uses quantified achievements (metrics / outcomes).');
  else {
    concerns.push('Few measurable outcomes on the resume.');
    recommendations.push('Add metrics to bullets (e.g., “improved conversion by 18%”).');
  }
  if (education) strengths.push(`Education signal: ${education}.`);
  else recommendations.push('Make education / credentials explicit if applicable.');
  if (missingSkills.length) {
    concerns.push(`Potential gaps: ${missingSkills.slice(0, 4).join(', ')}.`);
    recommendations.push(`Consider adding or demonstrating: ${missingSkills.slice(0, 3).join(', ')}.`);
  }
  recommendations.push('Mirror important keywords from the target job description in your summary and skills section.');
  recommendations.push('Lead bullets with action verbs and impact, not only responsibilities.');
  const topRole = jobRoles[0]?.title || 'professional roles';
  const resumeSummary = `${name} presents a ${ratingFromScore(atsScore).toLowerCase()} profile with ${resumeSkills.length} detected technical/professional skills. ${hasMetrics ? 'Impact-oriented language is present.' : 'Impact language is limited.'} Strongest role alignment appears to be ${topRole}.`;

  return {
    candidateName: name,
    atsScore,
    grade: gradeFromScore(atsScore),
    overallRating: ratingFromScore(atsScore),
    recommendation: recommendationFromScore(atsScore),
    resumeSummary,
    skillsMatched: skillsMatched.length ? skillsMatched : resumeSkills.slice(0, 12),
    missingSkills,
    certifications: certs,
    jobRoles,
    categoryScores,
    strengths: strengths.slice(0, 5),
    concerns: concerns.slice(0, 5),
    recommendations: recommendations.slice(0, 6),
    experienceYears: null,
    educationLevel: education,
    keywordsMatched: keywordsMatched.slice(0, 20),
    keywordsMissing,
  };
}

function answerAdviserLocally(question, resumeText, analysis) {
  const q = String(question || '').toLowerCase();
  const a = analysis || analyzeResumeLocally(resumeText);
  const name = a.candidateName;
  if (/ats|score|grade|rating/.test(q)) {
    return `## ATS outlook for ${name}\n\n**Current ATS score:** ${a.atsScore}/100 (**Grade ${a.grade}**, ${a.overallRating}).\n\n### What's helping\n${(a.strengths || []).map((s) => `- ${s}`).join('\n') || '- Limited positive signals detected.'}\n\n### What to improve\n${(a.recommendations || []).map((r) => `- ${r}`).join('\n')}`;
  }
  if (/skill|gap|missing|add/.test(q)) {
    return `## Skills guidance for ${name}\n\n### Skills already showing\n${(a.skillsMatched || []).map((s) => `- **${s}**`).join('\n') || '- Few explicit skills parsed.'}\n\n### Gaps to address\n${(a.missingSkills || []).map((s) => `- ${s}`).join('\n') || '- No major gaps flagged.'}`;
  }
  if (/job|role|career|fit|recommend/.test(q)) {
    return `## Role fit for ${name}\n\n${(a.jobRoles || []).map((r) => `### ${r.title} — ${r.matchScore}%\n${r.reason}`).join('\n\n')}\n\n**Recommendation:** ${a.recommendation}.`;
  }
  if (/summary|rewrite|headline|about/.test(q)) {
    const skills = (a.skillsMatched || []).slice(0, 5).join(', ') || 'your core tools';
    return `## Stronger summary draft for ${name}\n\n> ${name} is a results-driven professional skilled in ${skills}. Ready for **${a.jobRoles?.[0]?.title || 'impactful roles'}**.\n\n### Tips\n- Keep it to 3–4 lines\n- Mention 1 metric\n- Mirror JD keywords`;
  }
  if (/cert|education|degree/.test(q)) {
    return `## Credentials on this resume\n\n**Education:** ${a.educationLevel || 'Not clearly detected'}\n\n**Certifications:**\n${(a.certifications || []).length ? a.certifications.map((c) => `- ${c}`).join('\n') : '- None clearly detected'}`;
  }
  return `## Advice for ${name}\n\nBased on the uploaded resume (ATS **${a.atsScore}**, grade **${a.grade}**):\n\n${a.resumeSummary}\n\n### Priority recommendations\n${(a.recommendations || []).map((r) => `- ${r}`).join('\n')}`;
}

module.exports = {
  analyzeResumeLocally,
  answerAdviserLocally,
};
