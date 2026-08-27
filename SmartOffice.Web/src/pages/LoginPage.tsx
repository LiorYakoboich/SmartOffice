import { useState } from 'react'
import type { FormEvent } from 'react'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from '@mui/material'

import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined'

import { authStore } from '../stores/AuthStore'

interface LoginPageProps {
  onShowRegister: () => void
}

function LoginPage({
  onShowRegister,
}: LoginPageProps) {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    try {
      await authStore.login(name, password)
    } catch {
      // Error is displayed from AuthStore.
    }
  }

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      minHeight: 54,
      color: '#202337',
      borderRadius: '15px',
      backgroundColor: '#ffffff',
      transition: 'all .2s ease',

      '& fieldset': {
        borderColor: '#e3e7e2',
      },

      '&:hover fieldset': {
        borderColor: 'rgba(19, 166, 157, 0.55)',
      },

      '&.Mui-focused': {
        boxShadow:
          '0 0 0 4px rgba(120, 201, 72, 0.11)',
      },

      '&.Mui-focused fieldset': {
        borderColor: '#78c948',
      },

      '& input': {
        color: '#202337',
        fontWeight: 600,
        fontSize: '0.95rem',
      },

      '& input::placeholder': {
        color: '#a8abb4',
        opacity: 1,
      },

      '& input:-webkit-autofill': {
        WebkitBoxShadow:
          '0 0 0 1000px #ffffff inset !important',
        WebkitTextFillColor:
          '#202337 !important',
        caretColor: '#202337',
      },

      '& input:-webkit-autofill:hover': {
        WebkitBoxShadow:
          '0 0 0 1000px #ffffff inset !important',
        WebkitTextFillColor:
          '#202337 !important',
      },

      '& input:-webkit-autofill:focus': {
        WebkitBoxShadow:
          '0 0 0 1000px #ffffff inset !important',
        WebkitTextFillColor:
          '#202337 !important',
      },
    },
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100dvh',
        minHeight: 0,

        paddingX: {
          xs: 2,
          md: 5,
        },

        paddingY: 2,

        position: 'relative',

        overflow: {
          xs: 'auto',
          md: 'hidden',
        },

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        background:
          'linear-gradient(135deg, #ffffff 0%, #f8fbf5 45%, #f3fbfa 100%)',
      }}
    >
      {/* Decorative background */}

      <Box
        sx={{
          position: 'absolute',
          width: 430,
          height: 430,
          left: -240,
          bottom: -230,
          borderRadius: '50%',
          border:
            '75px solid rgba(120, 201, 72, 0.075)',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          width: 370,
          height: 370,
          right: -200,
          top: -190,
          borderRadius: '50%',
          backgroundColor:
            'rgba(20, 169, 161, 0.055)',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          width: 10,
          height: 140,
          right: '7%',
          top: '9%',
          borderRadius: '999px',

          background:
            'linear-gradient(180deg, #78c948, #1aa9a1)',

          opacity: 0.72,
        }}
      />

      {/* Main layout */}

      <Box
        sx={{
          width: '100%',
          maxWidth: 1210,

          position: 'relative',
          zIndex: 1,

          display: 'grid',

          gridTemplateColumns: {
            xs: '1fr',
            md: '1.12fr 0.88fr',
          },

          gap: {
            xs: 3,
            md: 8,
          },

          alignItems: 'center',
        }}
      >
        {/* LEFT SIDE */}

        <Box
          sx={{
            display: {
              xs: 'none',
              md: 'block',
            },
          }}
        >
          {/* Aristocrat logo */}

          <Box
            component="img"
            src="/aristocrat_interactive_logo.png"
            alt="Aristocrat Interactive"
            sx={{
              width: {
                md: 210,
                lg: 245,
              },
              height: 'auto',
              maxHeight: 105,
              objectFit: 'contain',
              objectPosition: 'left center',
              display: 'block',
              marginBottom: 2.6,
            }}
          />

          <Typography
            sx={{
              color: '#159f99',

              fontSize: '0.72rem',
              fontWeight: 900,

              letterSpacing: '0.2em',
              textTransform: 'uppercase',

              marginBottom: 1.3,
            }}
          >
            Smart Office
          </Typography>

          <Typography
            sx={{
              maxWidth: 700,

              color: '#191b30',

              fontSize: {
                md: '3.3rem',
                lg: '3.9rem',
              },

              lineHeight: 1,

              fontWeight: 900,

              letterSpacing: '-0.055em',

              '@media (max-height: 780px)': {
                fontSize: {
                  md: '2.9rem',
                  lg: '3.4rem',
                },
              },
            }}
          >
            A smarter way
            <br />

            to experience
            <br />

            <Box
              component="span"
              sx={{
                background:
                  'linear-gradient(90deg, #58ae35 0%, #7aca48 43%, #19aaa3 100%)',

                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',

                color: 'transparent',
              }}
            >
              your workplace.
            </Box>
          </Typography>

          <Typography
            sx={{
              maxWidth: 575,

              marginTop: 2.3,

              color: '#7d8190',

              fontSize: '0.98rem',
              lineHeight: 1.75,
            }}
          >
            Manage meeting rooms, desks and shared resources
            from one connected Smart Office workspace.
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',

              gap: 1.1,

              marginTop: 2.8,
            }}
          >
            <Box
              sx={{
                width: 9,
                height: 9,

                borderRadius: '50%',

                backgroundColor: '#78c948',

                boxShadow:
                  '0 0 15px rgba(120,201,72,.85)',
              }}
            />

            <Typography
              sx={{
                color: '#4d9f32',

                fontSize: '0.72rem',
                fontWeight: 900,

                letterSpacing: '0.12em',
              }}
            >
              SMART OFFICE ONLINE
            </Typography>
          </Box>
        </Box>

        {/* LOGIN CARD */}

        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 475,

            marginX: 'auto',

            padding: {
              xs: 3,
              sm: 3.8,
            },

            position: 'relative',
            overflow: 'hidden',

            borderRadius: '28px',

            color: '#202337',

            background:
              'rgba(255, 255, 255, 0.94)',

            backdropFilter: 'blur(24px)',

            border:
              '1px solid rgba(30, 32, 48, 0.07)',

            boxShadow:
              '0 34px 90px rgba(30, 32, 48, 0.12)',

            '&::before': {
              content: '""',

              position: 'absolute',

              top: 0,
              left: 0,
              right: 0,

              height: '5px',

              background:
                'linear-gradient(90deg, #78c948 0%, #78c948 45%, #18aaa3 100%)',
            },
          }}
        >
          {/* Card top */}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',

              gap: 2,

              marginBottom: 2,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,

                flexShrink: 0,

                borderRadius: '14px',

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',

                color: '#58ae35',

                backgroundColor:
                  'rgba(120, 201, 72, 0.11)',
              }}
            >
              <LockOutlinedIcon />
            </Box>

            <Box
              component="img"
              src="/aristocrat_interactive_logo.png"
              alt="Aristocrat Interactive"
              sx={{
                width: 125,
                height: 52,
                objectFit: 'contain',
                objectPosition: 'right center',
                display: 'block',
              }}
            />
          </Box>

          <Typography
            sx={{
              color: '#159f99',

              fontSize: '0.67rem',
              fontWeight: 900,

              letterSpacing: '0.17em',
              textTransform: 'uppercase',
            }}
          >
            Secure Access
          </Typography>

          <Typography
            sx={{
              marginTop: 0.4,

              color: '#191b30',

              fontSize: '2rem',
              fontWeight: 900,

              letterSpacing: '-0.045em',
            }}
          >
            Welcome back
          </Typography>

          <Typography
            sx={{
              marginTop: 0.4,
              marginBottom: 2.1,

              color: '#8b8e9c',

              fontSize: '0.86rem',
            }}
          >
            Sign in to your Smart Office workspace.
          </Typography>

          {authStore.error && (
            <Alert
              severity="error"
              sx={{
                marginBottom: 2,
                borderRadius: '13px',
              }}
            >
              {authStore.error}
            </Alert>
          )}

          {/* Login form */}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: 'grid',
              gap: 1.8,
            }}
          >
            {/* Username */}

            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',

                  gap: 0.7,

                  marginBottom: 0.55,
                }}
              >
                <PersonOutlinedIcon
                  sx={{
                    color: '#58ae35',
                    fontSize: 17,
                  }}
                />

                <Typography
                  sx={{
                    color: '#555968',

                    fontSize: '0.72rem',
                    fontWeight: 900,

                    letterSpacing: '0.07em',
                  }}
                >
                  USERNAME
                </Typography>
              </Box>

              <TextField
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Enter your username"
                required
                fullWidth
                autoComplete="username"
                sx={inputStyle}
              />
            </Box>

            {/* Password */}

            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',

                  gap: 0.7,

                  marginBottom: 0.55,
                }}
              >
                <KeyOutlinedIcon
                  sx={{
                    color: '#18aaa3',
                    fontSize: 17,
                  }}
                />

                <Typography
                  sx={{
                    color: '#555968',

                    fontSize: '0.72rem',
                    fontWeight: 900,

                    letterSpacing: '0.07em',
                  }}
                >
                  PASSWORD
                </Typography>
              </Box>

              <TextField
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                required
                fullWidth
                autoComplete="current-password"
                sx={inputStyle}
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              disabled={authStore.loading}
              sx={{
                minHeight: 50,

                marginTop: 0.5,

                borderRadius: '14px',

                color: '#182014',

                textTransform: 'none',

                fontSize: '0.93rem',
                fontWeight: 900,

                background:
                  'linear-gradient(100deg, #78c948 0%, #8ad45b 55%, #69cf82 110%)',

                boxShadow:
                  '0 14px 32px rgba(120,201,72,.25)',

                transition:
                  'all .2s ease',

                '&:hover': {
                  transform:
                    'translateY(-2px)',

                  background:
                    'linear-gradient(100deg, #6abe3c 0%, #7cca50 55%, #55c775 110%)',

                  boxShadow:
                    '0 17px 38px rgba(120,201,72,.34)',
                },
              }}
            >
              {authStore.loading ? (
                <CircularProgress
                  size={22}
                  color="inherit"
                />
              ) : (
                'Enter Smart Office'
              )}
            </Button>
          </Box>

          {/* Register */}

          <Box
            sx={{
              marginTop: 1.9,
              paddingTop: 1.5,

              textAlign: 'center',

              borderTop:
                '1px solid #eff1ee',
            }}
          >
            <Typography
              sx={{
                color: '#a0a3ad',
                fontSize: '0.8rem',
              }}
            >
              New here?
            </Typography>

            <Button
              onClick={onShowRegister}
              sx={{
                paddingY: 0.3,

                borderRadius: '9px',

                color: '#159f99',

                textTransform: 'none',

                fontWeight: 900,

                '&:hover': {
                  color: '#0d8984',

                  backgroundColor:
                    'rgba(24,170,163,.06)',
                },
              }}
            >
              Create an account
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}

export default LoginPage