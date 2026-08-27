import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { observer } from 'mobx-react-lite'

import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
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

import AddIcon from '@mui/icons-material/Add'
import LogoutIcon from '@mui/icons-material/Logout'
import RefreshIcon from '@mui/icons-material/Refresh'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined'
import DeskOutlinedIcon from '@mui/icons-material/DeskOutlined'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'

import { authStore } from '../stores/AuthStore'
import { assetStore } from '../stores/AssetStore'
import AddAssetDialog from '../components/AddAssetDialog'

const DashboardPage = observer(() => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    void assetStore.loadAssets()
  }, [])

  const handleLogout = () => {
    assetStore.clear()
    authStore.logout()
  }

  const handleRefresh = () => {
    void assetStore.loadAssets()
  }

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

  const totalAssets = assetStore.assets.length

  const availableAssets = assetStore.assets.filter(
    (asset) => asset.status === 'Available'
  ).length

  const rooms = assetStore.assets.filter(
    (asset) => asset.type === 'Room'
  ).length

  const desks = assetStore.assets.filter(
    (asset) => asset.type === 'Desk'
  ).length

  const getStatusStyle = (status: string) => {
    if (status === 'Available') {
      return {
        color: '#3f902c',
        borderColor: 'rgba(120, 201, 72, 0.45)',
        backgroundColor: 'rgba(120, 201, 72, 0.11)',
      }
    }

    if (status === 'Maintenance') {
      return {
        color: '#a66b14',
        borderColor: 'rgba(224, 164, 68, 0.42)',
        backgroundColor: 'rgba(224, 164, 68, 0.11)',
      }
    }

    return {
      color: '#117f7b',
      borderColor: 'rgba(24, 170, 163, 0.38)',
      backgroundColor: 'rgba(24, 170, 163, 0.09)',
    }
  }

  const getAssetIcon = (type: string) => {
    if (type === 'Room') {
      return <MeetingRoomOutlinedIcon sx={{ fontSize: 21 }} />
    }

    if (type === 'Desk') {
      return <DeskOutlinedIcon sx={{ fontSize: 21 }} />
    }

    return <Inventory2OutlinedIcon sx={{ fontSize: 21 }} />
  }

  const getAssetColors = (type: string) => {
    if (type === 'Room') {
      return {
        color: '#129a95',
        backgroundColor: 'rgba(24,170,163,.09)',
      }
    }

    if (type === 'Desk') {
      return {
        color: '#59ad35',
        backgroundColor: 'rgba(120,201,72,.11)',
      }
    }

    return {
      color: '#55596b',
      backgroundColor: '#f2f3f5',
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        color: '#202337',

        background:
          'radial-gradient(circle at 5% 5%, rgba(120,201,72,.07), transparent 23%), radial-gradient(circle at 95% 12%, rgba(24,170,163,.07), transparent 24%), #f7f9f6',
      }}
    >
      {/* TOP BAR */}

      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 30,

          backgroundColor: 'rgba(255,255,255,.95)',
          backdropFilter: 'blur(20px)',

          borderBottom: '1px solid #e9ece7',

          boxShadow:
            '0 5px 24px rgba(23,24,44,.045)',
        }}
      >
        <Box
          sx={{
            height: 5,

            background:
              'linear-gradient(90deg, #78c948 0%, #78c948 45%, #18aaa3 100%)',
          }}
        />

        <Container maxWidth="xl">
          <Box
            sx={{
              minHeight: 76,

              display: 'flex',
              alignItems: 'center',

              gap: 2,
            }}
          >
            {/* Logo */}

            <Box
              component="img"
              src="/aristocrat_interactive_logo.png"
              alt="Aristocrat Interactive"
              sx={{
                width: {
                  xs: 110,
                  sm: 145,
                },

                height: 52,

                objectFit: 'contain',
                objectPosition: 'left center',

                flexShrink: 0,
              }}
            />

            <Box
              sx={{
                width: '1px',
                height: 33,

                display: {
                  xs: 'none',
                  sm: 'block',
                },

                backgroundColor: '#e4e7e3',
              }}
            />

            <Box
              sx={{
                flexGrow: 1,

                display: {
                  xs: 'none',
                  sm: 'block',
                },
              }}
            >
              <Typography
                sx={{
                  color: '#202337',

                  fontSize: '0.95rem',

                  fontWeight: 900,

                  lineHeight: 1.1,
                }}
              >
                Smart Office
              </Typography>

              <Typography
                sx={{
                  marginTop: 0.3,

                  color: '#159f99',

                  fontSize: '0.63rem',

                  fontWeight: 900,

                  letterSpacing: '0.12em',

                  textTransform: 'uppercase',
                }}
              >
                Workplace Management
              </Typography>
            </Box>

            {/* Online indicator */}

            <Box
              sx={{
                display: {
                  xs: 'none',
                  md: 'flex',
                },

                alignItems: 'center',

                gap: 0.8,

                paddingX: 1.4,
                paddingY: 0.75,

                borderRadius: '999px',

                backgroundColor:
                  'rgba(120,201,72,.08)',

                border:
                  '1px solid rgba(120,201,72,.16)',
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,

                  borderRadius: '50%',

                  backgroundColor: '#78c948',

                  boxShadow:
                    '0 0 10px rgba(120,201,72,.75)',
                }}
              />

              <Typography
                sx={{
                  color: '#4c9932',

                  fontSize: '0.66rem',

                  fontWeight: 900,

                  letterSpacing: '0.08em',
                }}
              >
                ONLINE
              </Typography>
            </Box>

            {/* User */}

            <Box
              sx={{
                display: 'flex',

                alignItems: 'center',

                gap: 1.2,
              }}
            >
              <Box
                sx={{
                  display: {
                    xs: 'none',
                    sm: 'block',
                  },

                  textAlign: 'right',
                }}
              >
                <Typography
                  sx={{
                    color: '#202337',

                    fontSize: '0.8rem',

                    fontWeight: 800,
                  }}
                >
                  {authStore.user?.name}
                </Typography>

                <Typography
                  sx={{
                    marginTop: 0.1,

                    color: authStore.isAdmin
                      ? '#59ad35'
                      : '#8c909c',

                    fontSize: '0.68rem',

                    fontWeight: 700,
                  }}
                >
                  {authStore.user?.role}
                </Typography>
              </Box>

              <Avatar
                sx={{
                  width: 40,
                  height: 40,

                  color: '#202337',

                  fontSize: '0.9rem',

                  fontWeight: 900,

                  background:
                    'linear-gradient(145deg, #eff9eb, #eaf8f7)',

                  border:
                    '1px solid rgba(120,201,72,.24)',
                }}
              >
                {authStore.user?.name
                  ?.charAt(0)
                  .toUpperCase()}
              </Avatar>

              <Tooltip title="Logout">
                <IconButton
                  onClick={handleLogout}
                  sx={{
                    color: '#7b7f8d',

                    '&:hover': {
                      color: '#d65050',

                      backgroundColor: '#fff0f0',
                    },
                  }}
                >
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* PAGE */}

      <Container
        maxWidth="xl"
        sx={{
          paddingTop: {
            xs: 3,
            md: 4,
          },

          paddingBottom: 6,
        }}
      >
        {/* HERO */}

        <Paper
          elevation={0}
          sx={{
            position: 'relative',

            overflow: 'hidden',

            padding: {
              xs: 3,
              md: 4,
            },

            marginBottom: 3,

            borderRadius: '26px',

            color: '#ffffff',

            background:
              'linear-gradient(112deg, #17182c 0%, #202238 55%, #174c49 125%)',

            boxShadow:
              '0 24px 60px rgba(23,24,44,.16)',
          }}
        >
          {/* Decoration */}

          <Box
            sx={{
              position: 'absolute',

              width: 250,
              height: 250,

              right: -80,
              top: -120,

              borderRadius: '50%',

              border:
                '50px solid rgba(120,201,72,.12)',
            }}
          />

          <Box
            sx={{
              position: 'absolute',

              width: 150,
              height: 150,

              right: 150,
              bottom: -100,

              borderRadius: '50%',

              backgroundColor:
                'rgba(24,170,163,.10)',
            }}
          />

          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Typography
              sx={{
                color: '#78c948',

                fontSize: '0.68rem',

                fontWeight: 900,

                letterSpacing: '0.18em',

                textTransform: 'uppercase',
              }}
            >
              Aristocrat Smart Office
            </Typography>

            <Box
              sx={{
                marginTop: 0.7,

                display: 'flex',

                flexDirection: {
                  xs: 'column',
                  md: 'row',
                },

                justifyContent: 'space-between',

                alignItems: {
                  xs: 'flex-start',
                  md: 'flex-end',
                },

                gap: 3,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    color: '#ffffff',

                    fontSize: {
                      xs: '2rem',
                      md: '2.75rem',
                    },

                    lineHeight: 1.08,

                    fontWeight: 900,

                    letterSpacing: '-0.045em',
                  }}
                >
                  Your workplace,
                  <br />

                  <Box
                    component="span"
                    sx={{
                      color: '#78c948',
                    }}
                  >
                    organized smarter.
                  </Box>
                </Typography>

                <Typography
                  sx={{
                    maxWidth: 600,

                    marginTop: 1,

                    color: '#b7bbc6',

                    fontSize: '0.92rem',

                    lineHeight: 1.6,
                  }}
                >
                  Manage meeting rooms, desks and shared
                  resources from one connected workspace.
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',

                  gap: 1.2,

                  flexWrap: 'wrap',
                }}
              >
                <Button
                  variant="outlined"

                  startIcon={<RefreshIcon />}

                  onClick={handleRefresh}

                  sx={{
                    minHeight: 44,

                    paddingX: 2.1,

                    borderRadius: '12px',

                    color: '#ffffff',

                    borderColor:
                      'rgba(255,255,255,.25)',

                    textTransform: 'none',

                    fontWeight: 800,

                    '&:hover': {
                      color: '#ffffff',

                      borderColor: '#78c948',

                      backgroundColor:
                        'rgba(120,201,72,.08)',
                    },
                  }}
                >
                  Refresh
                </Button>

                {authStore.isAdmin && (
                  <Button
                    variant="contained"

                    startIcon={<AddIcon />}

                    onClick={() =>
                      setDialogOpen(true)
                    }

                    sx={{
                      minHeight: 44,

                      paddingX: 2.3,

                      borderRadius: '12px',

                      color: '#182012',

                      textTransform: 'none',

                      fontWeight: 900,

                      background:
                        'linear-gradient(100deg, #78c948, #8bd65b)',

                      boxShadow:
                        '0 12px 26px rgba(120,201,72,.22)',

                      '&:hover': {
                        background:
                          'linear-gradient(100deg, #6abd3d, #7dcb50)',

                        boxShadow:
                          '0 14px 30px rgba(120,201,72,.31)',
                      },
                    }}
                  >
                    Add Resource
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* SUMMARY */}

        <Box
          sx={{
            display: 'grid',

            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            },

            gap: 2,

            marginBottom: 3,
          }}
        >
          <SummaryCard
            title="Total Resources"
            value={totalAssets}
            subtitle="Registered assets"
            icon={<Inventory2OutlinedIcon />}
            accent="#202337"
          />

          <SummaryCard
            title="Available"
            value={availableAssets}
            subtitle="Ready for use"
            icon={<Inventory2OutlinedIcon />}
            accent="#78c948"
          />

          <SummaryCard
            title="Meeting Rooms"
            value={rooms}
            subtitle="Shared rooms"
            icon={<MeetingRoomOutlinedIcon />}
            accent="#18aaa3"
          />

          <SummaryCard
            title="Desks"
            value={desks}
            subtitle="Work stations"
            icon={<DeskOutlinedIcon />}
            accent="#687085"
          />
        </Box>

        {/* ERROR */}

        {assetStore.error && (
          <Alert
            severity="error"
            sx={{
              marginBottom: 3,

              borderRadius: '14px',
            }}
          >
            {assetStore.error}
          </Alert>
        )}

        {/* ASSETS */}

        <Paper
          elevation={0}
          sx={{
            overflow: 'hidden',

            borderRadius: '22px',

            border: '1px solid #e5e9e3',

            backgroundColor: '#ffffff',

            boxShadow:
              '0 18px 52px rgba(23,24,44,.055)',
          }}
        >
          {/* Table header */}

          <Box
            sx={{
              paddingX: {
                xs: 2,
                md: 3,
              },

              paddingY: 2.4,

              display: 'flex',

              justifyContent: 'space-between',

              alignItems: 'center',

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
                {totalAssets}{' '}
                {totalAssets === 1
                  ? 'resource'
                  : 'resources'}{' '}
                registered
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
                  width: 7,
                  height: 7,

                  borderRadius: '50%',

                  backgroundColor: '#78c948',

                  boxShadow:
                    '0 0 10px rgba(120,201,72,.7)',
                }}
              />

              <Typography
                sx={{
                  color: '#559b39',

                  fontSize: '0.67rem',

                  fontWeight: 900,

                  letterSpacing: '0.08em',
                }}
              >
                {assetStore.loading
                  ? 'SYNCING'
                  : 'LIVE DATA'}
              </Typography>
            </Box>
          </Box>

          {assetStore.loading && totalAssets === 0 ? (
            <Box
              sx={{
                paddingY: 9,

                display: 'flex',

                flexDirection: 'column',

                alignItems: 'center',

                gap: 1.5,
              }}
            >
              <CircularProgress
                size={30}

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
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: '#fafbfa',
                    }}
                  >
                    {[
                      'Resource',
                      'Type',
                      'Floor',
                      'Status',
                      'Created',
                    ].map((title) => (
                      <TableCell
                        key={title}
                        sx={{
                          paddingY: 1.7,

                          color: '#7b7f8c',

                          borderColor: '#e9ece8',

                          fontSize: '0.68rem',

                          fontWeight: 900,

                          letterSpacing: '0.08em',

                          textTransform: 'uppercase',
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

                          borderColor: '#e9ece8',

                          fontSize: '0.68rem',

                          fontWeight: 900,

                          letterSpacing: '0.08em',

                          textTransform: 'uppercase',
                        }}
                      >
                        Actions
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {assetStore.assets.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={
                          authStore.isAdmin ? 6 : 5
                        }
                        sx={{
                          borderBottom: 0,
                        }}
                      >
                        <Box
                          sx={{
                            paddingY: 7,

                            textAlign: 'center',
                          }}
                        >
                          <Box
                            sx={{
                              width: 62,
                              height: 62,

                              marginX: 'auto',
                              marginBottom: 1.5,

                              borderRadius: '18px',

                              display: 'flex',

                              alignItems: 'center',

                              justifyContent: 'center',

                              color: '#59ad35',

                              backgroundColor:
                                'rgba(120,201,72,.10)',
                            }}
                          >
                            <Inventory2OutlinedIcon
                              sx={{
                                fontSize: 31,
                              }}
                            />
                          </Box>

                          <Typography
                            sx={{
                              color: '#202337',

                              fontWeight: 900,
                            }}
                          >
                            No resources yet
                          </Typography>

                          <Typography
                            sx={{
                              marginTop: 0.4,

                              color: '#989ba6',

                              fontSize: '0.8rem',
                            }}
                          >
                            {authStore.isAdmin
                              ? 'Add your first Smart Office resource.'
                              : 'No resources are currently registered.'}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    assetStore.assets.map((asset) => {
                      const assetColors =
                        getAssetColors(asset.type)

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
                              borderColor: '#eef0ed',
                            },

                            '&:hover': {
                              backgroundColor:
                                'rgba(120,201,72,.035)',
                            },

                            '&:hover td:first-of-type': {
                              boxShadow:
                                'inset 3px 0 0 #78c948',
                            },

                            '&:last-child td': {
                              borderBottom: 0,
                            },
                          }}
                        >
                          {/* Resource */}

                          <TableCell>
                            <Box
                              sx={{
                                display: 'flex',

                                alignItems: 'center',

                                gap: 1.3,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 39,
                                  height: 39,

                                  flexShrink: 0,

                                  borderRadius: '12px',

                                  display: 'flex',

                                  alignItems: 'center',

                                  justifyContent: 'center',

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
                                    color: '#202337',

                                    fontSize: '0.86rem',

                                    fontWeight: 800,
                                  }}
                                >
                                  {asset.name}
                                </Typography>

                                <Typography
                                  sx={{
                                    marginTop: 0.15,

                                    color: '#a0a3ad',

                                    fontSize: '0.67rem',
                                  }}
                                >
                                  Smart Office Resource
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          {/* Type */}

                          <TableCell>
                            <Typography
                              sx={{
                                color: '#646878',

                                fontSize: '0.82rem',

                                fontWeight: 600,
                              }}
                            >
                              {asset.type === 'Room'
                                ? 'Meeting Room'
                                : asset.type}
                            </Typography>
                          </TableCell>

                          {/* Floor */}

                          <TableCell>
                            <Chip
                              label={asset.location}
                              size="small"
                              sx={{
                                height: 27,

                                color: '#55596a',

                                backgroundColor: '#f4f5f4',

                                border:
                                  '1px solid #e6e9e5',

                                fontSize: '0.71rem',

                                fontWeight: 800,
                              }}
                            />
                          </TableCell>

                          {/* Status */}

                          <TableCell>
                            <Chip
                              label={asset.status}
                              variant="outlined"
                              size="small"
                              sx={{
                                ...getStatusStyle(
                                  asset.status
                                ),

                                height: 28,

                                fontSize: '0.7rem',

                                fontWeight: 800,
                              }}
                            />
                          </TableCell>

                          {/* Created */}

                          <TableCell>
                            <Typography
                              sx={{
                                color: '#9295a0',

                                fontSize: '0.78rem',
                              }}
                            >
                              {asset.createdAt
                                ? new Date(
                                    asset.createdAt
                                  ).toLocaleString()
                                : '—'}
                            </Typography>
                          </TableCell>

                          {/* Actions */}

                          {authStore.isAdmin && (
                            <TableCell align="right">
                              <Tooltip title="Delete resource">
                                <span>
                                  <IconButton
                                    disabled={
                                      !asset.id ||
                                      deletingId === asset.id
                                    }
                                    onClick={() => {
                                      if (asset.id) {
                                        void handleDelete(
                                          asset.id,
                                          asset.name
                                        )
                                      }
                                    }}
                                    sx={{
                                      width: 36,
                                      height: 36,

                                      color: '#d85959',

                                      borderRadius: '10px',

                                      '&:hover': {
                                        color: '#cc3e3e',

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
                                          fontSize: 20,
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
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* FOOTER */}

        <Box
          sx={{
            marginTop: 2.5,

            display: 'flex',

            alignItems: 'center',

            justifyContent: 'center',

            gap: 1,
          }}
        >
          <Box
            component="img"
            src="/aristocrat_interactive_logo.png"
            alt=""
            sx={{
              width: 58,
              height: 30,

              objectFit: 'contain',

              opacity: 0.35,
            }}
          />

          <Typography
            sx={{
              color: '#b1b4bc',

              fontSize: '0.65rem',

              letterSpacing: '0.08em',
            }}
          >
            SMART OFFICE
          </Typography>
        </Box>
      </Container>

      <AddAssetDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </Box>
  )
})

interface SummaryCardProps {
  title: string
  value: number
  subtitle: string
  icon: ReactNode
  accent: string
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  accent,
}: SummaryCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',

        minHeight: 158,

        overflow: 'hidden',

        padding: 2.5,

        borderRadius: '19px',

        border: '1px solid #e5e9e3',

        backgroundColor: '#ffffff',

        boxShadow:
          '0 14px 40px rgba(23,24,44,.045)',

        transition:
          'transform .2s ease, box-shadow .2s ease',

        '&::after': {
          content: '""',

          position: 'absolute',

          width: 90,
          height: 90,

          right: -35,
          top: -35,

          borderRadius: '50%',

          backgroundColor: `${accent}14`,
        },

        '&:hover': {
          transform: 'translateY(-3px)',

          boxShadow:
            '0 20px 45px rgba(23,24,44,.075)',
        },
      }}
    >
      <Box
        sx={{
          width: 43,
          height: 43,

          borderRadius: '13px',

          display: 'flex',

          alignItems: 'center',

          justifyContent: 'center',

          color: accent,

          backgroundColor: `${accent}12`,

          position: 'relative',
          zIndex: 1,
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          marginTop: 1.5,

          color: '#777b89',

          fontSize: '0.69rem',

          fontWeight: 900,

          letterSpacing: '0.07em',

          textTransform: 'uppercase',
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          marginTop: 0.15,

          color: '#202337',

          fontSize: '2rem',

          lineHeight: 1,

          fontWeight: 900,

          letterSpacing: '-0.03em',
        }}
      >
        {value}
      </Typography>

      <Typography
        sx={{
          marginTop: 0.55,

          color: '#a0a3ad',

          fontSize: '0.72rem',
        }}
      >
        {subtitle}
      </Typography>
    </Paper>
  )
}

export default DashboardPage