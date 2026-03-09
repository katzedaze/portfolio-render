import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { createContactMessage } from '@/test/fixtures'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

vi.mock('lucide-react', () => ({
  CheckCheck: () => null,
  Trash2: () => null,
  Eye: () => null,
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

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
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
  TableRow: ({ children, className }: { children: React.ReactNode; className?: string }) =>
    <tr className={className}>{children}</tr>,
}))

vi.mock('@/hooks/useContactMessages', () => ({
  useContactMessages: vi.fn(),
  useMarkMessageRead: vi.fn(),
  useDeleteMessage: vi.fn(),
}))

import {
  useContactMessages,
  useMarkMessageRead,
  useDeleteMessage,
} from '@/hooks/useContactMessages'
import AdminContactMessagesPage from '@/app/admin/contact-messages/page'

const mockUseContactMessages = vi.mocked(useContactMessages)
const mockUseMarkMessageRead = vi.mocked(useMarkMessageRead)
const mockUseDeleteMessage = vi.mocked(useDeleteMessage)

const defaultMutationMock = {
  mutateAsync: vi.fn(),
  isPending: false,
} as unknown as ReturnType<typeof useMarkMessageRead>

describe('AdminContactMessagesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseMarkMessageRead.mockReturnValue(defaultMutationMock)
    mockUseDeleteMessage.mockReturnValue(defaultMutationMock as ReturnType<typeof useDeleteMessage>)
  })

  it('shows loading state', () => {
    mockUseContactMessages.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as ReturnType<typeof useContactMessages>)

    renderWithProviders(<AdminContactMessagesPage />)
    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('displays messages table', () => {
    const messages = [
      createContactMessage({ id: 1, name: 'Alice Smith', subject: 'Inquiry', is_read: false }),
      createContactMessage({ id: 2, name: 'Bob Jones', subject: 'Job Offer', is_read: true }),
    ]

    mockUseContactMessages.mockReturnValue({
      data: messages,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useContactMessages>)

    renderWithProviders(<AdminContactMessagesPage />)

    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
    expect(screen.getByText('Inquiry')).toBeInTheDocument()
    expect(screen.getByText('Job Offer')).toBeInTheDocument()
  })

  it('shows unread count badge', () => {
    const messages = [
      createContactMessage({ id: 1, is_read: false }),
      createContactMessage({ id: 2, is_read: false }),
      createContactMessage({ id: 3, is_read: true }),
    ]

    mockUseContactMessages.mockReturnValue({
      data: messages,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useContactMessages>)

    renderWithProviders(<AdminContactMessagesPage />)
    expect(screen.getByText('2 unread')).toBeInTheDocument()
  })

  it('shows "Read" and "Unread" badges', () => {
    const messages = [
      createContactMessage({ id: 1, is_read: false }),
      createContactMessage({ id: 2, is_read: true }),
    ]

    mockUseContactMessages.mockReturnValue({
      data: messages,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useContactMessages>)

    renderWithProviders(<AdminContactMessagesPage />)
    expect(screen.getByText('Unread')).toBeInTheDocument()
    expect(screen.getByText('Read')).toBeInTheDocument()
  })

  it('shows empty state', () => {
    mockUseContactMessages.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useContactMessages>)

    renderWithProviders(<AdminContactMessagesPage />)
    expect(screen.getByText(/no messages yet/i)).toBeInTheDocument()
  })

  it('shows error message', () => {
    mockUseContactMessages.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Unauthorized'),
    } as ReturnType<typeof useContactMessages>)

    renderWithProviders(<AdminContactMessagesPage />)
    expect(screen.getByText(/failed to load messages/i)).toBeInTheDocument()
  })
})
