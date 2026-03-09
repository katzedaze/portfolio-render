import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { api } from '@/lib/api'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Helper to create a successful JSON response
function createResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(data),
  } as unknown as Response
}

// Helper to create an error response
function createErrorResponse(status: number, body: unknown) {
  return {
    ok: false,
    status,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response
}

describe('api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('api.get', () => {
    it('adds Authorization header when token exists in localStorage', async () => {
      localStorage.setItem('token', 'my-test-token')
      mockFetch.mockResolvedValueOnce(createResponse({ data: 'test' }))

      await api.get('/api/projects')

      expect(mockFetch).toHaveBeenCalledOnce()
      const [, options] = mockFetch.mock.calls[0]
      expect(options.headers['Authorization']).toBe('Bearer my-test-token')
    })

    it('does not add Authorization header when no token in localStorage', async () => {
      mockFetch.mockResolvedValueOnce(createResponse({ data: 'test' }))

      await api.get('/api/projects')

      expect(mockFetch).toHaveBeenCalledOnce()
      const [, options] = mockFetch.mock.calls[0]
      expect(options.headers['Authorization']).toBeUndefined()
    })

    it('includes Content-Type application/json header', async () => {
      mockFetch.mockResolvedValueOnce(createResponse([]))

      await api.get('/api/skills')

      const [, options] = mockFetch.mock.calls[0]
      expect(options.headers['Content-Type']).toBe('application/json')
    })

    it('throws an error on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce(
        createErrorResponse(404, { detail: 'Not found' })
      )

      await expect(api.get('/api/projects/999')).rejects.toThrow('Not found')
    })

    it('throws generic HTTP error message if response body has no detail', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: vi.fn().mockRejectedValue(new SyntaxError('Invalid JSON')),
      } as unknown as Response)

      await expect(api.get('/api/projects')).rejects.toThrow('HTTP error 500')
    })

    it('returns parsed JSON on success', async () => {
      const mockData = [{ id: 1, title: 'Project' }]
      mockFetch.mockResolvedValueOnce(createResponse(mockData))

      const result = await api.get('/api/projects')

      expect(result).toEqual(mockData)
    })
  })

  describe('api.post', () => {
    it('sends POST request with JSON body', async () => {
      const body = { name: 'TypeScript', category: 'Language' }
      mockFetch.mockResolvedValueOnce(createResponse({ id: 1, ...body }, 201))

      await api.post('/api/skills', body)

      const [, options] = mockFetch.mock.calls[0]
      expect(options.method).toBe('POST')
      expect(options.body).toBe(JSON.stringify(body))
    })
  })

  describe('api.put', () => {
    it('sends PUT request with JSON body', async () => {
      const body = { title: 'Updated Project' }
      mockFetch.mockResolvedValueOnce(createResponse({ id: 1, ...body }))

      await api.put('/api/projects/1', body)

      const [, options] = mockFetch.mock.calls[0]
      expect(options.method).toBe('PUT')
      expect(options.body).toBe(JSON.stringify(body))
    })
  })

  describe('api.delete', () => {
    it('sends DELETE request and handles 204 no content', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: vi.fn(),
      } as unknown as Response)

      const result = await api.delete('/api/projects/1')

      const [, options] = mockFetch.mock.calls[0]
      expect(options.method).toBe('DELETE')
      expect(result).toBeUndefined()
    })
  })
})
