import {
  useEffect,
  useState,
} from 'react'

import {
  observer,
} from 'mobx-react-lite'

import {
  Alert,
  Box,
  Container,
  Paper,
  Typography,
} from '@mui/material'

import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined'
import DeskOutlinedIcon from '@mui/icons-material/DeskOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'

import {
  authStore,
} from '../stores/AuthStore'

import {
  assetStore,
} from '../stores/AssetStore'

import type {
  Asset,
} from '../stores/AssetStore'

import {
  reservationStore,
} from '../stores/ReservationStore'

import {
  lockerStore,
} from '../stores/LockerStore'

import DashboardHeader from '../components/dashboard/DashboardHeader'
import DashboardHero from '../components/dashboard/DashboardHero'
import DashboardNavigation from '../components/dashboard/DashboardNavigation'
import AdminOverviewPanel from '../components/dashboard/AdminOverviewPanel'

import type {
  DashboardSection,
} from '../components/dashboard/DashboardNavigation'

import SummaryCard from '../components/dashboard/SummaryCard'
import MeetingRoomsGrid from '../components/dashboard/MeetingRoomsGrid'

import AddAssetDialog from '../components/assets/AddAssetDialog'
import EditRoomDialog from '../components/assets/EditRoomDialog'

import ResourcesSection from '../components/resources/ResourcesSection'
import EditResourceDialog from '../components/resources/EditResourceDialog'

import BookRoomDialog from '../components/reservations/BookRoomDialog'
import MyReservationsPanel from '../components/reservations/MyReservationsPanel'
import RoomReservationsDialog from '../components/reservations/RoomReservationsDialog'

import LockerCenter from '../components/lockers/LockerCenter'
import LockerRequestsPanel from '../components/lockers/LockerRequestsPanel'

import UsersSection from '../components/users/UsersSection'

const DashboardPage =
  observer(
    () => {
      // =========================================
      // NAVIGATION
      // =========================================

      const [
        activeSection,
        setActiveSection,
      ] =
        useState<DashboardSection>(
          'overview'
        )

      // =========================================
      // ADD RESOURCE
      // =========================================

      const [
        addDialogOpen,
        setAddDialogOpen,
      ] = useState(false)

      // =========================================
      // BOOK ROOM
      // =========================================

      const [
        bookDialogOpen,
        setBookDialogOpen,
      ] = useState(false)

      const [
        selectedRoom,
        setSelectedRoom,
      ] = useState<
        Asset | null
      >(null)

      // =========================================
      // EDIT ROOM
      // =========================================

      const [
        editRoomDialogOpen,
        setEditRoomDialogOpen,
      ] = useState(false)

      const [
        editRoom,
        setEditRoom,
      ] = useState<
        Asset | null
      >(null)

      // =========================================
      // ROOM RESERVATIONS
      // =========================================

      const [
        roomReservationsDialogOpen,
        setRoomReservationsDialogOpen,
      ] = useState(false)

      const [
        reservationsRoom,
        setReservationsRoom,
      ] = useState<
        Asset | null
      >(null)

      // =========================================
      // EDIT OFFICE RESOURCE
      // =========================================

      const [
        editResourceDialogOpen,
        setEditResourceDialogOpen,
      ] = useState(false)

      const [
        selectedResource,
        setSelectedResource,
      ] = useState<
        Asset | null
      >(null)

      // =========================================
      // CLOCK
      // =========================================

      const [
        now,
        setNow,
      ] = useState(
        () => new Date()
      )

      // =========================================
      // LOAD
      // =========================================

      useEffect(() => {
        void Promise.all([
          assetStore
            .loadAssets(),

          reservationStore
            .loadReservations(),

          reservationStore
            .loadMyReservations(),

          lockerStore
            .refresh(),
        ])

        const interval =
          window.setInterval(
            () => {
              setNow(
                new Date()
              )
            },
            30_000
          )

        return () => {
          window.clearInterval(
            interval
          )
        }
      }, [])

      // =========================================
      // ADD
      // =========================================

      const handleOpenAddResource =
        () => {
          setAddDialogOpen(
            true
          )
        }

      const handleCloseAddResource =
        () => {
          setAddDialogOpen(
            false
          )
        }

      // =========================================
      // BOOK ROOM
      // =========================================

      const handleBookRoom =
        (
          room: Asset
        ) => {
          setSelectedRoom(
            room
          )

          setBookDialogOpen(
            true
          )
        }

      const handleCloseBookRoom =
        () => {
          setBookDialogOpen(
            false
          )

          setSelectedRoom(
            null
          )
        }

      // =========================================
      // EDIT ROOM
      // =========================================

      const handleEditRoom =
        (
          room: Asset
        ) => {
          setEditRoom(
            room
          )

          setEditRoomDialogOpen(
            true
          )
        }

      const handleCloseEditRoom =
        () => {
          setEditRoomDialogOpen(
            false
          )

          setEditRoom(
            null
          )
        }

      // =========================================
      // ROOM RESERVATIONS
      // =========================================

      const handleViewReservations =
        (
          room: Asset
        ) => {
          setReservationsRoom(
            room
          )

          setRoomReservationsDialogOpen(
            true
          )
        }

      const handleCloseRoomReservations =
        () => {
          setRoomReservationsDialogOpen(
            false
          )

          setReservationsRoom(
            null
          )
        }

      // =========================================
      // EDIT RESOURCE
      // =========================================

      const handleEditResource =
        (
          resource: Asset
        ) => {
          setSelectedResource(
            resource
          )

          setEditResourceDialogOpen(
            true
          )
        }

      const handleCloseEditResource =
        () => {
          setEditResourceDialogOpen(
            false
          )

          setSelectedResource(
            null
          )
        }

      // =========================================
      // COUNTERS
      // =========================================

      const dashboardAssets =
        assetStore.assets

      const rooms =
        dashboardAssets.filter(
          (asset) =>
            asset.type ===
            'Room'
        )

      const resources =
        dashboardAssets.filter(
          (asset) =>
            asset.type !==
            'Room'
        )

      const desks =
        resources.filter(
          (asset) =>
            asset.type ===
            'Desk'
        )

      const totalAssets =
        dashboardAssets.length

      const availableAssets =
        dashboardAssets.filter(
          (asset) => {
            if (
              asset.type !==
              'Room'
            ) {
              return (
                asset.status ===
                'Available'
              )
            }

            if (
              asset.status ===
              'Maintenance'
            ) {
              return false
            }

            const hasActiveReservation =
              reservationStore
                .reservations
                .some(
                  (
                    reservation
                  ) => {
                    if (
                      reservation.assetId !==
                      asset.id
                    ) {
                      return false
                    }

                    const start =
                      new Date(
                        reservation.startTimeUtc
                      )

                    const end =
                      new Date(
                        reservation.endTimeUtc
                      )

                    return (
                      start <=
                        now &&
                      end >
                        now
                    )
                  }
                )

            return (
              !hasActiveReservation
            )
          }
        ).length

      const myFutureReservations =
        reservationStore
          .myReservations
          .filter(
            (
              reservation
            ) =>
              new Date(
                reservation.endTimeUtc
              ) > now
          ).length

      const availableLockers =
        lockerStore.lockers
          .filter(
            (locker) =>
              locker.displayStatus ===
              'Available'
          )
          .length

      const assignedLockers =
        lockerStore.lockers
          .filter(
            (locker) =>
              locker.displayStatus ===
              'Assigned'
          )
          .length

      const currentError =
        assetStore.error ||
        reservationStore.error

      return (
        <Box
          sx={{
            minHeight:
              '100vh',

            color:
              '#202337',

            background:
              'radial-gradient(circle at 5% 5%, rgba(120,201,72,.07), transparent 23%), radial-gradient(circle at 95% 12%, rgba(24,170,163,.07), transparent 24%), #f7f9f6',
          }}
        >
          <DashboardHeader />

          <Container
            maxWidth="xl"

            sx={{
              paddingTop: {
                xs: 2.5,
                md: 3,
              },

              paddingBottom:
                6,
            }}
          >
            {/* NAV */}

            <DashboardNavigation
              activeSection={
                activeSection
              }

              onSectionChange={
                setActiveSection
              }

              roomCount={
                rooms.length
              }

              resourceCount={
                resources.length
              }

              availableLockerCount={
                availableLockers
              }
            />

            {/* ERROR */}

            {currentError && (
              <Alert
                severity="error"

                sx={{
                  marginBottom:
                    2,

                  borderRadius:
                    '14px',
                }}
              >
                {
                  currentError
                }
              </Alert>
            )}

            {/* =================================
                OVERVIEW
            ================================= */}

            {activeSection ===
              'overview' && (
              <>
                <DashboardHero
                  onAddResource={
                    handleOpenAddResource
                  }
                />

                <Box
                  sx={{
                    display:
                      'grid',

                    gridTemplateColumns:
                      {
                        xs:
                          '1fr',

                        sm:
                          'repeat(2, 1fr)',

                        lg:
                          'repeat(5, 1fr)',
                      },

                    gap: 2,

                    marginBottom:
                      3,
                  }}
                >
                  <SummaryCard
                    title="Total Resources"

                    value={
                      totalAssets
                    }

                    subtitle="Office assets"

                    icon={
                      <Inventory2OutlinedIcon />
                    }

                    accent="#202337"
                  />

                  <SummaryCard
                    title="Available"

                    value={
                      availableAssets
                    }

                    subtitle="Available right now"

                    icon={
                      <Inventory2OutlinedIcon />
                    }

                    accent="#78c948"
                  />

                  <SummaryCard
                    title="Meeting Rooms"

                    value={
                      rooms.length
                    }

                    subtitle="Shared rooms"

                    icon={
                      <MeetingRoomOutlinedIcon />
                    }

                    accent="#18aaa3"
                  />

                  <SummaryCard
                    title="Desks"

                    value={
                      desks.length
                    }

                    subtitle="Work stations"

                    icon={
                      <DeskOutlinedIcon />
                    }

                    accent="#687085"
                  />

                  <SummaryCard
                    title="My Bookings"

                    value={
                      myFutureReservations
                    }

                    subtitle="Upcoming bookings"

                    icon={
                      <CalendarMonthOutlinedIcon />
                    }

                    accent="#159f99"
                  />
                </Box>

                {/* ADMIN CONTROL CENTER */}

                {authStore.isAdmin && (
                  <AdminOverviewPanel
                    onNavigate={
                      setActiveSection
                    }
                  />
                )}

                <MyReservationsPanel />

                <Paper
                  elevation={0}

                  sx={{
                    padding: {
                      xs:
                        2,

                      md:
                        2.5,
                    },

                    display:
                      'flex',

                    alignItems:
                      'center',

                    justifyContent:
                      'space-between',

                    gap: 2,

                    flexWrap:
                      'wrap',

                    borderRadius:
                      '20px',

                    border:
                      '1px solid #e4e8e2',

                    background:
                      'linear-gradient(110deg, #ffffff, #f7fbf5)',

                    boxShadow:
                      '0 14px 34px rgba(23,24,44,.04)',
                  }}
                >
                  <Box
                    sx={{
                      display:
                        'flex',

                      alignItems:
                        'center',

                      gap:
                        1.2,
                    }}
                  >
                    <Box
                      sx={{
                        width:
                          46,

                        height:
                          46,

                        display:
                          'flex',

                        alignItems:
                          'center',

                        justifyContent:
                          'center',

                        borderRadius:
                          '14px',

                        color:
                          '#159f99',

                        backgroundColor:
                          'rgba(24,170,163,.09)',
                      }}
                    >
                      <LockOutlinedIcon />
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          color:
                            '#202337',

                          fontWeight:
                            900,
                        }}
                      >
                        Locker Center
                      </Typography>

                      <Typography
                        sx={{
                          marginTop:
                            0.2,

                          color:
                            '#9296a2',

                          fontSize:
                            '0.73rem',
                        }}
                      >
                        100 employee lockers across Floors 15 and 16
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display:
                        'flex',

                      alignItems:
                        'center',

                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          color:
                            '#58ad35',

                          fontSize:
                            '1.15rem',

                          fontWeight:
                            900,

                          textAlign:
                            'center',
                        }}
                      >
                        {
                          availableLockers
                        }
                      </Typography>

                      <Typography
                        sx={{
                          color:
                            '#999da7',

                          fontSize:
                            '0.58rem',

                          fontWeight:
                            800,
                        }}
                      >
                        AVAILABLE
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          color:
                            '#6357a6',

                          fontSize:
                            '1.15rem',

                          fontWeight:
                            900,

                          textAlign:
                            'center',
                        }}
                      >
                        {
                          assignedLockers
                        }
                      </Typography>

                      <Typography
                        sx={{
                          color:
                            '#999da7',

                          fontSize:
                            '0.58rem',

                          fontWeight:
                            800,
                        }}
                      >
                        ASSIGNED
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </>
            )}

            {/* =================================
                ROOMS
            ================================= */}

            {activeSection ===
              'rooms' && (
              <MeetingRoomsGrid
                onBookRoom={
                  handleBookRoom
                }

                onEditRoom={
                  handleEditRoom
                }

                onViewReservations={
                  handleViewReservations
                }
              />
            )}

            {/* =================================
                LOCKERS
            ================================= */}

            {activeSection ===
              'lockers' && (
              <>
                {authStore.isAdmin && (
                  <LockerRequestsPanel />
                )}

                <LockerCenter />
              </>
            )}

            {/* =================================
                RESOURCES
            ================================= */}

            {activeSection ===
              'resources' && (
              <ResourcesSection
                onAddResource={
                  handleOpenAddResource
                }

                onEditResource={
                  handleEditResource
                }
              />
            )}

            {/* =================================
                USERS - ADMIN ONLY
            ================================= */}

            {activeSection ===
              'users' &&
              authStore.isAdmin && (
                <UsersSection />
              )}
          </Container>

          {/* =====================================
              DIALOGS
          ====================================== */}

          <AddAssetDialog
            open={
              addDialogOpen
            }

            onClose={
              handleCloseAddResource
            }
          />

          <BookRoomDialog
            open={
              bookDialogOpen
            }

            room={
              selectedRoom
            }

            onClose={
              handleCloseBookRoom
            }
          />

          <EditRoomDialog
            open={
              editRoomDialogOpen
            }

            room={
              editRoom
            }

            onClose={
              handleCloseEditRoom
            }
          />

          <RoomReservationsDialog
            open={
              roomReservationsDialogOpen
            }

            room={
              reservationsRoom
            }

            onClose={
              handleCloseRoomReservations
            }
          />

          <EditResourceDialog
            open={
              editResourceDialogOpen
            }

            resource={
              selectedResource
            }

            onClose={
              handleCloseEditResource
            }
          />
        </Box>
      )
    }
  )

export default DashboardPage