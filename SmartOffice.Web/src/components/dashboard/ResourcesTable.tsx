import {
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

import {
  observer,
} from 'mobx-react-lite'

import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import DeskOutlinedIcon from '@mui/icons-material/DeskOutlined'
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'

import {
  assetStore,
} from '../../stores/AssetStore'

import {
  authStore,
} from '../../stores/AuthStore'

import type {
  Asset,
} from '../../stores/AssetStore'

interface ResourcesTableProps {
  onAddResource?: () => void
}

function isLocker(
  asset: Asset
) {
  const category =
    asset.category
      ?.trim()
      .toLowerCase()

  const name =
    asset.name
      ?.trim()
      .toLowerCase()

  return (
    category === 'locker' ||

    /^l(15|16)-\d+/i.test(
      name
    ) ||

    /^locker[\s-]/i.test(
      name
    )
  )
}

function getResourceIcon(
  type: string
) {
  if (
    type === 'Desk'
  ) {
    return (
      <DeskOutlinedIcon />
    )
  }

  if (
    type === 'Equipment'
  ) {
    return (
      <DevicesOutlinedIcon />
    )
  }

  return (
    <Inventory2OutlinedIcon />
  )
}

function getIconStyle(
  type: string
) {
  if (
    type === 'Desk'
  ) {
    return {
      color:
        '#58ad35',

      backgroundColor:
        'rgba(120,201,72,.11)',
    }
  }

  if (
    type === 'Equipment'
  ) {
    return {
      color:
        '#159f99',

      backgroundColor:
        'rgba(24,170,163,.10)',
    }
  }

  return {
    color:
      '#687085',

    backgroundColor:
      'rgba(104,112,133,.09)',
  }
}

function getStatusStyle(
  status: string
) {
  switch (status) {
    case 'Available':
      return {
        color:
          '#37861e',

        borderColor:
          'rgba(120,201,72,.48)',

        backgroundColor:
          'rgba(120,201,72,.08)',
      }

    case 'In Use':
      return {
        color:
          '#117f7a',

        borderColor:
          'rgba(24,170,163,.35)',

        backgroundColor:
          'rgba(24,170,163,.08)',
      }

    case 'Maintenance':
      return {
        color:
          '#c94d4d',

        borderColor:
          'rgba(201,77,77,.25)',

        backgroundColor:
          'rgba(201,77,77,.07)',
      }

    default:
      return {
        color:
          '#676c79',

        borderColor:
          '#e1e4e0',

        backgroundColor:
          '#f7f8f6',
      }
  }
}

const ResourcesTable =
  observer(
    ({
      onAddResource,
    }: ResourcesTableProps) => {
      const resources =
        assetStore.assets
          .filter(
            (asset) =>
              asset.type !==
              'Room'
          )
          .filter(
            (asset) =>
              !isLocker(
                asset
              )
          )

      return (
        <Paper
          elevation={0}
          sx={{
            overflow:
              'hidden',

            borderRadius:
              '24px',

            border:
              '1px solid #e3e7e1',

            backgroundColor:
              '#ffffff',

            boxShadow:
              '0 16px 45px rgba(23,24,44,.045)',
          }}
        >
          {/* HEADER */}

          <Box
            sx={{
              paddingX: {
                xs: 2,
                md: 3,
              },

              paddingY:
                2.4,

              display:
                'flex',

              alignItems:
                'center',

              justifyContent:
                'space-between',

              gap: 2,

              flexWrap:
                'wrap',

              borderBottom:
                '1px solid #edf0eb',
            }}
          >
            <Box>
              <Typography
                sx={{
                  color:
                    '#202337',

                  fontSize:
                    '1.25rem',

                  fontWeight:
                    900,

                  letterSpacing:
                    '-0.025em',
                }}
              >
                Office Resources
              </Typography>

              <Typography
                sx={{
                  marginTop:
                    0.35,

                  color:
                    '#9296a2',

                  fontSize:
                    '0.78rem',
                }}
              >
                Desks, equipment and shared workplace resources
              </Typography>
            </Box>

            <Box
              sx={{
                display:
                  'flex',

                alignItems:
                  'center',

                gap: 1,
              }}
            >
              <Box
                sx={{
                  minWidth:
                    48,

                  height: 40,

                  paddingX:
                    1.3,

                  display:
                    'flex',

                  alignItems:
                    'center',

                  justifyContent:
                    'center',

                  borderRadius:
                    '999px',

                  color:
                    '#438d28',

                  backgroundColor:
                    'rgba(120,201,72,.09)',

                  border:
                    '1px solid rgba(120,201,72,.18)',

                  fontSize:
                    '0.78rem',

                  fontWeight:
                    900,
                }}
              >
                {
                  resources.length
                }
              </Box>

              {authStore.isAdmin &&
                onAddResource && (
                  <Button
                    variant="contained"

                    startIcon={
                      <AddOutlinedIcon />
                    }

                    onClick={
                      onAddResource
                    }

                    sx={{
                      minHeight:
                        40,

                      paddingX:
                        1.6,

                      borderRadius:
                        '11px',

                      color:
                        '#ffffff',

                      background:
                        'linear-gradient(100deg, #58ad35, #18aaa3)',

                      boxShadow:
                        '0 9px 22px rgba(24,170,163,.16)',

                      textTransform:
                        'none',

                      fontSize:
                        '0.72rem',

                      fontWeight:
                        900,

                      '&:hover': {
                        background:
                          'linear-gradient(100deg, #4e9e31, #159b96)',
                      },
                    }}
                  >
                    Add Resource
                  </Button>
                )}
            </Box>
          </Box>

          {/* EMPTY */}

          {resources.length ===
          0 ? (
            <Box
              sx={{
                minHeight:
                  220,

                display:
                  'flex',

                flexDirection:
                  'column',

                alignItems:
                  'center',

                justifyContent:
                  'center',

                gap: 0.8,

                padding: 3,

                textAlign:
                  'center',
              }}
            >
              <Inventory2OutlinedIcon
                sx={{
                  color:
                    '#78c948',

                  fontSize:
                    40,
                }}
              />

              <Typography
                sx={{
                  color:
                    '#202337',

                  fontWeight:
                    900,
                }}
              >
                No office resources yet
              </Typography>

              <Typography
                sx={{
                  color:
                    '#969aa5',

                  fontSize:
                    '0.75rem',
                }}
              >
                Desks, equipment and shared resources will appear here.
              </Typography>

              {authStore.isAdmin &&
                onAddResource && (
                  <Button
                    startIcon={
                      <AddOutlinedIcon />
                    }

                    onClick={
                      onAddResource
                    }

                    sx={{
                      marginTop:
                        1,

                      color:
                        '#159f99',

                      textTransform:
                        'none',

                      fontWeight:
                        900,
                    }}
                  >
                    Add first resource
                  </Button>
                )}
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor:
                        '#fafbf9',
                    }}
                  >
                    {[
                      'RESOURCE',
                      'TYPE',
                      'CATEGORY',
                      'FLOOR',
                      'STATUS',
                    ].map(
                      (
                        heading
                      ) => (
                        <TableCell
                          key={
                            heading
                          }
                          sx={{
                            paddingY:
                              1.6,

                            color:
                              '#777c89',

                            fontSize:
                              '0.66rem',

                            fontWeight:
                              900,

                            letterSpacing:
                              '0.08em',

                            borderBottom:
                              '1px solid #e9ece7',
                          }}
                        >
                          {
                            heading
                          }
                        </TableCell>
                      )
                    )}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {resources.map(
                    (
                      resource
                    ) => {
                      const iconStyle =
                        getIconStyle(
                          resource.type
                        )

                      const statusStyle =
                        getStatusStyle(
                          resource.status
                        )

                      return (
                        <TableRow
                          key={
                            resource.id ??
                            `${resource.name}-${resource.location}`
                          }
                          sx={{
                            '&:last-child td':
                              {
                                borderBottom:
                                  'none',
                              },

                            '&:hover':
                              {
                                backgroundColor:
                                  '#fcfdfb',
                              },
                          }}
                        >
                          <TableCell
                            sx={{
                              paddingY:
                                1.8,

                              borderBottom:
                                '1px solid #edf0eb',
                            }}
                          >
                            <Box
                              sx={{
                                display:
                                  'flex',

                                alignItems:
                                  'center',

                                gap: 1.3,
                              }}
                            >
                              <Box
                                sx={{
                                  width:
                                    44,

                                  height:
                                    44,

                                  flexShrink:
                                    0,

                                  display:
                                    'flex',

                                  alignItems:
                                    'center',

                                  justifyContent:
                                    'center',

                                  borderRadius:
                                    '13px',

                                  color:
                                    iconStyle.color,

                                  backgroundColor:
                                    iconStyle.backgroundColor,
                                }}
                              >
                                {getResourceIcon(
                                  resource.type
                                )}
                              </Box>

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
                                    resource.name
                                  }
                                </Typography>

                                <Typography
                                  sx={{
                                    marginTop:
                                      0.2,

                                    maxWidth:
                                      320,

                                    color:
                                      '#9a9da8',

                                    fontSize:
                                      '0.67rem',

                                    overflow:
                                      'hidden',

                                    textOverflow:
                                      'ellipsis',

                                    whiteSpace:
                                      'nowrap',
                                  }}
                                >
                                  {resource.description ||
                                    'Smart Office Resource'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          <TableCell
                            sx={{
                              color:
                                '#5f6472',

                              fontSize:
                                '0.76rem',

                              fontWeight:
                                800,

                              borderBottom:
                                '1px solid #edf0eb',
                            }}
                          >
                            {
                              resource.type
                            }
                          </TableCell>

                          <TableCell
                            sx={{
                              color:
                                '#6e7380',

                              fontSize:
                                '0.74rem',

                              borderBottom:
                                '1px solid #edf0eb',
                            }}
                          >
                            {resource.category ||
                              'General'}
                          </TableCell>

                          <TableCell
                            sx={{
                              borderBottom:
                                '1px solid #edf0eb',
                            }}
                          >
                            <Chip
                              label={
                                resource.location
                              }

                              size="small"

                              sx={{
                                color:
                                  '#555b68',

                                backgroundColor:
                                  '#f4f5f3',

                                border:
                                  '1px solid #e1e4e0',

                                fontSize:
                                  '0.66rem',

                                fontWeight:
                                  800,
                              }}
                            />
                          </TableCell>

                          <TableCell
                            sx={{
                              borderBottom:
                                '1px solid #edf0eb',
                            }}
                          >
                            <Chip
                              label={
                                resource.status
                              }

                              size="small"

                              variant="outlined"

                              sx={{
                                color:
                                  statusStyle.color,

                                backgroundColor:
                                  statusStyle.backgroundColor,

                                borderColor:
                                  statusStyle.borderColor,

                                fontSize:
                                  '0.66rem',

                                fontWeight:
                                  900,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      )
                    }
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )
    }
  )

export default ResourcesTable