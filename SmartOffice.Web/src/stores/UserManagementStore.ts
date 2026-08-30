import {
  makeAutoObservable,
} from 'mobx'

import {
  apiRequest,
  USERS_API_URL,
} from '../services/api'

import {
  authStore,
} from './AuthStore'

export type UserRole =
  | 'Member'
  | 'Admin'

export interface ManagedUser {
  id: number

  username: string

  firstName: string

  lastName: string

  displayName: string

  role: UserRole
}

class UserManagementStore {
  users: ManagedUser[] = []

  loading = false

  updatingUserId:
    number | null = null

  error = ''

  constructor() {
    makeAutoObservable(
      this
    )
  }

  get adminCount() {
    return this.users.filter(
      (user) =>
        user.role ===
        'Admin'
    ).length
  }

  get memberCount() {
    return this.users.filter(
      (user) =>
        user.role ===
        'Member'
    ).length
  }

  async loadUsers() {
    if (
      !authStore.token ||
      !authStore.isAdmin
    ) {
      this.users = []

      return
    }

    this.loading = true

    this.error = ''

    try {
      this.users =
        await apiRequest<
          ManagedUser[]
        >(
          USERS_API_URL,
          {
            headers: {
              Authorization:
                `Bearer ${authStore.token}`,
            },
          }
        )
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'Failed to load users'
    } finally {
      this.loading = false
    }
  }

  async updateRole(
    userId: number,
    role: UserRole
  ) {
    if (
      !authStore.token ||
      !authStore.isAdmin
    ) {
      throw new Error(
        'Admin permissions are required.'
      )
    }

    this.updatingUserId =
      userId

    this.error = ''

    try {
      const updatedUser =
        await apiRequest<ManagedUser>(
          `${USERS_API_URL}/${userId}/role`,
          {
            method: 'PUT',

            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                `Bearer ${authStore.token}`,
            },

            body:
              JSON.stringify({
                role,
              }),
          }
        )

      this.users =
        this.users.map(
          (user) =>
            user.id ===
            updatedUser.id
              ? updatedUser
              : user
        )

      return updatedUser
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'Failed to update user role'

      throw error
    } finally {
      this.updatingUserId =
        null
    }
  }

  clear() {
    this.users = []

    this.loading = false

    this.updatingUserId =
      null

    this.error = ''
  }
}

export const userManagementStore =
  new UserManagementStore()