export interface Profile {
  id: number;
  name: string;
  title: string;
  bio: string;
  email: string;
  github_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  website_url?: string;
  avatar_url?: string;
  resume_url?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  long_description?: string;
  thumbnail_url?: string;
  demo_url?: string;
  github_url?: string;
  technologies: string[];
  is_featured: boolean;
  is_published: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  proficiency: number;
  icon_url?: string;
  order: number;
  created_at: string;
  updated_at: string;
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

export interface AdminUser {
  id: number;
  email: string;
  is_active: boolean;
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
