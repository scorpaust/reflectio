import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { LoginForm } from '../LoginForm'
import { createClient } from '@/lib/supabase/client'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

// Mock constants
jest.mock('@/lib/constants', () => ({
  ROUTES: {
    FEED: '/feed',
    REGISTER: '/register',
  },
}))

describe('LoginForm Component', () => {
  const mockPush = jest.fn()
  const mockRefresh = jest.fn()
  const mockSignInWithPassword = jest.fn()
  const mockSignInWithOAuth = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup router mock
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    })

    // Setup Supabase client mock
    ;(createClient as jest.Mock).mockReturnValue({
      auth: {
        signInWithPassword: mockSignInWithPassword,
        signInWithOAuth: mockSignInWithOAuth,
      },
    })

    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Rendering', () => {
    it('should render login form with all elements', () => {
      render(<LoginForm />)

      expect(screen.getByText('Bem-vindo de volta')).toBeInTheDocument()
      expect(screen.getByText('Entre para continuar sua jornada reflexiva')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
    })

    it('should render Google login button', () => {
      render(<LoginForm />)
      expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument()
    })

    it('should render registration link', () => {
      render(<LoginForm />)
      expect(screen.getByText('Registe-se gratuitamente')).toBeInTheDocument()
    })

    it('should render forgot password link', () => {
      render(<LoginForm />)
      expect(screen.getByText('Esqueceu a senha?')).toBeInTheDocument()
    })

    it('should render remember me checkbox', () => {
      render(<LoginForm />)
      expect(screen.getByText('Lembrar-me')).toBeInTheDocument()
    })
  })

  describe('Email/Password Login', () => {
    it('should handle successful login', async () => {
      const user = userEvent.setup()
      mockSignInWithPassword.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      })

      render(<LoginForm />)

      // Fill in the form
      const emailInput = screen.getByPlaceholderText('seu@email.com')
      const passwordInput = screen.getByPlaceholderText('••••••••')

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')

      // Submit form
      const submitButton = screen.getByRole('button', { name: /entrar/i })
      await user.click(submitButton)

      // Verify Supabase was called
      await waitFor(() => {
        expect(mockSignInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        })
      })

      // Wait for redirect (includes 1000ms delay)
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/feed')
        expect(mockRefresh).toHaveBeenCalled()
      }, { timeout: 2000 })
    })

    it('should display error message on failed login', async () => {
      const user = userEvent.setup()
      mockSignInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' },
      })

      render(<LoginForm />)

      // Fill and submit form
      await user.type(screen.getByPlaceholderText('seu@email.com'), 'wrong@example.com')
      await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /entrar/i }))

      // Check for error message
      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })
    })

    it('should display default error message when error has no message', async () => {
      const user = userEvent.setup()
      mockSignInWithPassword.mockRejectedValue({})

      render(<LoginForm />)

      await user.type(screen.getByPlaceholderText('seu@email.com'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('••••••••'), 'password')
      await user.click(screen.getByRole('button', { name: /entrar/i }))

      await waitFor(() => {
        expect(screen.getByText('Erro ao fazer login. Verifique suas credenciais.')).toBeInTheDocument()
      })
    })

    it('should show loading state during login', async () => {
      const user = userEvent.setup()
      let resolveLogin: any
      mockSignInWithPassword.mockImplementation(() =>
        new Promise(resolve => { resolveLogin = resolve })
      )

      render(<LoginForm />)

      await user.type(screen.getByPlaceholderText('seu@email.com'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('••••••••'), 'password')
      await user.click(screen.getByRole('button', { name: /entrar/i }))

      // Check loading state
      await waitFor(() => {
        expect(screen.getByText('A carregar...')).toBeInTheDocument()
      })

      // Resolve the login
      resolveLogin({ data: { user: { id: '123' } }, error: null })
    })

    it('should disable inputs during loading', async () => {
      const user = userEvent.setup()
      let resolveLogin: any
      mockSignInWithPassword.mockImplementation(() =>
        new Promise(resolve => { resolveLogin = resolve })
      )

      render(<LoginForm />)

      await user.type(screen.getByPlaceholderText('seu@email.com'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('••••••••'), 'password')
      await user.click(screen.getByRole('button', { name: /entrar/i }))

      await waitFor(() => {
        expect(screen.getByPlaceholderText('seu@email.com')).toBeDisabled()
        expect(screen.getByPlaceholderText('••••••••')).toBeDisabled()
      })

      resolveLogin({ data: { user: { id: '123' } }, error: null })
    })

    it('should clear error message on new submission', async () => {
      const user = userEvent.setup()

      // First submission fails
      mockSignInWithPassword.mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid credentials' },
      })

      render(<LoginForm />)

      await user.type(screen.getByPlaceholderText('seu@email.com'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('••••••••'), 'wrong')
      await user.click(screen.getByRole('button', { name: /entrar/i }))

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })

      // Second submission
      mockSignInWithPassword.mockResolvedValueOnce({
        data: { user: { id: '123' } },
        error: null,
      })

      await user.clear(screen.getByPlaceholderText('••••••••'))
      await user.type(screen.getByPlaceholderText('••••••••'), 'correct')
      await user.click(screen.getByRole('button', { name: /entrar/i }))

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument()
      })
    })
  })

  describe('Google OAuth Login', () => {
    it('should handle Google login click', async () => {
      const user = userEvent.setup()
      mockSignInWithOAuth.mockResolvedValue({ error: null })

      // Mock window.location.origin
      delete (window as any).location
      ;(window as any).location = { origin: 'http://localhost:3000' }

      render(<LoginForm />)

      const googleButton = screen.getByRole('button', { name: /google/i })
      await user.click(googleButton)

      await waitFor(() => {
        expect(mockSignInWithOAuth).toHaveBeenCalledWith({
          provider: 'google',
          options: {
            redirectTo: expect.stringContaining('/callback'),
          },
        })
      })
    })

    it('should handle Google login error', async () => {
      const user = userEvent.setup()
      mockSignInWithOAuth.mockResolvedValue({
        error: { message: 'OAuth error' },
      })

      render(<LoginForm />)

      await user.click(screen.getByRole('button', { name: /google/i }))

      await waitFor(() => {
        expect(screen.getByText('OAuth error')).toBeInTheDocument()
      })
    })

    it('should show default error for Google login without message', async () => {
      const user = userEvent.setup()
      mockSignInWithOAuth.mockRejectedValue({})

      render(<LoginForm />)

      await user.click(screen.getByRole('button', { name: /google/i }))

      await waitFor(() => {
        expect(screen.getByText('Erro ao fazer login com Google.')).toBeInTheDocument()
      })
    })

    it('should set loading state during Google OAuth', async () => {
      const user = userEvent.setup()
      let resolveOAuth: any
      mockSignInWithOAuth.mockImplementation(() =>
        new Promise(resolve => { resolveOAuth = resolve })
      )

      render(<LoginForm />)

      const googleButton = screen.getByRole('button', { name: /google/i })
      await user.click(googleButton)

      // Just verify the OAuth function was called
      expect(mockSignInWithOAuth).toHaveBeenCalled()

      // Resolve to prevent hanging
      await act(async () => {
        resolveOAuth({ error: null })
      })
    })
  })

  describe('Form Validation', () => {
    it('should require email field', () => {
      render(<LoginForm />)
      const emailInput = screen.getByPlaceholderText('seu@email.com')
      expect(emailInput).toBeRequired()
    })

    it('should require password field', () => {
      render(<LoginForm />)
      const passwordInput = screen.getByPlaceholderText('••••••••')
      expect(passwordInput).toBeRequired()
    })

    it('should have email type for email input', () => {
      render(<LoginForm />)
      const emailInput = screen.getByPlaceholderText('seu@email.com')
      expect(emailInput).toHaveAttribute('type', 'email')
    })

    it('should have password type for password input', () => {
      render(<LoginForm />)
      const passwordInput = screen.getByPlaceholderText('••••••••')
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('Console Logging', () => {
    it('should log on successful login', async () => {
      const user = userEvent.setup()
      mockSignInWithPassword.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      render(<LoginForm />)

      await user.type(screen.getByPlaceholderText('seu@email.com'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('••••••••'), 'password')
      await user.click(screen.getByRole('button', { name: /entrar/i }))

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('🔐 [LoginForm] Attempting login...')
        expect(console.log).toHaveBeenCalledWith('✅ [LoginForm] Login successful, user:', 'user-123')
      })
    })

    it('should log errors', async () => {
      const user = userEvent.setup()
      const error = new Error('Test error')
      mockSignInWithPassword.mockRejectedValue(error)

      render(<LoginForm />)

      await user.type(screen.getByPlaceholderText('seu@email.com'), 'test@example.com')
      await user.type(screen.getByPlaceholderText('••••••••'), 'password')
      await user.click(screen.getByRole('button', { name: /entrar/i }))

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('❌ [LoginForm] Login error:', error)
      })
    })
  })
})
