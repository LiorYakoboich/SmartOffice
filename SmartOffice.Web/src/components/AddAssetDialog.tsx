import { useState } from 'react'
import type { FormEvent } from 'react'

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'

import AddIcon from '@mui/icons-material/Add'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'

import { assetStore } from '../stores/AssetStore'

interface AddAssetDialogProps {
  open: boolean
  onClose: () => void
}

function AddAssetDialog({
  open,
  onClose,
}: AddAssetDialogProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState('Desk')
  const [location, setLocation] =
    useState('Floor 15')
  const [status, setStatus] =
    useState('Available')

  const resetForm = () => {
    setName('')
    setType('Desk')
    setLocation('Floor 15')
    setStatus('Available')
  }

  const handleClose = () => {
    if (assetStore.loading) {
      return
    }

    resetForm()
    onClose()
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    try {
      await assetStore.createAsset({
        name,
        type,
        location,
        status,
      })

      resetForm()
      onClose()
    } catch {
      // Error is displayed from AssetStore.
    }
  }

  const fieldStyle = {
    '& .MuiInputLabel-root': {
      color: '#80758e',
    },

    '& .MuiInputLabel-root.Mui-focused': {
      color: '#7046a3',
    },

    '& .MuiOutlinedInput-root': {
      color: '#251c3f',

      borderRadius: '14px',

      backgroundColor: '#ffffff',

      '& fieldset': {
        borderColor:
          'rgba(112,70,163,.14)',
      },

      '&:hover fieldset': {
        borderColor:
          'rgba(112,70,163,.38)',
      },

      '&.Mui-focused fieldset': {
        borderColor: '#7046a3',
      },
    },

    '& .MuiSelect-icon': {
      color: '#7046a3',
    },
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}

      fullWidth
      maxWidth="sm"

      slotProps={{
        paper: {
          sx: {
            position: 'relative',

            overflow: 'hidden',

            borderRadius: '26px',

            color: '#251c3f',

            background:
              'linear-gradient(145deg, #ffffff, #faf8fc)',

            border:
              '1px solid rgba(112,70,163,.12)',

            boxShadow:
              '0 38px 110px rgba(44,26,66,.25)',

            '&::before': {
              content: '""',

              position: 'absolute',

              top: 0,
              left: 0,
              right: 0,

              height: '3px',

              background:
                'linear-gradient(90deg, #4a286f, #8755a8, #31b8ba)',
            },
          },
        },

        backdrop: {
          sx: {
            backgroundColor:
              'rgba(39,25,55,.32)',

            backdropFilter:
              'blur(7px)',
          },
        },
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
      >
        <DialogTitle
          sx={{
            padding: 3,
            paddingBottom: 1,
          }}
        >
          <Box
            sx={{
              width: 46,
              height: 46,

              marginBottom: 1.5,

              borderRadius: '50%',

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',

              color: '#ffffff',

              background:
                'linear-gradient(145deg, #4a286f, #7046a3)',
            }}
          >
            <BusinessOutlinedIcon />
          </Box>

          <Typography
            sx={{
              color: '#7046a3',

              fontSize: '0.67rem',
              fontWeight: 900,

              letterSpacing: '0.15em',

              textTransform: 'uppercase',
            }}
          >
            Aristocrat Smart Office
          </Typography>

          <Typography
            sx={{
              marginTop: 0.4,

              color: '#251c3f',

              fontSize: '1.6rem',
              fontWeight: 900,

              letterSpacing: '-0.03em',
            }}
          >
            Add new resource
          </Typography>

          <Typography
            sx={{
              marginTop: 0.6,

              color: '#91879e',

              fontSize: '0.86rem',
            }}
          >
            Register an office asset on floors
            15 or 16.
          </Typography>
        </DialogTitle>

        <DialogContent
          sx={{
            padding: 3,
          }}
        >
          {assetStore.error && (
            <Alert
              severity="error"
              sx={{
                marginBottom: 2,

                borderRadius: '13px',
              }}
            >
              {assetStore.error}
            </Alert>
          )}

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              paddingTop: 1,
            }}
          >
            <TextField
              label="Asset name"

              value={name}

              onChange={(event) =>
                setName(event.target.value)
              }

              required
              fullWidth

              placeholder="e.g. Butterfly"

              sx={fieldStyle}
            />

            <Box
              sx={{
                display: 'grid',

                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr 1fr',
                },

                gap: 2,
              }}
            >
              <TextField
                select

                label="Asset type"

                value={type}

                onChange={(event) =>
                  setType(event.target.value)
                }

                fullWidth

                sx={fieldStyle}
              >
                <MenuItem value="Desk">
                  Desk
                </MenuItem>

                <MenuItem value="Room">
                  Meeting Room
                </MenuItem>

                <MenuItem value="Equipment">
                  Equipment
                </MenuItem>

                <MenuItem value="Other">
                  Other
                </MenuItem>
              </TextField>

              <TextField
                select

                label="Floor"

                value={location}

                onChange={(event) =>
                  setLocation(
                    event.target.value
                  )
                }

                required
                fullWidth

                sx={fieldStyle}
              >
                <MenuItem value="Floor 15">
                  Floor 15
                </MenuItem>

                <MenuItem value="Floor 16">
                  Floor 16
                </MenuItem>
              </TextField>
            </Box>

            <TextField
              select

              label="Status"

              value={status}

              onChange={(event) =>
                setStatus(
                  event.target.value
                )
              }

              fullWidth

              sx={fieldStyle}
            >
              <MenuItem value="Available">
                Available
              </MenuItem>

              <MenuItem value="In Use">
                In Use
              </MenuItem>

              <MenuItem value="Maintenance">
                Maintenance
              </MenuItem>
            </TextField>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            padding: 3,
            paddingTop: 0.5,
            gap: 1,
          }}
        >
          <Button
            onClick={handleClose}

            disabled={assetStore.loading}

            sx={{
              color: '#80758e',

              borderRadius: '11px',

              textTransform: 'none',

              fontWeight: 700,
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"

            variant="contained"

            startIcon={<AddIcon />}

            disabled={assetStore.loading}

            sx={{
              minWidth: 145,
              minHeight: 44,

              borderRadius: '12px',

              textTransform: 'none',

              fontWeight: 900,

              background:
                'linear-gradient(100deg, #4a286f, #8050a3, #35b4b7)',

              boxShadow:
                '0 11px 26px rgba(112,70,163,.20)',

              '&:hover': {
                background:
                  'linear-gradient(100deg, #3d205e, #714394, #28a5a8)',
              },
            }}
          >
            {assetStore.loading
              ? 'Adding...'
              : 'Add Resource'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default AddAssetDialog