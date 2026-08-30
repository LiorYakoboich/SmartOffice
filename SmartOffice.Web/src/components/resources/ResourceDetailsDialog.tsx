import {
  observer,
} from 'mobx-react-lite'

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'

import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'
import SendOutlinedIcon from '@mui/icons-material/SendOutlined'
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined'
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined'

import type {
  Asset,
} from '../../stores/AssetStore'

import {
  assetStore,
} from '../../stores/AssetStore'

import {
  authStore,
} from '../../stores/AuthStore'

import {
  equipmentRequestStore,
} from '../../stores/EquipmentRequestStore'

import ResourceCreature from './ResourceCreature'

interface ResourceDetailsDialogProps {
  open: boolean

  resource: Asset | null

  onClose: () => void
}

function getStatusStyle(
  status: string
) {
  switch (status) {
    case 'Available':
      return {
        color:
          '#438f2a',

        backgroundColor:
          'rgba(120,201,72,.10)',

        borderColor:
          'rgba(120,201,72,.24)',
      }

    case 'In Use':
      return {
        color:
          '#117f7a',

        backgroundColor:
          'rgba(24,170,163,.10)',

        borderColor:
          'rgba(24,170,163,.22)',
      }

    case 'Maintenance':
      return {
        color:
          '#c34e4e',

        backgroundColor:
          'rgba(211,79,79,.08)',

        borderColor:
          'rgba(211,79,79,.20)',
      }

    default:
      return {
        color:
          '#737783',

        backgroundColor:
          '#f5f6f4',

        borderColor:
          '#e1e4e0',
      }
  }
}

const ResourceDetailsDialog =
  observer(
    ({
      open,
      resource,
      onClose,
    }: ResourceDetailsDialogProps) => {
      if (!resource) {
        return null
      }

      /*
        Use the freshest version from AssetStore.

        This makes status changes such as
        Available -> In Use appear immediately.
      */

      const currentResource =
        assetStore.assets.find(
          (asset) =>
            asset.id ===
            resource.id
        ) ?? resource

      const statusStyle =
        getStatusStyle(
          currentResource.status
        )

      const isEquipment =
        currentResource.type ===
        'Equipment'

      const myRequest =
        currentResource.id
          ? equipmentRequestStore
              .getMyActiveRequestForAsset(
                currentResource.id
              )
          : null

      const actionLoading =
        equipmentRequestStore
          .actionLoadingId ===
          currentResource.id ||
        equipmentRequestStore
          .actionLoadingId ===
          myRequest?.id

      const handleRequest =
        async () => {
          if (
            !currentResource.id
          ) {
            return
          }

          const confirmed =
            window.confirm(
              `Request "${currentResource.name}"?`
            )

          if (!confirmed) {
            return
          }

          try {
            await equipmentRequestStore
              .requestEquipment(
                currentResource.id
              )
          } catch {
            // Store displays error.
          }
        }

      const handleCancel =
        async () => {
          if (
            !myRequest?.id
          ) {
            return
          }

          try {
            await equipmentRequestStore
              .cancelRequest(
                myRequest.id
              )
          } catch {
            // Store displays error.
          }
        }

      return (
        <Dialog
          open={
            open
          }

          onClose={
            onClose
          }

          fullWidth

          maxWidth="sm"

          slotProps={{
            paper: {
              sx: {
                maxHeight:
                  'calc(100dvh - 30px)',

                overflow:
                  'hidden',

                borderRadius:
                  '25px',

                border:
                  '1px solid #e4e8e2',

                background:
                  'linear-gradient(145deg, #ffffff, #fbfcfa)',

                boxShadow:
                  '0 35px 100px rgba(23,24,44,.20)',
              },
            },

            backdrop: {
              sx: {
                backgroundColor:
                  'rgba(23,24,44,.31)',

                backdropFilter:
                  'blur(7px)',
              },
            },
          }}
        >
          {/* HEADER */}

          <DialogTitle
            sx={{
              padding:
                2.5,
            }}
          >
            <Box
              sx={{
                display:
                  'flex',

                alignItems:
                  'flex-start',

                justifyContent:
                  'space-between',

                gap:
                  2,
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
                      '0.13em',

                    textTransform:
                      'uppercase',
                  }}
                >
                  Resource Details
                </Typography>

                <Typography
                  sx={{
                    marginTop:
                      0.25,

                    color:
                      '#202337',

                    fontSize:
                      '1.45rem',

                    fontWeight:
                      900,

                    letterSpacing:
                      '-0.035em',
                  }}
                >
                  {
                    currentResource.name
                  }
                </Typography>

                <Typography
                  sx={{
                    marginTop:
                      0.2,

                    color:
                      '#8e929e',

                    fontSize:
                      '0.72rem',
                  }}
                >
                  {
                    currentResource.category
                  }
                </Typography>
              </Box>

              <Button
                onClick={
                  onClose
                }

                sx={{
                  minWidth:
                    38,

                  width:
                    38,

                  height:
                    38,

                  padding:
                    0,

                  borderRadius:
                    '11px',

                  color:
                    '#8a8f9a',

                  backgroundColor:
                    '#f4f5f3',
                }}
              >
                <CloseOutlinedIcon />
              </Button>
            </Box>
          </DialogTitle>

          <DialogContent
            sx={{
              paddingX:
                2.5,

              paddingTop:
                '0 !important',

              paddingBottom:
                2.5,

              overflowY:
                'auto',
            }}
          >
            <ResourceCreature
              resource={
                currentResource
              }
            />

            {/* BASIC STATUS */}

            <Box
              sx={{
                marginTop:
                  1.5,

                display:
                  'flex',

                alignItems:
                  'center',

                gap:
                  0.7,

                flexWrap:
                  'wrap',
              }}
            >
              <Chip
                icon={
                  <LocationOnOutlinedIcon />
                }

                label={
                  currentResource.location
                }

                sx={{
                  color:
                    '#626774',

                  backgroundColor:
                    '#f5f6f4',

                  fontSize:
                    '0.68rem',

                  fontWeight:
                    800,
                }}
              />

              <Chip
                label={
                  currentResource.status
                }

                variant="outlined"

                sx={{
                  color:
                    statusStyle.color,

                  backgroundColor:
                    statusStyle.backgroundColor,

                  borderColor:
                    statusStyle.borderColor,

                  fontSize:
                    '0.68rem',

                  fontWeight:
                    900,
                }}
              />

              <Chip
                icon={
                  <Inventory2OutlinedIcon />
                }

                label={
                  currentResource.type
                }

                sx={{
                  color:
                    '#159f99',

                  backgroundColor:
                    'rgba(24,170,163,.07)',

                  fontSize:
                    '0.68rem',

                  fontWeight:
                    800,
                }}
              />
            </Box>

            {/* DESCRIPTION */}

            <Box
              sx={{
                marginTop:
                  2,

                padding:
                  1.7,

                borderRadius:
                  '15px',

                backgroundColor:
                  '#f8faf7',

                border:
                  '1px solid #e7ebe5',
              }}
            >
              <Typography
                sx={{
                  color:
                    '#6f7480',

                  fontSize:
                    '0.62rem',

                  fontWeight:
                    900,

                  letterSpacing:
                    '0.08em',

                  textTransform:
                    'uppercase',
                }}
              >
                About this resource
              </Typography>

              <Typography
                sx={{
                  marginTop:
                    0.6,

                  color:
                    '#454957',

                  fontSize:
                    '0.78rem',

                  lineHeight:
                    1.65,
                }}
              >
                {currentResource.description ||
                  'Smart Office workplace resource.'}
              </Typography>
            </Box>

            {/* FEATURES */}

            <Box
              sx={{
                marginTop:
                  2,
              }}
            >
              <Typography
                sx={{
                  color:
                    '#6f7480',

                  fontSize:
                    '0.62rem',

                  fontWeight:
                    900,

                  letterSpacing:
                    '0.08em',

                  textTransform:
                    'uppercase',
                }}
              >
                Features
              </Typography>

              <Box
                sx={{
                  marginTop:
                    0.8,

                  display:
                    'flex',

                  gap:
                    0.65,

                  flexWrap:
                    'wrap',
                }}
              >
                {(currentResource.features ??
                  []).map(
                  (feature) => (
                    <Chip
                      key={
                        feature
                      }

                      icon={
                        <CheckCircleOutlineOutlinedIcon />
                      }

                      label={
                        feature
                      }

                      sx={{
                        color:
                          '#5d626f',

                        backgroundColor:
                          '#ffffff',

                        border:
                          '1px solid #e3e7e1',

                        fontSize:
                          '0.66rem',

                        fontWeight:
                          700,
                      }}
                    />
                  )
                )}
              </Box>
            </Box>

            {/* EQUIPMENT WORKFLOW */}

            {isEquipment &&
              authStore.user?.role ===
                'Member' && (
                <Box
                  sx={{
                    marginTop:
                      2,
                  }}
                >
                  <Typography
                    sx={{
                      marginBottom:
                        0.7,

                      color:
                        '#6f7480',

                      fontSize:
                        '0.62rem',

                      fontWeight:
                        900,

                      letterSpacing:
                        '0.08em',

                      textTransform:
                        'uppercase',
                    }}
                  >
                    Equipment Request
                  </Typography>

                  {!myRequest &&
                    currentResource.status ===
                      'Available' && (
                      <Button
                        fullWidth

                        variant="contained"

                        startIcon={
                          actionLoading ? (
                            <CircularProgress
                              size={
                                16
                              }

                              color="inherit"
                            />
                          ) : (
                            <SendOutlinedIcon />
                          )
                        }

                        disabled={
                          actionLoading
                        }

                        onClick={() =>
                          void handleRequest()
                        }

                        sx={{
                          minHeight:
                            45,

                          borderRadius:
                            '12px',

                          color:
                            '#ffffff',

                          background:
                            'linear-gradient(100deg, #58ad35, #18aaa3)',

                          textTransform:
                            'none',

                          fontWeight:
                            900,

                          boxShadow:
                            '0 10px 24px rgba(24,170,163,.18)',
                        }}
                      >
                        Request Equipment
                      </Button>
                    )}

                  {myRequest?.status ===
                    'Pending' && (
                    <Alert
                      severity="warning"

                      icon={
                        <PendingActionsOutlinedIcon />
                      }

                      sx={{
                        borderRadius:
                          '13px',
                      }}
                    >
                      <strong>
                        Pending Admin Approval
                      </strong>

                      <br />

                      Your request has been sent to Admin.

                      <Button
                        disabled={
                          actionLoading
                        }

                        onClick={() =>
                          void handleCancel()
                        }

                        sx={{
                          marginLeft:
                            1,

                          color:
                            '#d45454',

                          textTransform:
                            'none',

                          fontWeight:
                            900,
                        }}
                      >
                        Cancel
                      </Button>
                    </Alert>
                  )}

                  {myRequest?.status ===
                    'Approved' && (
                    <Alert
                      severity="success"

                      icon={
                        <MoveToInboxOutlinedIcon />
                      }

                      sx={{
                        borderRadius:
                          '13px',
                      }}
                    >
                      <strong>
                        Ready for Pickup
                      </strong>

                      <br />

                      Admin approved your request. You can collect the equipment now.

                      <Button
                        disabled={
                          actionLoading
                        }

                        onClick={() =>
                          void handleCancel()
                        }

                        sx={{
                          marginLeft:
                            1,

                          color:
                            '#d45454',

                          textTransform:
                            'none',

                          fontWeight:
                            900,
                        }}
                      >
                        Cancel
                      </Button>
                    </Alert>
                  )}

                  {myRequest?.status ===
                    'Collected' && (
                    <Alert
                      severity="info"

                      sx={{
                        borderRadius:
                          '13px',
                      }}
                    >
                      <strong>
                        Equipment checked out to you
                      </strong>

                      <br />

                      Return it to Admin when you are finished.
                    </Alert>
                  )}

                  {!myRequest &&
                    currentResource.status ===
                      'In Use' && (
                      <Alert
                        severity="info"

                        sx={{
                          borderRadius:
                            '13px',
                        }}
                      >
                        This equipment is currently checked out by another employee.
                      </Alert>
                    )}

                  {!myRequest &&
                    currentResource.status ===
                      'Maintenance' && (
                      <Alert
                        severity="error"

                        icon={
                          <BuildOutlinedIcon />
                        }

                        sx={{
                          borderRadius:
                            '13px',
                        }}
                      >
                        This equipment is currently under maintenance.
                      </Alert>
                    )}
                </Box>
              )}

            {equipmentRequestStore.error && (
              <Alert
                severity="error"

                sx={{
                  marginTop:
                    1.5,

                  borderRadius:
                    '13px',
                }}
              >
                {
                  equipmentRequestStore.error
                }
              </Alert>
            )}
          </DialogContent>

          <DialogActions
            sx={{
              paddingX:
                2.5,

              paddingY:
                1.8,

              borderTop:
                '1px solid #edf0eb',

              backgroundColor:
                '#ffffff',
            }}
          >
            <Button
              onClick={
                onClose
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
        </Dialog>
      )
    }
  )

export default ResourceDetailsDialog