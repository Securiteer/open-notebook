export interface Skill {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  instructions: string;
  content: string;
  rating: number;
  rating_count: number;
  created: string;
  updated: string;
  is_installed: boolean;
}

export interface SkillCreate {
  name: string;
  description: string;
  author?: string;
  version?: string;
  instructions?: string;
  content: string;
}

export interface SkillRateRequest {
  rating: number;
}
