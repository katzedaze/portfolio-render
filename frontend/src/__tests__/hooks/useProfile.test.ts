import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { createProfile } from '@/test/fixtures'

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

describe('useProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('fetches and returns profile successfully', async () => {
    const mockProfile = createProfile({ name: 'Jane Doe', title: 'Full Stack Engineer' })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(mockProfile),
    })

    const { result } = renderHook(() => useProfile(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockProfile)
    expect(result.current.data?.name).toBe('Jane Doe')
  })

  it('calls correct API endpoint (/api/profile)', async () => {
    const mockProfile = createProfile()

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(mockProfile),
    })

    renderHook(() => useProfile(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledOnce()
    })

    const [url] = mockFetch.mock.calls[0]
    expect(url).toContain('/api/profile')
  })

  it('returns error state when fetch fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({ detail: 'Internal Server Error' }),
    })

    const { result } = renderHook(() => useProfile(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })

  it('starts with loading state', () => {
    mockFetch.mockReturnValue(new Promise(() => {})) // Never resolves

    const { result } = renderHook(() => useProfile(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })
})
