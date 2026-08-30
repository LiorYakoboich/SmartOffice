import {
  useState,
} from 'react'

import {
  observer,
} from 'mobx-react-lite'

import {
  Alert,
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material'

import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined'
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined'
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'

import {
  authStore,
} from '../../stores/AuthStore'

import {
  lockerStore,
} from '../../stores/LockerStore'

import type {
  Locker,
} from '../../stores/LockerStore'

type Floor =
  | 'Floor 15'
  | 'Floor 16'

type StatusFilter =
  | 'All'
  | 'Available'
  | 'Assigned'
  | 'Pending'

const STATUS_CONFIG:
  Record<
    string,
    {
      label: string
      background: string
      color: string
    }
  > = {
  Available: {
    label:
      'Available',

    background:
      'rgba(120,201,72,.12)',

    color:
      '#4b9932',
  },

  'Pending Admin Approval':
    {
      label:
        'Pending Admin',

      background:
        'rgba(222,166,50,.12)',

      color:
        '#a47616',
    },

  'Ready for Key Pickup':
    {
      label:
        'Key Ready',

      background:
        'rgba(24,170,163,.11)',

      color:
        '#117f7a',
    },

  Assigned: {
    label:
      'Assigned',

    background:
      'rgba(94,83,172,.10)',

    color:
      '#6357a6',
  },

  Unavailable: {
    label:
      'Unavailable',

    background:
      'rgba(120,124,135,.10)',

    color:
      '#70747f',
  },

  Maintenance: {
    label:
      'Maintenance',

    background:
      'rgba(213,84,84,.10)',

    color:
      '#c64e4e',
  },
}

const LockerCenter =
  observer(
    () => {
      const [
        selectedFloor,
        setSelectedFloor,
      ] =
        useState<Floor>(
          'Floor 15'
        )

      const [
        statusFilter,
        setStatusFilter,
      ] =
        useState<StatusFilter>(
          'All'
        )

      const [
        selectedLockerId,
        setSelectedLockerId,
      ] =
        useState<
          string | null
        >(null)

      const floorLockers =
        lockerStore.lockers
          .filter(
            (locker) =>
              locker.floor ===
              selectedFloor
          )
          .sort(
            (a, b) =>
              a.name.localeCompare(
                b.name
              )
          )

      const selectedLocker =
        selectedLockerId
          ? lockerStore.lockers.find(
              (locker) =>
                locker.id ===
                selectedLockerId
            ) ?? null
          : null

      const availableCount =
        floorLockers.filter(
          (locker) =>
            locker.displayStatus ===
            'Available'
        ).length

      const assignedCount =
        floorLockers.filter(
          (locker) =>
            locker.displayStatus ===
            'Assigned'
        ).length

      const pendingCount =
        floorLockers.filter(
          (locker) =>
            locker.displayStatus ===
              'Pending Admin Approval' ||
            locker.displayStatus ===
              'Ready for Key Pickup'
        ).length

      const maintenanceCount =
        floorLockers.filter(
          (locker) =>
            locker.displayStatus ===
              'Maintenance' ||
            locker.displayStatus ===
              'Unavailable'
        ).length

      const visibleLockers =
        floorLockers.filter(
          (locker) => {
            if (
              statusFilter ===
              'All'
            ) {
              return true
            }

            if (
              statusFilter ===
              'Available'
            ) {
              return (
                locker.displayStatus ===
                'Available'
              )
            }

            if (
              statusFilter ===
              'Assigned'
            ) {
              return (
                locker.displayStatus ===
                'Assigned'
              )
            }

            return (
              locker.displayStatus ===
                'Pending Admin Approval' ||
              locker.displayStatus ===
                'Ready for Key Pickup'
            )
          }
        )

      const myRequest =
        lockerStore
          .myActiveRequest

      const handleRequest =
        async (
          locker: Locker
        ) => {
          const confirmed =
            window.confirm(
              `Request ${locker.name}? The request will be sent to Admin for approval.`
            )

          if (!confirmed) {
            return
          }

          try {
            await lockerStore
              .requestLocker(
                locker.id
              )
          } catch {
            // Store displays error.
          }
        }

      const handleAvailability =
        async (
          locker: Locker,
          status: string
        ) => {
          try {
            await lockerStore
              .updateAvailability(
                locker.id,
                status
              )
          } catch {
            // Store displays error.
          }
        }

      const getLockerIcon =
        (
          locker: Locker
        ) => {
          if (
            locker.displayStatus ===
            'Available'
          ) {
            return (
              <LockOpenOutlinedIcon />
            )
          }

          if (
            locker.displayStatus ===
            'Maintenance'
          ) {
            return (
              <BuildOutlinedIcon />
            )
          }

          return (
            <LockOutlinedIcon />
          )
        }

      return (
        <Box
          sx={{
            marginBottom: 4,
          }}
        >
          {/* HEADER */}

          <Paper
            elevation={0}
            sx={{
              marginBottom: 2,

              padding: {
                xs: 2,
                md: 2.5,
              },

              borderRadius:
                '22px',

              color:
                '#ffffff',

              background:
                'linear-gradient(120deg, #202337 0%, #222b3b 58%, #174b4a 120%)',

              boxShadow:
                '0 18px 45px rgba(23,24,44,.10)',
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

                gap: 2,

                flexWrap:
                  'wrap',
              }}
            >
              <Box>
                <Box
                  sx={{
                    display:
                      'flex',

                    alignItems:
                      'center',

                    gap: 0.8,
                  }}
                >
                  <KeyOutlinedIcon
                    sx={{
                      color:
                        '#78c948',
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize:
                        '1.3rem',

                      fontWeight:
                        900,
                    }}
                  >
                    Locker Center
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    marginTop:
                      0.4,

                    color:
                      'rgba(255,255,255,.65)',

                    fontSize:
                      '0.76rem',
                  }}
                >
                  Select a locker to view details or request a key.
                </Typography>
              </Box>

              <Box
                sx={{
                  display:
                    'flex',

                  gap: 1,
                }}
              >
                {[
                  {
                    value:
                      availableCount,

                    label:
                      'Available',
                  },

                  {
                    value:
                      assignedCount,

                    label:
                      'Assigned',
                  },

                  {
                    value:
                      pendingCount,

                    label:
                      'Pending',
                  },
                ].map(
                  (stat) => (
                    <Box
                      key={
                        stat.label
                      }
                      sx={{
                        minWidth:
                          70,

                        paddingX:
                          1.2,

                        paddingY:
                          0.75,

                        borderRadius:
                          '12px',

                        backgroundColor:
                          'rgba(255,255,255,.07)',

                        textAlign:
                          'center',
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize:
                            '1rem',

                          fontWeight:
                            900,
                        }}
                      >
                        {
                          stat.value
                        }
                      </Typography>

                      <Typography
                        sx={{
                          color:
                            'rgba(255,255,255,.53)',

                          fontSize:
                            '0.55rem',

                          textTransform:
                            'uppercase',
                        }}
                      >
                        {
                          stat.label
                        }
                      </Typography>
                    </Box>
                  )
                )}
              </Box>
            </Box>
          </Paper>

          {/* MEMBER REQUEST */}

          {authStore.user
            ?.role ===
            'Member' &&
            myRequest && (
              <Alert
                severity={
                  myRequest.status ===
                  'Approved'
                    ? 'success'
                    : myRequest.status ===
                        'Collected'
                      ? 'info'
                      : 'warning'
                }
                sx={{
                  marginBottom:
                    2,

                  borderRadius:
                    '14px',
                }}
              >
                <strong>
                  {
                    myRequest.lockerName
                  }
                </strong>

                {' · '}

                {myRequest.status ===
                'Pending'
                  ? 'Waiting for Admin approval.'
                  : myRequest.status ===
                      'Approved'
                    ? 'Approved — your key is ready for pickup from Admin.'
                    : 'This locker is assigned to you.'}
              </Alert>
            )}

          {lockerStore.error && (
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
                lockerStore.error
              }
            </Alert>
          )}

          {/* CONTROLS */}

          <Box
            sx={{
              marginBottom:
                1.6,

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
            <Box
              sx={{
                display:
                  'flex',

                gap: 0.7,
              }}
            >
              {(
                [
                  'Floor 15',
                  'Floor 16',
                ] as Floor[]
              ).map(
                (floor) => (
                  <Button
                    key={
                      floor
                    }

                    onClick={() => {
                      setSelectedFloor(
                        floor
                      )

                      setStatusFilter(
                        'All'
                      )
                    }}

                    sx={{
                      borderRadius:
                        '11px',

                      color:
                        selectedFloor ===
                        floor
                          ? '#ffffff'
                          : '#686d79',

                      background:
                        selectedFloor ===
                        floor
                          ? 'linear-gradient(100deg, #58ad35, #18aaa3)'
                          : '#ffffff',

                      border:
                        '1px solid #e2e6e0',

                      textTransform:
                        'none',

                      fontWeight:
                        900,
                    }}
                  >
                    {floor}
                  </Button>
                )
              )}
            </Box>

            <Box
              sx={{
                display:
                  'flex',

                gap: 0.5,

                flexWrap:
                  'wrap',
              }}
            >
              {(
                [
                  'All',
                  'Available',
                  'Assigned',
                  'Pending',
                ] as StatusFilter[]
              ).map(
                (filter) => (
                  <Button
                    key={
                      filter
                    }

                    onClick={() =>
                      setStatusFilter(
                        filter
                      )
                    }

                    sx={{
                      minHeight:
                        34,

                      paddingX:
                        1.2,

                      borderRadius:
                        '9px',

                      color:
                        statusFilter ===
                        filter
                          ? '#202337'
                          : '#898d98',

                      backgroundColor:
                        statusFilter ===
                        filter
                          ? '#eef5ea'
                          : 'transparent',

                      textTransform:
                        'none',

                      fontSize:
                        '0.68rem',

                      fontWeight:
                        900,
                    }}
                  >
                    {filter}
                  </Button>
                )
              )}
            </Box>
          </Box>

          {/* LOCKER WALL */}

          <Paper
            elevation={0}
            sx={{
              padding: {
                xs: 1.2,
                md: 1.8,
              },

              borderRadius:
                '20px',

              border:
                '1px solid #e3e7e1',

              background:
                'linear-gradient(145deg, #f9faf8, #ffffff)',
            }}
          >
            {lockerStore.loading ? (
              <Box
                sx={{
                  minHeight:
                    250,

                  display:
                    'flex',

                  alignItems:
                    'center',

                  justifyContent:
                    'center',
                }}
              >
                <CircularProgress
                  sx={{
                    color:
                      '#78c948',
                  }}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  display:
                    'grid',

                  gridTemplateColumns:
                    {
                      xs:
                        'repeat(3, minmax(0, 1fr))',

                      sm:
                        'repeat(5, minmax(0, 1fr))',

                      md:
                        'repeat(8, minmax(0, 1fr))',

                      lg:
                        'repeat(10, minmax(0, 1fr))',
                    },

                  gap: 0.75,
                }}
              >
                {visibleLockers.map(
                  (
                    locker
                  ) => {
                    const config =
                      STATUS_CONFIG[
                        locker.displayStatus
                      ] ??
                      STATUS_CONFIG
                        .Unavailable

                    return (
                      <ButtonBase
                        key={
                          locker.id
                        }

                        onClick={() =>
                          setSelectedLockerId(
                            locker.id
                          )
                        }

                        sx={{
                          minHeight:
                            78,

                          padding:
                            0.9,

                          display:
                            'flex',

                          flexDirection:
                            'column',

                          alignItems:
                            'flex-start',

                          justifyContent:
                            'space-between',

                          borderRadius:
                            '11px',

                          border:
                            locker.isMyRequest
                              ? '2px solid #18aaa3'
                              : '1px solid #e1e5df',

                          backgroundColor:
                            '#ffffff',

                          textAlign:
                            'left',

                          transition:
                            'transform .15s ease, box-shadow .15s ease',

                          '&:hover':
                            {
                              transform:
                                'translateY(-2px)',

                              boxShadow:
                                '0 9px 20px rgba(23,24,44,.07)',
                            },
                        }}
                      >
                        <Box
                          sx={{
                            width:
                              '100%',

                            display:
                              'flex',

                            justifyContent:
                              'space-between',

                            alignItems:
                              'center',
                          }}
                        >
                          <Box
                            sx={{
                              color:
                                config.color,

                              display:
                                'flex',

                              '& svg':
                                {
                                  fontSize:
                                    17,
                                },
                            }}
                          >
                            {getLockerIcon(
                              locker
                            )}
                          </Box>

                          <Box
                            sx={{
                              width: 6,

                              height: 6,

                              borderRadius:
                                '50%',

                              backgroundColor:
                                config.color,
                            }}
                          />
                        </Box>

                        <Typography
                          sx={{
                            color:
                              '#202337',

                            fontSize:
                              '0.66rem',

                            fontWeight:
                              900,
                          }}
                        >
                          {
                            locker.name
                          }
                        </Typography>

                        <Typography
                          sx={{
                            color:
                              config.color,

                            fontSize:
                              '0.5rem',

                            fontWeight:
                              900,
                          }}
                        >
                          {
                            config.label
                          }
                        </Typography>
                      </ButtonBase>
                    )
                  }
                )}
              </Box>
            )}
          </Paper>

          <Typography
            sx={{
              marginTop: 1,

              color:
                '#a0a3ad',

              fontSize:
                '0.62rem',
            }}
          >
            {visibleLockers.length} lockers shown · {maintenanceCount} currently unavailable on {selectedFloor}
          </Typography>

          {/* DETAILS DIALOG */}

          <Dialog
            open={
              Boolean(
                selectedLocker
              )
            }

            onClose={() =>
              setSelectedLockerId(
                null
              )
            }

            fullWidth

            maxWidth="xs"

            slotProps={{
              paper: {
                sx: {
                  borderRadius:
                    '22px',

                  overflow:
                    'hidden',

                  border:
                    '1px solid #e5e9e3',
                },
              },
            }}
          >
            {selectedLocker && (
              <>
                <DialogTitle
                  sx={{
                    padding: 2.5,
                  }}
                >
                  <Box
                    sx={{
                      display:
                        'flex',

                      justifyContent:
                        'space-between',

                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          color:
                            '#159f99',

                          fontSize:
                            '0.62rem',

                          fontWeight:
                            900,

                          letterSpacing:
                            '0.1em',
                        }}
                      >
                        LOCKER DETAILS
                      </Typography>

                      <Typography
                        sx={{
                          marginTop:
                            0.3,

                          color:
                            '#202337',

                          fontSize:
                            '1.45rem',

                          fontWeight:
                            900,
                        }}
                      >
                        {
                          selectedLocker.name
                        }
                      </Typography>

                      <Typography
                        sx={{
                          color:
                            '#9295a0',

                          fontSize:
                            '0.74rem',
                        }}
                      >
                        {
                          selectedLocker.floor
                        }
                      </Typography>
                    </Box>

                    <Button
                      onClick={() =>
                        setSelectedLockerId(
                          null
                        )
                      }

                      sx={{
                        minWidth:
                          38,

                        width: 38,

                        height: 38,

                        borderRadius:
                          '11px',

                        color:
                          '#8a8e99',

                        backgroundColor:
                          '#f4f5f3',
                      }}
                    >
                      <CloseOutlinedIcon />
                    </Button>
                  </Box>
                </DialogTitle>

                <DialogContent
                  dividers
                >
                  <Box
                    sx={{
                      padding:
                        1.4,

                      borderRadius:
                        '13px',

                      backgroundColor:
                        STATUS_CONFIG[
                          selectedLocker
                            .displayStatus
                        ]
                          ?.background,

                      color:
                        STATUS_CONFIG[
                          selectedLocker
                            .displayStatus
                        ]
                          ?.color,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize:
                          '0.78rem',

                        fontWeight:
                          900,
                      }}
                    >
                      {
                        selectedLocker.displayStatus
                      }
                    </Typography>
                  </Box>

                  {authStore.isAdmin &&
                    selectedLocker.requestedBy && (
                      <Typography
                        sx={{
                          marginTop:
                            1.5,

                          color:
                            '#646976',

                          fontSize:
                            '0.76rem',
                        }}
                      >
                        Assigned / requested by:{' '}
                        <strong>
                          {
                            selectedLocker.requestedBy
                          }
                        </strong>
                      </Typography>
                    )}

                  {/* MEMBER */}

                  {authStore.user
                    ?.role ===
                    'Member' &&
                    selectedLocker.isRequestable && (
                      <Button
                        fullWidth

                        variant="contained"

                        startIcon={
                          <KeyOutlinedIcon />
                        }

                        onClick={() =>
                          void handleRequest(
                            selectedLocker
                          )
                        }

                        sx={{
                          marginTop:
                            2,

                          minHeight:
                            44,

                          borderRadius:
                            '12px',

                          background:
                            'linear-gradient(100deg, #58ad35, #18aaa3)',

                          textTransform:
                            'none',

                          fontWeight:
                            900,
                        }}
                      >
                        Request Locker Key
                      </Button>
                    )}

                  {/* ADMIN */}

                  {authStore.isAdmin && (
                    <Box
                      sx={{
                        marginTop:
                          2,
                      }}
                    >
                      <Typography
                        sx={{
                          marginBottom:
                            0.6,

                          color:
                            '#777b88',

                          fontSize:
                            '0.65rem',

                          fontWeight:
                            900,
                        }}
                      >
                        OPERATIONAL STATUS
                      </Typography>

                      <TextField
                        select

                        fullWidth

                        value={
                          selectedLocker.operationalStatus
                        }

                        disabled={
                          lockerStore
                            .actionLoadingId ===
                          selectedLocker.id
                        }

                        onChange={(
                          event
                        ) =>
                          void handleAvailability(
                            selectedLocker,
                            event.target.value
                          )
                        }

                        sx={{
                          '& .MuiOutlinedInput-root':
                            {
                              borderRadius:
                                '11px',
                            },
                        }}
                      >
                        <MenuItem value="Available">
                          Available
                        </MenuItem>

                        <MenuItem value="Unavailable">
                          Unavailable
                        </MenuItem>

                        <MenuItem value="Maintenance">
                          Maintenance
                        </MenuItem>
                      </TextField>
                    </Box>
                  )}
                </DialogContent>

                <DialogActions
                  sx={{
                    padding:
                      2,
                  }}
                >
                  <Button
                    onClick={() =>
                      setSelectedLockerId(
                        null
                      )
                    }

                    sx={{
                      color:
                        '#159f99',

                      textTransform:
                        'none',

                      fontWeight:
                        900,
                    }}
                  >
                    Close
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>
        </Box>
      )
    }
  )

export default LockerCenter