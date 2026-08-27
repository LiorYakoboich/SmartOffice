import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { observer } from 'mobx-react-lite'

import {
  Alert,
  AppBar,
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
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'

import AddIcon from '@mui/icons-material/Add'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import RefreshIcon from '@mui/icons-material/Refresh'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined'
import DeskOutlinedIcon from '@mui/icons-material/DeskOutlined'

import { authStore } from '../stores/AuthStore'
import { assetStore } from '../stores/AssetStore'
import AddAssetDialog from '../components/AddAssetDialog'

const DashboardPage = observer(() => {
  const [dialogOpen, setDialogOpen] = useState(false)

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

  const getStatusColor = (
    status: string
  ): 'success' | 'warning' | 'default' => {
    if (status === 'Available') {
      return 'success'
    }

    if (status === 'Maintenance') {
      return 'warning'
    }

    return 'default'
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
      }}
    >
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: '#0f172a',
          borderBottom: '1px solid #1e293b',
        }}
      >
        <Toolbar
          sx={{
            minHeight: '76px !important',
          }}
        >
          <BusinessOutlinedIcon
            sx={{
              marginRight: 1.5,
              color: '#60a5fa',
            }}
          />

          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: 800,
              color: '#ffffff',
            }}
          >
            Smart Office
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                textAlign: 'right',
                display: {
                  xs: 'none',
                  sm: 'block',
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: '#ffffff',
                }}
              >
                {authStore.user?.name}
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  color: '#94a3b8',
                }}
              >
                {authStore.user?.role}
              </Typography>
            </Box>

            <Avatar
              sx={{
                backgroundColor: authStore.isAdmin
                  ? '#2563eb'
                  : '#475569',
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
                  color: '#ffffff',
                }}
              >
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="xl"
        sx={{
          paddingTop: 5,
          paddingBottom: 5,
        }}
      >
        {/* Header */}

        <Box
          sx={{
            display: 'flex',
            flexDirection: {
              xs: 'column',
              md: 'row',
            },
            justifyContent: 'space-between',
            alignItems: {
              xs: 'flex-start',
              md: 'center',
            },
            gap: 2,
            marginBottom: 4,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: '#0f172a',
              }}
            >
              Asset Management
            </Typography>

            <Typography
              sx={{
                marginTop: 0.5,
                color: '#64748b',
              }}
            >
              Monitor and manage shared office resources.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
            }}
          >
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
              }}
            >
              Refresh
            </Button>

            {authStore.isAdmin && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setDialogOpen(true)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                }}
              >
                Add Asset
              </Button>
            )}
          </Box>
        </Box>

        {/* Summary cards */}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 2.5,
            marginBottom: 4,
          }}
        >
          <SummaryCard
            title="Total Assets"
            value={totalAssets}
            icon={<Inventory2OutlinedIcon />}
          />

          <SummaryCard
            title="Available"
            value={availableAssets}
            icon={<Inventory2OutlinedIcon />}
          />

          <SummaryCard
            title="Rooms"
            value={rooms}
            icon={<MeetingRoomOutlinedIcon />}
          />

          <SummaryCard
            title="Desks"
            value={desks}
            icon={<DeskOutlinedIcon />}
          />
        </Box>

        {/* Error */}

        {assetStore.error && (
          <Alert
            severity="error"
            sx={{
              marginBottom: 3,
            }}
          >
            {assetStore.error}
          </Alert>
        )}

        {/* Assets table */}

        <Paper
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              paddingX: 3,
              paddingY: 2.5,
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: '#0f172a',
              }}
            >
              Office Assets
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
              }}
            >
              {totalAssets} resources registered
            </Typography>
          </Box>

          {assetStore.loading && totalAssets === 0 ? (
            <Box
              sx={{
                paddingY: 10,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: '#f8fafc',
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 800,
                      }}
                    >
                      Asset
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight: 800,
                      }}
                    >
                      Type
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight: 800,
                      }}
                    >
                      Location
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight: 800,
                      }}
                    >
                      Status
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight: 800,
                      }}
                    >
                      Created
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {assetStore.assets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Box
                          sx={{
                            paddingY: 7,
                            textAlign: 'center',
                          }}
                        >
                          <Inventory2OutlinedIcon
                            sx={{
                              fontSize: 48,
                              color: '#94a3b8',
                              marginBottom: 1,
                            }}
                          />

                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: '#0f172a',
                            }}
                          >
                            No assets yet
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              color: '#64748b',
                              marginTop: 0.5,
                            }}
                          >
                            {authStore.isAdmin
                              ? 'Create your first office asset.'
                              : 'No office assets are currently available.'}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    assetStore.assets.map((asset) => (
                      <TableRow
                        key={asset.id ?? `${asset.name}-${asset.location}`}
                        hover
                        sx={{
                          '&:last-child td': {
                            borderBottom: 0,
                          },
                        }}
                      >
                        <TableCell>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: '#0f172a',
                            }}
                          >
                            {asset.name}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          {asset.type}
                        </TableCell>

                        <TableCell>
                          {asset.location}
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={asset.status}
                            color={getStatusColor(
                              asset.status
                            )}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>

                        <TableCell>
                          {asset.createdAt
                            ? new Date(
                                asset.createdAt
                              ).toLocaleString()
                            : '—'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
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
  icon: ReactNode
}

function SummaryCard({
  title,
  value,
  icon,
}: SummaryCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        padding: 3,
        borderRadius: 3,
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          backgroundColor: '#eff6ff',
          color: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 2,
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          color: '#64748b',
          fontWeight: 600,
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="h4"
        sx={{
          marginTop: 0.5,
          fontWeight: 800,
          color: '#0f172a',
        }}
      >
        {value}
      </Typography>
    </Paper>
  )
}

export default DashboardPage