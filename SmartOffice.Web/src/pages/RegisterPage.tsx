import { useState } from 'react'
import type { FormEvent } from 'react'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material'

import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'

import { authStore } from '../stores/AuthStore'
import type { UserRole } from '../stores/AuthStore'

interface RegisterPageProps {
  onShowLogin: () => void
}

function RegisterPage({
  onShowLogin,
}: RegisterPageProps) {
  const [name, setName] = useState('')
  const [password, setPassword] =
    useState('')
  const [role, setRole] =
    useState<UserRole>('Member')
  const [success, setSuccess] =
    useState(false)

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()
    setSuccess(false)

    try {
      await authStore.register(
        name,
        password,
        role
      )

      setSuccess(true)

      setTimeout(() => {
        onShowLogin()
      }, 700)
    } catch {
      // AuthStore exposes the API error.
    }
  }

  const fieldStyle = {
    '& .MuiInputLabel-root': {
      color: '#64748b',
    },

    '& .MuiInputLabel-root.Mui-focused': {
      color: '#60a5fa',
    },

    '& .MuiOutlinedInput-root': {
      color: '#f8fafc',
      borderRadius: '12px',
      backgroundColor:
        'rgba(15,23,42,.60)',

      '& fieldset': {
        borderColor:
          'rgba(148,163,184,.16)',
      },

      '&:hover fieldset': {
        borderColor:
          'rgba(96,165,250,.40)',
      },

      '&.Mui-focused fieldset': {
        borderColor: '#3b82f6',
      },
    },

    '& .MuiSelect-icon': {
      color: '#64748b',
    },
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        padding: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(circle at 20% 10%, rgba(37,99,235,.22), transparent 34%), radial-gradient(circle at 82% 18%, rgba(139,92,246,.18), transparent 32%), #050816',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 520,
          padding: {
            xs: 3,
            sm: 4.5,
          },
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '24px',
          color: '#f8fafc',
          background:
            'linear-gradient(145deg, rgba(15,23,42,.95), rgba(8,13,30,.98))',
          border:
            '1px solid rgba(96,165,250,.16)',
          boxShadow:
            '0 40px 120px rgba(0,0,0,.50)',

          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background:
              'linear-gradient(90deg, transparent, #3b82f6, #8b5cf6, #22d3ee, transparent)',
          },
        }}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#67e8f9',
            background:
              'linear-gradient(145deg, rgba(37,99,235,.18), rgba(139,92,246,.13))',
            border:
              '1px solid rgba(103,232,249,.16)',
            marginBottom: 3,
          }}
        >
          <BusinessOutlinedIcon />
        </Box>

        <Typography
          sx={{
            color: '#60a5fa',
            fontSize: '0.67rem',
            fontWeight: 900,
            letterSpacing: '0.17em',
            textTransform: 'uppercase',
            marginBottom: 0.9,
          }}
        >
          New Operator
        </Typography>

        <Typography
          sx={{
            fontSize: '2rem',
            fontWeight: 950,
            letterSpacing: '-0.04em',
          }}
        >
          Create account
        </Typography>

        <Typography
          sx={{
            color: '#64748b',
            marginTop: 0.8,
            marginBottom: 3.5,
            fontSize: '0.9rem',
          }}
        >
          Register a new Smart Office user.
        </Typography>

        {authStore.error && (
          <Alert
            severity="error"
            sx={{
              marginBottom: 2.4,
              color: '#fecaca',
              backgroundColor:
                'rgba(127,29,29,.25)',
              border:
                '1px solid rgba(248,113,113,.18)',

              '& .MuiAlert-icon': {
                color: '#f87171',
              },
            }}
          >
            {authStore.error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{
              marginBottom: 2.4,
              color: '#99f6e4',
              backgroundColor:
                'rgba(6,78,59,.25)',
              border:
                '1px solid rgba(45,212,191,.18)',

              '& .MuiAlert-icon': {
                color: '#2dd4bf',
              },
            }}
          >
            Account created successfully.
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'grid',
            gap: 2.2,
          }}
        >
          <TextField
            label="Username"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            required
            fullWidth
            sx={fieldStyle}
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
            fullWidth
            sx={fieldStyle}
          />

          <TextField
            select
            label="Role"
            value={role}
            onChange={(event) =>
              setRole(
                event.target.value as UserRole
              )
            }
            fullWidth
            sx={fieldStyle}
          >
            <MenuItem value="Member">
              Member
            </MenuItem>

            <MenuItem value="Admin">
              Admin
            </MenuItem>
          </TextField>

          <Button
            type="submit"
            variant="contained"
            disabled={authStore.loading}
            sx={{
              marginTop: 0.7,
              minHeight: 48,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 900,
              background:
                'linear-gradient(100deg, #2563eb, #6d28d9)',
              boxShadow:
                '0 12px 30px rgba(79,70,229,.27)',

              '&:hover': {
                background:
                  'linear-gradient(100deg, #3b82f6, #7c3aed)',
              },
            }}
          >
            {authStore.loading ? (
              <CircularProgress
                size={22}
                color="inherit"
              />
            ) : (
              'Create Account'
            )}
          </Button>
        </Box>

        <Box
          sx={{
            marginTop: 3,
            paddingTop: 2.3,
            textAlign: 'center',
            borderTop:
              '1px solid rgba(148,163,184,.09)',
          }}
        >
          <Typography
            sx={{
              color: '#64748b',
              fontSize: '0.82rem',
            }}
          >
            Already registered?
          </Typography>

          <Button
            onClick={onShowLogin}
            sx={{
              textTransform: 'none',
              color: '#60a5fa',
              fontWeight: 900,
            }}
          >
            Back to sign in
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}

export default RegisterPage