import {
  makeAutoObservable,
} from 'mobx'

import {
  apiRequest,
  LOCKER_API_URL,
} from '../services/api'

import {
  authStore,
} from './AuthStore'

export interface Locker {
  id: string

  name: string

  floor: string

  operationalStatus: string

  displayStatus: string

  isRequestable: boolean

  isMyRequest: boolean

  activeRequestId?: string | null

  requestStatus?: string | null

  requestedBy?: string | null
}

export interface LockerRequest {
  id?: string

  lockerId: string

  lockerName: string

  floor: string

  requestedByUserId: string

  requestedBy: string

  status: string

  isActive: boolean

  requestedAtUtc: string

  reviewedByUserId?: string | null

  reviewedBy?: string | null

  reviewedAtUtc?: string | null

  keyCollectedAtUtc?: string | null

  returnedAtUtc?: string | null

  cancelledAtUtc?: string | null
}

class LockerStore {
  lockers: Locker[] = []

  myRequests:
    LockerRequest[] = []

  activeRequests:
    LockerRequest[] = []

  loading = false

  actionLoadingId:
    string | null = null

  error = ''

  constructor() {
    makeAutoObservable(
      this
    )
  }

  get myActiveRequest() {
    return (
      this.myRequests.find(
        (request) =>
          request.isActive
      ) ?? null
    )
  }

  get pendingRequests() {
    return this.activeRequests.filter(
      (request) =>
        request.status ===
        'Pending'
    )
  }

  get approvedRequests() {
    return this.activeRequests.filter(
      (request) =>
        request.status ===
        'Approved'
    )
  }

  get collectedRequests() {
    return this.activeRequests.filter(
      (request) =>
        request.status ===
        'Collected'
    )
  }

  async loadLockers() {
    if (!authStore.token) {
      return
    }

    this.loading = true

    this.error = ''

    try {
      this.lockers =
        await apiRequest<
          Locker[]
        >(
          LOCKER_API_URL,
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
          : 'Failed to load lockers'
    } finally {
      this.loading = false
    }
  }

  async loadMyRequests() {
    if (
      !authStore.token ||
      authStore.user?.role !==
        'Member'
    ) {
      return
    }

    try {
      this.myRequests =
        await apiRequest<
          LockerRequest[]
        >(
          `${LOCKER_API_URL}/my-requests`,
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
          : 'Failed to load locker requests'
    }
  }

  async loadActiveRequests() {
    if (
      !authStore.token ||
      !authStore.canManageLockerRequests
    ) {
      return
    }

    try {
      this.activeRequests =
        await apiRequest<
          LockerRequest[]
        >(
          `${LOCKER_API_URL}/requests/active`,
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
          : 'Failed to load locker requests'
    }
  }

  async refresh() {
    await this.loadLockers()

    if (
      authStore.user?.role ===
      'Member'
    ) {
      await this.loadMyRequests()
    }

    if (
      authStore.canManageLockerRequests
    ) {
      await this.loadActiveRequests()
    }
  }

  async requestLocker(
    lockerId: string
  ) {
    if (!authStore.token) {
      throw new Error(
        'Authentication required'
      )
    }

    this.actionLoadingId =
      lockerId

    this.error = ''

    try {
      await apiRequest<LockerRequest>(
        `${LOCKER_API_URL}/${lockerId}/request`,
        {
          method: 'POST',

          headers: {
            Authorization:
              `Bearer ${authStore.token}`,
          },
        }
      )

      await this.refresh()
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'Failed to request locker'

      throw error
    } finally {
      this.actionLoadingId =
        null
    }
  }

  async cancelRequest(
    requestId: string
  ) {
    await this.performRequestAction(
      requestId,
      'cancel'
    )
  }

  async approveRequest(
    requestId: string
  ) {
    await this.performRequestAction(
      requestId,
      'approve'
    )
  }

  async rejectRequest(
    requestId: string
  ) {
    await this.performRequestAction(
      requestId,
      'reject'
    )
  }

  async collectKey(
    requestId: string
  ) {
    await this.performRequestAction(
      requestId,
      'collect'
    )
  }

  async returnKey(
    requestId: string
  ) {
    await this.performRequestAction(
      requestId,
      'return'
    )
  }

  private async performRequestAction(
    requestId: string,
    action: string
  ) {
    if (!authStore.token) {
      throw new Error(
        'Authentication required'
      )
    }

    this.actionLoadingId =
      requestId

    this.error = ''

    try {
      await apiRequest<LockerRequest>(
        `${LOCKER_API_URL}/requests/${requestId}/${action}`,
        {
          method: 'POST',

          headers: {
            Authorization:
              `Bearer ${authStore.token}`,
          },
        }
      )

      await this.refresh()
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'Locker action failed'

      throw error
    } finally {
      this.actionLoadingId =
        null
    }
  }

  async updateAvailability(
    lockerId: string,
    status: string
  ) {
    if (!authStore.token) {
      throw new Error(
        'Authentication required'
      )
    }

    this.actionLoadingId =
      lockerId

    this.error = ''

    try {
      await apiRequest(
        `${LOCKER_API_URL}/${lockerId}/availability`,
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
              status,
            }),
        }
      )

      await this.refresh()
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'Failed to update locker'

      throw error
    } finally {
      this.actionLoadingId =
        null
    }
  }

  clear() {
    this.lockers = []

    this.myRequests = []

    this.activeRequests = []

    this.error = ''

    this.actionLoadingId =
      null
  }
}

export const lockerStore =
  new LockerStore()