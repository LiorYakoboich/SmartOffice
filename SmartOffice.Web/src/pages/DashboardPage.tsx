import {
  useEffect,
  useState,
} from 'react'

import { observer } from 'mobx-react-lite'

import {
  Alert,
  Box,
  Container,
} from '@mui/material'

import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined'
import DeskOutlinedIcon from '@mui/icons-material/DeskOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'

import {
  assetStore,
} from '../stores/AssetStore'

import type {
  Asset,
} from '../stores/AssetStore'

import {
  reservationStore,
} from '../stores/ReservationStore'

import DashboardHeader from '../components/dashboard/DashboardHeader'
import DashboardHero from '../components/dashboard/DashboardHero'
import SummaryCard from '../components/dashboard/SummaryCard'
import MeetingRoomsGrid from '../components/dashboard/MeetingRoomsGrid'
import ResourcesTable from '../components/dashboard/ResourcesTable'

import AddAssetDialog from '../components/assets/AddAssetDialog'
import EditRoomDialog from '../components/assets/EditRoomDialog'

import BookRoomDialog from '../components/reservations/BookRoomDialog'
import MyReservationsPanel from '../components/reservations/MyReservationsPanel'
import RoomReservationsDialog from '../components/reservations/RoomReservationsDialog'

const DashboardPage = observer(
  () => {
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
    // ADMIN ROOM RESERVATIONS
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
    // CURRENT TIME
    // =========================================

    const [now, setNow] =
      useState(
        () => new Date()
      )

    // =========================================
    // LOAD DATA
    // =========================================

    useEffect(() => {
      void Promise.all([
        assetStore
          .loadAssets(),

        reservationStore
          .loadReservations(),

        reservationStore
          .loadMyReservations(),
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
    // ADD RESOURCE
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

    const handleBookRoom = (
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

    const handleEditRoom = (
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
    // VIEW ROOM RESERVATIONS
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
    // SUMMARY
    // =========================================

    const totalAssets =
      assetStore.assets.length

    const rooms =
      assetStore.assets.filter(
        (asset) =>
          asset.type === 'Room'
      ).length

    const desks =
      assetStore.assets.filter(
        (asset) =>
          asset.type === 'Desk'
      ).length

    // =========================================
    // AVAILABLE NOW
    // =========================================

    const availableAssets =
      assetStore.assets.filter(
        (asset) => {
          if (
            asset.type !== 'Room'
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

    // =========================================
    // MY BOOKINGS
    // =========================================

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

    const currentError =
      assetStore.error ||
      reservationStore.error

    return (
      <Box
        sx={{
          minHeight:
            '100vh',

          color: '#202337',

          background:
            'radial-gradient(circle at 5% 5%, rgba(120,201,72,.07), transparent 23%), radial-gradient(circle at 95% 12%, rgba(24,170,163,.07), transparent 24%), #f7f9f6',
        }}
      >
        {/* HEADER */}

        <DashboardHeader />

        {/* MAIN */}

        <Container
          maxWidth="xl"
          sx={{
            paddingTop: {
              xs: 3,
              md: 4,
            },

            paddingBottom: 6,
          }}
        >
          {/* HERO */}

          <DashboardHero
            onAddResource={
              handleOpenAddResource
            }
          />

          {/* SUMMARY */}

          <Box
            sx={{
              display: 'grid',

              gridTemplateColumns:
                {
                  xs: '1fr',

                  sm: 'repeat(2, 1fr)',

                  lg: 'repeat(5, 1fr)',
                },

              gap: 2,

              marginBottom: 3,
            }}
          >
            <SummaryCard
              title="Total Resources"
              value={
                totalAssets
              }
              subtitle="Registered assets"
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
              value={rooms}
              subtitle="Shared rooms"
              icon={
                <MeetingRoomOutlinedIcon />
              }
              accent="#18aaa3"
            />

            <SummaryCard
              title="Desks"
              value={desks}
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

          {/* MY RESERVATIONS */}

          <MyReservationsPanel />

          {/* MEETING ROOMS */}

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

          {/* ERRORS */}

          {currentError && (
            <Alert
              severity="error"
              sx={{
                marginBottom: 3,

                borderRadius:
                  '14px',
              }}
            >
              {currentError}
            </Alert>
          )}

          {/* OTHER RESOURCES */}

          <ResourcesTable />
        </Container>

        {/* ADD RESOURCE */}

        <AddAssetDialog
          open={
            addDialogOpen
          }

          onClose={
            handleCloseAddResource
          }
        />

        {/* BOOK ROOM */}

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

        {/* EDIT ROOM */}

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

        {/* ADMIN ROOM RESERVATIONS */}

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
      </Box>
    )
  }
)

export default DashboardPage