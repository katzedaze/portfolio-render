import type { Project, Skill, Profile, ContactMessage, DashboardStats } from '@/types'

export function createProject(overrides?: Partial<Project>): Project {
  return {
    id: 1,
    title: 'Test Project',
    slug: 'test-project',
    description: 'A test project description',
    content: 'A longer description for the test project',
    thumbnail_url: undefined,
    live_url: undefined,
    github_url: 'https://github.com/user/test-project',
    skills: [],
    is_featured: false,
    is_published: true,
    sort_order: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

export function createSkill(overrides?: Partial<Skill>): Skill {
  return {
    id: 1,
    name: 'TypeScript',
    category: 'Language',
    proficiency: 85,
    icon: undefined,
    sort_order: 0,
    ...overrides,
  }
}

export function createProfile(overrides?: Partial<Profile>): Profile {
  return {
    id: 1,
    name: 'Test User',
    title: 'Software Engineer',
    bio: 'A software engineer who loves building things.',
    email: 'test@example.com',
    github_url: 'https://github.com/testuser',
    linkedin_url: undefined,
    avatar_url: undefined,
    ...overrides,
  }
}

export function createContactMessage(overrides?: Partial<ContactMessage>): ContactMessage {
  return {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Hello',
    message: 'This is a test message.',
    is_read: false,
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

export function createDashboardStats(overrides?: Partial<DashboardStats>): DashboardStats {
  return {
    totalProjects: 5,
    publishedProjects: 3,
    totalSkills: 10,
    unreadMessages: 2,
    ...overrides,
  }
}
