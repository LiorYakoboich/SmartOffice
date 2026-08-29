import { observer } from 'mobx-react-lite'

import {
  Avatar,
  Box,
  Container,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'

import LogoutIcon from '@mui/icons-material/Logout'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'

import { authStore } from '../../stores/AuthStore'
import { assetStore } from '../../stores/AssetStore'
import { reservationStore } from '../../stores/ReservationStore'

const DashboardHeader = observer(() => {
  const myFutureReservations =
    reservationStore.myReservations.filter(
      (reservation) =>
        new Date(reservation.endTimeUtc) > new Date()
    ).length

  const handleLogout = () => {
    assetStore.clear()
    reservationStore.clear()
    authStore.logout()
  }

  return (
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
      {/* BRAND STRIPE */}

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
          {/* LOGO */}

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

              flexShrink: 0,

              objectFit: 'contain',

              objectPosition: 'left center',
            }}
          />

          {/* DIVIDER */}

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

          {/* APP NAME */}

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

          {/* MY BOOKINGS */}

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

              color: '#117f7b',

              backgroundColor:
                'rgba(24,170,163,.07)',

              border:
                '1px solid rgba(24,170,163,.14)',
            }}
          >
            <CalendarMonthOutlinedIcon
              sx={{
                color: '#159f99',

                fontSize: 17,
              }}
            />

            <Typography
              sx={{
                color: '#117f7b',

                fontSize: '0.68rem',

                fontWeight: 900,
              }}
            >
              {myFutureReservations}{' '}
              {myFutureReservations === 1
                ? 'BOOKING'
                : 'BOOKINGS'}
            </Typography>
          </Box>

          {/* ONLINE */}

          <Box
            sx={{
              display: {
                xs: 'none',
                lg: 'flex',
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

          {/* USER */}

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
                    : '#159f99',

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

                    backgroundColor:
                      '#fff0f0',
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
  )
})

export default DashboardHeader