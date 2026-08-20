export interface JobRoleSuggestion {
  title: string;
  matchScore: number;
  reason: string;
}

export interface CategoryScores {
  skills: number;
  experience: number;
  education: number;
  keywords: number;
  impact: number;
  formatting: number;
  cultureFit: number;
}

export interface GeminiAnalysis {
  candidateName: string;
  atsScore: number;
  grade: string;
  overallRating: string;
  recommendation: 'Strong Hire' | 'Interview' | 'Maybe' | 'Pass' | string;
  resumeSummary: string;
  skillsMatched: string[];
  missingSkills: string[];
  certifications: string[];
  jobRoles: JobRoleSuggestion[];
  categoryScores: CategoryScores;
  strengths: string[];
  concerns: string[];
  recommendations: string[];
  experienceYears: number | null;
  educationLevel: string | null;
  keywordsMatched: string[];
  keywordsMissing: string[];
  /** Optional fields filled by analysis engines */
  placementStatus?: 'Placement Ready' | 'Almost Ready' | 'Needs Work';
  placementScore?: number;
  placementSummary?: string;
}


export interface ScreeningRecord {
  id: string;
  timestamp: number;
  fileName: string;
  resumeText: string;
  jobDescription: string;
  analysis: GeminiAnalysis;
  screenedBy?: string;
  provider?: string;
}

export interface AdviserMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
