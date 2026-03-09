import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { login, logout, getToken, isAuthenticated } from '@/lib/auth'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('auth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('login', () => {
    it('saves token to localStorage on successful login', async () => {
      const mockResponse = { access_token: 'abc123', token_type: 'bearer' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse),
      })

      await login('admin@example.com', 'password123')

      expect(localStorage.getItem('token')).toBe('abc123')
    })

    it('returns the login response with access_token', async () => {
      const mockResponse = { access_token: 'my-token', token_type: 'bearer' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(mockResponse),
      })

      const result = await login('admin@example.com', 'password123')

      expect(result).toEqual(mockResponse)
    })

    it('sends form-encoded credentials', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ access_token: 'tok', token_type: 'bearer' }),
      })

      await login('admin@example.com', 'secret')

      expect(mockFetch).toHaveBeenCalledOnce()
      const [url, options] = mockFetch.mock.calls[0]
      expect(url).toContain('/api/auth/login')
      expect(options.method).toBe('POST')
      expect(options.headers['Content-Type']).toBe('application/x-www-form-urlencoded')
      expect(options.body).toContain('username=admin%40example.com')
    })

    it('throws an error on failed login', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({ detail: 'Invalid email or password' }),
      })

      await expect(login('wrong@example.com', 'badpassword')).rejects.toThrow(
        'Invalid email or password'
      )
    })

    it('does not save token when login fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({ detail: 'Invalid credentials' }),
      })

      try {
        await login('wrong@example.com', 'wrongpass')
      } catch {
        // expected
      }

      expect(localStorage.getItem('token')).toBeNull()
    })
  })

  describe('logout', () => {
    it('removes token from localStorage', () => {
      localStorage.setItem('token', 'existing-token')

      logout()

      expect(localStorage.getItem('token')).toBeNull()
    })

    it('does not throw if no token exists', () => {
      expect(() => logout()).not.toThrow()
    })
  })

  describe('getToken', () => {
    it('returns token from localStorage when it exists', () => {
      localStorage.setItem('token', 'stored-token')

      const token = getToken()

      expect(token).toBe('stored-token')
    })

    it('returns null when no token exists', () => {
      const token = getToken()

      expect(token).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('returns true when token exists in localStorage', () => {
      localStorage.setItem('token', 'some-token')

      expect(isAuthenticated()).toBe(true)
    })

    it('returns false when no token exists', () => {
      expect(isAuthenticated()).toBe(false)
    })

    it('returns false after logout', () => {
      localStorage.setItem('token', 'some-token')
      logout()

      expect(isAuthenticated()).toBe(false)
    })
  })
})
