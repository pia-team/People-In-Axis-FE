export interface MatchingConfig {
  weightSkills?: number;
  weightExperience?: number;
  weightLanguage?: number;
  weightEducation?: number;
  weightLocation?: number;
  weightSalary?: number;
  weightSemantic?: number;
  minThreshold?: number;
  requireAllRequiredSkills?: boolean;
}

export interface SkillAliasItem {
  id: string;
  alias: string;
  canonicalSkill: string;
}
