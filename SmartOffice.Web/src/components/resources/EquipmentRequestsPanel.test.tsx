// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'

import {
  afterEach,
  describe,
  expect,
  it,
} from 'vitest'

import {
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react'

import {
  authStore,
} from '../../stores/AuthStore'

import {
  equipmentRequestStore,
} from '../../stores/EquipmentRequestStore'

import type {
  EquipmentRequest,
} from '../../stores/EquipmentRequestStore'

import EquipmentRequestsPanel from './EquipmentRequestsPanel'

function authenticateAs(
  role:
    | 'Admin'
    | 'Member'
) {
  authStore.token =
    'test-token'

  authStore.user =
    {
      id:
        role ===
        'Admin'
          ? 1
          : 2,

      name:
        `${role} User`,

      username:
        role.toLowerCase(),

      firstName:
        role,

      lastName:
        'User',

      role,
    }
}

function createRequest(
  overrides:
    Partial<EquipmentRequest> = {}
): EquipmentRequest {
  return {
    id:
      'equipment-request-1',

    assetId:
      'equipment-1',

    assetName:
      'Jabra Evolve2 65',

    category:
      'Headset',

    location:
      'Floor 15',

    requestedByUserId:
      'member-1',

    requestedBy:
      'Member User',

    status:
      'Pending',

    isActive:
      true,

    requestedAtUtc:
      new Date()
        .toISOString(),

    ...overrides,
  } as EquipmentRequest
}

afterEach(() => {
  cleanup()

  authStore.user =
    null

  authStore.token =
    null

  equipmentRequestStore
    .activeRequests =
    []

  equipmentRequestStore
    .error =
    ''

  equipmentRequestStore
    .actionLoadingId =
    null

  localStorage.clear()
})

describe(
  'EquipmentRequestsPanel',
  () => {
    // =========================================
    // MEMBER
    // =========================================

    it(
      'does not render Admin equipment management for Member',
      () => {
        authenticateAs(
          'Member'
        )

        equipmentRequestStore
          .activeRequests =
          [
            createRequest(),
          ]

        render(
          <EquipmentRequestsPanel />
        )

        expect(
          screen.queryByText(
            'Equipment Requests'
          )
        ).not.toBeInTheDocument()

        expect(
          screen.queryByRole(
            'button',
            {
              name:
                /approve/i,
            }
          )
        ).not.toBeInTheDocument()

        expect(
          screen.queryByRole(
            'button',
            {
              name:
                /reject/i,
            }
          )
        ).not.toBeInTheDocument()
      }
    )

    // =========================================
    // ADMIN - PENDING
    // =========================================

    it(
      'shows Approve and Reject for Admin when request is pending',
      () => {
        authenticateAs(
          'Admin'
        )

        equipmentRequestStore
          .activeRequests =
          [
            createRequest({
              status:
                'Pending',
            }),
          ]

        render(
          <EquipmentRequestsPanel />
        )

        expect(
          screen.getByText(
            'Equipment Requests'
          )
        ).toBeInTheDocument()

        expect(
          screen.getByRole(
            'button',
            {
              name:
                /approve/i,
            }
          )
        ).toBeInTheDocument()

        expect(
          screen.getByRole(
            'button',
            {
              name:
                /reject/i,
            }
          )
        ).toBeInTheDocument()
      }
    )

    // =========================================
    // ADMIN - APPROVED
    // =========================================

    it(
      'shows Mark Collected for approved equipment request',
      () => {
        authenticateAs(
          'Admin'
        )

        equipmentRequestStore
          .activeRequests =
          [
            createRequest({
              status:
                'Approved',
            }),
          ]

        render(
          <EquipmentRequestsPanel />
        )

        expect(
          screen.getByRole(
            'button',
            {
              name:
                /mark collected/i,
            }
          )
        ).toBeInTheDocument()

        expect(
          screen.queryByRole(
            'button',
            {
              name:
                /approve/i,
            }
          )
        ).not.toBeInTheDocument()
      }
    )

    // =========================================
    // ADMIN - COLLECTED
    // =========================================

    it(
      'shows Mark Returned in Checked Out view',
      () => {
        authenticateAs(
          'Admin'
        )

        equipmentRequestStore
          .activeRequests =
          [
            createRequest({
              status:
                'Collected',
            }),
          ]

        render(
          <EquipmentRequestsPanel />
        )

        fireEvent.click(
          screen.getByRole(
            'button',
            {
              name:
                /checked out/i,
            }
          )
        )

        expect(
          screen.getByRole(
            'button',
            {
              name:
                /mark returned/i,
            }
          )
        ).toBeInTheDocument()
      }
    )

    // =========================================
    // EMPTY
    // =========================================

    it(
      'does not render panel when Admin has no active equipment requests',
      () => {
        authenticateAs(
          'Admin'
        )

        equipmentRequestStore
          .activeRequests =
          []

        render(
          <EquipmentRequestsPanel />
        )

        expect(
          screen.queryByText(
            'Equipment Requests'
          )
        ).not.toBeInTheDocument()
      }
    )
  }
)