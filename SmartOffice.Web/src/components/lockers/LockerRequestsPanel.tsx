import {
  useState,
} from 'react'

import {
  observer,
} from 'mobx-react-lite'

import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material'

import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined'
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined'
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'

import {
  authStore,
} from '../../stores/AuthStore'

import {
  lockerStore,
} from '../../stores/LockerStore'

import type {
  LockerRequest,
} from '../../stores/LockerStore'

type RequestView =
  | 'action'
  | 'assigned'

function formatDate(
  value: string
) {
  return new Date(
    value
  ).toLocaleString(
    undefined,
    {
      day: '2-digit',

      month: 'short',

      hour: '2-digit',

      minute: '2-digit',
    }
  )
}

const LockerRequestsPanel =
  observer(
    () => {
      const [
        selectedView,
        setSelectedView,
      ] =
        useState<RequestView>(
          'action'
        )

      // =========================================
      // ADMIN ONLY
      // =========================================

      if (
        !authStore.isAdmin
      ) {
        return null
      }

      const needsAction =
        lockerStore
          .activeRequests
          .filter(
            (request) =>
              request.status ===
                'Pending' ||
              request.status ===
                'Approved'
          )

      const assigned =
        lockerStore
          .activeRequests
          .filter(
            (request) =>
              request.status ===
              'Collected'
          )

      const visibleRequests =
        selectedView ===
        'action'
          ? needsAction
          : assigned

      const renderRequest =
        (
          request:
            LockerRequest
        ) => {
          const loading =
            lockerStore
              .actionLoadingId ===
            request.id

          return (
            <Paper
              key={
                request.id
              }

              elevation={0}

              sx={{
                padding: 1.6,

                borderRadius:
                  '15px',

                border:
                  '1px solid #e5e9e3',

                backgroundColor:
                  '#ffffff',
              }}
            >
              <Box
                sx={{
                  display:
                    'flex',

                  justifyContent:
                    'space-between',

                  alignItems:
                    'center',

                  gap: 2,

                  flexWrap:
                    'wrap',
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      color:
                        '#202337',

                      fontSize:
                        '0.82rem',

                      fontWeight:
                        900,
                    }}
                  >
                    {
                      request.requestedBy
                    }
                  </Typography>

                  <Typography
                    sx={{
                      marginTop:
                        0.2,

                      color:
                        '#159f99',

                      fontSize:
                        '0.71rem',

                      fontWeight:
                        900,
                    }}
                  >
                    {
                      request.lockerName
                    }

                    {' · '}

                    {
                      request.floor
                    }
                  </Typography>

                  <Typography
                    sx={{
                      marginTop:
                        0.25,

                      color:
                        '#999ca6',

                      fontSize:
                        '0.61rem',
                    }}
                  >
                    Requested{' '}

                    {formatDate(
                      request.requestedAtUtc
                    )}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display:
                      'flex',

                    gap: 0.7,

                    alignItems:
                      'center',

                    flexWrap:
                      'wrap',
                  }}
                >
                  {loading && (
                    <CircularProgress
                      size={17}

                      sx={{
                        color:
                          '#159f99',
                      }}
                    />
                  )}

                  {request.status ===
                    'Pending' && (
                    <>
                      <Button
                        disabled={
                          loading
                        }

                        startIcon={
                          <CheckOutlinedIcon />
                        }

                        onClick={() =>
                          void lockerStore
                            .approveRequest(
                              request.id!
                            )
                        }

                        sx={{
                          color:
                            '#4d9e32',

                          backgroundColor:
                            'rgba(120,201,72,.10)',

                          borderRadius:
                            '9px',

                          textTransform:
                            'none',

                          fontSize:
                            '0.68rem',

                          fontWeight:
                            900,
                        }}
                      >
                        Approve
                      </Button>

                      <Button
                        disabled={
                          loading
                        }

                        startIcon={
                          <CloseOutlinedIcon />
                        }

                        onClick={() =>
                          void lockerStore
                            .rejectRequest(
                              request.id!
                            )
                        }

                        sx={{
                          color:
                            '#d45454',

                          backgroundColor:
                            '#fff4f4',

                          borderRadius:
                            '9px',

                          textTransform:
                            'none',

                          fontSize:
                            '0.68rem',

                          fontWeight:
                            900,
                        }}
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {request.status ===
                    'Approved' && (
                    <Button
                      disabled={
                        loading
                      }

                      startIcon={
                        <KeyOutlinedIcon />
                      }

                      onClick={() =>
                        void lockerStore
                          .collectKey(
                            request.id!
                          )
                      }

                      sx={{
                        color:
                          '#117e79',

                        backgroundColor:
                          'rgba(24,170,163,.10)',

                        borderRadius:
                          '9px',

                        textTransform:
                          'none',

                        fontSize:
                          '0.68rem',

                        fontWeight:
                          900,
                      }}
                    >
                      Key Collected
                    </Button>
                  )}

                  {request.status ===
                    'Collected' && (
                    <Button
                      disabled={
                        loading
                      }

                      startIcon={
                        <AssignmentReturnOutlinedIcon />
                      }

                      onClick={() =>
                        void lockerStore
                          .returnKey(
                            request.id!
                          )
                      }

                      sx={{
                        color:
                          '#6758a8',

                        backgroundColor:
                          'rgba(103,88,168,.09)',

                        borderRadius:
                          '9px',

                        textTransform:
                          'none',

                        fontSize:
                          '0.68rem',

                        fontWeight:
                          900,
                      }}
                    >
                      Key Returned
                    </Button>
                  )}
                </Box>
              </Box>
            </Paper>
          )
        }

      return (
        <Box
          sx={{
            marginBottom: 3,
          }}
        >
          <Box
            sx={{
              marginBottom:
                1.3,

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

                alignItems:
                  'center',

                gap: 0.8,
              }}
            >
              <PendingActionsOutlinedIcon
                sx={{
                  color:
                    '#159f99',
                }}
              />

              <Typography
                sx={{
                  color:
                    '#202337',

                  fontSize:
                    '1.08rem',

                  fontWeight:
                    900,
                }}
              >
                Locker Management
              </Typography>
            </Box>

            <Box
              sx={{
                display:
                  'flex',

                gap: 0.7,
              }}
            >
              <Button
                onClick={() =>
                  setSelectedView(
                    'action'
                  )
                }

                sx={{
                  borderRadius:
                    '10px',

                  color:
                    selectedView ===
                    'action'
                      ? '#ffffff'
                      : '#666b79',

                  background:
                    selectedView ===
                    'action'
                      ? '#159f99'
                      : '#ffffff',

                  border:
                    '1px solid #e4e7e2',

                  textTransform:
                    'none',

                  fontSize:
                    '0.68rem',

                  fontWeight:
                    900,
                }}
              >
                Needs Action (
                {
                  needsAction.length
                }
                )
              </Button>

              <Button
                startIcon={
                  <LockOutlinedIcon />
                }

                onClick={() =>
                  setSelectedView(
                    'assigned'
                  )
                }

                sx={{
                  borderRadius:
                    '10px',

                  color:
                    selectedView ===
                    'assigned'
                      ? '#ffffff'
                      : '#666b79',

                  background:
                    selectedView ===
                    'assigned'
                      ? '#6258a8'
                      : '#ffffff',

                  border:
                    '1px solid #e4e7e2',

                  textTransform:
                    'none',

                  fontSize:
                    '0.68rem',

                  fontWeight:
                    900,
                }}
              >
                Assigned (
                {
                  assigned.length
                }
                )
              </Button>
            </Box>
          </Box>

          <Paper
            elevation={0}

            sx={{
              padding: 1.2,

              borderRadius:
                '18px',

              border:
                '1px solid #e5e9e3',

              backgroundColor:
                '#f9faf8',
            }}
          >
            {visibleRequests.length ===
            0 ? (
              <Box
                sx={{
                  paddingY: 3,

                  textAlign:
                    'center',
                }}
              >
                <Typography
                  sx={{
                    color:
                      '#8d919c',

                    fontSize:
                      '0.76rem',

                    fontWeight:
                      700,
                  }}
                >
                  No requests in this section.
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  maxHeight:
                    360,

                  overflowY:
                    'auto',

                  display:
                    'grid',

                  gap: 0.8,

                  paddingRight:
                    0.4,
                }}
              >
                {visibleRequests.map(
                  renderRequest
                )}
              </Box>
            )}
          </Paper>
        </Box>
      )
    }
  )

export default LockerRequestsPanel