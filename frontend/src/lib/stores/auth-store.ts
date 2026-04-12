import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getApiUrl } from '@/lib/config'

interface AuthState {
  isAuthenticated: boolean
  token: string | null
  user: { id: string, email: string } | null
  isLoading: boolean
  error: string | null
  lastAuthCheck: number | null
  isCheckingAuth: boolean
  hasHydrated: boolean
  authRequired: boolean | null
  setHasHydrated: (state: boolean) => void
  checkAuthRequired: () => Promise<boolean>
  login: (password: string, email?: string) => Promise<boolean>
  register: (email: string, password: string, inviteCode: string) => Promise<boolean>
  logout: () => void
  checkAuth: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      user: null,
      isLoading: false,
      error: null,
      lastAuthCheck: null,
      isCheckingAuth: false,
      hasHydrated: false,
      authRequired: null,

      setHasHydrated: (state: boolean) => {
        set({ hasHydrated: state })
      },

      checkAuthRequired: async () => {
        try {
          const apiUrl = await getApiUrl()
          const response = await fetch(`${apiUrl}/api/auth/status`, {
            cache: 'no-store',
          })

          if (!response.ok) {
            throw new Error(`Auth status check failed: ${response.status}`)
          }

          const data = await response.json()
          const required = data.auth_enabled || false
          set({ authRequired: required })

          // If auth is not required, mark as authenticated
          if (!required) {
            set({ isAuthenticated: true, token: 'not-required' })
          }

          return required
        } catch (error) {
          console.error('Failed to check auth status:', error)

          // If it's a network error, set a more helpful error message
          if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            set({
              error: 'Unable to connect to server. Please check if the API is running.',
              authRequired: null  // Don't assume auth is required if we can't connect
            })
          } else {
            // For other errors, default to requiring auth to be safe
            set({ authRequired: true })
          }

          // Re-throw the error so the UI can handle it
          throw error
        }
      },

      register: async (email: string, password: string, inviteCode: string) => {
        set({ isLoading: true, error: null })
        try {
          const apiUrl = await getApiUrl()
          const response = await fetch(`${apiUrl}/api/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, invite_code: inviteCode })
          })

          if (response.ok) {
             const data = await response.json()
             set({
               isAuthenticated: true,
               token: data.access_token,
               isLoading: false,
               lastAuthCheck: Date.now(),
               error: null
             })
             // Optionally fetch me profile afterwards
             await get().checkAuth()
             return true
          } else {
             const errorData = await response.json().catch(() => null)
             set({
               error: errorData?.detail || 'Registration failed',
               isLoading: false,
               isAuthenticated: false,
               token: null
             })
             return false
          }
        } catch (error) {
          console.error('Network error during register:', error)
          let errorMessage = 'Registration failed'
          if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            errorMessage = 'Unable to connect to server. Please check if the API is running.'
          }
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            token: null
          })
          return false
        }
      },

      login: async (password: string, email?: string) => {
        set({ isLoading: true, error: null })
        try {
          const apiUrl = await getApiUrl()

          // Login request to new endpoints
          let response;
          if (email) {
            // Use new email/password endpoint
            response = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })
          } else {
            // Legacy/fallback behavior, might fail if user table empty but left for compatibility if needed. Wait no, we just migrated, we should just assume email is always present if login form passes it. But wait, `useAuth` hook passes only password! Let's update `useAuth` too!
            // For now, if no email is provided, we simulate failure or fallback. Let's just fail if email is absent.
             throw new Error("Email is required for login")
          }
          
          if (response.ok) {
            const data = await response.json()
            set({ 
              isAuthenticated: true, 
              token: data.access_token,
              isLoading: false,
              lastAuthCheck: Date.now(),
              error: null
            })
            // Fetch user profile immediately
            await get().checkAuth()
            return true
          } else {
            const errorData = await response.json().catch(() => null)
            let errorMessage = errorData?.detail || 'Authentication failed'
            if (response.status === 401) {
              errorMessage = 'Invalid email or password. Please try again.'
            } else if (response.status === 403) {
              errorMessage = 'Access denied. Please check your credentials.'
            } else if (response.status >= 500) {
              errorMessage = 'Server error. Please try again later.'
            }
            
            set({ 
              error: errorMessage,
              isLoading: false,
              isAuthenticated: false,
              token: null,
              user: null
            })
            return false
          }
        } catch (error) {
          console.error('Network error during auth:', error)
          let errorMessage = 'Authentication failed'
          
          if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            errorMessage = 'Unable to connect to server. Please check if the API is running.'
          } else if (error instanceof Error) {
            errorMessage = `Network error: ${error.message}`
          } else {
            errorMessage = 'An unexpected error occurred during authentication'
          }
          
          set({ 
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            token: null,
            user: null
          })
          return false
        }
      },
      
      logout: () => {
        set({ 
          isAuthenticated: false, 
          token: null, 
          error: null,
          user: null
        })
      },
      
      checkAuth: async () => {
        const state = get()
        const { token, lastAuthCheck, isCheckingAuth, isAuthenticated, user } = state

        // If already checking, return current auth state
        if (isCheckingAuth) {
          return isAuthenticated
        }

        // If no token, not authenticated
        if (!token) {
          return false
        }

        // If we checked recently (within 30 seconds) and are authenticated and have user, skip
        const now = Date.now()
        if (isAuthenticated && user && lastAuthCheck && (now - lastAuthCheck) < 30000) {
          return true
        }

        set({ isCheckingAuth: true })

        try {
          const apiUrl = await getApiUrl()

          const response = await fetch(`${apiUrl}/api/auth/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            const userData = await response.json()
            set({ 
              isAuthenticated: true,
              user: userData,
              lastAuthCheck: now,
              isCheckingAuth: false 
            })
            return true
          } else {
            set({
              isAuthenticated: false,
              token: null,
              user: null,
              lastAuthCheck: null,
              isCheckingAuth: false
            })
            return false
          }
        } catch (error) {
          console.error('checkAuth error:', error)
          set({ 
            isAuthenticated: false, 
            token: null,
            user: null,
            lastAuthCheck: null,
            isCheckingAuth: false 
          })
          return false
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      }
    }
  )
)
