import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useContactMessages } from '@/hooks/useContactMessages'
import { createContactMessage } from '@/test/fixtures'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useContactMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('fetches and returns messages successfully', async () => {
    const mockMessages = [
      createContactMessage({ id: 1, name: 'Alice', subject: 'Hello' }),
      createContactMessage({ id: 2, name: 'Bob', subject: 'World', is_read: true }),
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(mockMessages),
    })

    const { result } = renderHook(() => useContactMessages(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockMessages)
    expect(result.current.data).toHaveLength(2)
  })

  it('calls correct API endpoint (/api/contact)', async () => {
    const mockMessages = [createContactMessage()]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(mockMessages),
    })

    renderHook(() => useContactMessages(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledOnce()
    })

    const [url] = mockFetch.mock.calls[0]
    expect(url).toContain('/api/contact')
  })

  it('returns error state when fetch fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: vi.fn().mockResolvedValue({ detail: 'Forbidden' }),
    })

    const { result } = renderHook(() => useContactMessages(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })

  it('starts with loading state', () => {
    mockFetch.mockReturnValue(new Promise(() => {})) // Never resolves

    const { result } = renderHook(() => useContactMessages(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })
})
