import { useState } from 'react'
import type { FormEvent } from 'react'

import { observer } from 'mobx-react-lite'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from '@mui/material'

import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'

import { authStore } from '../stores/AuthStore'

interface RegisterPageProps {
  onShowLogin: () => void
}

const RegisterPage = observer(
  ({
    onShowLogin,
  }: RegisterPageProps) => {
    const [
      firstName,
      setFirstName,
    ] = useState('')

    const [
      lastName,
      setLastName,
    ] = useState('')

    const [
      username,
      setUsername,
    ] = useState('')

    const [
      password,
      setPassword,
    ] = useState('')

    const [
      confirmPassword,
      setConfirmPassword,
    ] = useState('')

    const [
      localError,
      setLocalError,
    ] = useState('')

    const [
      success,
      setSuccess,
    ] = useState(false)

    const handleSubmit = async (
      event: FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault()

      setLocalError('')

      setSuccess(false)

      authStore.error = ''

      /*
        Reading the real values from the
        form also makes browser autofill
        reliable.
      */

      const formData =
        new FormData(
          event.currentTarget
        )

      const submittedFirstName =
        String(
          formData.get(
            'firstName'
          ) ?? ''
        ).trim()

      const submittedLastName =
        String(
          formData.get(
            'lastName'
          ) ?? ''
        ).trim()

      const submittedUsername =
        String(
          formData.get(
            'username'
          ) ?? ''
        ).trim()

      const submittedPassword =
        String(
          formData.get(
            'password'
          ) ?? ''
        )

      const submittedConfirmPassword =
        String(
          formData.get(
            'confirmPassword'
          ) ?? ''
        )

      if (
        !submittedFirstName ||
        !submittedLastName ||
        !submittedUsername ||
        !submittedPassword ||
        !submittedConfirmPassword
      ) {
        setLocalError(
          'Please complete all fields.'
        )

        return
      }

      if (
        submittedFirstName.length <
        2
      ) {
        setLocalError(
          'Please enter a valid first name.'
        )

        return
      }

      if (
        submittedLastName.length <
        2
      ) {
        setLocalError(
          'Please enter a valid last name.'
        )

        return
      }

      if (
        submittedUsername.length <
        3
      ) {
        setLocalError(
          'Username must contain at least 3 characters.'
        )

        return
      }

      if (
        submittedPassword.length <
        6
      ) {
        setLocalError(
          'Password must contain at least 6 characters.'
        )

        return
      }

      if (
        submittedPassword !==
        submittedConfirmPassword
      ) {
        setLocalError(
          'Passwords do not match.'
        )

        return
      }

      setFirstName(
        submittedFirstName
      )

      setLastName(
        submittedLastName
      )

      setUsername(
        submittedUsername
      )

      setPassword(
        submittedPassword
      )

      setConfirmPassword(
        submittedConfirmPassword
      )

      try {
        await authStore.register(
          submittedFirstName,
          submittedLastName,
          submittedUsername,
          submittedPassword
        )

        setSuccess(true)

        window.setTimeout(
          () => {
            onShowLogin()
          },
          1100
        )
      } catch {
        // AuthStore displays API errors.
      }
    }

    const inputStyle = {
      '& .MuiOutlinedInput-root':
        {
          minHeight: 52,

          color: '#202337',

          borderRadius:
            '14px',

          backgroundColor:
            '#ffffff',

          transition:
            'all .2s ease',

          '& fieldset': {
            borderColor:
              '#e3e7e2',
          },

          '&:hover fieldset': {
            borderColor:
              'rgba(24,170,163,.50)',
          },

          '&.Mui-focused': {
            boxShadow:
              '0 0 0 4px rgba(120,201,72,.11)',
          },

          '&.Mui-focused fieldset':
            {
              borderColor:
                '#78c948',
            },

          '& input': {
            color: '#202337',

            fontWeight: 600,

            fontSize:
              '0.92rem',
          },

          '& input::placeholder':
            {
              color: '#a8abb4',

              opacity: 1,
            },

          '& input:-webkit-autofill':
            {
              WebkitBoxShadow:
                '0 0 0 1000px #ffffff inset !important',

              WebkitTextFillColor:
                '#202337 !important',

              caretColor:
                '#202337',
            },
        },
    }

    const fieldLabelStyle = {
      color: '#555968',

      fontSize: '0.69rem',

      fontWeight: 900,

      letterSpacing: '0.07em',
    }

    return (
      <Box
        sx={{
          width: '100%',

          minHeight: '100dvh',

          position: 'relative',

          overflowX: 'hidden',

          paddingX: {
            xs: 2,
            md: 5,
          },

          paddingTop: {
            xs: 3,
            md: 3,
          },

          paddingBottom: {
            xs: 4,
            md: 4,
          },

          display: 'flex',

          alignItems: 'center',

          justifyContent:
            'center',

          background:
            'linear-gradient(135deg, #ffffff 0%, #f8fbf5 45%, #f3fbfa 100%)',
        }}
      >
        {/* BACKGROUND */}

        <Box
          sx={{
            position: 'absolute',

            width: 430,
            height: 430,

            left: -240,
            bottom: -230,

            borderRadius: '50%',

            border:
              '75px solid rgba(120,201,72,.075)',

            pointerEvents: 'none',
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
              'rgba(20,169,161,.055)',

            pointerEvents: 'none',
          }}
        />

        {/* MAIN */}

        <Box
          sx={{
            width: '100%',

            maxWidth: 1210,

            position: 'relative',

            zIndex: 1,

            display: 'grid',

            gridTemplateColumns: {
              xs: '1fr',

              md: '1.05fr 0.95fr',
            },

            gap: {
              xs: 3,
              md: 7,
            },

            alignItems: 'center',

            marginY: 'auto',
          }}
        >
          {/* LEFT */}

          <Box
            sx={{
              display: {
                xs: 'none',
                md: 'block',
              },
            }}
          >
            <Box
              component="img"

              src="/aristocrat_interactive_logo.png"

              alt="Aristocrat Interactive"

              sx={{
                width: {
                  md: 210,
                  lg: 245,
                },

                maxHeight: 105,

                objectFit: 'contain',

                objectPosition:
                  'left center',

                display: 'block',

                marginBottom: 2.6,
              }}
            />

            <Typography
              sx={{
                color: '#159f99',

                fontSize: '0.72rem',

                fontWeight: 900,

                letterSpacing:
                  '0.2em',

                textTransform:
                  'uppercase',

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
                  md: '3rem',
                  lg: '3.55rem',
                },

                lineHeight: 1,

                fontWeight: 900,

                letterSpacing:
                  '-0.055em',
              }}
            >
              Your workplace
              <br />

              starts with
              <br />

              <Box
                component="span"
                sx={{
                  background:
                    'linear-gradient(90deg, #58ae35 0%, #7aca48 43%, #19aaa3 100%)',

                  WebkitBackgroundClip:
                    'text',

                  backgroundClip:
                    'text',

                  color:
                    'transparent',
                }}
              >
                one smart account.
              </Box>
            </Typography>

            <Typography
              sx={{
                maxWidth: 570,

                marginTop: 2.3,

                color: '#7d8190',

                fontSize: '0.98rem',

                lineHeight: 1.75,
              }}
            >
              Create your Smart Office
              account to reserve meeting
              rooms, manage your bookings
              and access shared workplace
              resources.
            </Typography>

            <Box
              sx={{
                marginTop: 2.6,

                display: 'grid',

                gap: 1.1,
              }}
            >
              {[
                'Book meeting rooms instantly',
                'Prevent overlapping reservations',
                'Manage all your bookings in one place',
              ].map((item) => (
                <Box
                  key={item}
                  sx={{
                    display: 'flex',

                    alignItems:
                      'center',

                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,

                      borderRadius:
                        '50%',

                      backgroundColor:
                        '#78c948',

                      boxShadow:
                        '0 0 12px rgba(120,201,72,.55)',
                    }}
                  />

                  <Typography
                    sx={{
                      color: '#666a78',

                      fontSize:
                        '0.82rem',

                      fontWeight: 700,
                    }}
                  >
                    {item}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* REGISTER CARD */}

          <Paper
            elevation={0}
            sx={{
              width: '100%',

              maxWidth: 500,

              marginX: 'auto',

              padding: {
                xs: 3,
                sm: 3.5,
              },

              position: 'relative',

              overflow: 'hidden',

              borderRadius: '28px',

              color: '#202337',

              background:
                'rgba(255,255,255,.95)',

              backdropFilter:
                'blur(24px)',

              border:
                '1px solid rgba(30,32,48,.07)',

              boxShadow:
                '0 34px 90px rgba(30,32,48,.12)',

              '&::before': {
                content: '""',

                position: 'absolute',

                top: 0,
                left: 0,
                right: 0,

                height: 5,

                background:
                  'linear-gradient(90deg, #78c948 0%, #78c948 45%, #18aaa3 100%)',
              },
            }}
          >
            {/* TOP */}

            <Box
              sx={{
                display: 'flex',

                alignItems: 'center',

                justifyContent:
                  'space-between',

                gap: 2,

                marginBottom: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 46,
                  height: 46,

                  borderRadius: '14px',

                  display: 'flex',

                  alignItems:
                    'center',

                  justifyContent:
                    'center',

                  color: '#58ae35',

                  backgroundColor:
                    'rgba(120,201,72,.11)',
                }}
              >
                <PersonAddOutlinedIcon />
              </Box>

              <Box
                component="img"

                src="/aristocrat_interactive_logo.png"

                alt="Aristocrat Interactive"

                sx={{
                  width: 120,

                  height: 48,

                  objectFit: 'contain',

                  objectPosition:
                    'right center',
                }}
              />
            </Box>

            <Typography
              sx={{
                color: '#159f99',

                fontSize: '0.65rem',

                fontWeight: 900,

                letterSpacing:
                  '0.17em',

                textTransform:
                  'uppercase',
              }}
            >
              Create Account
            </Typography>

            <Typography
              sx={{
                marginTop: 0.3,

                color: '#191b30',

                fontSize: '1.85rem',

                fontWeight: 900,

                letterSpacing:
                  '-0.045em',
              }}
            >
              Join Smart Office
            </Typography>

            <Typography
              sx={{
                marginTop: 0.3,

                marginBottom: 1.4,

                color: '#8b8e9c',

                fontSize: '0.82rem',
              }}
            >
              Tell us who you are and
              create your login credentials.
            </Typography>

            {/* MEMBER INFO */}

            <Box
              sx={{
                marginBottom: 1.5,

                paddingX: 1.4,

                paddingY: 1,

                display: 'flex',

                alignItems: 'center',

                gap: 1,

                borderRadius: '13px',

                background:
                  'linear-gradient(100deg, rgba(120,201,72,.07), rgba(24,170,163,.055))',

                border:
                  '1px solid rgba(120,201,72,.14)',
              }}
            >
              <VerifiedUserOutlinedIcon
                sx={{
                  color: '#58ad35',

                  fontSize: 20,
                }}
              />

              <Box>
                <Typography
                  sx={{
                    color: '#202337',

                    fontSize: '0.73rem',

                    fontWeight: 900,
                  }}
                >
                  Member Account
                </Typography>

                <Typography
                  sx={{
                    color: '#9295a0',

                    fontSize: '0.66rem',
                  }}
                >
                  Your full name will be
                  shown on room bookings
                </Typography>
              </Box>
            </Box>

            {(localError ||
              authStore.error) && (
              <Alert
                severity="error"

                sx={{
                  marginBottom: 1.5,

                  borderRadius: '13px',
                }}
              >
                {localError ||
                  authStore.error}
              </Alert>
            )}

            {success && (
              <Alert
                severity="success"

                sx={{
                  marginBottom: 1.5,

                  borderRadius: '13px',
                }}
              >
                Account created successfully.
                Redirecting to login...
              </Alert>
            )}

            {/* FORM */}

            <Box
              component="form"

              onSubmit={handleSubmit}

              sx={{
                display: 'grid',

                gap: 1.25,
              }}
            >
              {/* FIRST + LAST NAME */}

              <Box
                sx={{
                  display: 'grid',

                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: '1fr 1fr',
                  },

                  gap: 1.3,
                }}
              >
                {/* FIRST NAME */}

                <Box>
                  <Box
                    sx={{
                      display: 'flex',

                      alignItems:
                        'center',

                      gap: 0.55,

                      marginBottom:
                        0.45,
                    }}
                  >
                    <BadgeOutlinedIcon
                      sx={{
                        color:
                          '#58ae35',

                        fontSize: 16,
                      }}
                    />

                    <Typography
                      sx={
                        fieldLabelStyle
                      }
                    >
                      FIRST NAME
                    </Typography>
                  </Box>

                  <TextField
                    name="firstName"

                    value={firstName}

                    onChange={(event) =>
                      setFirstName(
                        event.target.value
                      )
                    }

                    placeholder="Enter first name"

                    fullWidth

                    required

                    autoComplete="given-name"

                    disabled={
                      authStore.loading ||
                      success
                    }

                    sx={inputStyle}
                  />
                </Box>

                {/* LAST NAME */}

                <Box>
                  <Typography
                    sx={{
                      ...fieldLabelStyle,

                      marginBottom:
                        0.45,

                      minHeight: 16,
                    }}
                  >
                    LAST NAME
                  </Typography>

                  <TextField
                    name="lastName"

                    value={lastName}

                    onChange={(event) =>
                      setLastName(
                        event.target.value
                      )
                    }

                    placeholder="Enter last name"

                    fullWidth

                    required

                    autoComplete="family-name"

                    disabled={
                      authStore.loading ||
                      success
                    }

                    sx={inputStyle}
                  />
                </Box>
              </Box>

              {/* USERNAME */}

              <Box>
                <Box
                  sx={{
                    display: 'flex',

                    alignItems: 'center',

                    gap: 0.55,

                    marginBottom: 0.45,
                  }}
                >
                  <PersonOutlinedIcon
                    sx={{
                      color: '#58ae35',

                      fontSize: 16,
                    }}
                  />

                  <Typography
                    sx={
                      fieldLabelStyle
                    }
                  >
                    USERNAME
                  </Typography>
                </Box>

                <TextField
                  name="username"

                  value={username}

                  onChange={(event) =>
                    setUsername(
                      event.target.value
                    )
                  }

                  placeholder="Choose your login username"

                  fullWidth

                  required

                  autoComplete="username"

                  disabled={
                    authStore.loading ||
                    success
                  }

                  sx={inputStyle}
                />
              </Box>

              {/* PASSWORD */}

              <Box>
                <Box
                  sx={{
                    display: 'flex',

                    alignItems: 'center',

                    gap: 0.55,

                    marginBottom: 0.45,
                  }}
                >
                  <KeyOutlinedIcon
                    sx={{
                      color: '#18aaa3',

                      fontSize: 16,
                    }}
                  />

                  <Typography
                    sx={
                      fieldLabelStyle
                    }
                  >
                    PASSWORD
                  </Typography>
                </Box>

                <TextField
                  name="password"

                  type="password"

                  value={password}

                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }

                  placeholder="Create a password"

                  fullWidth

                  required

                  autoComplete="new-password"

                  disabled={
                    authStore.loading ||
                    success
                  }

                  sx={inputStyle}
                />
              </Box>

              {/* CONFIRM */}

              <Box>
                <Typography
                  sx={{
                    ...fieldLabelStyle,

                    marginBottom: 0.45,
                  }}
                >
                  CONFIRM PASSWORD
                </Typography>

                <TextField
                  name="confirmPassword"

                  type="password"

                  value={
                    confirmPassword
                  }

                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }

                  placeholder="Repeat your password"

                  fullWidth

                  required

                  autoComplete="new-password"

                  disabled={
                    authStore.loading ||
                    success
                  }

                  sx={inputStyle}
                />
              </Box>

              <Button
                type="submit"

                variant="contained"

                disabled={
                  authStore.loading ||
                  success
                }

                startIcon={
                  !authStore.loading ? (
                    <PersonAddOutlinedIcon />
                  ) : undefined
                }

                sx={{
                  minHeight: 48,

                  marginTop: 0.35,

                  borderRadius: '14px',

                  color: '#182014',

                  textTransform: 'none',

                  fontSize: '0.9rem',

                  fontWeight: 900,

                  background:
                    'linear-gradient(100deg, #78c948 0%, #8ad45b 55%, #69cf82 110%)',

                  boxShadow:
                    '0 14px 32px rgba(120,201,72,.25)',

                  '&:hover': {
                    transform:
                      'translateY(-2px)',

                    background:
                      'linear-gradient(100deg, #6abe3c 0%, #7cca50 55%, #55c775 110%)',
                  },
                }}
              >
                {authStore.loading ? (
                  <Box
                    sx={{
                      display: 'flex',

                      alignItems:
                        'center',

                      gap: 1,
                    }}
                  >
                    <CircularProgress
                      size={19}

                      color="inherit"
                    />

                    Creating account...
                  </Box>
                ) : success ? (
                  'Account Created'
                ) : (
                  'Create Member Account'
                )}
              </Button>
            </Box>

            {/* LOGIN */}

            <Box
              sx={{
                marginTop: 1.5,

                paddingTop: 1.2,

                textAlign: 'center',

                borderTop:
                  '1px solid #eff1ee',
              }}
            >
              <Typography
                sx={{
                  color: '#a0a3ad',

                  fontSize: '0.76rem',
                }}
              >
                Already have an account?
              </Typography>

              <Button
                type="button"

                startIcon={
                  <ArrowBackOutlinedIcon />
                }

                onClick={
                  onShowLogin
                }

                disabled={
                  authStore.loading
                }

                sx={{
                  marginTop: 0.15,

                  color: '#159f99',

                  borderRadius: '9px',

                  textTransform: 'none',

                  fontWeight: 900,
                }}
              >
                Back to sign in
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    )
  }
)

export default RegisterPage