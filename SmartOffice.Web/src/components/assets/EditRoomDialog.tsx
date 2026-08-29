import {
  useEffect,
  useState,
} from 'react'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'

import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'

import type { Asset } from '../../stores/AssetStore'

import { assetStore } from '../../stores/AssetStore'

import RoomCreature from '../RoomCreature'

interface EditRoomDialogProps {
  open: boolean

  room: Asset | null

  onClose: () => void
}

function EditRoomDialog({
  open,
  room,
  onClose,
}: EditRoomDialogProps) {
  const [location, setLocation] =
    useState('Floor 15')

  const [status, setStatus] =
    useState('Available')

  const [success, setSuccess] =
    useState(false)

  useEffect(() => {
    if (!open || !room) {
      return
    }

    setLocation(room.location)

    setStatus(
      room.status === 'Maintenance'
        ? 'Maintenance'
        : 'Available'
    )

    setSuccess(false)

    assetStore.error = ''
  }, [open, room])

  const handleClose = () => {
    if (assetStore.loading) {
      return
    }

    setSuccess(false)

    assetStore.error = ''

    onClose()
  }

  const handleSave = async () => {
    if (!room?.id) {
      return
    }

    setSuccess(false)

    assetStore.error = ''

    try {
      await assetStore.updateAsset(
        room.id,
        {
          location,
          status,
        }
      )

      setSuccess(true)

      window.setTimeout(() => {
        handleClose()
      }, 700)
    } catch {
      // AssetStore displays the API error.
    }
  }

  const fieldStyle = {
    '& .MuiInputLabel-root': {
      color: '#7c808d',
    },

    '& .MuiInputLabel-root.Mui-focused':
      {
        color: '#159f99',
      },

    '& .MuiOutlinedInput-root': {
      borderRadius: '14px',

      backgroundColor: '#ffffff',

      '& fieldset': {
        borderColor: '#e3e7e2',
      },

      '&:hover fieldset': {
        borderColor:
          'rgba(24,170,163,.45)',
      },

      '&.Mui-focused fieldset': {
        borderColor: '#78c948',
      },
    },

    '& .MuiSelect-icon': {
      color: '#159f99',
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

            background:
              'linear-gradient(145deg, #ffffff, #fafcf9)',

            border:
              '1px solid #e5e9e3',

            boxShadow:
              '0 38px 110px rgba(23,24,44,.22)',

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
          },
        },

        backdrop: {
          sx: {
            backgroundColor:
              'rgba(23,24,44,.30)',

            backdropFilter:
              'blur(8px)',
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          padding: 3,

          paddingBottom: 1.5,
        }}
      >
        <Box
          sx={{
            display: 'flex',

            alignItems: 'center',

            gap: 1.5,
          }}
        >
          {room && (
            <RoomCreature
              roomName={room.name}
              size={58}
            />
          )}

          <Box>
            <Typography
              sx={{
                color: '#159f99',

                fontSize: '0.66rem',

                fontWeight: 900,

                letterSpacing:
                  '0.15em',

                textTransform:
                  'uppercase',
              }}
            >
              Admin Room Management
            </Typography>

            <Typography
              sx={{
                marginTop: 0.3,

                color: '#202337',

                fontSize: '1.6rem',

                fontWeight: 900,

                letterSpacing:
                  '-0.035em',
              }}
            >
              Edit {room?.name}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          padding: 3,

          paddingTop: 2,
        }}
      >
        {assetStore.error && (
          <Alert
            severity="error"
            sx={{
              marginBottom: 2,

              borderRadius: '14px',
            }}
          >
            {assetStore.error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{
              marginBottom: 2,

              borderRadius: '14px',
            }}
          >
            Room updated successfully.
          </Alert>
        )}

        <Box
          sx={{
            display: 'grid',

            gap: 2,
          }}
        >
          <TextField
            select
            label="Floor"
            value={location}
            onChange={(event) =>
              setLocation(
                event.target.value
              )
            }
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

          <TextField
            select
            label="Room Status"
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

            <MenuItem value="Maintenance">
              Maintenance
            </MenuItem>
          </TextField>

          {status === 'Maintenance' ? (
            <Alert
              severity="warning"
              icon={<BuildOutlinedIcon />}
              sx={{
                borderRadius: '14px',
              }}
            >
              Users will not be able to create
              new bookings for this room while
              it is under maintenance.
            </Alert>
          ) : (
            <Box
              sx={{
                padding: 1.5,

                borderRadius: '14px',

                background:
                  'linear-gradient(100deg, rgba(120,201,72,.07), rgba(24,170,163,.05))',

                border:
                  '1px solid rgba(120,201,72,.15)',
              }}
            >
              <Typography
                sx={{
                  color: '#4b9932',

                  fontSize: '0.73rem',

                  fontWeight: 900,
                }}
              >
                Automatic availability
              </Typography>

              <Typography
                sx={{
                  marginTop: 0.35,

                  color: '#858996',

                  fontSize: '0.72rem',

                  lineHeight: 1.55,
                }}
              >
                In Use status is calculated
                automatically from active
                reservations.
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          padding: 3,

          paddingTop: 1,

          gap: 1,
        }}
      >
        <Button
          onClick={handleClose}
          disabled={assetStore.loading}
          sx={{
            color: '#7d8190',

            borderRadius: '11px',

            textTransform: 'none',

            fontWeight: 700,
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          startIcon={
            assetStore.loading ? (
              <CircularProgress
                size={17}
                color="inherit"
              />
            ) : (
              <EditOutlinedIcon />
            )
          }
          onClick={() =>
            void handleSave()
          }
          disabled={
            assetStore.loading ||
            !room?.id
          }
          sx={{
            minWidth: 150,

            minHeight: 44,

            borderRadius: '12px',

            color: '#182012',

            textTransform: 'none',

            fontWeight: 900,

            background:
              'linear-gradient(100deg, #78c948, #8bd65b)',

            boxShadow:
              '0 11px 26px rgba(120,201,72,.22)',

            '&:hover': {
              background:
                'linear-gradient(100deg, #6abd3d, #7dcb50)',
            },
          }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditRoomDialog