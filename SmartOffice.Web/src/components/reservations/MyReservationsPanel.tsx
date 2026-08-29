import { useState } from 'react'
import { observer } from 'mobx-react-lite'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material'

import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined'

import { reservationStore } from '../../stores/ReservationStore'

import RoomCreature from '../RoomCreature'

const MyReservationsPanel = observer(() => {
  const [cancellingId, setCancellingId] =
    useState<string | null>(null)

  const upcomingReservations =
    reservationStore.myReservations
      .filter(
        (reservation) =>
          new Date(reservation.endTimeUtc) >
          new Date()
      )
      .sort(
        (a, b) =>
          new Date(a.startTimeUtc).getTime() -
          new Date(b.startTimeUtc).getTime()
      )

  const handleCancel = async (
    id: string,
    roomName: string
  ) => {
    const confirmed = window.confirm(
      `Cancel your booking for "${roomName}"?`
    )

    if (!confirmed) {
      return
    }

    try {
      setCancellingId(id)

      await reservationStore.cancelReservation(id)
    } catch {
      // ReservationStore already exposes the error.
    } finally {
      setCancellingId(null)
    }
  }

  const formatDate = (
    dateValue: string
  ) => {
    return new Date(
      dateValue
    ).toLocaleDateString(
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
    dateValue: string
  ) => {
    return new Date(
      dateValue
    ).toLocaleTimeString(
      undefined,
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    )
  }

  return (
    <Paper
      elevation={0}
      sx={{
        marginBottom: 3,

        overflow: 'hidden',

        borderRadius: '22px',

        border: '1px solid #e5e9e3',

        backgroundColor: '#ffffff',

        boxShadow:
          '0 18px 52px rgba(23,24,44,.055)',
      }}
    >
      {/* HEADER */}

      <Box
        sx={{
          paddingX: {
            xs: 2,
            md: 3,
          },

          paddingY: 2.3,

          display: 'flex',

          alignItems: 'center',

          justifyContent:
            'space-between',

          gap: 2,

          borderBottom:
            '1px solid #eaede8',

          background:
            'linear-gradient(100deg, rgba(120,201,72,.035), rgba(24,170,163,.025))',
        }}
      >
        <Box
          sx={{
            display: 'flex',

            alignItems: 'center',

            gap: 1.2,
          }}
        >
          <Box
            sx={{
              width: 43,
              height: 43,

              borderRadius: '13px',

              display: 'flex',

              alignItems: 'center',

              justifyContent:
                'center',

              color: '#159f99',

              backgroundColor:
                'rgba(24,170,163,.09)',
            }}
          >
            <CalendarMonthOutlinedIcon />
          </Box>

          <Box>
            <Typography
              sx={{
                color: '#202337',

                fontSize: '1.05rem',

                fontWeight: 900,
              }}
            >
              My Reservations
            </Typography>

            <Typography
              sx={{
                marginTop: 0.2,

                color: '#9295a0',

                fontSize: '0.76rem',
              }}
            >
              Your upcoming meeting room bookings
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            minWidth: 34,

            height: 34,

            paddingX: 1,

            borderRadius: '999px',

            display: 'flex',

            alignItems: 'center',

            justifyContent:
              'center',

            color: '#117f7b',

            backgroundColor:
              'rgba(24,170,163,.08)',

            border:
              '1px solid rgba(24,170,163,.14)',

            fontSize: '0.74rem',

            fontWeight: 900,
          }}
        >
          {upcomingReservations.length}
        </Box>
      </Box>

      {/* ERROR */}

      {reservationStore.error && (
        <Box
          sx={{
            paddingX: {
              xs: 2,
              md: 3,
            },

            paddingTop: 2,
          }}
        >
          <Alert
            severity="error"
            sx={{
              borderRadius: '14px',
            }}
          >
            {reservationStore.error}
          </Alert>
        </Box>
      )}

      {/* LOADING */}

      {reservationStore.loading &&
      reservationStore.myReservations
        .length === 0 ? (
        <Box
          sx={{
            minHeight: 180,

            display: 'flex',

            flexDirection: 'column',

            alignItems: 'center',

            justifyContent: 'center',

            gap: 1.2,
          }}
        >
          <CircularProgress
            size={27}
            sx={{
              color: '#78c948',
            }}
          />

          <Typography
            sx={{
              color: '#9295a0',

              fontSize: '0.78rem',
            }}
          >
            Loading your reservations...
          </Typography>
        </Box>
      ) : upcomingReservations.length ===
        0 ? (
        <Box
          sx={{
            paddingY: 5,

            paddingX: 2,

            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 58,

              height: 58,

              marginX: 'auto',

              marginBottom: 1.3,

              borderRadius: '17px',

              display: 'flex',

              alignItems: 'center',

              justifyContent:
                'center',

              color: '#58ad35',

              backgroundColor:
                'rgba(120,201,72,.10)',
            }}
          >
            <EventAvailableOutlinedIcon
              sx={{
                fontSize: 30,
              }}
            />
          </Box>

          <Typography
            sx={{
              color: '#202337',

              fontWeight: 900,
            }}
          >
            No upcoming reservations
          </Typography>

          <Typography
            sx={{
              maxWidth: 420,

              marginX: 'auto',

              marginTop: 0.5,

              color: '#9295a0',

              fontSize: '0.77rem',

              lineHeight: 1.6,
            }}
          >
            Choose a meeting room below
            and click Book Room to create
            your first booking.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',

            gridTemplateColumns: {
              xs: '1fr',
              lg: 'repeat(2, 1fr)',
            },

            gap: 1.5,

            padding: {
              xs: 2,
              md: 2.5,
            },
          }}
        >
          {upcomingReservations.map(
            (reservation) => (
              <Box
                key={reservation.id}
                sx={{
                  position: 'relative',

                  padding: 2,

                  borderRadius: '17px',

                  border:
                    '1px solid #e8ebe7',

                  background:
                    'linear-gradient(120deg, #ffffff, #fafcf9)',

                  transition:
                    'transform .18s ease, box-shadow .18s ease, border-color .18s ease',

                  '&:hover': {
                    transform:
                      'translateY(-2px)',

                    borderColor:
                      'rgba(120,201,72,.28)',

                    boxShadow:
                      '0 13px 30px rgba(23,24,44,.065)',
                  },
                }}
              >
                {/* ROOM */}

                <Box
                  sx={{
                    display: 'flex',

                    alignItems:
                      'center',

                    gap: 1.4,
                  }}
                >
                  <RoomCreature
                    roomName={
                      reservation.roomName
                    }
                    size={52}
                  />

                  <Box
                    sx={{
                      minWidth: 0,

                      flexGrow: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display:
                          'flex',

                        alignItems:
                          'center',

                        justifyContent:
                          'space-between',

                        gap: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          color:
                            '#202337',

                          fontSize:
                            '0.94rem',

                          fontWeight:
                            900,
                        }}
                      >
                        {
                          reservation.roomName
                        }
                      </Typography>

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
                            '#4b9932',

                          backgroundColor:
                            'rgba(120,201,72,.10)',

                          border:
                            '1px solid rgba(120,201,72,.18)',

                          fontSize:
                            '0.62rem',

                          fontWeight:
                            900,

                          letterSpacing:
                            '0.05em',
                        }}
                      >
                        BOOKED
                      </Box>
                    </Box>

                    <Typography
                      sx={{
                        marginTop:
                          0.15,

                        color:
                          '#9295a0',

                        fontSize:
                          '0.7rem',
                      }}
                    >
                      {
                        reservation.floor
                      }
                    </Typography>
                  </Box>
                </Box>

                {/* DATE */}

                <Box
                  sx={{
                    marginTop: 1.7,

                    display: 'flex',

                    alignItems:
                      'center',

                    gap: 0.8,
                  }}
                >
                  <CalendarMonthOutlinedIcon
                    sx={{
                      color: '#58ad35',

                      fontSize: 18,
                    }}
                  />

                  <Typography
                    sx={{
                      color: '#5d6170',

                      fontSize: '0.76rem',

                      fontWeight: 700,
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
                    marginTop: 0.8,

                    display: 'flex',

                    alignItems:
                      'center',

                    gap: 0.8,
                  }}
                >
                  <AccessTimeOutlinedIcon
                    sx={{
                      color: '#159f99',

                      fontSize: 18,
                    }}
                  />

                  <Typography
                    sx={{
                      color: '#202337',

                      fontSize: '0.8rem',

                      fontWeight: 900,
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

                {/* CANCEL */}

                {reservation.id && (
                  <Button
                    onClick={() =>
                      void handleCancel(
                        reservation.id!,
                        reservation.roomName
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
                          size={15}
                          color="inherit"
                        />
                      ) : (
                        <CloseOutlinedIcon />
                      )
                    }
                    sx={{
                      marginTop: 1.7,

                      minHeight: 36,

                      paddingX: 1.4,

                      borderRadius: '10px',

                      color: '#d45454',

                      backgroundColor:
                        '#fff5f5',

                      border:
                        '1px solid #f7dddd',

                      textTransform: 'none',

                      fontSize: '0.72rem',

                      fontWeight: 900,

                      '&:hover': {
                        color: '#ffffff',

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
                      : 'Cancel Booking'}
                  </Button>
                )}
              </Box>
            )
          )}
        </Box>
      )}
    </Paper>
  )
})

export default MyReservationsPanel