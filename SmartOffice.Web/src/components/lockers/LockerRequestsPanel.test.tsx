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
  lockerStore,
} from '../../stores/LockerStore'

import type {
  LockerRequest,
} from '../../stores/LockerStore'

import LockerRequestsPanel from './LockerRequestsPanel'

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
    Partial<LockerRequest> = {}
): LockerRequest {
  return {
    id:
      'request-1',

    lockerId:
      'locker-1',

    lockerName:
      'L15-001',

    floor:
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
  } as LockerRequest
}

afterEach(() => {
  cleanup()

  authStore.user =
    null

  authStore.token =
    null

  lockerStore.activeRequests =
    []

  localStorage.clear()
})

describe(
  'LockerRequestsPanel',
  () => {
    // =========================================
    // MEMBER
    // =========================================

    it(
      'does not render Admin locker management for Member',
      () => {
        authenticateAs(
          'Member'
        )

        /*
            Even if Admin request data somehow
            exists in the frontend store,
            a Member must not see the panel.
        */

        lockerStore.activeRequests =
          [
            createRequest(),
          ]

        render(
          <LockerRequestsPanel />
        )

        expect(
          screen.queryByText(
            'Locker Management'
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

        lockerStore.activeRequests =
          [
            createRequest({
              status:
                'Pending',
            }),
          ]

        render(
          <LockerRequestsPanel />
        )

        expect(
          screen.getByText(
            'Locker Management'
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
      'shows Key Collected action for approved request',
      () => {
        authenticateAs(
          'Admin'
        )

        lockerStore.activeRequests =
          [
            createRequest({
              status:
                'Approved',
            }),
          ]

        render(
          <LockerRequestsPanel />
        )

        expect(
          screen.getByRole(
            'button',
            {
              name:
                /key collected/i,
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
      'shows Key Returned action in Assigned view',
      () => {
        authenticateAs(
          'Admin'
        )

        lockerStore.activeRequests =
          [
            createRequest({
              status:
                'Collected',
            }),
          ]

        render(
          <LockerRequestsPanel />
        )

        fireEvent.click(
          screen.getByRole(
            'button',
            {
              name:
                /assigned/i,
            }
          )
        )

        expect(
          screen.getByRole(
            'button',
            {
              name:
                /key returned/i,
            }
          )
        ).toBeInTheDocument()
      }
    )
  }
)