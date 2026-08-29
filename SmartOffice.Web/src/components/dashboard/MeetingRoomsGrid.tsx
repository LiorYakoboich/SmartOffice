import { useState } from 'react'
import { observer } from 'mobx-react-lite'

import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material'

import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined'
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'

import { authStore } from '../../stores/AuthStore'
import { assetStore } from '../../stores/AssetStore'

import type {
  Asset,
} from '../../stores/AssetStore'

import RoomCreature from '../RoomCreature'
import RoomStatusChip from '../reservations/RoomStatusChip'

interface MeetingRoomsGridProps {
  onBookRoom:
    (room: Asset) => void

  onEditRoom:
    (room: Asset) => void

  onViewReservations:
    (room: Asset) => void
}

const MeetingRoomsGrid = observer(
  ({
    onBookRoom,
    onEditRoom,
    onViewReservations,
  }: MeetingRoomsGridProps) => {
    const [
      deletingId,
      setDeletingId,
    ] = useState<
      string | null
    >(null)

    const rooms =
      assetStore.assets.filter(
        (asset) =>
          asset.type === 'Room'
      )

    const handleDelete =
      async (
        id: string,
        roomName: string
      ) => {
        const confirmed =
          window.confirm(
            `Are you sure you want to delete "${roomName}"?`
          )

        if (!confirmed) {
          return
        }

        try {
          setDeletingId(id)

          await assetStore
            .deleteAsset(id)
        } catch {
          // AssetStore already exposes the error.
        } finally {
          setDeletingId(null)
        }
      }

    return (
      <Box
        sx={{
          marginBottom: 3,
        }}
      >
        {/* HEADER */}

        <Box
          sx={{
            marginBottom: 1.7,

            display: 'flex',

            alignItems:
              'flex-end',

            justifyContent:
              'space-between',

            gap: 2,
          }}
        >
          <Box>
            <Box
              sx={{
                display: 'flex',

                alignItems:
                  'center',

                gap: 0.8,
              }}
            >
              <MeetingRoomOutlinedIcon
                sx={{
                  color:
                    '#159f99',

                  fontSize: 21,
                }}
              />

              <Typography
                sx={{
                  color:
                    '#202337',

                  fontSize:
                    '1.15rem',

                  fontWeight:
                    900,

                  letterSpacing:
                    '-0.02em',
                }}
              >
                Meeting Rooms
              </Typography>
            </Box>

            <Typography
              sx={{
                marginTop: 0.35,

                color: '#9397a2',

                fontSize:
                  '0.78rem',
              }}
            >
              Check room schedules and
              reserve an available time.
            </Typography>
          </Box>

          <Typography
            sx={{
              color: '#159f99',

              fontSize:
                '0.72rem',

              fontWeight: 900,

              letterSpacing:
                '0.08em',
            }}
          >
            {rooms.length}{' '}
            {rooms.length === 1
              ? 'ROOM'
              : 'ROOMS'}
          </Typography>
        </Box>

        {/* EMPTY */}

        {rooms.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              padding: 5,

              borderRadius:
                '22px',

              textAlign: 'center',

              border:
                '1px solid #e5e9e3',

              backgroundColor:
                '#ffffff',

              boxShadow:
                '0 15px 42px rgba(23,24,44,.04)',
            }}
          >
            <MeetingRoomOutlinedIcon
              sx={{
                color: '#78c948',

                fontSize: 42,
              }}
            />

            <Typography
              sx={{
                marginTop: 1,

                color: '#202337',

                fontWeight: 900,
              }}
            >
              No meeting rooms yet
            </Typography>

            <Typography
              sx={{
                marginTop: 0.5,

                color: '#969aa5',

                fontSize:
                  '0.78rem',
              }}
            >
              Meeting rooms added by an
              Admin will appear here.
            </Typography>
          </Paper>
        ) : (
          /* GRID */

          <Box
            sx={{
              display: 'grid',

              gridTemplateColumns:
                {
                  xs: '1fr',

                  sm: 'repeat(2, minmax(0, 1fr))',

                  lg: 'repeat(3, minmax(0, 1fr))',

                  xl: 'repeat(4, minmax(0, 1fr))',
                },

              gap: 2,
            }}
          >
            {rooms.map(
              (room) => {
                const isMaintenance =
                  room.status ===
                  'Maintenance'

                return (
                  <Paper
                    key={
                      room.id ??
                      `${room.name}-${room.location}`
                    }
                    elevation={0}
                    sx={{
                      position:
                        'relative',

                      minHeight: 315,

                      overflow:
                        'hidden',

                      padding: 2.3,

                      display: 'flex',

                      flexDirection:
                        'column',

                      borderRadius:
                        '22px',

                      border:
                        '1px solid #e5e9e3',

                      background:
                        'linear-gradient(145deg, #ffffff 0%, #fcfdfb 65%, rgba(120,201,72,.045) 100%)',

                      boxShadow:
                        '0 15px 42px rgba(23,24,44,.05)',

                      transition:
                        'transform .2s ease, box-shadow .2s ease, border-color .2s ease',

                      '&::before': {
                        content:
                          '""',

                        position:
                          'absolute',

                        width: 115,
                        height: 115,

                        right: -40,
                        top: -45,

                        borderRadius:
                          '50%',

                        background:
                          'rgba(24,170,163,.055)',
                      },

                      '&::after': {
                        content:
                          '""',

                        position:
                          'absolute',

                        width: 80,
                        height: 80,

                        right: 25,
                        top: -45,

                        borderRadius:
                          '50%',

                        background:
                          'rgba(120,201,72,.07)',
                      },

                      '&:hover': {
                        transform:
                          'translateY(-4px)',

                        borderColor:
                          'rgba(120,201,72,.30)',

                        boxShadow:
                          '0 22px 50px rgba(23,24,44,.09)',
                      },
                    }}
                  >
                    {/* TOP */}

                    <Box
                      sx={{
                        position:
                          'relative',

                        zIndex: 1,

                        display:
                          'flex',

                        alignItems:
                          'flex-start',

                        justifyContent:
                          'space-between',

                        gap: 1,
                      }}
                    >
                      <RoomCreature
                        roomName={
                          room.name
                        }
                        size={64}
                      />

                      <Box
                        sx={{
                          display:
                            'flex',

                          gap: 0.55,
                        }}
                      >
                        {/* VIEW SCHEDULE
                            EVERY USER
                        */}

                        <Tooltip title="View room schedule">
                          <IconButton
                            onClick={() =>
                              onViewReservations(
                                room
                              )
                            }
                            sx={{
                              width: 36,

                              height: 36,

                              borderRadius:
                                '11px',

                              color:
                                '#687085',

                              backgroundColor:
                                'rgba(255,255,255,.78)',

                              border:
                                '1px solid rgba(104,112,133,.12)',

                              backdropFilter:
                                'blur(8px)',

                              '&:hover':
                                {
                                  color:
                                    '#ffffff',

                                  backgroundColor:
                                    '#687085',
                                },
                            }}
                          >
                            <EventNoteOutlinedIcon
                              sx={{
                                fontSize:
                                  19,
                              }}
                            />
                          </IconButton>
                        </Tooltip>

                        {/* ADMIN ONLY */}

                        {authStore.isAdmin &&
                          room.id && (
                            <>
                              {/* EDIT */}

                              <Tooltip title="Edit room">
                                <IconButton
                                  onClick={() =>
                                    onEditRoom(
                                      room
                                    )
                                  }
                                  sx={{
                                    width: 36,

                                    height: 36,

                                    borderRadius:
                                      '11px',

                                    color:
                                      '#159f99',

                                    backgroundColor:
                                      'rgba(255,255,255,.78)',

                                    border:
                                      '1px solid rgba(24,170,163,.12)',

                                    backdropFilter:
                                      'blur(8px)',

                                    '&:hover':
                                      {
                                        color:
                                          '#ffffff',

                                        backgroundColor:
                                          '#159f99',
                                      },
                                  }}
                                >
                                  <EditOutlinedIcon
                                    sx={{
                                      fontSize:
                                        19,
                                    }}
                                  />
                                </IconButton>
                              </Tooltip>

                              {/* DELETE */}

                              <Tooltip title="Delete room">
                                <span>
                                  <IconButton
                                    onClick={() =>
                                      void handleDelete(
                                        room.id!,
                                        room.name
                                      )
                                    }
                                    disabled={
                                      deletingId ===
                                      room.id
                                    }
                                    sx={{
                                      width: 36,

                                      height: 36,

                                      borderRadius:
                                        '11px',

                                      color:
                                        '#d85959',

                                      backgroundColor:
                                        'rgba(255,255,255,.78)',

                                      border:
                                        '1px solid rgba(216,89,89,.10)',

                                      backdropFilter:
                                        'blur(8px)',

                                      '&:hover':
                                        {
                                          color:
                                            '#ffffff',

                                          backgroundColor:
                                            '#d85959',
                                        },
                                    }}
                                  >
                                    {deletingId ===
                                    room.id ? (
                                      <CircularProgress
                                        size={
                                          17
                                        }
                                        color="inherit"
                                      />
                                    ) : (
                                      <DeleteOutlinedIcon
                                        sx={{
                                          fontSize:
                                            19,
                                        }}
                                      />
                                    )}
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </>
                          )}
                      </Box>
                    </Box>

                    {/* NAME */}

                    <Typography
                      sx={{
                        position:
                          'relative',

                        zIndex: 1,

                        marginTop: 1.5,

                        color:
                          '#202337',

                        fontSize:
                          '1.12rem',

                        fontWeight:
                          900,

                        letterSpacing:
                          '-0.025em',
                      }}
                    >
                      {room.name}
                    </Typography>

                    {/* FLOOR */}

                    <Box
                      sx={{
                        position:
                          'relative',

                        zIndex: 1,

                        marginTop: 0.45,

                        display:
                          'flex',

                        alignItems:
                          'center',

                        gap: 0.4,
                      }}
                    >
                      <LocationOnOutlinedIcon
                        sx={{
                          color:
                            '#8c909b',

                          fontSize:
                            16,
                        }}
                      />

                      <Typography
                        sx={{
                          color:
                            '#858995',

                          fontSize:
                            '0.75rem',

                          fontWeight:
                            700,
                        }}
                      >
                        {
                          room.location
                        }
                      </Typography>
                    </Box>

                    {/* STATUS */}

                    <Box
                      sx={{
                        position:
                          'relative',

                        zIndex: 1,

                        marginTop: 2,
                      }}
                    >
                      <RoomStatusChip
                        room={room}
                      />
                    </Box>

                    <Box
                      sx={{
                        flexGrow: 1,
                      }}
                    />

                    {/* VIEW SCHEDULE */}

                    <Button
                      fullWidth

                      variant="outlined"

                      startIcon={
                        <EventNoteOutlinedIcon />
                      }

                      onClick={() =>
                        onViewReservations(
                          room
                        )
                      }

                      sx={{
                        position:
                          'relative',

                        zIndex: 1,

                        minHeight: 40,

                        marginTop: 2,

                        borderRadius:
                          '12px',

                        color:
                          '#687085',

                        borderColor:
                          '#e0e3e6',

                        textTransform:
                          'none',

                        fontSize:
                          '0.75rem',

                        fontWeight:
                          900,

                        backgroundColor:
                          'rgba(255,255,255,.65)',

                        '&:hover': {
                          color:
                            '#202337',

                          borderColor:
                            '#bfc4cb',

                          backgroundColor:
                            '#ffffff',
                        },
                      }}
                    >
                      View Reservations
                    </Button>

                    {/* BOOK */}

                    <Button
                      fullWidth

                      variant="contained"

                      startIcon={
                        <CalendarMonthOutlinedIcon />
                      }

                      onClick={() =>
                        onBookRoom(
                          room
                        )
                      }

                      disabled={
                        !room.id ||
                        isMaintenance
                      }

                      sx={{
                        position:
                          'relative',

                        zIndex: 1,

                        minHeight: 43,

                        marginTop: 0.8,

                        borderRadius:
                          '12px',

                        color:
                          '#ffffff',

                        textTransform:
                          'none',

                        fontSize:
                          '0.78rem',

                        fontWeight:
                          900,

                        background:
                          'linear-gradient(100deg, #159f99, #18aaa3)',

                        boxShadow:
                          '0 10px 24px rgba(24,170,163,.18)',

                        '&:hover': {
                          background:
                            'linear-gradient(100deg, #118b86, #159f99)',

                          boxShadow:
                            '0 12px 28px rgba(24,170,163,.27)',
                        },

                        '&.Mui-disabled':
                          {
                            color:
                              '#a1a5ad',

                            background:
                              '#f0f2f0',

                            boxShadow:
                              'none',
                          },
                      }}
                    >
                      {isMaintenance
                        ? 'Unavailable'
                        : 'Book Room'}
                    </Button>
                  </Paper>
                )
              }
            )}
          </Box>
        )}
      </Box>
    )
  }
)

export default MeetingRoomsGrid