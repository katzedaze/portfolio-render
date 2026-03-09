import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useSkills } from '@/hooks/useSkills'
import { createSkill } from '@/test/fixtures'

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

describe('useSkills', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('fetches and returns skills successfully', async () => {
    const mockSkills = [
      createSkill({ id: 1, name: 'TypeScript', category: 'Language' }),
      createSkill({ id: 2, name: 'React', category: 'Framework' }),
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(mockSkills),
    })

    const { result } = renderHook(() => useSkills(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockSkills)
    expect(result.current.data).toHaveLength(2)
  })

  it('calls the correct API endpoint for skills', async () => {
    const mockSkills = [createSkill()]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(mockSkills),
    })

    renderHook(() => useSkills(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledOnce()
    })

    const [url] = mockFetch.mock.calls[0]
    expect(url).toContain('/api/skills')
  })

  it('returns empty array when no skills exist', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue([]),
    })

    const { result } = renderHook(() => useSkills(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual([])
  })

  it('returns error state when fetch fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({ detail: 'Server error' }),
    })

    const { result } = renderHook(() => useSkills(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })
})
