import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'

import {
  Box,
  Chip,
  Typography,
} from '@mui/material'

import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'

import type { Asset } from '../../stores/AssetStore'
import { reservationStore } from '../../stores/ReservationStore'

interface RoomStatusChipProps {
  room: Asset
}

const RoomStatusChip = observer(
  ({
    room,
  }: RoomStatusChipProps) => {
    const [now, setNow] = useState(
      () => new Date()
    )

    useEffect(() => {
      const interval = window.setInterval(
        () => {
          setNow(new Date())
        },
        30_000
      )

      return () => {
        window.clearInterval(interval)
      }
    }, [])

    const roomReservations =
      reservationStore.reservations
        .filter(
          (reservation) =>
            reservation.assetId === room.id &&
            new Date(
              reservation.endTimeUtc
            ) > now
        )
        .sort(
          (a, b) =>
            new Date(
              a.startTimeUtc
            ).getTime() -
            new Date(
              b.startTimeUtc
            ).getTime()
        )

    const activeReservation =
      roomReservations.find(
        (reservation) => {
          const start = new Date(
            reservation.startTimeUtc
          )

          const end = new Date(
            reservation.endTimeUtc
          )

          return (
            start <= now &&
            end > now
          )
        }
      )

    const nextReservation =
      roomReservations.find(
        (reservation) =>
          new Date(
            reservation.startTimeUtc
          ) > now
      )

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

    const isSameDay = (
      firstDate: Date,
      secondDate: Date
    ) => {
      return (
        firstDate.getFullYear() ===
          secondDate.getFullYear() &&
        firstDate.getMonth() ===
          secondDate.getMonth() &&
        firstDate.getDate() ===
          secondDate.getDate()
      )
    }

    const formatBookingDateTime = (
      value: string
    ) => {
      const reservationDate =
        new Date(value)

      if (
        isSameDay(
          reservationDate,
          now
        )
      ) {
        return `Today, ${formatTime(value)}`
      }

      const tomorrow =
        new Date(now)

      tomorrow.setDate(
        tomorrow.getDate() + 1
      )

      if (
        isSameDay(
          reservationDate,
          tomorrow
        )
      ) {
        return `Tomorrow, ${formatTime(value)}`
      }

      const formattedDate =
        reservationDate.toLocaleDateString(
          undefined,
          {
            day: '2-digit',
            month: 'short',
          }
        )

      return `${formattedDate}, ${formatTime(value)}`
    }

    /*
      Maintenance is controlled manually.

      Available / In Use are calculated
      automatically from reservations.
    */

    if (
      room.status === 'Maintenance'
    ) {
      return (
        <Box>
          <Chip
            label="Maintenance"
            size="small"
            variant="outlined"
            sx={{
              height: 28,

              color: '#a66b14',

              borderColor:
                'rgba(224,164,68,.42)',

              backgroundColor:
                'rgba(224,164,68,.11)',

              fontSize: '0.7rem',

              fontWeight: 800,
            }}
          />

          <Typography
            sx={{
              marginTop: 0.45,

              color: '#a1a4ad',

              fontSize: '0.65rem',
            }}
          >
            Booking unavailable
          </Typography>
        </Box>
      )
    }

    if (activeReservation) {
      return (
        <Box>
          <Chip
            label="In Use"
            size="small"
            variant="outlined"
            sx={{
              height: 28,

              color: '#117f7b',

              borderColor:
                'rgba(24,170,163,.38)',

              backgroundColor:
                'rgba(24,170,163,.09)',

              fontSize: '0.7rem',

              fontWeight: 800,
            }}
          />

          <Box
            sx={{
              marginTop: 0.45,

              display: 'flex',

              alignItems: 'center',

              gap: 0.35,
            }}
          >
            <AccessTimeOutlinedIcon
              sx={{
                color: '#159f99',

                fontSize: 13,
              }}
            />

            <Typography
              sx={{
                color: '#159f99',

                fontSize: '0.65rem',

                fontWeight: 700,
              }}
            >
              Until{' '}
              {formatTime(
                activeReservation.endTimeUtc
              )}
            </Typography>
          </Box>
        </Box>
      )
    }

    return (
      <Box>
        <Chip
          label="Available"
          size="small"
          variant="outlined"
          sx={{
            height: 28,

            color: '#3f902c',

            borderColor:
              'rgba(120,201,72,.45)',

            backgroundColor:
              'rgba(120,201,72,.11)',

            fontSize: '0.7rem',

            fontWeight: 800,
          }}
        />

        {nextReservation ? (
          <Box
            sx={{
              marginTop: 0.45,

              display: 'flex',

              alignItems: 'center',

              gap: 0.35,
            }}
          >
            <AccessTimeOutlinedIcon
              sx={{
                color: '#8b8f9a',

                fontSize: 13,
              }}
            />

            <Typography
              sx={{
                color: '#8b8f9a',

                fontSize: '0.65rem',

                fontWeight: 600,
              }}
            >
              Next{' '}
              {formatBookingDateTime(
                nextReservation.startTimeUtc
              )}
            </Typography>
          </Box>
        ) : (
          <Typography
            sx={{
              marginTop: 0.45,

              color: '#a1a4ad',

              fontSize: '0.65rem',
            }}
          >
            No upcoming bookings
          </Typography>
        )}
      </Box>
    )
  }
)

export default RoomStatusChip