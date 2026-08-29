import { useEffect, useState } from 'react'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material'

import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'

import type { Asset } from '../../stores/AssetStore'
import { reservationStore } from '../../stores/ReservationStore'

import RoomCreature from '../RoomCreature'

interface BookRoomDialogProps {
  open: boolean
  room: Asset | null
  onClose: () => void
}

function BookRoomDialog({
  open,
  room,
  onClose,
}: BookRoomDialogProps) {
  const [startTime, setStartTime] =
    useState('')

  const [endTime, setEndTime] =
    useState('')

  const [success, setSuccess] =
    useState(false)

  useEffect(() => {
    if (!open) {
      setStartTime('')
      setEndTime('')
      setSuccess(false)

      reservationStore.error = ''
    }
  }, [open])

  const handleClose = () => {
    if (reservationStore.loading) {
      return
    }

    setStartTime('')
    setEndTime('')
    setSuccess(false)

    reservationStore.error = ''

    onClose()
  }

  const handleBook = async () => {
    if (!room?.id) {
      return
    }

    reservationStore.error = ''

    setSuccess(false)

    if (!startTime || !endTime) {
      reservationStore.error =
        'Please select start and end time.'

      return
    }

    const startDate =
      new Date(startTime)

    const endDate =
      new Date(endTime)

    if (
      Number.isNaN(
        startDate.getTime()
      ) ||
      Number.isNaN(
        endDate.getTime()
      )
    ) {
      reservationStore.error =
        'Invalid reservation time.'

      return
    }

    if (endDate <= startDate) {
      reservationStore.error =
        'End time must be later than start time.'

      return
    }

    try {
      await reservationStore.createReservation(
        {
          assetId: room.id,

          startTimeUtc:
            startDate.toISOString(),

          endTimeUtc:
            endDate.toISOString(),
        }
      )

      setSuccess(true)

      setTimeout(() => {
        handleClose()
      }, 900)
    } catch {
      // ReservationStore already displays
      // API errors such as 409 Conflict.
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            position: 'relative',

            overflow: 'hidden',

            borderRadius: '26px',

            color: '#202337',

            background:
              'linear-gradient(145deg, #ffffff, #fafcf9)',

            border:
              '1px solid #e5e9e3',

            boxShadow:
              '0 38px 110px rgba(23,24,44,.22)',

            '&::before': {
              content: '""',

              position: 'absolute',

              top: 0,
              left: 0,
              right: 0,

              height: 5,

              zIndex: 5,

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
          padding: 3,

          paddingBottom: 1.4,
        }}
      >
        <Box
          sx={{
            display: 'flex',

            alignItems: 'center',

            gap: 1.5,

            marginBottom: 2,
          }}
        >
          {room ? (
            <RoomCreature
              roomName={room.name}
              size={58}
            />
          ) : (
            <Box
              sx={{
                width: 58,
                height: 58,

                borderRadius: '16px',

                display: 'flex',

                alignItems: 'center',

                justifyContent:
                  'center',

                color: '#58ad35',

                backgroundColor:
                  'rgba(120,201,72,.11)',
              }}
            >
              <CalendarMonthOutlinedIcon />
            </Box>
          )}

          <Box>
            <Typography
              sx={{
                color: '#159f99',

                fontSize: '0.66rem',

                fontWeight: 900,

                letterSpacing:
                  '0.15em',

                textTransform:
                  'uppercase',
              }}
            >
              Meeting Room Booking
            </Typography>

            <Typography
              sx={{
                marginTop: 0.3,

                color: '#202337',

                fontSize: '1.65rem',

                fontWeight: 900,

                letterSpacing:
                  '-0.035em',
              }}
            >
              Book{' '}
              {room?.name ??
                'room'}
            </Typography>
          </Box>
        </Box>

        {/* ROOM SUMMARY */}

        {room && (
          <Box
            sx={{
              padding: 1.5,

              borderRadius: '15px',

              display: 'flex',

              alignItems: 'center',

              justifyContent:
                'space-between',

              gap: 2,

              background:
                'linear-gradient(100deg, rgba(120,201,72,.07), rgba(24,170,163,.06))',

              border:
                '1px solid rgba(120,201,72,.13)',
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: '#202337',

                  fontWeight: 900,

                  fontSize: '0.88rem',
                }}
              >
                {room.name}
              </Typography>

              <Typography
                sx={{
                  marginTop: 0.2,

                  color: '#9295a0',

                  fontSize: '0.73rem',
                }}
              >
                {room.location}
              </Typography>
            </Box>

            <Typography
              sx={{
                color: '#159f99',

                fontSize: '0.72rem',

                fontWeight: 900,

                letterSpacing:
                  '0.07em',
              }}
            >
              MEETING ROOM
            </Typography>
          </Box>
        )}
      </DialogTitle>

      {/* CONTENT */}

      <DialogContent
        sx={{
          padding: 3,

          paddingTop: 2,
        }}
      >
        {reservationStore.error && (
          <Alert
            severity="error"
            sx={{
              marginBottom: 2.3,

              borderRadius: '14px',
            }}
          >
            {reservationStore.error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{
              marginBottom: 2.3,

              borderRadius: '14px',
            }}
          >
            Meeting room booked
            successfully.
          </Alert>
        )}

        <Box
          sx={{
            display: 'grid',

            gap: 2.3,
          }}
        >
          {/* START TIME */}

          <Box>
            <Box
              sx={{
                display: 'flex',

                alignItems: 'center',

                gap: 0.7,

                marginBottom: 0.7,
              }}
            >
              <AccessTimeOutlinedIcon
                sx={{
                  color: '#58ad35',

                  fontSize: 18,
                }}
              />

              <Typography
                sx={{
                  color: '#55596a',

                  fontSize: '0.72rem',

                  fontWeight: 900,

                  letterSpacing:
                    '0.07em',
                }}
              >
                START TIME
              </Typography>
            </Box>

            <TextField
              type="datetime-local"
              value={startTime}
              onChange={(event) =>
                setStartTime(
                  event.target.value
                )
              }
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root':
                  {
                    minHeight: 55,

                    borderRadius:
                      '14px',

                    backgroundColor:
                      '#ffffff',

                    '& fieldset': {
                      borderColor:
                        '#e3e7e2',
                    },

                    '&:hover fieldset':
                      {
                        borderColor:
                          'rgba(24,170,163,.45)',
                      },

                    '&.Mui-focused fieldset':
                      {
                        borderColor:
                          '#78c948',
                      },
                  },
              }}
            />
          </Box>

          {/* END TIME */}

          <Box>
            <Box
              sx={{
                display: 'flex',

                alignItems: 'center',

                gap: 0.7,

                marginBottom: 0.7,
              }}
            >
              <AccessTimeOutlinedIcon
                sx={{
                  color: '#18aaa3',

                  fontSize: 18,
                }}
              />

              <Typography
                sx={{
                  color: '#55596a',

                  fontSize: '0.72rem',

                  fontWeight: 900,

                  letterSpacing:
                    '0.07em',
                }}
              >
                END TIME
              </Typography>
            </Box>

            <TextField
              type="datetime-local"
              value={endTime}
              onChange={(event) =>
                setEndTime(
                  event.target.value
                )
              }
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root':
                  {
                    minHeight: 55,

                    borderRadius:
                      '14px',

                    backgroundColor:
                      '#ffffff',

                    '& fieldset': {
                      borderColor:
                        '#e3e7e2',
                    },

                    '&:hover fieldset':
                      {
                        borderColor:
                          'rgba(24,170,163,.45)',
                      },

                    '&.Mui-focused fieldset':
                      {
                        borderColor:
                          '#18aaa3',
                      },
                  },
              }}
            />
          </Box>

          {/* INFO */}

          <Box
            sx={{
              padding: 1.5,

              borderRadius: '14px',

              color: '#737785',

              backgroundColor:
                '#f7f9f6',

              border:
                '1px solid #eaede8',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.76rem',

                lineHeight: 1.6,
              }}
            >
              Smart Office automatically
              checks that the room is
              available during the
              selected time. Overlapping
              reservations are blocked.
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      {/* ACTIONS */}

      <DialogActions
        sx={{
          padding: 3,

          paddingTop: 1,

          gap: 1,
        }}
      >
        <Button
          onClick={handleClose}
          disabled={
            reservationStore.loading
          }
          sx={{
            color: '#7d8190',

            borderRadius: '11px',

            textTransform: 'none',

            fontWeight: 700,
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={() =>
            void handleBook()
          }
          disabled={
            reservationStore.loading ||
            !room?.id
          }
          startIcon={
            reservationStore.loading ? (
              <CircularProgress
                size={17}
                color="inherit"
              />
            ) : (
              <CalendarMonthOutlinedIcon />
            )
          }
          sx={{
            minWidth: 145,

            minHeight: 44,

            borderRadius: '12px',

            color: '#182012',

            textTransform: 'none',

            fontWeight: 900,

            background:
              'linear-gradient(100deg, #78c948, #8bd65b)',

            boxShadow:
              '0 11px 26px rgba(120,201,72,.22)',

            '&:hover': {
              background:
                'linear-gradient(100deg, #6abd3d, #7dcb50)',
            },
          }}
        >
          Book Room
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BookRoomDialog