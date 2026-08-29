import {
  useEffect,
  useState,
} from 'react'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'

import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined'

import type {
  Asset,
} from '../../stores/AssetStore'

import {
  authStore,
} from '../../stores/AuthStore'

import {
  reservationStore,
} from '../../stores/ReservationStore'

import type {
  Reservation,
} from '../../stores/ReservationStore'

import RoomCreature from '../RoomCreature'

interface RoomReservationsDialogProps {
  open: boolean

  room: Asset | null

  onClose: () => void
}

function RoomReservationsDialog({
  open,
  room,
  onClose,
}: RoomReservationsDialogProps) {
  const [
    reservations,
    setReservations,
  ] = useState<
    Reservation[]
  >([])

  const [
    loading,
    setLoading,
  ] = useState(false)

  const [
    cancellingId,
    setCancellingId,
  ] = useState<
    string | null
  >(null)

  const [
    localError,
    setLocalError,
  ] = useState('')

  /*
    -----------------------------------------
    LOAD ROOM RESERVATIONS
    -----------------------------------------
  */

  useEffect(() => {
    if (
      !open ||
      !room?.id
    ) {
      return
    }

    const loadReservations =
      async () => {
        setLoading(true)

        setLocalError('')

        try {
          const result =
            await reservationStore
              .loadRoomReservations(
                room.id!
              )

          /*
            Only active or future
            reservations are relevant
            to the room schedule.
          */

          const upcoming =
            result
              .filter(
                (
                  reservation
                ) =>
                  new Date(
                    reservation.endTimeUtc
                  ) >
                  new Date()
              )
              .sort(
                (
                  a,
                  b
                ) =>
                  new Date(
                    a.startTimeUtc
                  ).getTime() -
                  new Date(
                    b.startTimeUtc
                  ).getTime()
              )

          setReservations(
            upcoming
          )
        } catch (error) {
          setLocalError(
            error instanceof Error
              ? error.message
              : 'Failed to load reservations.'
          )
        } finally {
          setLoading(false)
        }
      }

    void loadReservations()
  }, [open, room])

  /*
    -----------------------------------------
    CLOSE
    -----------------------------------------
  */

  const handleClose = () => {
    if (
      loading ||
      cancellingId
    ) {
      return
    }

    setReservations([])

    setLocalError('')

    onClose()
  }

  /*
    -----------------------------------------
    ADMIN CANCEL
    -----------------------------------------

    Members do not get this action here.

    Members can still cancel their OWN
    reservations through My Reservations.
  */

  const handleCancelReservation =
    async (
      reservation: Reservation
    ) => {
      if (
        !authStore.isAdmin ||
        !reservation.id
      ) {
        return
      }

      const confirmed =
        window.confirm(
          `Cancel the booking for "${reservation.roomName}" by ${reservation.bookedBy}?`
        )

      if (!confirmed) {
        return
      }

      try {
        setCancellingId(
          reservation.id
        )

        setLocalError('')

        await reservationStore
          .cancelReservation(
            reservation.id
          )

        setReservations(
          (current) =>
            current.filter(
              (item) =>
                item.id !==
                reservation.id
            )
        )

        await Promise.all([
          reservationStore
            .loadReservations(),

          reservationStore
            .loadMyReservations(),
        ])
      } catch (error) {
        setLocalError(
          error instanceof Error
            ? error.message
            : 'Failed to cancel reservation.'
        )
      } finally {
        setCancellingId(
          null
        )
      }
    }

  /*
    -----------------------------------------
    DATE HELPERS
    -----------------------------------------
  */

  const isSameDay = (
    first: Date,
    second: Date
  ) => {
    return (
      first.getFullYear() ===
        second.getFullYear() &&
      first.getMonth() ===
        second.getMonth() &&
      first.getDate() ===
        second.getDate()
    )
  }

  const formatDate = (
    value: string
  ) => {
    const date =
      new Date(value)

    const today =
      new Date()

    const tomorrow =
      new Date()

    tomorrow.setDate(
      tomorrow.getDate() + 1
    )

    if (
      isSameDay(
        date,
        today
      )
    ) {
      return 'Today'
    }

    if (
      isSameDay(
        date,
        tomorrow
      )
    ) {
      return 'Tomorrow'
    }

    return date.toLocaleDateString(
      undefined,
      {
        weekday: 'short',

        day: '2-digit',

        month: 'short',

        year: 'numeric',
      }
    )
  }

  const formatTime = (
    value: string
  ) => {
    return new Date(
      value
    ).toLocaleTimeString(
      undefined,
      {
        hour: '2-digit',

        minute: '2-digit',
      }
    )
  }

  /*
    -----------------------------------------
    ACTIVE BOOKING
    -----------------------------------------
  */

  const isActiveReservation = (
    reservation: Reservation
  ) => {
    const now =
      new Date()

    const start =
      new Date(
        reservation.startTimeUtc
      )

    const end =
      new Date(
        reservation.endTimeUtc
      )

    return (
      start <= now &&
      end > now
    )
  }

  return (
    <Dialog
      open={open}

      onClose={
        handleClose
      }

      fullWidth

      maxWidth="sm"

      slotProps={{
        paper: {
          sx: {
            position:
              'relative',

            maxHeight:
              'calc(100dvh - 32px)',

            display: 'flex',

            flexDirection:
              'column',

            overflow:
              'hidden',

            borderRadius:
              '26px',

            background:
              'linear-gradient(145deg, #ffffff, #fafcf9)',

            border:
              '1px solid #e5e9e3',

            boxShadow:
              '0 38px 110px rgba(23,24,44,.22)',

            '&::before': {
              content:
                '""',

              position:
                'absolute',

              top: 0,
              left: 0,
              right: 0,

              height: 5,

              zIndex: 10,

              background:
                'linear-gradient(90deg, #78c948 0%, #78c948 45%, #18aaa3 100%)',
            },
          },
        },

        backdrop: {
          sx: {
            backgroundColor:
              'rgba(23,24,44,.30)',

            backdropFilter:
              'blur(8px)',
          },
        },
      }}
    >
      {/* HEADER */}

      <DialogTitle
        sx={{
          flexShrink: 0,

          padding: 3,

          paddingBottom:
            1.5,
        }}
      >
        <Box
          sx={{
            display: 'flex',

            alignItems:
              'center',

            gap: 1.5,
          }}
        >
          {room && (
            <RoomCreature
              roomName={
                room.name
              }

              size={58}
            />
          )}

          <Box>
            <Typography
              sx={{
                color:
                  '#159f99',

                fontSize:
                  '0.65rem',

                fontWeight:
                  900,

                letterSpacing:
                  '0.15em',

                textTransform:
                  'uppercase',
              }}
            >
              {authStore.isAdmin
                ? 'Room Booking Management'
                : 'Meeting Room Schedule'}
            </Typography>

            <Typography
              sx={{
                marginTop:
                  0.3,

                color:
                  '#202337',

                fontSize:
                  '1.55rem',

                fontWeight:
                  900,

                letterSpacing:
                  '-0.035em',
              }}
            >
              {room?.name}{' '}
              Reservations
            </Typography>

            {room && (
              <Typography
                sx={{
                  marginTop:
                    0.25,

                  color:
                    '#9295a0',

                  fontSize:
                    '0.75rem',
                }}
              >
                {room.location}
              </Typography>
            )}
          </Box>
        </Box>

        {/* MEMBER INFO */}

        {!authStore.isAdmin && (
          <Box
            sx={{
              marginTop: 1.7,

              paddingX: 1.4,

              paddingY: 1,

              borderRadius:
                '13px',

              background:
                'linear-gradient(100deg, rgba(120,201,72,.06), rgba(24,170,163,.05))',

              border:
                '1px solid rgba(24,170,163,.12)',
            }}
          >
            <Typography
              sx={{
                color:
                  '#687085',

                fontSize:
                  '0.7rem',

                lineHeight:
                  1.55,
              }}
            >
              View who has booked this
              room and when it will be
              available. You can manage
              your own bookings from My
              Reservations.
            </Typography>
          </Box>
        )}
      </DialogTitle>

      {/* CONTENT */}

      <DialogContent
        sx={{
          flex: 1,

          minHeight: 0,

          overflowY:
            'auto',

          padding: 3,

          paddingTop: 2,

          borderTop:
            '1px solid #edf0eb',

          '&::-webkit-scrollbar':
            {
              width: 8,
            },

          '&::-webkit-scrollbar-track':
            {
              backgroundColor:
                '#f5f7f4',
            },

          '&::-webkit-scrollbar-thumb':
            {
              borderRadius:
                20,

              background:
                'linear-gradient(180deg, #78c948, #18aaa3)',

              border:
                '2px solid #f5f7f4',
            },
        }}
      >
        {localError && (
          <Alert
            severity="error"

            sx={{
              marginBottom:
                2,

              borderRadius:
                '14px',
            }}
          >
            {localError}
          </Alert>
        )}

        {/* LOADING */}

        {loading ? (
          <Box
            sx={{
              minHeight: 210,

              display: 'flex',

              flexDirection:
                'column',

              alignItems:
                'center',

              justifyContent:
                'center',

              gap: 1.2,
            }}
          >
            <CircularProgress
              size={29}

              sx={{
                color:
                  '#78c948',
              }}
            />

            <Typography
              sx={{
                color:
                  '#9295a0',

                fontSize:
                  '0.78rem',
              }}
            >
              Loading room schedule...
            </Typography>
          </Box>
        ) : reservations.length ===
          0 ? (
          /* EMPTY */

          <Box
            sx={{
              paddingY: 5,

              textAlign:
                'center',
            }}
          >
            <Box
              sx={{
                width: 62,
                height: 62,

                marginX:
                  'auto',

                marginBottom:
                  1.3,

                borderRadius:
                  '18px',

                display: 'flex',

                alignItems:
                  'center',

                justifyContent:
                  'center',

                color:
                  '#58ad35',

                backgroundColor:
                  'rgba(120,201,72,.10)',
              }}
            >
              <EventAvailableOutlinedIcon
                sx={{
                  fontSize: 31,
                }}
              />
            </Box>

            <Typography
              sx={{
                color:
                  '#202337',

                fontWeight:
                  900,
              }}
            >
              No upcoming reservations
            </Typography>

            <Typography
              sx={{
                marginTop:
                  0.45,

                color:
                  '#9295a0',

                fontSize:
                  '0.76rem',
              }}
            >
              This room currently has no
              active or future bookings.
            </Typography>
          </Box>
        ) : (
          /* RESERVATIONS */

          <Box
            sx={{
              display: 'grid',

              gap: 1.3,
            }}
          >
            {reservations.map(
              (
                reservation
              ) => {
                const active =
                  isActiveReservation(
                    reservation
                  )

                return (
                  <Box
                    key={
                      reservation.id
                    }
                    sx={{
                      padding: 2,

                      borderRadius:
                        '17px',

                      border:
                        active
                          ? '1px solid rgba(24,170,163,.30)'
                          : '1px solid #e7ebe6',

                      background:
                        active
                          ? 'linear-gradient(120deg, rgba(24,170,163,.055), rgba(120,201,72,.035))'
                          : 'linear-gradient(120deg, #ffffff, #fafcf9)',

                      transition:
                        'border-color .18s ease, box-shadow .18s ease',

                      '&:hover':
                        {
                          borderColor:
                            active
                              ? 'rgba(24,170,163,.45)'
                              : 'rgba(120,201,72,.30)',

                          boxShadow:
                            '0 12px 28px rgba(23,24,44,.055)',
                        },
                    }}
                  >
                    {/* PERSON */}

                    <Box
                      sx={{
                        display:
                          'flex',

                        alignItems:
                          'center',

                        justifyContent:
                          'space-between',

                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display:
                            'flex',

                          alignItems:
                            'center',

                          gap: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: 38,

                            height: 38,

                            flexShrink: 0,

                            borderRadius:
                              '12px',

                            display:
                              'flex',

                            alignItems:
                              'center',

                            justifyContent:
                              'center',

                            color:
                              '#159f99',

                            backgroundColor:
                              'rgba(24,170,163,.08)',
                          }}
                        >
                          <PersonOutlinedIcon
                            sx={{
                              fontSize:
                                20,
                            }}
                          />
                        </Box>

                        <Box>
                          <Typography
                            sx={{
                              color:
                                '#202337',

                              fontSize:
                                '0.85rem',

                              fontWeight:
                                900,
                            }}
                          >
                            {
                              reservation.bookedBy
                            }
                          </Typography>

                          <Typography
                            sx={{
                              marginTop:
                                0.1,

                              color:
                                '#989ba6',

                              fontSize:
                                '0.66rem',
                            }}
                          >
                            Room reservation
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          paddingX: 1,

                          paddingY:
                            0.35,

                          flexShrink:
                            0,

                          borderRadius:
                            '999px',

                          color:
                            active
                              ? '#117f7b'
                              : '#4b9932',

                          backgroundColor:
                            active
                              ? 'rgba(24,170,163,.10)'
                              : 'rgba(120,201,72,.10)',

                          border:
                            active
                              ? '1px solid rgba(24,170,163,.18)'
                              : '1px solid rgba(120,201,72,.17)',

                          fontSize:
                            '0.61rem',

                          fontWeight:
                            900,

                          letterSpacing:
                            '0.05em',
                        }}
                      >
                        {active
                          ? 'IN USE'
                          : 'BOOKED'}
                      </Box>
                    </Box>

                    {/* DATE */}

                    <Box
                      sx={{
                        marginTop:
                          1.5,

                        display:
                          'flex',

                        alignItems:
                          'center',

                        gap: 0.7,
                      }}
                    >
                      <CalendarMonthOutlinedIcon
                        sx={{
                          color:
                            '#58ad35',

                          fontSize:
                            18,
                        }}
                      />

                      <Typography
                        sx={{
                          color:
                            '#5c6070',

                          fontSize:
                            '0.76rem',

                          fontWeight:
                            700,
                        }}
                      >
                        {formatDate(
                          reservation.startTimeUtc
                        )}
                      </Typography>
                    </Box>

                    {/* TIME */}

                    <Box
                      sx={{
                        marginTop:
                          0.7,

                        display:
                          'flex',

                        alignItems:
                          'center',

                        gap: 0.7,
                      }}
                    >
                      <AccessTimeOutlinedIcon
                        sx={{
                          color:
                            '#159f99',

                          fontSize:
                            18,
                        }}
                      />

                      <Typography
                        sx={{
                          color:
                            '#202337',

                          fontSize:
                            '0.8rem',

                          fontWeight:
                            900,
                        }}
                      >
                        {formatTime(
                          reservation.startTimeUtc
                        )}

                        {' — '}

                        {formatTime(
                          reservation.endTimeUtc
                        )}
                      </Typography>
                    </Box>

                    {/* ADMIN CANCEL ONLY */}

                    {authStore.isAdmin &&
                      reservation.id && (
                        <Button
                          onClick={() =>
                            void handleCancelReservation(
                              reservation
                            )
                          }

                          disabled={
                            cancellingId ===
                            reservation.id
                          }

                          startIcon={
                            cancellingId ===
                            reservation.id ? (
                              <CircularProgress
                                size={
                                  15
                                }

                                color="inherit"
                              />
                            ) : (
                              <CloseOutlinedIcon />
                            )
                          }

                          sx={{
                            marginTop:
                              1.5,

                            minHeight:
                              36,

                            paddingX:
                              1.4,

                            borderRadius:
                              '10px',

                            color:
                              '#d45454',

                            backgroundColor:
                              '#fff5f5',

                            border:
                              '1px solid #f7dddd',

                            textTransform:
                              'none',

                            fontSize:
                              '0.71rem',

                            fontWeight:
                              900,

                            '&:hover':
                              {
                                color:
                                  '#ffffff',

                                backgroundColor:
                                  '#d45454',

                                borderColor:
                                  '#d45454',
                              },
                          }}
                        >
                          {cancellingId ===
                          reservation.id
                            ? 'Cancelling...'
                            : 'Cancel Reservation'}
                        </Button>
                      )}
                  </Box>
                )
              }
            )}
          </Box>
        )}
      </DialogContent>

      {/* FOOTER */}

      <DialogActions
        sx={{
          flexShrink: 0,

          paddingX: 3,

          paddingY: 2,

          borderTop:
            '1px solid #edf0eb',

          backgroundColor:
            'rgba(255,255,255,.98)',
        }}
      >
        <Button
          onClick={
            handleClose
          }

          disabled={
            loading ||
            Boolean(
              cancellingId
            )
          }

          sx={{
            color: '#159f99',

            borderRadius:
              '11px',

            textTransform:
              'none',

            fontWeight:
              900,
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RoomReservationsDialog