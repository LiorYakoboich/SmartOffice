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
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material'

import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined'
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined'

import {
  authStore,
} from '../../stores/AuthStore'

import {
  equipmentRequestStore,
} from '../../stores/EquipmentRequestStore'

import type {
  EquipmentRequest,
} from '../../stores/EquipmentRequestStore'

type RequestView =
  | 'action'
  | 'checked-out'

function formatDate(
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

const EquipmentRequestsPanel =
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
        equipmentRequestStore
          .needsAdminAction

      const checkedOut =
        equipmentRequestStore
          .checkedOutRequests

      if (
        needsAction.length ===
          0 &&
        checkedOut.length ===
          0
      ) {
        return null
      }

      const visibleRequests =
        selectedView ===
        'action'
          ? needsAction
          : checkedOut

      const renderRequest =
        (
          request:
            EquipmentRequest
        ) => {
          const loading =
            equipmentRequestStore
              .actionLoadingId ===
            request.id

          return (
            <Paper
              key={
                request.id
              }

              elevation={0}

              sx={{
                padding:
                  1.5,

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
                        '0.8rem',

                      fontWeight:
                        900,
                    }}
                  >
                    {
                      request.assetName
                    }
                  </Typography>

                  <Typography
                    sx={{
                      marginTop:
                        0.2,

                      color:
                        '#159f99',

                      fontSize:
                        '0.68rem',

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
                        '#9a9da6',

                      fontSize:
                        '0.61rem',
                    }}
                  >
                    {
                      request.category
                    }

                    {' · '}

                    {
                      request.location
                    }

                    {' · Requested '}

                    {formatDate(
                      request.requestedAtUtc
                    )}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display:
                      'flex',

                    alignItems:
                      'center',

                    gap:
                      0.6,

                    flexWrap:
                      'wrap',
                  }}
                >
                  {loading && (
                    <CircularProgress
                      size={
                        17
                      }

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
                          void equipmentRequestStore
                            .approveRequest(
                              request.id!
                            )
                        }

                        sx={{
                          color:
                            '#4b9633',

                          backgroundColor:
                            'rgba(120,201,72,.10)',

                          borderRadius:
                            '9px',

                          textTransform:
                            'none',

                          fontSize:
                            '0.67rem',

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
                          void equipmentRequestStore
                            .rejectRequest(
                              request.id!
                            )
                        }

                        sx={{
                          color:
                            '#d45454',

                          backgroundColor:
                            'rgba(212,84,84,.06)',

                          borderRadius:
                            '9px',

                          textTransform:
                            'none',

                          fontSize:
                            '0.67rem',

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
                        <MoveToInboxOutlinedIcon />
                      }

                      onClick={() =>
                        void equipmentRequestStore
                          .collectEquipment(
                            request.id!
                          )
                      }

                      sx={{
                        color:
                          '#117f7a',

                        backgroundColor:
                          'rgba(24,170,163,.09)',

                        borderRadius:
                          '9px',

                        textTransform:
                          'none',

                        fontSize:
                          '0.67rem',

                        fontWeight:
                          900,
                      }}
                    >
                      Mark Collected
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
                        void equipmentRequestStore
                          .returnEquipment(
                            request.id!
                          )
                      }

                      sx={{
                        color:
                          '#6357a6',

                        backgroundColor:
                          'rgba(99,87,166,.08)',

                        borderRadius:
                          '9px',

                        textTransform:
                          'none',

                        fontSize:
                          '0.67rem',

                        fontWeight:
                          900,
                      }}
                    >
                      Mark Returned
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
            marginBottom:
              2.5,
          }}
        >
          <Box
            sx={{
              marginBottom:
                1.1,

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

                gap:
                  0.7,
              }}
            >
              <Inventory2OutlinedIcon
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
                    '1rem',

                  fontWeight:
                    900,
                }}
              >
                Equipment Requests
              </Typography>
            </Box>

            <Box
              sx={{
                display:
                  'flex',

                gap:
                  0.6,
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
                      : '#6c7180',

                  backgroundColor:
                    selectedView ===
                    'action'
                      ? '#159f99'
                      : '#ffffff',

                  border:
                    '1px solid #e3e7e1',

                  textTransform:
                    'none',

                  fontSize:
                    '0.67rem',

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
                onClick={() =>
                  setSelectedView(
                    'checked-out'
                  )
                }

                sx={{
                  borderRadius:
                    '10px',

                  color:
                    selectedView ===
                    'checked-out'
                      ? '#ffffff'
                      : '#6c7180',

                  backgroundColor:
                    selectedView ===
                    'checked-out'
                      ? '#6357a6'
                      : '#ffffff',

                  border:
                    '1px solid #e3e7e1',

                  textTransform:
                    'none',

                  fontSize:
                    '0.67rem',

                  fontWeight:
                    900,
                }}
              >
                Checked Out (
                {
                  checkedOut.length
                }
                )
              </Button>
            </Box>
          </Box>

          <Paper
            elevation={0}

            sx={{
              padding:
                1,

              maxHeight:
                350,

              overflowY:
                'auto',

              borderRadius:
                '18px',

              border:
                '1px solid #e4e8e2',

              backgroundColor:
                '#f9faf8',
            }}
          >
            {visibleRequests.length ===
            0 ? (
              <Typography
                sx={{
                  padding:
                    3,

                  color:
                    '#9296a1',

                  fontSize:
                    '0.72rem',

                  textAlign:
                    'center',
                }}
              >
                No requests in this section.
              </Typography>
            ) : (
              <Box
                sx={{
                  display:
                    'grid',

                  gap:
                    0.7,
                }}
              >
                {visibleRequests.map(
                  renderRequest
                )}
              </Box>
            )}
          </Paper>

          {equipmentRequestStore.error && (
            <Alert
              severity="error"

              sx={{
                marginTop:
                  1,

                borderRadius:
                  '12px',
              }}
            >
              {
                equipmentRequestStore.error
              }
            </Alert>
          )}
        </Box>
      )
    }
  )

export default EquipmentRequestsPanel