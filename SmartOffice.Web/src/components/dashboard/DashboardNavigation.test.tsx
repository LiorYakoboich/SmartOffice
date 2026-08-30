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

import DashboardNavigation from './DashboardNavigation'

afterEach(() => {
  cleanup()

  authStore.user =
    null

  authStore.token =
    null

  localStorage.clear()
})

describe(
  'DashboardNavigation',
  () => {
    // =========================================
    // ADMIN
    // =========================================

    it(
      'shows Users navigation for Admin',
      () => {
        authStore.user =
          {
            id:
              1,

            name:
              'Admin User',

            username:
              'admin',

            firstName:
              'Admin',

            lastName:
              'User',

            role:
              'Admin',
          }

        authStore.token =
          'test-token'

        render(
          <DashboardNavigation
            activeSection="overview"

            onSectionChange={() => {
              // No action needed.
            }}

            roomCount={
              8
            }

            resourceCount={
              12
            }

            availableLockerCount={
              16
            }
          />
        )

        expect(
          screen.getByRole(
            'button',
            {
              name:
                /users/i,
            }
          )
        ).toBeInTheDocument()
      }
    )

    // =========================================
    // MEMBER
    // =========================================

    it(
      'does not show Users navigation for Member',
      () => {
        authStore.user =
          {
            id:
              2,

            name:
              'Member User',

            username:
              'member',

            firstName:
              'Member',

            lastName:
              'User',

            role:
              'Member',
          }

        authStore.token =
          'test-token'

        render(
          <DashboardNavigation
            activeSection="overview"

            onSectionChange={() => {
              // No action needed.
            }}

            roomCount={
              8
            }

            resourceCount={
              12
            }

            availableLockerCount={
              16
            }
          />
        )

        expect(
          screen.queryByRole(
            'button',
            {
              name:
                /users/i,
            }
          )
        ).not.toBeInTheDocument()
      }
    )

    // =========================================
    // NAVIGATION
    // =========================================

    it(
      'calls onSectionChange when Resources is clicked',
      () => {
        authStore.user =
          {
            id:
              2,

            name:
              'Member User',

            username:
              'member',

            firstName:
              'Member',

            lastName:
              'User',

            role:
              'Member',
          }

        authStore.token =
          'test-token'

        let selectedSection =
          ''

        render(
          <DashboardNavigation
            activeSection="overview"

            onSectionChange={(
              section
            ) => {
              selectedSection =
                section
            }}

            roomCount={
              8
            }

            resourceCount={
              12
            }

            availableLockerCount={
              16
            }
          />
        )

        fireEvent.click(
          screen.getByRole(
            'button',
            {
              name:
                /resources/i,
            }
          )
        )

        expect(
          selectedSection
        ).toBe(
          'resources'
        )
      }
    )

    // =========================================
    // COUNTERS
    // =========================================

    it(
      'shows current resource counts',
      () => {
        authStore.user =
          {
            id:
              2,

            name:
              'Member User',

            username:
              'member',

            firstName:
              'Member',

            lastName:
              'User',

            role:
              'Member',
          }

        authStore.token =
          'test-token'

        render(
          <DashboardNavigation
            activeSection="overview"

            onSectionChange={() => {
              // No action needed.
            }}

            roomCount={
              8
            }

            resourceCount={
              12
            }

            availableLockerCount={
              16
            }
          />
        )

        expect(
          screen.getByText(
            '8'
          )
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            '12'
          )
        ).toBeInTheDocument()

        expect(
          screen.getByText(
            '16'
          )
        ).toBeInTheDocument()
      }
    )
  }
)