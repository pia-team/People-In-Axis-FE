import { Position } from '@/types/cv-sharing';

export interface MatchBreakdown {
  skillsScore: number;
  experienceScore: number;
  languageScore: number;
  educationScore: number;
  locationScore: number;
  salaryScore: number;
  semanticScore: number;
  details?: Record<string, string>;
}

export interface MatchedPosition {
  position: Position;
  matchScore: number;
  breakdown: MatchBreakdown;
  missingRequiredSkills?: string[];
  matchedSkills?: string[];
  matchLevel: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  recommendation: string;
}
