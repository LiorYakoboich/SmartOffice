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

import HeadphonesOutlinedIcon from '@mui/icons-material/HeadphonesOutlined'
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'

import {
  equipmentRequestStore,
} from '../../stores/EquipmentRequestStore'

function getStatusMessage(
  status: string
) {
  switch (status) {
    case 'Pending':
      return {
        title:
          'Waiting for approval',

        message:
          'Your request was sent to Admin for approval.',

        color:
          '#a47616',
      }

    case 'Approved':
      return {
        title:
          'Ready for pickup',

        message:
          'Your request was approved. Please collect the equipment from Admin.',

        color:
          '#159f99',
      }

    case 'Collected':
      return {
        title:
          'Checked out to you',

        message:
          'You currently have this equipment. Return it to Admin when finished.',

        color:
          '#6357a6',
      }

    default:
      return {
        title:
          status,

        message:
          '',

        color:
          '#777b86',
      }
  }
}

const MyEquipmentRequestsPanel =
  observer(
    () => {
      const requests =
        equipmentRequestStore
          .myActiveRequests

      if (
        requests.length ===
        0
      ) {
        return null
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
                1,

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

                fontSize:
                  20,
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
              My Equipment
            </Typography>
          </Box>

          <Box
            sx={{
              display:
                'grid',

              gridTemplateColumns:
                {
                  xs:
                    '1fr',

                  md:
                    'repeat(2, minmax(0, 1fr))',
                },

              gap: 1,
            }}
          >
            {requests.map(
              (request) => {
                const status =
                  getStatusMessage(
                    request.status
                  )

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
                        1.6,

                      borderRadius:
                        '17px',

                      border:
                        '1px solid #e4e8e2',

                      background:
                        'linear-gradient(120deg, #ffffff, #f8fbf7)',
                    }}
                  >
                    <Box
                      sx={{
                        display:
                          'flex',

                        alignItems:
                          'flex-start',

                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 42,

                          height: 42,

                          display:
                            'flex',

                          alignItems:
                            'center',

                          justifyContent:
                            'center',

                          flexShrink:
                            0,

                          borderRadius:
                            '13px',

                          color:
                            '#159f99',

                          backgroundColor:
                            'rgba(24,170,163,.08)',
                        }}
                      >
                        <HeadphonesOutlinedIcon />
                      </Box>

                      <Box
                        sx={{
                          flex: 1,
                        }}
                      >
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
                            request.assetName
                          }
                        </Typography>

                        <Typography
                          sx={{
                            marginTop:
                              0.15,

                            color:
                              '#9296a1',

                            fontSize:
                              '0.65rem',
                          }}
                        >
                          {
                            request.category
                          }

                          {' · '}

                          {
                            request.location
                          }
                        </Typography>

                        <Box
                          sx={{
                            marginTop:
                              0.8,

                            display:
                              'flex',

                            alignItems:
                              'center',

                            gap:
                              0.5,

                            color:
                              status.color,
                          }}
                        >
                          {request.status ===
                          'Pending' ? (
                            <PendingActionsOutlinedIcon
                              sx={{
                                fontSize:
                                  17,
                              }}
                            />
                          ) : (
                            <CheckCircleOutlineOutlinedIcon
                              sx={{
                                fontSize:
                                  17,
                              }}
                            />
                          )}

                          <Typography
                            sx={{
                              fontSize:
                                '0.68rem',

                              fontWeight:
                                900,
                            }}
                          >
                            {
                              status.title
                            }
                          </Typography>
                        </Box>

                        <Typography
                          sx={{
                            marginTop:
                              0.4,

                            color:
                              '#8b8f9a',

                            fontSize:
                              '0.64rem',

                            lineHeight:
                              1.5,
                          }}
                        >
                          {
                            status.message
                          }
                        </Typography>
                      </Box>
                    </Box>

                    {request.status !==
                      'Collected' &&
                      request.id && (
                        <Button
                          disabled={
                            loading
                          }

                          onClick={() =>
                            void equipmentRequestStore
                              .cancelRequest(
                                request.id!
                              )
                          }

                          sx={{
                            marginTop:
                              1,

                            color:
                              '#d45454',

                            textTransform:
                              'none',

                            fontSize:
                              '0.68rem',

                            fontWeight:
                              900,
                          }}
                        >
                          {loading ? (
                            <CircularProgress
                              size={
                                15
                              }

                              color="inherit"
                            />
                          ) : (
                            'Cancel Request'
                          )}
                        </Button>
                      )}
                  </Paper>
                )
              }
            )}
          </Box>

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

export default MyEquipmentRequestsPanel