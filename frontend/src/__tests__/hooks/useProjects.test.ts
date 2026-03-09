import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useProjects } from '@/hooks/useProjects'
import { createProject } from '@/test/fixtures'

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

describe('useProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('fetches and returns projects successfully', async () => {
    const mockProjects = [
      createProject({ id: 1, title: 'Project One' }),
      createProject({ id: 2, title: 'Project Two', slug: 'project-two' }),
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(mockProjects),
    })

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    })

    // Initially loading
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockProjects)
    expect(result.current.data).toHaveLength(2)
  })

  it('calls the correct API endpoint', async () => {
    const mockProjects = [createProject()]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(mockProjects),
    })

    renderHook(() => useProjects(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledOnce()
    })

    const [url] = mockFetch.mock.calls[0]
    expect(url).toContain('/api/projects')
  })

  it('returns error state when fetch fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({ detail: 'Internal Server Error' }),
    })

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })

  it('starts with loading state true', () => {
    mockFetch.mockReturnValue(new Promise(() => {})) // Never resolves

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })
})
