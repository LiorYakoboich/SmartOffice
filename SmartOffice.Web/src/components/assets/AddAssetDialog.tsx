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
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined'

import { assetStore } from '../../stores/AssetStore'
import RoomCreature from '../RoomCreature'

interface AddAssetDialogProps {
  open: boolean
  onClose: () => void
}

const meetingRooms = [
  'Butterfly',
  'Beetle',
  'Ladybug',
  'Firefly',
  'Dragonfly',
  'Bumblebee',
  'Cricket',
  'Mantis',
]

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

  const handleTypeChange = (
    newType: string
  ) => {
    setType(newType)

    if (newType === 'Room') {
      setName('Butterfly')

      /*
        Meeting Room availability is managed
        automatically by reservations.
      */

      setStatus('Available')
    } else {
      setName('')
      setStatus('Available')
    }
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

        status:
          type === 'Room'
            ? 'Available'
            : status,
      })

      resetForm()
      onClose()
    } catch {
      // AssetStore already exposes the API error.
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
      color: '#202337',

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

            width: '100%',

            maxHeight:
              'calc(100dvh - 32px)',

            display: 'flex',

            flexDirection: 'column',

            overflow: 'hidden',

            borderRadius: '26px',

            color: '#202337',

            background:
              'linear-gradient(145deg, #ffffff, #fafcf9)',

            border:
              '1px solid #e5e9e3',

            boxShadow:
              '0 38px 110px rgba(23,24,44,.20)',

            '&::before': {
              content: '""',

              position: 'absolute',

              top: 0,
              left: 0,
              right: 0,

              height: '5px',

              zIndex: 10,

              background:
                'linear-gradient(90deg, #78c948 0%, #78c948 45%, #18aaa3 100%)',
            },
          },
        },

        backdrop: {
          sx: {
            backgroundColor:
              'rgba(23,24,44,.28)',

            backdropFilter: 'blur(7px)',
          },
        },
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          flex: 1,

          minHeight: 0,

          display: 'flex',

          flexDirection: 'column',

          overflow: 'hidden',
        }}
      >
        {/* HEADER */}

        <DialogTitle
          sx={{
            flexShrink: 0,

            padding: 3,

            paddingBottom: 1.5,

            backgroundColor:
              'rgba(255,255,255,.98)',
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,

              marginBottom: 1.5,

              borderRadius: '14px',

              display: 'flex',

              alignItems: 'center',

              justifyContent: 'center',

              color: '#58ad35',

              backgroundColor:
                'rgba(120,201,72,.11)',
            }}
          >
            <MeetingRoomOutlinedIcon />
          </Box>

          <Typography
            sx={{
              color: '#159f99',

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

              color: '#202337',

              fontSize: '1.65rem',

              fontWeight: 900,

              letterSpacing: '-0.035em',
            }}
          >
            Add new resource
          </Typography>

          <Typography
            sx={{
              marginTop: 0.6,

              color: '#90939e',

              fontSize: '0.85rem',
            }}
          >
            Register a new workplace resource.
          </Typography>
        </DialogTitle>

        {/* CONTENT */}

        <DialogContent
          sx={{
            flex: 1,

            minHeight: 0,

            overflowY: 'auto',

            overflowX: 'hidden',

            padding: 3,

            paddingTop: 2.5,

            paddingBottom: 3,

            borderTop:
              '1px solid #edf0eb',

            borderBottom:
              '1px solid #edf0eb',

            overscrollBehavior: 'contain',

            '&::-webkit-scrollbar': {
              width: 8,
            },

            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f5f7f4',

              borderRadius: 20,
            },

            '&::-webkit-scrollbar-thumb': {
              borderRadius: 20,

              background:
                'linear-gradient(180deg, #78c948, #18aaa3)',

              border:
                '2px solid #f5f7f4',
            },
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
            }}
          >
            {/* RESOURCE TYPE */}

            <TextField
              select
              label="Resource type"
              value={type}
              onChange={(event) =>
                handleTypeChange(
                  event.target.value
                )
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

            {/* NAME */}

            {type === 'Room' ? (
              <Box>
                <TextField
                  select
                  label="Meeting room"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  required
                  fullWidth
                  sx={fieldStyle}
                >
                  {meetingRooms.map(
                    (room) => (
                      <MenuItem
                        key={room}
                        value={room}
                      >
                        {room}
                      </MenuItem>
                    )
                  )}
                </TextField>

                {name && (
                  <Box
                    sx={{
                      marginTop: 1.5,

                      padding: 1.5,

                      borderRadius: '15px',

                      display: 'flex',

                      alignItems: 'center',

                      gap: 1.3,

                      background:
                        'linear-gradient(100deg, rgba(120,201,72,.07), rgba(24,170,163,.06))',

                      border:
                        '1px solid rgba(120,201,72,.12)',
                    }}
                  >
                    <RoomCreature
                      roomName={name}
                      size={48}
                    />

                    <Box>
                      <Typography
                        sx={{
                          color: '#202337',

                          fontSize: '0.86rem',

                          fontWeight: 900,
                        }}
                      >
                        {name}
                      </Typography>

                      <Typography
                        sx={{
                          marginTop: 0.1,

                          color: '#9295a0',

                          fontSize: '0.72rem',
                        }}
                      >
                        Aristocrat Meeting Room
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            ) : (
              <TextField
                label="Resource name"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                placeholder={
                  type === 'Desk'
                    ? 'e.g. Desk 101'
                    : 'Enter resource name'
                }
                required
                fullWidth
                sx={fieldStyle}
              />
            )}

            {/* FLOOR */}

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

            {/* STATUS FOR NON-ROOM RESOURCES */}

            {type !== 'Room' && (
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
            )}

            {/* ROOM STATUS INFO */}

            {type === 'Room' && (
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

                    fontSize: '0.72rem',

                    fontWeight: 900,
                  }}
                >
                  Room availability is automatic
                </Typography>

                <Typography
                  sx={{
                    marginTop: 0.35,

                    color: '#858996',

                    fontSize: '0.72rem',

                    lineHeight: 1.55,
                  }}
                >
                  The room will start as Available.
                  In Use status is calculated from
                  active reservations.
                </Typography>
              </Box>
            )}

            <Box sx={{ height: 2 }} />
          </Box>
        </DialogContent>

        {/* ACTIONS */}

        <DialogActions
          sx={{
            flexShrink: 0,

            paddingX: 3,

            paddingY: 2,

            gap: 1,

            backgroundColor:
              'rgba(255,255,255,.99)',

            boxShadow:
              '0 -10px 30px rgba(23,24,44,.035)',
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
            type="submit"
            variant="contained"
            startIcon={<AddIcon />}
            disabled={assetStore.loading}
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