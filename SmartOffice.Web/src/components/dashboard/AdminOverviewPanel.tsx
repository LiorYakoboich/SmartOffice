import {
  useEffect,
  useMemo,
} from 'react'

import {
  observer,
} from 'mobx-react-lite'

import {
  Box,
  Button,
  Chip,
  Paper,
  Typography,
} from '@mui/material'

import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined'
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined'

import {
  assetStore,
} from '../../stores/AssetStore'

import {
  reservationStore,
} from '../../stores/ReservationStore'

import {
  lockerStore,
} from '../../stores/LockerStore'

import {
  equipmentRequestStore,
} from '../../stores/EquipmentRequestStore'

import type {
  DashboardSection,
} from './DashboardNavigation'

interface AdminOverviewPanelProps {
  onNavigate: (
    section: DashboardSection
  ) => void
}

interface AttentionItem {
  id: string

  title: string

  subtitle: string

  status: string

  type:
    | 'locker'
    | 'equipment'

  requestedAtUtc: string
}

function isLockerAsset(
  name: string,
  category: string
) {
  const normalizedName =
    (name ?? '')
      .trim()
      .toLowerCase()

  const normalizedCategory =
    (category ?? '')
      .trim()
      .toLowerCase()

  return (
    normalizedCategory ===
      'locker' ||

    /^l15-\d+$/i.test(
      normalizedName
    ) ||

    /^l16-\d+$/i.test(
      normalizedName
    ) ||

    /^locker[\s-]/i.test(
      normalizedName
    )
  )
}

function formatRequestTime(
  value: string
) {
  return new Date(
    value
  ).toLocaleString(
    undefined,
    {
      day:
        '2-digit',

      month:
        'short',

      hour:
        '2-digit',

      minute:
        '2-digit',
    }
  )
}

const AdminOverviewPanel =
  observer(
    ({
      onNavigate,
    }: AdminOverviewPanelProps) => {
      useEffect(() => {
        void Promise.all([
          lockerStore
            .refresh(),

          equipmentRequestStore
            .refresh(),
        ])
      }, [])

      const lockerNeedsAction =
        lockerStore
          .activeRequests
          .filter(
            (request) =>
              request.status ===
                'Pending' ||
              request.status ===
                'Approved'
          )

      const equipmentNeedsAction =
        equipmentRequestStore
          .activeRequests
          .filter(
            (request) =>
              request.status ===
                'Pending' ||
              request.status ===
                'Approved'
          )

      const maintenanceResources =
        assetStore.assets.filter(
          (asset) =>
            asset.type !==
              'Room' &&
            !isLockerAsset(
              asset.name,
              asset.category
            ) &&
            asset.status ===
              'Maintenance'
        )

      const roomsInUse =
        useMemo(
          () => {
            const now =
              new Date()

            return assetStore.assets
              .filter(
                (asset) =>
                  asset.type ===
                  'Room'
              )
              .filter(
                (room) =>
                  reservationStore
                    .reservations
                    .some(
                      (
                        reservation
                      ) => {
                        if (
                          reservation.assetId !==
                          room.id
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
              )
          },
          [
            assetStore.assets,
            reservationStore.reservations,
          ]
        )

      const attentionItems =
        useMemo(
          () => {
            const items:
              AttentionItem[] =
              [
                ...lockerNeedsAction.map(
                  (
                    request
                  ) => ({
                    id:
                      `locker-${request.id}`,

                    title:
                      request.lockerName,

                    subtitle:
                      `${request.requestedBy} · ${request.floor}`,

                    status:
                      request.status,

                    type:
                      'locker' as const,

                    requestedAtUtc:
                      request.requestedAtUtc,
                  })
                ),

                ...equipmentNeedsAction.map(
                  (
                    request
                  ) => ({
                    id:
                      `equipment-${request.id}`,

                    title:
                      request.assetName,

                    subtitle:
                      `${request.requestedBy} · ${request.location}`,

                    status:
                      request.status,

                    type:
                      'equipment' as const,

                    requestedAtUtc:
                      request.requestedAtUtc,
                  })
                ),
              ]

            return items
              .sort(
                (a, b) =>
                  new Date(
                    b.requestedAtUtc
                  ).getTime() -
                  new Date(
                    a.requestedAtUtc
                  ).getTime()
              )
              .slice(
                0,
                5
              )
          },
          [
            lockerNeedsAction,
            equipmentNeedsAction,
          ]
        )

      const cards = [
        {
          title:
            'Locker Actions',

          value:
            lockerNeedsAction.length,

          subtitle:
            lockerNeedsAction.length ===
            1
              ? 'Request needs attention'
              : 'Requests need attention',

          icon:
            <KeyOutlinedIcon />,

          color:
            '#159f99',

          background:
            'rgba(24,170,163,.09)',

          section:
            'lockers' as DashboardSection,
        },

        {
          title:
            'Equipment Actions',

          value:
            equipmentNeedsAction.length,

          subtitle:
            equipmentNeedsAction.length ===
            1
              ? 'Request needs attention'
              : 'Requests need attention',

          icon:
            <Inventory2OutlinedIcon />,

          color:
            '#58ad35',

          background:
            'rgba(120,201,72,.10)',

          section:
            'resources' as DashboardSection,
        },

        {
          title:
            'Maintenance',

          value:
            maintenanceResources.length,

          subtitle:
            maintenanceResources.length ===
            1
              ? 'Resource unavailable'
              : 'Resources unavailable',

          icon:
            <BuildOutlinedIcon />,

          color:
            '#c65353',

          background:
            'rgba(198,83,83,.08)',

          section:
            'resources' as DashboardSection,
        },

        {
          title:
            'Rooms In Use',

          value:
            roomsInUse.length,

          subtitle:
            roomsInUse.length ===
            1
              ? 'Active meeting'
              : 'Active meetings',

          icon:
            <MeetingRoomOutlinedIcon />,

          color:
            '#6357a6',

          background:
            'rgba(99,87,166,.08)',

          section:
            'rooms' as DashboardSection,
        },
      ]

      return (
        <Box
          sx={{
            marginBottom:
              3,
          }}
        >
          {/* HEADER */}

          <Box
            sx={{
              marginBottom:
                1.4,

              display:
                'flex',

              alignItems:
                'center',

              justifyContent:
                'space-between',

              gap: 2,

              flexWrap:
                'wrap',
            }}
          >
            <Box>
              <Typography
                sx={{
                  color:
                    '#159f99',

                  fontSize:
                    '0.63rem',

                  fontWeight:
                    900,

                  letterSpacing:
                    '0.12em',

                  textTransform:
                    'uppercase',
                }}
              >
                Admin Control Center
              </Typography>

              <Typography
                sx={{
                  marginTop:
                    0.2,

                  color:
                    '#202337',

                  fontSize:
                    '1.2rem',

                  fontWeight:
                    900,

                  letterSpacing:
                    '-0.025em',
                }}
              >
                Workplace Overview
              </Typography>

              <Typography
                sx={{
                  marginTop:
                    0.25,

                  color:
                    '#9296a1',

                  fontSize:
                    '0.71rem',
                }}
              >
                Requests, availability and operational activity that may need your attention.
              </Typography>
            </Box>
          </Box>

          {/* ADMIN CARDS */}

          <Box
            sx={{
              display:
                'grid',

              gridTemplateColumns:
                {
                  xs:
                    'repeat(2, minmax(0, 1fr))',

                  lg:
                    'repeat(4, minmax(0, 1fr))',
                },

              gap:
                1.2,
            }}
          >
            {cards.map(
              (
                card
              ) => (
                <Paper
                  key={
                    card.title
                  }

                  elevation={0}

                  sx={{
                    padding:
                      1.6,

                    minHeight:
                      145,

                    display:
                      'flex',

                    flexDirection:
                      'column',

                    borderRadius:
                      '18px',

                    border:
                      '1px solid #e4e8e2',

                    background:
                      'linear-gradient(145deg, #ffffff, #fbfcfa)',

                    boxShadow:
                      '0 10px 28px rgba(23,24,44,.035)',
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
                    <Box
                      sx={{
                        width:
                          39,

                        height:
                          39,

                        display:
                          'flex',

                        alignItems:
                          'center',

                        justifyContent:
                          'center',

                        borderRadius:
                          '12px',

                        color:
                          card.color,

                        backgroundColor:
                          card.background,

                        '& svg':
                          {
                            fontSize:
                              21,
                          },
                      }}
                    >
                      {
                        card.icon
                      }
                    </Box>

                    {card.value >
                      0 && (
                      <Chip
                        label="Attention"

                        size="small"

                        sx={{
                          height:
                            21,

                          color:
                            card.color,

                          backgroundColor:
                            card.background,

                          fontSize:
                            '0.54rem',

                          fontWeight:
                            900,
                        }}
                      />
                    )}
                  </Box>

                  <Typography
                    sx={{
                      marginTop:
                        1.2,

                      color:
                        '#202337',

                      fontSize:
                        '1.45rem',

                      fontWeight:
                        900,

                      lineHeight:
                        1,
                    }}
                  >
                    {
                      card.value
                    }
                  </Typography>

                  <Typography
                    sx={{
                      marginTop:
                        0.45,

                      color:
                        '#4e5360',

                      fontSize:
                        '0.72rem',

                      fontWeight:
                        900,
                    }}
                  >
                    {
                      card.title
                    }
                  </Typography>

                  <Typography
                    sx={{
                      marginTop:
                        0.15,

                      color:
                        '#9a9da6',

                      fontSize:
                        '0.59rem',
                    }}
                  >
                    {
                      card.subtitle
                    }
                  </Typography>

                  <Button
                    endIcon={
                      <ArrowForwardOutlinedIcon />
                    }

                    onClick={() =>
                      onNavigate(
                        card.section
                      )
                    }

                    sx={{
                      marginTop:
                        'auto',

                      padding:
                        0,

                      alignSelf:
                        'flex-start',

                      minWidth:
                        0,

                      color:
                        card.color,

                      textTransform:
                        'none',

                      fontSize:
                        '0.62rem',

                      fontWeight:
                        900,

                      '& .MuiButton-endIcon svg':
                        {
                          fontSize:
                            15,
                        },
                    }}
                  >
                    Review
                  </Button>
                </Paper>
              )
            )}
          </Box>

          {/* NEEDS ATTENTION */}

          <Paper
            elevation={0}

            sx={{
              marginTop:
                1.2,

              overflow:
                'hidden',

              borderRadius:
                '18px',

              border:
                '1px solid #e4e8e2',

              backgroundColor:
                '#ffffff',

              boxShadow:
                '0 10px 28px rgba(23,24,44,.03)',
            }}
          >
            <Box
              sx={{
                paddingX:
                  1.7,

                paddingY:
                  1.3,

                display:
                  'flex',

                alignItems:
                  'center',

                gap:
                  0.8,

                borderBottom:
                  '1px solid #edf0eb',

                backgroundColor:
                  '#fafbf9',
              }}
            >
              <PendingActionsOutlinedIcon
                sx={{
                  color:
                    '#159f99',

                  fontSize:
                    20,
                }}
              />

              <Box>
                <Typography
                  sx={{
                    color:
                      '#202337',

                    fontSize:
                      '0.78rem',

                    fontWeight:
                      900,
                  }}
                >
                  Needs Attention
                </Typography>

                <Typography
                  sx={{
                    marginTop:
                      0.1,

                    color:
                      '#9a9da6',

                    fontSize:
                      '0.58rem',
                  }}
                >
                  Most recent locker and equipment actions.
                </Typography>
              </Box>
            </Box>

            {attentionItems.length ===
            0 ? (
              <Box
                sx={{
                  padding:
                    3.2,

                  textAlign:
                    'center',
                }}
              >
                <Typography
                  sx={{
                    color:
                      '#58ad35',

                    fontSize:
                      '0.82rem',

                    fontWeight:
                      900,
                  }}
                >
                  Everything is up to date
                </Typography>

                <Typography
                  sx={{
                    marginTop:
                      0.3,

                    color:
                      '#9a9da6',

                    fontSize:
                      '0.65rem',
                  }}
                >
                  There are currently no pending locker or equipment actions.
                </Typography>
              </Box>
            ) : (
              <Box>
                {attentionItems.map(
                  (
                    item,
                    index
                  ) => (
                    <Box
                      key={
                        item.id
                      }

                      sx={{
                        paddingX:
                          1.7,

                        paddingY:
                          1.15,

                        display:
                          'flex',

                        alignItems:
                          'center',

                        justifyContent:
                          'space-between',

                        gap:
                          1.5,

                        flexWrap:
                          'wrap',

                        borderBottom:
                          index <
                          attentionItems.length -
                            1
                            ? '1px solid #edf0eb'
                            : 'none',
                      }}
                    >
                      <Box
                        sx={{
                          display:
                            'flex',

                          alignItems:
                            'center',

                          gap:
                            1,
                        }}
                      >
                        <Box
                          sx={{
                            width:
                              36,

                            height:
                              36,

                            display:
                              'flex',

                            alignItems:
                              'center',

                            justifyContent:
                              'center',

                            flexShrink:
                              0,

                            borderRadius:
                              '11px',

                            color:
                              item.type ===
                              'locker'
                                ? '#159f99'
                                : '#58ad35',

                            backgroundColor:
                              item.type ===
                              'locker'
                                ? 'rgba(24,170,163,.08)'
                                : 'rgba(120,201,72,.10)',
                          }}
                        >
                          {item.type ===
                          'locker' ? (
                            <KeyOutlinedIcon
                              sx={{
                                fontSize:
                                  19,
                              }}
                            />
                          ) : (
                            <Inventory2OutlinedIcon
                              sx={{
                                fontSize:
                                  19,
                              }}
                            />
                          )}
                        </Box>

                        <Box>
                          <Typography
                            sx={{
                              color:
                                '#202337',

                              fontSize:
                                '0.72rem',

                              fontWeight:
                                900,
                            }}
                          >
                            {
                              item.title
                            }
                          </Typography>

                          <Typography
                            sx={{
                              marginTop:
                                0.1,

                              color:
                                '#969aa4',

                              fontSize:
                                '0.59rem',
                            }}
                          >
                            {
                              item.subtitle
                            }

                            {' · '}

                            {formatRequestTime(
                              item.requestedAtUtc
                            )}
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          display:
                            'flex',

                          alignItems:
                            'center',

                          gap:
                            0.7,
                        }}
                      >
                        <Chip
                          label={
                            item.status ===
                            'Pending'
                              ? 'Approval Needed'
                              : 'Ready for Pickup'
                          }

                          size="small"

                          sx={{
                            color:
                              item.status ===
                              'Pending'
                                ? '#a47616'
                                : '#117f7a',

                            backgroundColor:
                              item.status ===
                              'Pending'
                                ? 'rgba(222,166,50,.11)'
                                : 'rgba(24,170,163,.09)',

                            fontSize:
                              '0.56rem',

                            fontWeight:
                              900,
                          }}
                        />

                        <Button
                          onClick={() =>
                            onNavigate(
                              item.type ===
                              'locker'
                                ? 'lockers'
                                : 'resources'
                            )
                          }

                          sx={{
                            minWidth:
                              0,

                            color:
                              '#159f99',

                            textTransform:
                              'none',

                            fontSize:
                              '0.61rem',

                            fontWeight:
                              900,
                          }}
                        >
                          Open
                        </Button>
                      </Box>
                    </Box>
                  )
                )}
              </Box>
            )}
          </Paper>
        </Box>
      )
    }
  )

export default AdminOverviewPanel