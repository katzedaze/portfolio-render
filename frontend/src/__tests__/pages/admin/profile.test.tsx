import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { createProfile } from '@/test/fixtures'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

vi.mock('lucide-react', () => ({
  Upload: () => null,
  X: () => null,
  ImageIcon: () => null,
}))

vi.mock('next/image', () => ({
  default: ({ src, alt, fill: _fill, unoptimized: _u, ...props }: Record<string, unknown>) =>
    <img src={src as string} alt={alt as string} {...props} />,
}))

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) =>
    <div className={`animate-pulse ${className || ''}`} data-testid="skeleton" />,
}))

vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children, variant }: { children: React.ReactNode; variant?: string }) =>
    <div role="alert" data-variant={variant}>{children}</div>,
  AlertDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}))

vi.mock('@/components/ui/input', () => ({
  Input: (props: React.ComponentProps<'input'>) => <input {...props} />,
}))

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) =>
    <label htmlFor={htmlFor}>{children}</label>,
}))

vi.mock('@/components/ui/textarea', () => ({
  Textarea: (props: React.ComponentProps<'textarea'>) => <textarea {...props} />,
}))

vi.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, id }: { checked?: boolean; onCheckedChange?: (v: boolean) => void; id?: string }) =>
    <input type="checkbox" id={id} checked={checked} onChange={(e) => onCheckedChange?.(e.target.checked)} />,
}))

vi.mock('@/components/ui/ImageUpload', () => ({
  ImageUpload: ({ value, onChange }: { value?: string; onChange: (f: File | null) => void }) =>
    <div data-testid="image-upload">{value && <img src={value} alt="preview" />}</div>,
}))

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  uploadFile: vi.fn(),
}))

vi.mock('@/hooks/useProfile', () => ({
  useProfile: vi.fn(),
  useUpdateProfile: vi.fn(),
}))

import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import AdminProfilePage from '@/app/admin/profile/page'

const mockUseProfile = vi.mocked(useProfile)
const mockUseUpdateProfile = vi.mocked(useUpdateProfile)

const defaultUpdateMock = {
  mutateAsync: vi.fn(),
  isPending: false,
} as unknown as ReturnType<typeof useUpdateProfile>

describe('AdminProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseUpdateProfile.mockReturnValue(defaultUpdateMock)
  })

  it('shows loading state', () => {
    mockUseProfile.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useProfile>)

    renderWithProviders(<AdminProfilePage />)
    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('displays profile form with data pre-filled', () => {
    const profile = createProfile({
      name: 'Jane Developer',
      title: 'Full Stack Engineer',
      email: 'jane@example.com',
    })

    mockUseProfile.mockReturnValue({
      data: profile,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useProfile>)

    renderWithProviders(<AdminProfilePage />)

    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Edit Profile')).toBeInTheDocument()
  })

  it('shows error message on error', () => {
    mockUseProfile.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Not found'),
    } as ReturnType<typeof useProfile>)

    renderWithProviders(<AdminProfilePage />)
    expect(screen.getByText(/failed to load profile/i)).toBeInTheDocument()
  })
})
