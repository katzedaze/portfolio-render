import type { Project, Skill, Profile, ContactMessage, DashboardStats } from '@/types'

export function createProject(overrides?: Partial<Project>): Project {
  return {
    id: 1,
    title: 'Test Project',
    slug: 'test-project',
    description: 'A test project description',
    long_description: 'A longer description for the test project',
    thumbnail_url: undefined,
    demo_url: undefined,
    github_url: 'https://github.com/user/test-project',
    technologies: ['TypeScript', 'React'],
    is_featured: false,
    is_published: true,
    order: 0,
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
    icon_url: undefined,
    order: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
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
    twitter_url: undefined,
    website_url: undefined,
    avatar_url: undefined,
    resume_url: undefined,
    is_available: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
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
