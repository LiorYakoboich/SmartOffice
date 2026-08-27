import { useState } from 'react'
import type { FormEvent } from 'react'
import { observer } from 'mobx-react-lite'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined'
import { authStore } from '../stores/AuthStore'
import type { UserRole } from '../stores/AuthStore'

interface RegisterPageProps {
  onShowLogin: () => void
}

const RegisterPage = observer(
  ({ onShowLogin }: RegisterPageProps) => {
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState<UserRole>('Member')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (event: FormEvent) => {
      event.preventDefault()
      setSuccess(false)

      try {
        await authStore.register(name, password, role)

        setSuccess(true)
        setName('')
        setPassword('')
        setRole('Member')
      } catch {
        // Error is already stored inside AuthStore.
      }
    }

    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f1f5f9',
          p: 2,
        }}
      >
        <Paper
          elevation={4}
          sx={{
            width: '100%',
            maxWidth: 500,
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
            <PersonAddAltOutlinedIcon sx={{ color: '#2563eb' }} />
          </Box>

          <Typography
            variant="h4"
            sx={{ fontWeight: 800 }}
          >
            Create account
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
            Register a new Smart Office user.
          </Typography>

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Account created successfully. You can now sign in.
            </Alert>
          )}

          {authStore.error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {authStore.error}
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

              <TextField
                select
                label="Role"
                value={role}
                onChange={(event) =>
                  setRole(event.target.value as UserRole)
                }
                fullWidth
              >
                <MenuItem value="Member">Member</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
              </TextField>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={authStore.loading}
                sx={{
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 700,
                }}
              >
                {authStore.loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Create account'
                )}
              </Button>

              <Button
                type="button"
                onClick={onShowLogin}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Back to sign in
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    )
  }
)

export default RegisterPage