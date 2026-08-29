import {
  makeAutoObservable,
} from 'mobx'

import {
  apiRequest,
  AUTH_API_URL,
  UNAUTHORIZED_EVENT,
} from '../services/api'

export interface AuthUser {
  id: number

  name: string

  username?: string

  firstName?: string

  lastName?: string

  role: string
}

interface LoginResponse {
  token: string

  user: AuthUser
}

interface RegisterResponse {
  id: number

  username: string

  firstName: string

  lastName: string

  name: string

  role: string
}

class AuthStore {
  token: string | null =
    null

  user: AuthUser | null =
    null

  loading = false

  error = ''

  constructor() {
    makeAutoObservable(
      this
    )

    this.restoreSession()

    window.addEventListener(
      UNAUTHORIZED_EVENT,
      this.handleUnauthorized
    )
  }

  get isAuthenticated() {
    return Boolean(
      this.token &&
      this.user
    )
  }

  get isAdmin() {
    return (
      this.user?.role ===
      'Admin'
    )
  }

  get isHR() {
    return (
      this.user?.role ===
      'HR'
    )
  }

  /*
    Both HR and Admin can process
    locker approval workflows.
  */

  get canManageLockerRequests() {
    return (
      this.isAdmin ||
      this.isHR
    )
  }

  private restoreSession() {
    const storedToken =
      localStorage.getItem(
        'smartoffice_token'
      )

    const storedUser =
      localStorage.getItem(
        'smartoffice_user'
      )

    if (
      !storedToken ||
      !storedUser
    ) {
      return
    }

    try {
      this.token =
        storedToken

      this.user =
        JSON.parse(
          storedUser
        ) as AuthUser
    } catch {
      this.clearSession()
    }
  }

  private saveSession() {
    if (
      !this.token ||
      !this.user
    ) {
      return
    }

    localStorage.setItem(
      'smartoffice_token',
      this.token
    )

    localStorage.setItem(
      'smartoffice_user',
      JSON.stringify(
        this.user
      )
    )
  }

  private clearSession() {
    this.token = null

    this.user = null

    localStorage.removeItem(
      'smartoffice_token'
    )

    localStorage.removeItem(
      'smartoffice_user'
    )
  }

  private handleUnauthorized =
    () => {
      if (
        !this.token &&
        !this.user
      ) {
        return
      }

      this.clearSession()

      this.loading = false

      this.error =
        'Your session expired. Please sign in again.'
    }

  async login(
    username: string,
    password: string
  ) {
    this.loading = true

    this.error = ''

    try {
      const response =
        await apiRequest<LoginResponse>(
          `${AUTH_API_URL}/login`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                name: username,
                password,
              }),
          }
        )

      this.token =
        response.token

      this.user =
        response.user

      this.saveSession()

      return response
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'Login failed'

      throw error
    } finally {
      this.loading = false
    }
  }

  async register(
    firstName: string,
    lastName: string,
    username: string,
    password: string
  ) {
    this.loading = true

    this.error = ''

    try {
      const response =
        await apiRequest<RegisterResponse>(
          `${AUTH_API_URL}/register`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                firstName,
                lastName,
                name: username,
                password,
              }),
          }
        )

      return response
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'Registration failed'

      throw error
    } finally {
      this.loading = false
    }
  }

  logout() {
    this.error = ''

    this.loading = false

    this.clearSession()
  }
}

export const authStore =
  new AuthStore()