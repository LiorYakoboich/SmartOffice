import { useState } from 'react'
import type { FormEvent } from 'react'
import { observer } from 'mobx-react-lite'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { authStore } from '../stores/AuthStore'

interface LoginPageProps {
  onShowRegister: () => void
}

const LoginPage = observer(({ onShowRegister }: LoginPageProps) => {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    try {
      await authStore.login(name, password)
    } catch {
      // Error is already stored inside AuthStore.
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background:
          'linear-gradient(135deg, #0f172a 0%, #172554 50%, #0f172a 100%)',
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          p: 8,
        }}
      >
        <Box sx={{ maxWidth: 580 }}>
          <Typography
            sx={{
              color: '#60a5fa',
              fontWeight: 700,
              letterSpacing: 2,
              mb: 2,
            }}
          >
            SMART OFFICE
          </Typography>

          <Typography
            variant="h2"
            sx={{
              color: 'white',
              fontWeight: 800,
              lineHeight: 1.1,
              mb: 3,
            }}
          >
            Manage your office resources intelligently.
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: '#94a3b8',
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            Securely manage rooms, desks and shared office assets through
            role-based access.
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          width: { xs: '100%', md: 560 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 5 },
        }}
      >
        <Paper
          elevation={12}
          sx={{
            width: '100%',
            maxWidth: 460,
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2.5,
              bgcolor: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <LockOutlinedIcon sx={{ color: '#2563eb' }} />
          </Box>

          <Typography
            variant="h4"
            sx={{ fontWeight: 800 }}
          >
            Welcome back
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
            Sign in to your Smart Office account.
          </Typography>

          {authStore.error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              Login failed. Please check your credentials.
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                label="Username"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                fullWidth
              />

              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                fullWidth
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={authStore.loading}
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: 16,
                }}
              >
                {authStore.loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign in'
                )}
              </Button>

              <Button
                type="button"
                onClick={onShowRegister}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Don't have an account? Register
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Box>
  )
})

export default LoginPage