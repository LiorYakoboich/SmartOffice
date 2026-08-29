import { makeAutoObservable } from 'mobx'

import {
  apiRequest,
  RESERVATION_API_URL,
} from '../services/api'

import { authStore } from './AuthStore'

export interface Reservation {
  id?: string

  assetId: string

  roomName: string

  floor: string

  startTimeUtc: string

  endTimeUtc: string

  bookedByUserId: string

  bookedBy: string

  createdAtUtc?: string
}

export interface CreateReservationRequest {
  assetId: string

  startTimeUtc: string

  endTimeUtc: string
}

class ReservationStore {
  reservations: Reservation[] = []

  myReservations: Reservation[] = []

  loading = false

  error = ''

  constructor() {
    makeAutoObservable(this)
  }

  async loadReservations() {
    if (!authStore.token) {
      return
    }

    this.loading = true
    this.error = ''

    try {
      this.reservations =
        await apiRequest<Reservation[]>(
          RESERVATION_API_URL,
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          }
        )
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'Failed to load reservations'
    } finally {
      this.loading = false
    }
  }

  async loadMyReservations() {
    if (!authStore.token) {
      return
    }

    this.loading = true
    this.error = ''

    try {
      this.myReservations =
        await apiRequest<Reservation[]>(
          `${RESERVATION_API_URL}/mine`,
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          }
        )
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'Failed to load your reservations'
    } finally {
      this.loading = false
    }
  }

  async loadRoomReservations(
    assetId: string
  ): Promise<Reservation[]> {
    if (!authStore.token) {
      throw new Error(
        'Authentication required'
      )
    }

    try {
      return await apiRequest<Reservation[]>(
        `${RESERVATION_API_URL}/room/${assetId}`,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        }
      )
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'Failed to load room reservations'

      throw error
    }
  }

  async createReservation(
    request: CreateReservationRequest
  ) {
    if (!authStore.token) {
      throw new Error(
        'Authentication required'
      )
    }

    this.loading = true
    this.error = ''

    try {
      const reservation =
        await apiRequest<Reservation>(
          RESERVATION_API_URL,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              Authorization: `Bearer ${authStore.token}`,
            },

            body: JSON.stringify(request),
          }
        )

      await Promise.all([
        this.loadReservations(),
        this.loadMyReservations(),
      ])

      return reservation
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'Failed to book meeting room'

      throw error
    } finally {
      this.loading = false
    }
  }

  async cancelReservation(id: string) {
    if (!authStore.token) {
      throw new Error(
        'Authentication required'
      )
    }

    this.loading = true
    this.error = ''

    try {
      await apiRequest<void>(
        `${RESERVATION_API_URL}/${id}`,
        {
          method: 'DELETE',

          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        }
      )

      this.reservations =
        this.reservations.filter(
          (reservation) =>
            reservation.id !== id
        )

      this.myReservations =
        this.myReservations.filter(
          (reservation) =>
            reservation.id !== id
        )
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'Failed to cancel reservation'

      throw error
    } finally {
      this.loading = false
    }
  }

  clear() {
    this.reservations = []
    this.myReservations = []
    this.error = ''
  }
}

export const reservationStore =
  new ReservationStore()