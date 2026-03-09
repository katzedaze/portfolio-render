export interface Profile {
  id: number;
  name: string;
  title: string;
  bio: string;
  avatar_url?: string | null;
  email?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
}

export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  thumbnail_url?: string | null;
  live_url?: string | null;
  github_url?: string | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  skills: Skill[];
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  proficiency: number;
  icon?: string | null;
  sort_order: number;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardStats {
  totalProjects: number;
  publishedProjects: number;
  totalSkills: number;
  unreadMessages: number;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}
