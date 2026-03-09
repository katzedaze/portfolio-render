import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { createDashboardStats } from '@/test/fixtures'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

vi.mock('lucide-react', () => ({
  FolderOpen: () => null,
  Globe: () => null,
  Code2: () => null,
  MessageSquare: () => null,
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    <div data-testid="card" className={className}>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => <div className={`animate-pulse ${className || ''}`} data-testid="skeleton" />,
}))

vi.mock('@/hooks/useDashboardStats', () => ({
  useDashboardStats: vi.fn(),
}))

import { useDashboardStats } from '@/hooks/useDashboardStats'
import AdminDashboardPage from '@/app/admin/page'

const mockUseDashboardStats = vi.mocked(useDashboardStats)

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows "Dashboard" heading', () => {
    mockUseDashboardStats.mockReturnValue({
      data: createDashboardStats(),
      isLoading: false,
      error: null,
    } as ReturnType<typeof useDashboardStats>)

    renderWithProviders(<AdminDashboardPage />)
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument()
  })

  it('shows loading skeletons when loading', () => {
    mockUseDashboardStats.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useDashboardStats>)

    renderWithProviders(<AdminDashboardPage />)
    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('displays stats cards with correct values', () => {
    const stats = createDashboardStats({
      totalProjects: 10,
      publishedProjects: 7,
      totalSkills: 15,
      unreadMessages: 3,
    })

    mockUseDashboardStats.mockReturnValue({
      data: stats,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useDashboardStats>)

    renderWithProviders(<AdminDashboardPage />)

    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Total Projects')).toBeInTheDocument()
    expect(screen.getByText('Published Projects')).toBeInTheDocument()
    expect(screen.getByText('Total Skills')).toBeInTheDocument()
    expect(screen.getByText('Unread Messages')).toBeInTheDocument()
  })

  it('shows error message on error', () => {
    mockUseDashboardStats.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
    } as ReturnType<typeof useDashboardStats>)

    renderWithProviders(<AdminDashboardPage />)
    expect(screen.getByText(/failed to load dashboard stats/i)).toBeInTheDocument()
  })
})
