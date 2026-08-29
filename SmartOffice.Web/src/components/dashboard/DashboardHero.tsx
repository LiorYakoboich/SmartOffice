import { Box, Button, Paper, Typography } from '@mui/material'

import AddIcon from '@mui/icons-material/Add'
import RefreshIcon from '@mui/icons-material/Refresh'

import { authStore } from '../../stores/AuthStore'
import { assetStore } from '../../stores/AssetStore'
import { reservationStore } from '../../stores/ReservationStore'

interface DashboardHeroProps {
  onAddResource: () => void
}

function DashboardHero({
  onAddResource,
}: DashboardHeroProps) {
  const handleRefresh = () => {
    void Promise.all([
      assetStore.loadAssets(),
      reservationStore.loadReservations(),
      reservationStore.loadMyReservations(),
    ])
  }

  return (
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
      {/* DECORATION */}

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

      {/* CONTENT */}

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
          {/* TEXT */}

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
                maxWidth: 650,

                marginTop: 1,

                color: '#b7bbc6',

                fontSize: '0.92rem',

                lineHeight: 1.6,
              }}
            >
              Find a meeting room, reserve it instantly and
              manage your workplace resources from one
              connected workspace.
            </Typography>
          </Box>

          {/* ACTIONS */}

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
                onClick={onAddResource}
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
  )
}

export default DashboardHero