export interface SkillMatch {
  skill: string;
  matched: boolean;
  weight: number;
}

export interface ScreeningCategory {
  name: string;
  score: number;
  weight: number;
  details: string;
}

export interface LiveInsight {
  id: string;
  type: 'skill' | 'keyword' | 'experience' | 'education' | 'impact' | 'info';
  message: string;
  positive: boolean;
}

export interface ScreeningResult {
  overallScore: number;
  recommendation: 'Strong Hire' | 'Interview' | 'Maybe' | 'Pass';
  skills: SkillMatch[];
  categories: ScreeningCategory[];
  matchedKeywords: string[];
  missingKeywords: string[];
  experienceYears: null;
  educationLevel: string | null;
  summary: string;
  strengths: string[];
  concerns: string[];
  timestamp: number;
  candidateName: string;
  cultureFitScore: number;
  communicationScore: number;
}

export interface ScreeningProgress {
  stage: string;
  progress: number;
  detail: string;
  insights: LiveInsight[];
  partialScore: number | null;
  skillsFound: number;
  keywordsFound: number;
}

const COMMON_SKILLS = [
  'javascript', 'typescript', 'react', 'vue', 'angular', 'node', 'nodejs',
  'python', 'java', 'go', 'golang', 'rust', 'c++', 'c#', 'ruby', 'php',
  'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ci/cd',
  'git', 'linux', 'graphql', 'rest', 'api', 'microservices',
  'machine learning', 'ml', 'ai', 'data science', 'pandas', 'tensorflow',
  'pytorch', 'nlp', 'computer vision', 'deep learning',
  'agile', 'scrum', 'jira', 'figma', 'ui/ux', 'design systems',
  'html', 'css', 'tailwind', 'sass', 'next.js', 'nextjs', 'express',
  'spring', 'django', 'flask', 'fastapi', 'rails',
  'leadership', 'communication', 'project management', 'mentoring',
  'product management', 'stakeholder management', 'strategy',
  'salesforce', 'excel', 'tableau', 'power bi', 'looker',
  'security', 'oauth', 'authentication', 'testing', 'jest', 'cypress',
  'webpack', 'vite', 'ci', 'cd', 'devops', 'sre', 'observability',
];

const EDUCATION_PATTERNS: Array<{ pattern: RegExp; level: string; rank: number }> = [
  { pattern: /\bph\.?d\b|doctorate|doctoral/i, level: 'PhD', rank: 5 },
  { pattern: /\bmaster'?s?\b|\bm\.?s\.?\b|\bmba\b|\bm\.?eng\b/i, level: "Master's", rank: 4 },
  { pattern: /\bbachelor'?s?\b|\bb\.?s\.?\b|\bb\.?a\.?\b|\bb\.?eng\b|\bb\.?tech\b/i, level: "Bachelor's", rank: 3 },
  { pattern: /\bassociate'?s?\b|\ba\.?a\.?\b|\ba\.?s\.?\b/i, level: 'Associate', rank: 2 },
  { pattern: /\bhigh school\b|\bg\.?e\.?d\b/i, level: 'High School', rank: 1 },
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w+#./\s-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractSkills(text: string): string[] {
  const normalized = normalize(text);
  const found = new Set<string>();

  for (const skill of COMMON_SKILLS) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(?:^|\\s|[,;/|])${escaped}(?:$|\\s|[,;/|]|s\\b)`, 'i');
    if (re.test(normalized) || normalized.includes(skill)) {
      found.add(skill);
    }
  }

  const skillSection = text.match(/(?:skills?|technologies|tech stack|tools?)[:\s]*([\s\S]{0,800})/i);
  if (skillSection) {
    const tokens = skillSection[1]
      .split(/[,|•·\n;/]+/)
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 1 && t.length < 40);
    tokens.forEach((t) => {
      if (COMMON_SKILLS.some((s) => s.includes(t) || t.includes(s))) {
        found.add(t);
      }
    });
  }

  return Array.from(found);
}

function extractEducation(text: string): string | null {
  let best: { level: string; rank: number } | null = null;
  for (const entry of EDUCATION_PATTERNS) {
    if (entry.pattern.test(text)) {
      if (!best || entry.rank > best.rank) {
        best = { level: entry.level, rank: entry.rank };
      }
    }
  }
  return best?.level ?? null;
}

function extractCandidateName(resume: string): string {
  const lines = resume
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines.slice(0, 5)) {
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

function extractKeywordsFromJD(jd: string): string[] {
  const skills = extractSkills(jd);
  const normalized = normalize(jd);

  const reqSection = jd.match(
    /(?:requirements?|qualifications?|must[- ]have|you(?:'ll| will) need|what we(?:'re| are) looking for)[:\s]*([\s\S]{0,1200})/i
  );

  const extras: string[] = [];
  if (reqSection) {
    const tokens = reqSection[1]
      .toLowerCase()
      .split(/[\n,•·|;]+/)
      .map((t) => t.replace(/^[\s\-*]+/, '').trim())
      .filter((t) => t.length > 2 && t.length < 50);

    for (const token of tokens) {
      const words = token.split(/\s+/).slice(0, 4).join(' ');
      if (words.length > 2) extras.push(words);
    }
  }

  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'you', 'our', 'will', 'are', 'this', 'that',
    'from', 'have', 'has', 'been', 'your', 'all', 'can', 'who', 'what', 'how',
    'job', 'role', 'team', 'work', 'working', 'experience', 'years', 'ability',
    'strong', 'including', 'such', 'using', 'well', 'etc', 'also', 'into',
    'about', 'over', 'their', 'they', 'should', 'must', 'need', 'needs',
  ]);

  const words = normalized.split(/\s+/).filter((w) => w.length > 3 && !stopWords.has(w));
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);

  const frequent = [...freq.entries()]
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([w]) => w);

  return Array.from(new Set([...skills, ...frequent, ...extras])).slice(0, 40);
}

function scoreSkills(jdSkills: string[], resumeSkills: string[], resumeText: string): SkillMatch[] {
  const resumeNorm = normalize(resumeText);
  const resumeSet = new Set(resumeSkills);

  return jdSkills.slice(0, 20).map((skill) => {
    const matched =
      resumeSet.has(skill) ||
      resumeNorm.includes(skill) ||
      resumeSkills.some((rs) => rs.includes(skill) || skill.includes(rs));

    return {
      skill,
      matched,
      weight: skill.includes(' ') ? 1.2 : 1,
    };
  });
}

function computeRecommendation(score: number): ScreeningResult['recommendation'] {
  if (score >= 80) return 'Strong Hire';
  if (score >= 65) return 'Interview';
  if (score >= 45) return 'Maybe';
  return 'Pass';
}

export function screenResume(jobDescription: string, resumeText: string): ScreeningResult {
  const jdKeywords = extractKeywordsFromJD(jobDescription);
  const resumeSkills = extractSkills(resumeText);
  const jdSkills = extractSkills(jobDescription);
  const skillsToCheck = jdSkills.length > 0 ? jdSkills : jdKeywords.slice(0, 15);

  const skillMatches = scoreSkills(skillsToCheck, resumeSkills, resumeText);
  const matchedSkills = skillMatches.filter((s) => s.matched);
  const skillScore =
    skillMatches.length === 0
      ? 50
      : Math.round(
          (matchedSkills.reduce((a, s) => a + s.weight, 0) /
            skillMatches.reduce((a, s) => a + s.weight, 0)) *
            100
        );

  const resumeNorm = normalize(resumeText);
  const matchedKeywords = jdKeywords.filter((k) => resumeNorm.includes(k));
  const missingKeywords = jdKeywords.filter((k) => !resumeNorm.includes(k)).slice(0, 12);
  const keywordScore =
    jdKeywords.length === 0
      ? 50
      : Math.round((matchedKeywords.length / jdKeywords.length) * 100);

  const hasProjects = /project|built|developed|implemented|github|portfolio/i.test(resumeText);
  const hasInternship = /intern(ship)?|trainee|apprentice|co-?op/i.test(resumeText);
  const experienceScore = Math.min(100, 50 + (hasProjects ? 25 : 0) + (hasInternship ? 20 : 0));

  const educationLevel = extractEducation(resumeText);
  const wantsMasters = /master'?s?|m\.?s\.?|mba|ph\.?d/i.test(jobDescription);
  let educationScore = 60;
  if (educationLevel === 'PhD') educationScore = 100;
  else if (educationLevel === "Master's") educationScore = wantsMasters ? 100 : 90;
  else if (educationLevel === "Bachelor's") educationScore = wantsMasters ? 70 : 85;
  else if (educationLevel === 'Associate') educationScore = 55;
  else if (educationLevel === 'High School') educationScore = 40;

  const hasMetrics = /\d+%|\$\d+|\d+x|\d+\+|increased|reduced|improved|grew|saved|led|managed/i.test(
    resumeText
  );
  const hasLeadership = /lead|led|manage|mentor|direct|own|owned|spearhead/i.test(resumeText);
  const impactScore = Math.min(100, (hasMetrics ? 55 : 30) + (hasLeadership ? 30 : 0) + 15);

  const cultureFitScore = Math.min(
    100,
    Math.round(
      (hasLeadership ? 30 : 10) +
        (/collaborat|team|cross-functional|partner/i.test(resumeText) ? 25 : 10) +
        (/mentor|coach|teach/i.test(resumeText) ? 20 : 5) +
        (/agile|scrum|sprint/i.test(resumeText) ? 15 : 5) +
        10
    )
  );

  const communicationScore = Math.min(
    100,
    Math.round(
      40 +
        (resumeText.length > 800 ? 15 : 5) +
        (/present|wrote|document|stakeholder|communicat/i.test(resumeText) ? 25 : 5) +
        (hasMetrics ? 15 : 5)
    )
  );

  const categories: ScreeningCategory[] = [
    {
      name: 'Skills Match',
      score: skillScore,
      weight: 0.3,
      details: `${matchedSkills.length} of ${skillMatches.length} required skills found`,
    },
    {
      name: 'Keyword Alignment',
      score: keywordScore,
      weight: 0.2,
      details: `${matchedKeywords.length} of ${jdKeywords.length} key terms present`,
    },
    {
      name: 'Projects & Experience',
      score: experienceScore,
      weight: 0.2,
      details: hasProjects
        ? 'Project or hands-on experience present'
        : 'Limited project work detected',
    },
    {
      name: 'Education',
      score: educationScore,
      weight: 0.1,
      details: educationLevel ? `Highest level: ${educationLevel}` : 'Education level not clearly detected',
    },
    {
      name: 'Impact Signals',
      score: impactScore,
      weight: 0.1,
      details: hasMetrics
        ? 'Quantified achievements and ownership language present'
        : 'Limited quantified impact language found',
    },
    {
      name: 'Culture Fit',
      score: cultureFitScore,
      weight: 0.1,
      details: 'Based on collaboration, leadership, and team signals in the resume',
    },
  ];

  const overallScore = Math.round(
    categories.reduce((sum, c) => sum + c.score * c.weight, 0)
  );

  const strengths: string[] = [];
  const concerns: string[] = [];

  if (skillScore >= 70) strengths.push('Strong alignment with required technical skills');
  else if (skillScore < 45) concerns.push('Significant skill gaps vs. job requirements');

  if (keywordScore >= 65) strengths.push('Resume language closely mirrors the job description');
  else concerns.push('Keyword coverage is limited — consider tailoring resume wording');

  if (hasMetrics) strengths.push('Uses measurable outcomes to demonstrate impact');
  else concerns.push('Few quantified results — impact is harder to assess');

  if (educationLevel && (educationLevel === "Master's" || educationLevel === 'PhD')) {
    strengths.push(`Advanced education (${educationLevel})`);
  }

  if (cultureFitScore >= 70) strengths.push('Positive collaboration and leadership indicators');

  if (missingKeywords.length > 5) {
    concerns.push(`Missing key terms: ${missingKeywords.slice(0, 5).join(', ')}`);
  }

  const recommendation = computeRecommendation(overallScore);
  const candidateName = extractCandidateName(resumeText);

  const summary =
    recommendation === 'Strong Hire'
      ? `${candidateName} is a highly competitive match with strong skill coverage and relevant project signals.`
      : recommendation === 'Interview'
        ? `${candidateName} looks promising overall. Recommend a technical screen to validate remaining gaps.`
        : recommendation === 'Maybe'
          ? `${candidateName} has partial alignment. Worth a closer look only if the talent pool is thin.`
          : `${candidateName} shows limited alignment with this role's requirements based on the resume alone.`;

  return {
    overallScore,
    recommendation,
    skills: skillMatches,
    categories,
    matchedKeywords: matchedKeywords.slice(0, 20),
    missingKeywords,
    experienceYears: null,
    educationLevel,
    summary,
    strengths: strengths.slice(0, 5),
    concerns: concerns.slice(0, 5),
    timestamp: Date.now(),
    candidateName,
    cultureFitScore,
    communicationScore,
  };
}

export const SAMPLE_JOB_DESCRIPTION = `Senior Frontend Engineer — Product Platform

About the role
We are looking for a Senior Frontend Engineer to build delightful, performant user experiences for our AI-powered recruiting platform. You will collaborate with design and product to ship polished features at scale.

Requirements
- Strong proficiency in TypeScript, React, and Next.js
- Experience with Tailwind CSS, component libraries, and design systems
- Solid understanding of REST APIs, GraphQL, and state management
- Familiarity with testing (Jest, Cypress) and CI/CD pipelines
- Experience with performance optimization and accessibility (WCAG)
- Bachelor's degree in Computer Science or equivalent experience

Nice to have
- Experience with Node.js and full-stack development
- Exposure to AWS, Docker, and Kubernetes
- Background in AI/ML product interfaces
- Mentoring and technical leadership experience`;

export const SAMPLE_RESUME = `Jordan Lee
Senior Frontend Engineer
jordan.lee@email.com | linkedin.com/in/jordanlee | San Francisco, CA

SUMMARY
Frontend engineer with experience building scalable React applications. Passionate about design systems, performance, and shipping polished product experiences.

EXPERIENCE
Senior Frontend Engineer — Horizon Labs (2021 – Present)
- Led rebuild of customer dashboard in React + TypeScript, improving LCP by 42%
- Built shared design system with Tailwind CSS used across 4 product teams
- Mentored 3 junior engineers; introduced Jest and Cypress coverage standards
- Integrated GraphQL APIs and optimized client-side state management

Frontend Engineer — Pixel Forge (2018 – 2021)
- Developed responsive web apps with React, Redux, and REST APIs
- Collaborated with design on accessibility improvements meeting WCAG 2.1 AA
- Implemented CI/CD pipelines reducing release time by 30%

SKILLS
TypeScript, JavaScript, React, Next.js, Tailwind CSS, HTML, CSS, GraphQL, REST, Jest, Cypress, Git, Node.js, AWS, Docker, Agile, Communication, Mentoring

EDUCATION
B.S. Computer Science — University of Washington`;

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Streaming realtime analysis with live insights and partial scores */
export async function* runScreeningAnimation(
  jobDescription: string,
  resumeText: string
): AsyncGenerator<ScreeningProgress | { done: true; result: ScreeningResult }> {
  const insights: LiveInsight[] = [];
  let insightId = 0;
  const push = (insight: Omit<LiveInsight, 'id'>) => {
    insights.push({ ...insight, id: `i${++insightId}` });
  };

  yield {
    stage: 'Ingesting documents',
    progress: 6,
    detail: 'Normalizing job description and resume text for Sukriva analysis…',
    insights: [...insights],
    partialScore: null,
    skillsFound: 0,
    keywordsFound: 0,
  };
  await delay(450);

  const candidateName = extractCandidateName(resumeText);
  push({
    type: 'info',
    message: `Candidate identity detected: ${candidateName}`,
    positive: true,
  });

  yield {
    stage: 'Parsing documents',
    progress: 14,
    detail: `Extracting structure from ${candidateName}'s resume…`,
    insights: [...insights],
    partialScore: null,
    skillsFound: 0,
    keywordsFound: 0,
  };
  await delay(500);

  const jdSkills = extractSkills(jobDescription);
  const resumeSkills = extractSkills(resumeText);
  const skillMatches = scoreSkills(
    jdSkills.length > 0 ? jdSkills : extractKeywordsFromJD(jobDescription).slice(0, 15),
    resumeSkills,
    resumeText
  );
  const matchedSkills = skillMatches.filter((s) => s.matched);

  for (const s of matchedSkills.slice(0, 4)) {
    push({ type: 'skill', message: `Matched skill: ${s.skill}`, positive: true });
    yield {
      stage: 'Extracting skills',
      progress: 18 + matchedSkills.indexOf(s) * 4,
      detail: `Cross-checking skill graph for "${s.skill}"…`,
      insights: [...insights],
      partialScore: Math.round((matchedSkills.length / Math.max(skillMatches.length, 1)) * 55),
      skillsFound: matchedSkills.length,
      keywordsFound: 0,
    };
    await delay(320);
  }

  const missingSkills = skillMatches.filter((s) => !s.matched).slice(0, 2);
  for (const s of missingSkills) {
    push({ type: 'skill', message: `Gap detected: ${s.skill}`, positive: false });
    await delay(280);
  }

  yield {
    stage: 'Extracting skills',
    progress: 36,
    detail: `Found ${matchedSkills.length} of ${skillMatches.length} required skills`,
    insights: [...insights],
    partialScore: Math.round((matchedSkills.length / Math.max(skillMatches.length, 1)) * 60),
    skillsFound: matchedSkills.length,
    keywordsFound: 0,
  };
  await delay(400);

  const jdKeywords = extractKeywordsFromJD(jobDescription);
  const resumeNorm = normalize(resumeText);
  const matchedKeywords = jdKeywords.filter((k) => resumeNorm.includes(k));

  for (const k of matchedKeywords.slice(0, 3)) {
    push({ type: 'keyword', message: `Keyword hit: "${k}"`, positive: true });
    yield {
      stage: 'Keyword analysis',
      progress: 42 + matchedKeywords.indexOf(k) * 4,
      detail: `Aligning JD language with resume phrasing…`,
      insights: [...insights],
      partialScore: Math.round(
        (matchedSkills.length / Math.max(skillMatches.length, 1)) * 40 +
          (matchedKeywords.length / Math.max(jdKeywords.length, 1)) * 25
      ),
      skillsFound: matchedSkills.length,
      keywordsFound: matchedKeywords.length,
    };
    await delay(300);
  }

  yield {
    stage: 'Keyword analysis',
    progress: 56,
    detail: `${matchedKeywords.length} of ${jdKeywords.length} key terms present`,
    insights: [...insights],
    partialScore: Math.round(
      (matchedSkills.length / Math.max(skillMatches.length, 1)) * 45 +
        (matchedKeywords.length / Math.max(jdKeywords.length, 1)) * 30
    ),
    skillsFound: matchedSkills.length,
    keywordsFound: matchedKeywords.length,
  };
  await delay(420);

  const educationLevel = extractEducation(resumeText);
  push({
    type: 'education',
    message: educationLevel
      ? `Education level: ${educationLevel}`
      : 'Education credentials not clearly detected',
    positive: !!educationLevel,
  });

  yield {
    stage: 'Education check',
    progress: 78,
    detail: educationLevel
      ? `Validating ${educationLevel} credentials…`
      : 'Scanning for degree and certification signals…',
    insights: [...insights],
    partialScore: Math.round(
      (matchedSkills.length / Math.max(skillMatches.length, 1)) * 40 +
        (matchedKeywords.length / Math.max(jdKeywords.length, 1)) * 25 +
        15
    ),
    skillsFound: matchedSkills.length,
    keywordsFound: matchedKeywords.length,
  };
  await delay(400);

  const hasMetrics = /\d+%|\$\d+|\d+x|increased|reduced|improved|led|managed/i.test(resumeText);
  push({
    type: 'impact',
    message: hasMetrics
      ? 'Quantified impact language detected'
      : 'Limited measurable outcomes found',
    positive: hasMetrics,
  });

  yield {
    stage: 'Impact & culture signals',
    progress: 88,
    detail: 'Scoring leadership, collaboration, and measurable outcomes…',
    insights: [...insights],
    partialScore: Math.round(
      (matchedSkills.length / Math.max(skillMatches.length, 1)) * 40 +
        (matchedKeywords.length / Math.max(jdKeywords.length, 1)) * 25 +
        20
    ),
    skillsFound: matchedSkills.length,
    keywordsFound: matchedKeywords.length,
  };
  await delay(480);

  yield {
    stage: 'Generating Sukriva report',
    progress: 96,
    detail: 'Compiling match score, recommendations, and hiring guidance…',
    insights: [...insights],
    partialScore: null,
    skillsFound: matchedSkills.length,
    keywordsFound: matchedKeywords.length,
  };
  await delay(350);

  const result = screenResume(jobDescription, resumeText);
  yield { done: true, result };
}
