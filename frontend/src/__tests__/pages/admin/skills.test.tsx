import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { createSkill } from '@/test/fixtures'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

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
}))

vi.mock('@/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
  TableCell: ({ children }: { children: React.ReactNode }) => <td>{children}</td>,
  TableHead: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
  TableRow: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/ui/input', () => ({
  Input: (props: React.ComponentProps<'input'>) => <input {...props} />,
}))

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) =>
    <label htmlFor={htmlFor}>{children}</label>,
}))

vi.mock('@/hooks/useSkills', () => ({
  useSkills: vi.fn(),
  useCreateSkill: vi.fn(),
  useUpdateSkill: vi.fn(),
  useDeleteSkill: vi.fn(),
}))

import { useSkills, useCreateSkill, useUpdateSkill, useDeleteSkill } from '@/hooks/useSkills'
import AdminSkillsPage from '@/app/admin/skills/page'

const mockUseSkills = vi.mocked(useSkills)
const mockUseCreateSkill = vi.mocked(useCreateSkill)
const mockUseUpdateSkill = vi.mocked(useUpdateSkill)
const mockUseDeleteSkill = vi.mocked(useDeleteSkill)

const defaultMutationMock = {
  mutateAsync: vi.fn(),
  isPending: false,
}

describe('AdminSkillsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseCreateSkill.mockReturnValue(defaultMutationMock as ReturnType<typeof useCreateSkill>)
    mockUseUpdateSkill.mockReturnValue(defaultMutationMock as ReturnType<typeof useUpdateSkill>)
    mockUseDeleteSkill.mockReturnValue(defaultMutationMock as ReturnType<typeof useDeleteSkill>)
  })

  it('shows loading state', () => {
    mockUseSkills.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useSkills>)

    renderWithProviders(<AdminSkillsPage />)
    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('groups skills by category', () => {
    const skills = [
      createSkill({ id: 1, name: 'TypeScript', category: 'Languages' }),
      createSkill({ id: 2, name: 'Python', category: 'Languages' }),
      createSkill({ id: 3, name: 'React', category: 'Frameworks' }),
    ]

    mockUseSkills.mockReturnValue({
      data: skills,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useSkills>)

    renderWithProviders(<AdminSkillsPage />)

    expect(screen.getByText('Languages')).toBeInTheDocument()
    expect(screen.getByText('Frameworks')).toBeInTheDocument()
  })

  it('shows skill name and proficiency', () => {
    const skills = [
      createSkill({ id: 1, name: 'TypeScript', category: 'Languages', proficiency: 90 }),
    ]

    mockUseSkills.mockReturnValue({
      data: skills,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useSkills>)

    renderWithProviders(<AdminSkillsPage />)

    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('90%')).toBeInTheDocument()
  })

  it('shows empty state', () => {
    mockUseSkills.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useSkills>)

    renderWithProviders(<AdminSkillsPage />)
    expect(screen.getByText(/no skills yet/i)).toBeInTheDocument()
  })

  it('shows error message', () => {
    mockUseSkills.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load'),
    } as ReturnType<typeof useSkills>)

    renderWithProviders(<AdminSkillsPage />)
    expect(screen.getByText(/failed to load skills/i)).toBeInTheDocument()
  })
})
