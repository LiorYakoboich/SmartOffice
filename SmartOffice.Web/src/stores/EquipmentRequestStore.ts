import {
  makeAutoObservable,
} from 'mobx'

import {
  apiRequest,
  EQUIPMENT_REQUEST_API_URL,
} from '../services/api'

import {
  authStore,
} from './AuthStore'

import {
  assetStore,
} from './AssetStore'

export interface EquipmentRequest {
  id?: string

  assetId: string

  assetName: string

  category: string

  location: string

  requestedByUserId: string

  requestedBy: string

  status: string

  isActive: boolean

  requestedAtUtc: string

  reviewedByUserId?: string | null

  reviewedBy?: string | null

  reviewedAtUtc?: string | null

  collectedAtUtc?: string | null

  returnedAtUtc?: string | null

  cancelledAtUtc?: string | null
}

class EquipmentRequestStore {
  myRequests:
    EquipmentRequest[] = []

  activeRequests:
    EquipmentRequest[] = []

  loading = false

  actionLoadingId:
    string | null = null

  error = ''

  constructor() {
    makeAutoObservable(
      this
    )
  }

  get myActiveRequests() {
    return this.myRequests.filter(
      (request) =>
        request.isActive
    )
  }

  get needsAdminAction() {
    return this.activeRequests.filter(
      (request) =>
        request.status ===
          'Pending' ||
        request.status ===
          'Approved'
    )
  }

  get checkedOutRequests() {
    return this.activeRequests.filter(
      (request) =>
        request.status ===
        'Collected'
    )
  }

  getMyActiveRequestForAsset(
    assetId: string
  ) {
    return (
      this.myRequests.find(
        (request) =>
          request.assetId ===
            assetId &&
          request.isActive
      ) ?? null
    )
  }

  getActiveRequestForAsset(
    assetId: string
  ) {
    return (
      this.activeRequests.find(
        (request) =>
          request.assetId ===
            assetId &&
          request.isActive
      ) ?? null
    )
  }

  async loadMyRequests() {
    if (
      !authStore.token ||
      authStore.user?.role !==
        'Member'
    ) {
      this.myRequests = []

      return
    }

    try {
      this.myRequests =
        await apiRequest<
          EquipmentRequest[]
        >(
          `${EQUIPMENT_REQUEST_API_URL}/mine`,
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
          : 'Failed to load equipment requests'
    }
  }

  async loadActiveRequests() {
    if (
      !authStore.token ||
      !authStore.isAdmin
    ) {
      this.activeRequests = []

      return
    }

    try {
      this.activeRequests =
        await apiRequest<
          EquipmentRequest[]
        >(
          `${EQUIPMENT_REQUEST_API_URL}/active`,
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
          : 'Failed to load equipment requests'
    }
  }

  async refresh() {
    this.loading = true

    this.error = ''

    try {
      if (
        authStore.user?.role ===
        'Member'
      ) {
        await this.loadMyRequests()
      }

      if (
        authStore.isAdmin
      ) {
        await this.loadActiveRequests()
      }
    } finally {
      this.loading = false
    }
  }

  async requestEquipment(
    assetId: string
  ) {
    if (!authStore.token) {
      throw new Error(
        'Authentication required'
      )
    }

    this.actionLoadingId =
      assetId

    this.error = ''

    try {
      await apiRequest<EquipmentRequest>(
        `${EQUIPMENT_REQUEST_API_URL}/${assetId}`,
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
          : 'Failed to request equipment'

      throw error
    } finally {
      this.actionLoadingId =
        null
    }
  }

  async cancelRequest(
    requestId: string
  ) {
    await this.performAction(
      requestId,
      'cancel'
    )
  }

  async approveRequest(
    requestId: string
  ) {
    await this.performAction(
      requestId,
      'approve'
    )
  }

  async rejectRequest(
    requestId: string
  ) {
    await this.performAction(
      requestId,
      'reject'
    )
  }

  async collectEquipment(
    requestId: string
  ) {
    await this.performAction(
      requestId,
      'collect'
    )
  }

  async returnEquipment(
    requestId: string
  ) {
    await this.performAction(
      requestId,
      'return'
    )
  }

  private async performAction(
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
      await apiRequest<EquipmentRequest>(
        `${EQUIPMENT_REQUEST_API_URL}/${requestId}/${action}`,
        {
          method: 'POST',

          headers: {
            Authorization:
              `Bearer ${authStore.token}`,
          },
        }
      )

      /*
        Collect / Return can modify
        the actual Asset status.

        Refresh assets after every action
        so the UI is always synchronized.
      */

      await Promise.all([
        this.refresh(),
        assetStore.loadAssets(),
      ])
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'Equipment action failed'

      throw error
    } finally {
      this.actionLoadingId =
        null
    }
  }

  clear() {
    this.myRequests = []

    this.activeRequests = []

    this.actionLoadingId =
      null

    this.error = ''
  }
}

export const equipmentRequestStore =
  new EquipmentRequestStore()