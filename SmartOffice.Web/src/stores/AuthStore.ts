import { makeAutoObservable } from 'mobx'
import { apiRequest, AUTH_API_URL } from '../services/api'

export type UserRole = 'Admin' | 'Member'

export interface User {
  id: number
  name: string
  role: UserRole
}

interface LoginResponse {
  token: string
  user: User
}

class AuthStore {
  token: string | null = localStorage.getItem('token')
  user: User | null = this.loadStoredUser()
  loading = false
  error = ''

  constructor() {
    makeAutoObservable(this)
  }

  private loadStoredUser(): User | null {
    const storedUser = localStorage.getItem('user')

    if (!storedUser) {
      return null
    }

    try {
      return JSON.parse(storedUser) as User
    } catch {
      return null
    }
  }

  get isAuthenticated() {
    return Boolean(this.token && this.user)
  }

  get isAdmin() {
    return this.user?.role === 'Admin'
  }

  async login(name: string, password: string) {
    this.loading = true
    this.error = ''

    try {
      const response = await apiRequest<LoginResponse>(
        `${AUTH_API_URL}/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            password,
          }),
        }
      )

      this.token = response.token
      this.user = response.user

      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
    } catch (error) {
      this.error =
        error instanceof Error ? error.message : 'Login failed'

      throw error
    } finally {
      this.loading = false
    }
  }

  async register(
    name: string,
    password: string,
    role: UserRole
  ) {
    this.loading = true
    this.error = ''

    try {
      await apiRequest(`${AUTH_API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          password,
          role,
        }),
      })
    } catch (error) {
      this.error =
        error instanceof Error ? error.message : 'Registration failed'

      throw error
    } finally {
      this.loading = false
    }
  }

  logout() {
    this.token = null
    this.user = null
    this.error = ''

    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}

export const authStore = new AuthStore()