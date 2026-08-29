import { useState } from 'react'
import { observer } from 'mobx-react-lite'

import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'

import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import DeskOutlinedIcon from '@mui/icons-material/DeskOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'

import { authStore } from '../../stores/AuthStore'
import { assetStore } from '../../stores/AssetStore'

const ResourcesTable = observer(() => {
  const [deletingId, setDeletingId] =
    useState<string | null>(null)

  const resources =
    assetStore.assets.filter(
      (asset) =>
        asset.type !== 'Room'
    )

  const handleDelete = async (
    id: string,
    assetName: string
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${assetName}"?`
    )

    if (!confirmed) {
      return
    }

    try {
      setDeletingId(id)

      await assetStore.deleteAsset(id)
    } catch {
      // AssetStore already exposes the error.
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusStyle = (
    status: string
  ) => {
    if (status === 'Available') {
      return {
        color: '#3f902c',

        borderColor:
          'rgba(120,201,72,.45)',

        backgroundColor:
          'rgba(120,201,72,.11)',
      }
    }

    if (status === 'Maintenance') {
      return {
        color: '#a66b14',

        borderColor:
          'rgba(224,164,68,.42)',

        backgroundColor:
          'rgba(224,164,68,.11)',
      }
    }

    return {
      color: '#117f7b',

      borderColor:
        'rgba(24,170,163,.38)',

      backgroundColor:
        'rgba(24,170,163,.09)',
    }
  }

  const getAssetIcon = (
    type: string
  ) => {
    if (type === 'Desk') {
      return (
        <DeskOutlinedIcon
          sx={{
            fontSize: 21,
          }}
        />
      )
    }

    return (
      <Inventory2OutlinedIcon
        sx={{
          fontSize: 21,
        }}
      />
    )
  }

  const getAssetColors = (
    type: string
  ) => {
    if (type === 'Desk') {
      return {
        color: '#59ad35',

        backgroundColor:
          'rgba(120,201,72,.11)',
      }
    }

    if (type === 'Equipment') {
      return {
        color: '#159f99',

        backgroundColor:
          'rgba(24,170,163,.09)',
      }
    }

    return {
      color: '#666b7d',

      backgroundColor: '#f2f3f5',
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{
        overflow: 'hidden',

        borderRadius: '22px',

        border:
          '1px solid #e5e9e3',

        backgroundColor: '#ffffff',

        boxShadow:
          '0 18px 52px rgba(23,24,44,.055)',
      }}
    >
      {/* HEADER */}

      <Box
        sx={{
          paddingX: {
            xs: 2,
            md: 3,
          },

          paddingY: 2.4,

          display: 'flex',

          alignItems: 'center',

          justifyContent:
            'space-between',

          gap: 2,

          borderBottom:
            '1px solid #eaede8',
        }}
      >
        <Box>
          <Typography
            sx={{
              color: '#202337',

              fontSize: '1.08rem',

              fontWeight: 900,
            }}
          >
            Office Resources
          </Typography>

          <Typography
            sx={{
              marginTop: 0.3,

              color: '#90939e',

              fontSize: '0.79rem',
            }}
          >
            Desks, equipment and other
            shared workplace resources
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',

            alignItems: 'center',

            gap: 0.8,
          }}
        >
          <Box
            sx={{
              minWidth: 30,
              height: 30,

              paddingX: 1,

              borderRadius: '999px',

              display: 'flex',

              alignItems: 'center',

              justifyContent:
                'center',

              color: '#4b9932',

              backgroundColor:
                'rgba(120,201,72,.09)',

              border:
                '1px solid rgba(120,201,72,.15)',

              fontSize: '0.72rem',

              fontWeight: 900,
            }}
          >
            {resources.length}
          </Box>

          <Box
            sx={{
              width: 7,
              height: 7,

              display: {
                xs: 'none',
                sm: 'block',
              },

              borderRadius: '50%',

              backgroundColor:
                '#78c948',

              boxShadow:
                '0 0 10px rgba(120,201,72,.7)',
            }}
          />
        </Box>
      </Box>

      {/* LOADING */}

      {assetStore.loading &&
      resources.length === 0 ? (
        <Box
          sx={{
            paddingY: 8,

            display: 'flex',

            flexDirection: 'column',

            alignItems: 'center',

            gap: 1.2,
          }}
        >
          <CircularProgress
            size={28}
            sx={{
              color: '#78c948',
            }}
          />

          <Typography
            sx={{
              color: '#9497a2',

              fontSize: '0.8rem',
            }}
          >
            Loading resources...
          </Typography>
        </Box>
      ) : resources.length === 0 ? (
        /* EMPTY */

        <Box
          sx={{
            paddingY: 6,

            paddingX: 2,

            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,

              marginX: 'auto',

              marginBottom: 1.3,

              borderRadius: '18px',

              display: 'flex',

              alignItems: 'center',

              justifyContent:
                'center',

              color: '#59ad35',

              backgroundColor:
                'rgba(120,201,72,.10)',
            }}
          >
            <Inventory2OutlinedIcon
              sx={{
                fontSize: 30,
              }}
            />
          </Box>

          <Typography
            sx={{
              color: '#202337',

              fontWeight: 900,
            }}
          >
            No additional resources
          </Typography>

          <Typography
            sx={{
              marginTop: 0.45,

              color: '#969aa5',

              fontSize: '0.76rem',
            }}
          >
            Desks and shared equipment
            will appear here.
          </Typography>
        </Box>
      ) : (
        /* TABLE */

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor:
                    '#fafbfa',
                }}
              >
                {[
                  'Resource',
                  'Type',
                  'Floor',
                  'Status',
                ].map((title) => (
                  <TableCell
                    key={title}
                    sx={{
                      paddingY: 1.7,

                      color: '#7b7f8c',

                      borderColor:
                        '#e9ece8',

                      fontSize:
                        '0.68rem',

                      fontWeight: 900,

                      letterSpacing:
                        '0.08em',

                      textTransform:
                        'uppercase',
                    }}
                  >
                    {title}
                  </TableCell>
                ))}

                {authStore.isAdmin && (
                  <TableCell
                    align="right"
                    sx={{
                      color: '#7b7f8c',

                      borderColor:
                        '#e9ece8',

                      fontSize:
                        '0.68rem',

                      fontWeight: 900,

                      letterSpacing:
                        '0.08em',

                      textTransform:
                        'uppercase',
                    }}
                  >
                    Actions
                  </TableCell>
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {resources.map(
                (asset) => {
                  const assetColors =
                    getAssetColors(
                      asset.type
                    )

                  return (
                    <TableRow
                      key={
                        asset.id ??
                        `${asset.name}-${asset.location}`
                      }
                      sx={{
                        transition:
                          'background-color .16s ease',

                        '& td': {
                          borderColor:
                            '#eef0ed',
                        },

                        '&:hover': {
                          backgroundColor:
                            'rgba(120,201,72,.035)',
                        },

                        '&:hover td:first-of-type':
                          {
                            boxShadow:
                              'inset 3px 0 0 #78c948',
                          },

                        '&:last-child td':
                          {
                            borderBottom:
                              0,
                          },
                      }}
                    >
                      {/* RESOURCE */}

                      <TableCell>
                        <Box
                          sx={{
                            display: 'flex',

                            alignItems:
                              'center',

                            gap: 1.3,
                          }}
                        >
                          <Box
                            sx={{
                              width: 45,
                              height: 45,

                              flexShrink: 0,

                              borderRadius:
                                '13px',

                              display: 'flex',

                              alignItems:
                                'center',

                              justifyContent:
                                'center',

                              color:
                                assetColors.color,

                              backgroundColor:
                                assetColors.backgroundColor,
                            }}
                          >
                            {getAssetIcon(
                              asset.type
                            )}
                          </Box>

                          <Box>
                            <Typography
                              sx={{
                                color:
                                  '#202337',

                                fontSize:
                                  '0.87rem',

                                fontWeight:
                                  900,
                              }}
                            >
                              {asset.name}
                            </Typography>

                            <Typography
                              sx={{
                                marginTop:
                                  0.15,

                                color:
                                  '#a0a3ad',

                                fontSize:
                                  '0.67rem',
                              }}
                            >
                              Smart Office Resource
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* TYPE */}

                      <TableCell>
                        <Typography
                          sx={{
                            color:
                              '#646878',

                            fontSize:
                              '0.82rem',

                            fontWeight:
                              600,
                          }}
                        >
                          {asset.type}
                        </Typography>
                      </TableCell>

                      {/* FLOOR */}

                      <TableCell>
                        <Chip
                          label={
                            asset.location
                          }
                          size="small"
                          sx={{
                            height: 27,

                            color:
                              '#55596a',

                            backgroundColor:
                              '#f4f5f4',

                            border:
                              '1px solid #e6e9e5',

                            fontSize:
                              '0.71rem',

                            fontWeight:
                              800,
                          }}
                        />
                      </TableCell>

                      {/* STATUS */}

                      <TableCell>
                        <Chip
                          label={
                            asset.status
                          }
                          variant="outlined"
                          size="small"
                          sx={{
                            ...getStatusStyle(
                              asset.status
                            ),

                            height: 28,

                            fontSize:
                              '0.7rem',

                            fontWeight:
                              800,
                          }}
                        />
                      </TableCell>

                      {/* ADMIN ACTIONS */}

                      {authStore.isAdmin && (
                        <TableCell align="right">
                          <Tooltip title="Delete resource">
                            <span>
                              <IconButton
                                disabled={
                                  !asset.id ||
                                  deletingId ===
                                    asset.id
                                }
                                onClick={() => {
                                  if (
                                    asset.id
                                  ) {
                                    void handleDelete(
                                      asset.id,
                                      asset.name
                                    )
                                  }
                                }}
                                sx={{
                                  width: 36,
                                  height: 36,

                                  color:
                                    '#d85959',

                                  borderRadius:
                                    '10px',

                                  '&:hover':
                                    {
                                      color:
                                        '#cc3e3e',

                                      backgroundColor:
                                        '#fff0f0',
                                    },
                                }}
                              >
                                {deletingId ===
                                asset.id ? (
                                  <CircularProgress
                                    size={18}
                                    color="inherit"
                                  />
                                ) : (
                                  <DeleteOutlinedIcon
                                    sx={{
                                      fontSize:
                                        20,
                                    }}
                                  />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      )}
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
})

export default ResourcesTable