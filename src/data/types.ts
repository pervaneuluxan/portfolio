export const PROJECT_FILTERS = ['All', 'Next.js / React', 'Full-Stack', 'CMS sites', 'Motion / GSAP'] as const;
export type ProjectFilter = (typeof PROJECT_FILTERS)[number];

export interface Profile {
  name: string;
  role: string;
  headline: string;
  valueProp: string;
  location: string;
  availability: string;
  email: string;
  cvUrl: string;
  links: { label: string; href: string }[];
}

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  period: string;
  role: string;
  filters: Exclude<ProjectFilter, 'All'>[];
  stack: string[];
  live: string;
  repo?: string;
  overview: string;
  challenge: string;
  solution: string;
  highlights: string[];
}

export interface MoreProject {
  slug: string;
  title: string;
  category: string;
  live: string;
  stack: string;
}

export interface Role {
  title: string;
  org: string;
  context: string;
  period: string;
  points: string[];
}

export interface SkillGroup {
  title: string;
  items: string[];
}

export interface Note {
  slug: string;
  title: string;
  summary: string;
  date: string;
  tags: string[];
  body: string[];
}
