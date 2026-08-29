import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Alert,
  Autocomplete,
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
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import DeskOutlinedIcon from '@mui/icons-material/DeskOutlined'
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'

import {
  assetStore,
} from '../../stores/AssetStore'

import type {
  Asset,
} from '../../stores/AssetStore'

interface EditResourceDialogProps {
  open: boolean

  resource: Asset | null

  onClose: () => void
}

const CONFIG = {
  Desk: {
    categories: [
      'Standard Desk',
      'Standing Desk',
      'Dual Monitor Desk',
      'Window Desk',
      'Focus Desk',
    ],

    features: [
      '1 Monitor',
      '2 Monitors',
      'USB-C Dock',
      'Adjustable Height',
      'Ergonomic Chair',
      'Keyboard & Mouse',
      'Natural Light',
      'Privacy Screen',
    ],
  },

  Equipment: {
    categories: [
      'Headset',
      'Webcam',
      'Docking Station',
      'Portable Monitor',
      'Presentation Kit',
      'Keyboard & Mouse',
    ],

    features: [
      'Bluetooth',
      'Noise Cancelling',
      'USB-C',
      'Wireless',
      '4K',
      'HDMI',
      'Portable',
      'Rechargeable',
    ],
  },

  'Shared Resource': {
    categories: [
      'Printer Station',
      'Parking Spot',
      'Storage Cabinet',
      'Visitor Kit',
      'General Shared Resource',
    ],

    features: [
      'Secure Storage',
      'Personal Use',
      'Color Printing',
      'Scanner',
      'Reserved',
      'Accessible',
      'Daily Use',
      'Lockable',
    ],
  },
} as const

function EditResourceDialog({
  open,
  resource,
  onClose,
}: EditResourceDialogProps) {
  const [
    category,
    setCategory,
  ] = useState('')

  const [
    location,
    setLocation,
  ] = useState(
    'Floor 15'
  )

  const [
    description,
    setDescription,
  ] = useState('')

  const [
    features,
    setFeatures,
  ] = useState<
    string[]
  >([])

  const [
    status,
    setStatus,
  ] = useState(
    'Available'
  )

  const [
    localError,
    setLocalError,
  ] = useState('')

  const [
    success,
    setSuccess,
  ] = useState(false)

  const currentConfig =
    useMemo(
      () => {
        if (
          resource?.type ===
          'Desk'
        ) {
          return CONFIG.Desk
        }

        if (
          resource?.type ===
          'Equipment'
        ) {
          return CONFIG.Equipment
        }

        return CONFIG[
          'Shared Resource'
        ]
      },
      [resource]
    )

  useEffect(() => {
    if (
      !open ||
      !resource
    ) {
      return
    }

    setCategory(
      resource.category ??
      ''
    )

    setLocation(
      resource.location
    )

    setDescription(
      resource.description ??
      ''
    )

    setFeatures(
      resource.features ??
      []
    )

    setStatus(
      resource.status
    )

    setLocalError('')

    setSuccess(false)

    assetStore.error = ''
  }, [
    open,
    resource,
  ])

  const handleClose =
    () => {
      if (
        assetStore.loading
      ) {
        return
      }

      setLocalError('')

      setSuccess(false)

      onClose()
    }

  const handleSave =
    async () => {
      if (
        !resource?.id
      ) {
        return
      }

      setLocalError('')

      setSuccess(false)

      assetStore.error = ''

      if (
        !category.trim()
      ) {
        setLocalError(
          'Category is required.'
        )

        return
      }

      if (
        description.length >
        300
      ) {
        setLocalError(
          'Description cannot exceed 300 characters.'
        )

        return
      }

      try {
        await assetStore
          .updateAsset(
            resource.id,
            {
              location,

              status,

              category:
                category.trim(),

              description:
                description.trim(),

              features:
                features
                  .map(
                    (feature) =>
                      feature.trim()
                  )
                  .filter(
                    Boolean
                  )
                  .slice(
                    0,
                    10
                  ),
            }
          )

        setSuccess(
          true
        )

        window.setTimeout(
          () => {
            onClose()
          },
          700
        )
      } catch {
        // AssetStore exposes error.
      }
    }

  const renderIcon =
    () => {
      if (
        resource?.type ===
        'Desk'
      ) {
        return (
          <DeskOutlinedIcon />
        )
      }

      if (
        resource?.type ===
        'Equipment'
      ) {
        return (
          <DevicesOutlinedIcon />
        )
      }

      return (
        <Inventory2OutlinedIcon />
      )
    }

  const fieldSx = {
    '& .MuiOutlinedInput-root':
      {
        borderRadius:
          '12px',

        backgroundColor:
          '#ffffff',

        '& fieldset': {
          borderColor:
            '#e3e7e1',
        },

        '&:hover fieldset':
          {
            borderColor:
              'rgba(24,170,163,.38)',
          },

        '&.Mui-focused fieldset':
          {
            borderColor:
              '#78c948',
          },
      },
  }

  return (
    <Dialog
      open={open}

      onClose={
        handleClose
      }

      fullWidth

      maxWidth="sm"

      slotProps={{
        paper: {
          sx: {
            maxHeight:
              'calc(100dvh - 28px)',

            overflow:
              'hidden',

            display:
              'flex',

            flexDirection:
              'column',

            borderRadius:
              '24px',

            border:
              '1px solid #e4e8e2',

            background:
              'linear-gradient(145deg, #ffffff, #fafcf9)',

            boxShadow:
              '0 35px 100px rgba(23,24,44,.20)',
          },
        },

        backdrop: {
          sx: {
            backgroundColor:
              'rgba(23,24,44,.30)',

            backdropFilter:
              'blur(7px)',
          },
        },
      }}
    >
      {/* HEADER */}

      <DialogTitle
        sx={{
          flexShrink: 0,

          padding:
            2.5,
        }}
      >
        <Box
          sx={{
            display:
              'flex',

            alignItems:
              'center',

            justifyContent:
              'space-between',

            gap: 2,
          }}
        >
          <Box
            sx={{
              display:
                'flex',

              alignItems:
                'center',

              gap: 1.2,
            }}
          >
            <Box
              sx={{
                width: 44,

                height: 44,

                display:
                  'flex',

                alignItems:
                  'center',

                justifyContent:
                  'center',

                borderRadius:
                  '13px',

                color:
                  '#159f99',

                background:
                  'linear-gradient(135deg, rgba(120,201,72,.11), rgba(24,170,163,.09))',
              }}
            >
              {renderIcon()}
            </Box>

            <Box>
              <Typography
                sx={{
                  color:
                    '#159f99',

                  fontSize:
                    '0.63rem',

                  fontWeight:
                    900,

                  letterSpacing:
                    '0.12em',

                  textTransform:
                    'uppercase',
                }}
              >
                Resource Management
              </Typography>

              <Typography
                sx={{
                  marginTop:
                    0.2,

                  color:
                    '#202337',

                  fontSize:
                    '1.4rem',

                  fontWeight:
                    900,

                  letterSpacing:
                    '-0.035em',
                }}
              >
                Edit{' '}
                {
                  resource?.name
                }
              </Typography>
            </Box>
          </Box>

          <Button
            onClick={
              handleClose
            }

            disabled={
              assetStore.loading
            }

            sx={{
              minWidth:
                38,

              width: 38,

              height: 38,

              padding: 0,

              borderRadius:
                '11px',

              color:
                '#8e929d',

              backgroundColor:
                '#f4f5f3',
            }}
          >
            <CloseOutlinedIcon />
          </Button>
        </Box>
      </DialogTitle>

      {/* CONTENT */}

      <DialogContent
        sx={{
          flex: 1,

          minHeight: 0,

          overflowY:
            'auto',

          paddingX:
            2.5,

          paddingTop:
            '4px !important',

          paddingBottom:
            2.5,
        }}
      >
        {(localError ||
          assetStore.error) && (
          <Alert
            severity="error"

            sx={{
              marginBottom:
                1.5,

              borderRadius:
                '12px',
            }}
          >
            {localError ||
              assetStore.error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"

            sx={{
              marginBottom:
                1.5,

              borderRadius:
                '12px',
            }}
          >
            Resource updated successfully.
          </Alert>
        )}

        {/* BASIC INFO */}

        <Box
          sx={{
            marginBottom:
              2,

            padding:
              1.4,

            borderRadius:
              '14px',

            backgroundColor:
              '#f7faf6',

            border:
              '1px solid #e5ebe2',
          }}
        >
          <Typography
            sx={{
              color:
                '#202337',

              fontSize:
                '0.78rem',

              fontWeight:
                900,
            }}
          >
            {
              resource?.name
            }
          </Typography>

          <Typography
            sx={{
              marginTop:
                0.2,

              color:
                '#9195a0',

              fontSize:
                '0.68rem',
            }}
          >
            {resource?.type}
          </Typography>
        </Box>

        {/* CATEGORY + FLOOR */}

        <Box
          sx={{
            display:
              'grid',

            gridTemplateColumns:
              {
                xs: '1fr',

                sm:
                  '1fr 1fr',
              },

            gap: 1.3,

            marginBottom:
              1.8,
          }}
        >
          <Box>
            <Typography
              sx={{
                marginBottom:
                  0.5,

                color:
                  '#5f6371',

                fontSize:
                  '0.65rem',

                fontWeight:
                  900,

                letterSpacing:
                  '0.07em',
              }}
            >
              CATEGORY
            </Typography>

            <TextField
              select

              fullWidth

              value={
                category
              }

              onChange={(
                event
              ) =>
                setCategory(
                  event.target.value
                )
              }

              sx={fieldSx}
            >
              {currentConfig.categories.map(
                (
                  item
                ) => (
                  <MenuItem
                    key={
                      item
                    }

                    value={
                      item
                    }
                  >
                    {
                      item
                    }
                  </MenuItem>
                )
              )}
            </TextField>
          </Box>

          <Box>
            <Typography
              sx={{
                marginBottom:
                  0.5,

                color:
                  '#5f6371',

                fontSize:
                  '0.65rem',

                fontWeight:
                  900,

                letterSpacing:
                  '0.07em',
              }}
            >
              FLOOR
            </Typography>

            <TextField
              select

              fullWidth

              value={
                location
              }

              onChange={(
                event
              ) =>
                setLocation(
                  event.target.value
                )
              }

              sx={fieldSx}
            >
              <MenuItem value="Floor 15">
                Floor 15
              </MenuItem>

              <MenuItem value="Floor 16">
                Floor 16
              </MenuItem>
            </TextField>
          </Box>
        </Box>

        {/* DESCRIPTION */}

        <Typography
          sx={{
            marginBottom:
              0.5,

            color:
              '#5f6371',

            fontSize:
              '0.65rem',

            fontWeight:
              900,

            letterSpacing:
              '0.07em',
          }}
        >
          DESCRIPTION
        </Typography>

        <TextField
          fullWidth

          multiline

          minRows={3}

          maxRows={5}

          value={
            description
          }

          onChange={(
            event
          ) =>
            setDescription(
              event.target.value
            )
          }

          slotProps={{
            htmlInput: {
              maxLength:
                300,
            },
          }}

          sx={{
            ...fieldSx,

            marginBottom:
              0.35,
          }}
        />

        <Typography
          sx={{
            marginBottom:
              1.8,

            color:
              '#a0a3ad',

            fontSize:
              '0.61rem',

            textAlign:
              'right',
          }}
        >
          {
            description.length
          }
          /300
        </Typography>

        {/* FEATURES */}

        <Typography
          sx={{
            marginBottom:
              0.5,

            color:
              '#5f6371',

            fontSize:
              '0.65rem',

            fontWeight:
              900,

            letterSpacing:
              '0.07em',
          }}
        >
          FEATURES
        </Typography>

        <Autocomplete
          multiple

          freeSolo

          options={[
            ...currentConfig.features,
          ]}

          value={
            features
          }

          onChange={(
            _,
            newValue
          ) => {
            setFeatures(
              newValue
                .map(
                  (item) =>
                    item.trim()
                )
                .filter(
                  Boolean
                )
                .slice(
                  0,
                  10
                )
            )
          }}

          renderInput={(
            params
          ) => (
            <TextField
              {...params}

              placeholder="Select or type features"

              sx={
                fieldSx
              }
            />
          )}
        />

        <Typography
          sx={{
            marginTop:
              0.45,

            marginBottom:
              1.8,

            color:
              '#a0a3ad',

            fontSize:
              '0.61rem',
          }}
        >
          Maximum 10 features.
        </Typography>

        {/* STATUS */}

        <Typography
          sx={{
            marginBottom:
              0.5,

            color:
              '#5f6371',

            fontSize:
              '0.65rem',

            fontWeight:
              900,

            letterSpacing:
              '0.07em',
          }}
        >
          STATUS
        </Typography>

        <TextField
          select

          fullWidth

          value={
            status
          }

          onChange={(
            event
          ) =>
            setStatus(
              event.target.value
            )
          }

          sx={fieldSx}
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
      </DialogContent>

      {/* ACTIONS */}

      <DialogActions
        sx={{
          flexShrink: 0,

          paddingX:
            2.5,

          paddingY:
            1.8,

          gap: 1,

          borderTop:
            '1px solid #edf0eb',

          backgroundColor:
            '#ffffff',
        }}
      >
        <Button
          onClick={
            handleClose
          }

          disabled={
            assetStore.loading
          }

          sx={{
            color:
              '#7c808c',

            textTransform:
              'none',

            fontWeight:
              900,
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"

          startIcon={
            assetStore.loading ? (
              <CircularProgress
                size={16}

                color="inherit"
              />
            ) : (
              <EditOutlinedIcon />
            )
          }

          disabled={
            assetStore.loading ||
            success
          }

          onClick={() =>
            void handleSave()
          }

          sx={{
            minWidth:
              140,

            minHeight:
              42,

            borderRadius:
              '11px',

            color:
              '#ffffff',

            background:
              'linear-gradient(100deg, #58ad35, #18aaa3)',

            textTransform:
              'none',

            fontWeight:
              900,

            boxShadow:
              '0 10px 24px rgba(24,170,163,.18)',
          }}
        >
          {assetStore.loading
            ? 'Saving...'
            : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditResourceDialog