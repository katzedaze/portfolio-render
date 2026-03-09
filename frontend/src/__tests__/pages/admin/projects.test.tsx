import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { createProject } from '@/test/fixtures'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string } & Record<string, unknown>) =>
    <a href={href} {...props}>{children}</a>,
}))

vi.mock('lucide-react', () => ({
  Plus: () => null,
  Pencil: () => null,
  Trash2: () => null,
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) =>
    <span data-variant={variant}>{children}</span>,
  badgeVariants: () => '',
}))

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) =>
    <div className={`animate-pulse ${className || ''}`} data-testid="skeleton" />,
}))

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div role="dialog">{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}))

vi.mock('@/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
  TableCell: ({ children }: { children: React.ReactNode }) => <td>{children}</td>,
  TableHead: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
  TableRow: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
}))

vi.mock('@/hooks/useProjects', () => ({
  useProjects: vi.fn(),
  useDeleteProject: vi.fn(),
}))

import { useProjects, useDeleteProject } from '@/hooks/useProjects'
import AdminProjectsPage from '@/app/admin/projects/page'

const mockUseProjects = vi.mocked(useProjects)
const mockUseDeleteProject = vi.mocked(useDeleteProject)

const defaultDeleteMock = {
  mutateAsync: vi.fn(),
  isPending: false,
} as unknown as ReturnType<typeof useDeleteProject>

describe('AdminProjectsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseDeleteProject.mockReturnValue(defaultDeleteMock)
  })

  it('shows loading skeletons when loading', () => {
    mockUseProjects.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useProjects>)

    renderWithProviders(<AdminProjectsPage />)
    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('displays projects table with project data', () => {
    const projects = [
      createProject({ id: 1, title: 'My Portfolio', is_published: true }),
      createProject({ id: 2, title: 'Side Project', slug: 'side-project', is_published: false }),
    ]

    mockUseProjects.mockReturnValue({
      data: projects,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useProjects>)

    renderWithProviders(<AdminProjectsPage />)

    expect(screen.getByText('My Portfolio')).toBeInTheDocument()
    expect(screen.getByText('Side Project')).toBeInTheDocument()
  })

  it('shows "Published" badge for published projects', () => {
    const projects = [createProject({ id: 1, title: 'Pub Project', is_published: true })]

    mockUseProjects.mockReturnValue({
      data: projects,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useProjects>)

    renderWithProviders(<AdminProjectsPage />)
    expect(screen.getByText('Published')).toBeInTheDocument()
  })

  it('shows "Draft" badge for unpublished projects', () => {
    const projects = [createProject({ id: 1, title: 'Draft Project', is_published: false })]

    mockUseProjects.mockReturnValue({
      data: projects,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useProjects>)

    renderWithProviders(<AdminProjectsPage />)
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('shows empty state when no projects', () => {
    mockUseProjects.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useProjects>)

    renderWithProviders(<AdminProjectsPage />)
    expect(screen.getByText(/no projects yet/i)).toBeInTheDocument()
  })

  it('shows error message on error', () => {
    mockUseProjects.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Network error'),
    } as ReturnType<typeof useProjects>)

    renderWithProviders(<AdminProjectsPage />)
    expect(screen.getByText(/failed to load projects/i)).toBeInTheDocument()
  })
})
