import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders, userEvent } from '@/test/utils'
import { ContactForm } from '@/components/contact/ContactForm'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('ContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all form fields', () => {
    renderWithProviders(<ContactForm />)

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
  })

  it('renders the submit button', () => {
    renderWithProviders(<ContactForm />)

    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
  })

  it('shows validation errors when submitting empty form', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ContactForm />)

    await user.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/subject is required/i)).toBeInTheDocument()
  })

  it('shows email validation error for invalid email', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ContactForm />)

    // Fill all required fields but with an invalid email
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'not-an-email')
    await user.type(screen.getByLabelText(/subject/i), 'Hello')
    await user.type(screen.getByLabelText(/message/i), 'This is a test message that is long enough.')

    // Submit the form programmatically to bypass browser native email validation
    const form = emailInput.closest('form')!
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
    })
  })

  it('shows validation error when message is too short', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ContactForm />)

    await user.type(screen.getByLabelText(/name/i), 'John')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/subject/i), 'Hello')
    await user.type(screen.getByLabelText(/message/i), 'Short')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() => {
      expect(screen.getByText(/message must be at least 10 characters/i)).toBeInTheDocument()
    })
  })

  it('submits the form successfully and shows success message', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: vi.fn().mockResolvedValue({ id: 1 }),
    })

    renderWithProviders(<ContactForm />)

    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/subject/i), 'Hello there')
    await user.type(screen.getByLabelText(/message/i), 'This is a sufficiently long test message.')

    await user.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/thank you! your message has been sent successfully/i)
      ).toBeInTheDocument()
    })
  })

  it('shows error message when submission fails', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({ detail: 'Server error' }),
    })

    renderWithProviders(<ContactForm />)

    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/subject/i), 'Hello there')
    await user.type(screen.getByLabelText(/message/i), 'This is a sufficiently long test message.')

    await user.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument()
    })
  })
})
