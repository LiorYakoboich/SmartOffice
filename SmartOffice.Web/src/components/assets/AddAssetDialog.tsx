import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import type {
  ReactNode,
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

import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import DeskOutlinedIcon from '@mui/icons-material/DeskOutlined'
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined'
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'

import {
  assetStore,
} from '../../stores/AssetStore'

import RoomCreature from '../RoomCreature'

interface AddAssetDialogProps {
  open: boolean
  onClose: () => void
}

type ResourceType =
  | 'Room'
  | 'Desk'
  | 'Equipment'
  | 'Shared Resource'

interface ResourceConfiguration {
  categories: string[]
  features: string[]
  examples: string[]
  description: string
}

interface ResourceTypeOption {
  value: ResourceType
  label: string
  icon: ReactNode
}

const ROOM_NAMES = [
  'Butterfly',
  'Beetle',
  'Ladybug',
  'Firefly',
  'Dragonfly',
  'Bumblebee',
  'Cricket',
  'Mantis',
]

const RESOURCE_CONFIG: Record<
  ResourceType,
  ResourceConfiguration
> = {
  Room: {
    categories: [
      'Meeting Room',
      'Conference Room',
      'Focus Room',
      'Collaboration Room',
    ],

    features: [
      'TV Screen',
      'Video Conferencing',
      'Whiteboard',
      'HDMI',
      'USB-C',
      'Speakerphone',
      'Natural Light',
      'Soundproof',
    ],

    examples: [
      'Butterfly',
      'Ladybug',
      'Dragonfly',
    ],

    description:
      'Shared meeting space that employees can reserve by time slot.',
  },

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

    examples: [
      'Desk 15-A01',
      'Desk 15-B04',
      'Desk 16-C02',
    ],

    description:
      'Employee workstation with equipment and workspace characteristics.',
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

    examples: [
      'Jabra Evolve2 65',
      'Logitech Brio Webcam',
      'Dell USB-C Dock',
    ],

    description:
      'Shared office equipment available for employee use.',
  },

  'Shared Resource': {
    categories: [
      'Locker',
      'Printer Station',
      'Parking Spot',
      'Storage Cabinet',
      'Visitor Kit',
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

    examples: [
      'Locker 15-08',
      'Printer Station 16-A',
      'Parking Spot P-12',
    ],

    description:
      'Shared workplace facility used by employees across the office.',
  },
}

const RESOURCE_TYPES: ResourceTypeOption[] = [
  {
    value: 'Desk',
    label: 'Desk',
    icon: <DeskOutlinedIcon />,
  },
  {
    value: 'Room',
    label: 'Room',
    icon: <MeetingRoomOutlinedIcon />,
  },
  {
    value: 'Equipment',
    label: 'Equipment',
    icon: <DevicesOutlinedIcon />,
  },
  {
    value: 'Shared Resource',
    label: 'Shared',
    icon: <Inventory2OutlinedIcon />,
  },
]

function AddAssetDialog({
  open,
  onClose,
}: AddAssetDialogProps) {
  const [
    name,
    setName,
  ] = useState('')

  const [
    type,
    setType,
  ] = useState<ResourceType>(
    'Desk'
  )

  const [
    category,
    setCategory,
  ] = useState(
    'Standard Desk'
  )

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
  ] = useState<string[]>(
    []
  )

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
      () =>
        RESOURCE_CONFIG[
          type
        ],
      [type]
    )

  const resetForm = () => {
    setName('')

    setType('Desk')

    setCategory(
      'Standard Desk'
    )

    setLocation(
      'Floor 15'
    )

    setDescription('')

    setFeatures([])

    setStatus(
      'Available'
    )

    setLocalError('')

    setSuccess(false)

    assetStore.error = ''
  }

  useEffect(() => {
    if (open) {
      resetForm()
    }
  }, [open])

  const handleTypeChange = (
    newType: ResourceType
  ) => {
    setType(
      newType
    )

    setCategory(
      RESOURCE_CONFIG[
        newType
      ].categories[0]
    )

    setFeatures([])

    setDescription('')

    setStatus(
      'Available'
    )

    if (
      newType === 'Room'
    ) {
      if (
        !ROOM_NAMES.includes(
          name
        )
      ) {
        setName(
          'Butterfly'
        )
      }
    } else if (
      ROOM_NAMES.includes(
        name
      )
    ) {
      setName('')
    }
  }

  const handleSubmit =
    async () => {
      setLocalError('')

      setSuccess(false)

      assetStore.error = ''

      const cleanName =
        name.trim()

      const cleanDescription =
        description.trim()

      if (!cleanName) {
        setLocalError(
          'Resource name is required.'
        )

        return
      }

      if (!category) {
        setLocalError(
          'Please select a category.'
        )

        return
      }

      try {
        await assetStore
          .createAsset({
            name:
              cleanName,

            type,

            category,

            location,

            description:
              cleanDescription,

            features:
              features
                .map(
                  (feature) =>
                    feature.trim()
                )
                .filter(
                  Boolean
                ),

            status:
              type === 'Room'
                ? 'Available'
                : status,
          })

        setSuccess(
          true
        )

        window.setTimeout(
          () => {
            resetForm()

            onClose()
          },
          800
        )
      } catch {
        // AssetStore exposes API errors.
      }
    }

  const handleClose =
    () => {
      if (
        assetStore.loading
      ) {
        return
      }

      resetForm()

      onClose()
    }

  const renderTypeIcon =
    () => {
      switch (type) {
        case 'Room':
          return (
            <MeetingRoomOutlinedIcon />
          )

        case 'Desk':
          return (
            <DeskOutlinedIcon />
          )

        case 'Equipment':
          return (
            <DevicesOutlinedIcon />
          )

        default:
          return (
            <Inventory2OutlinedIcon />
          )
      }
    }

  const fieldSx = {
    '& .MuiOutlinedInput-root':
      {
        borderRadius:
          '13px',

        backgroundColor:
          '#ffffff',

        '& fieldset': {
          borderColor:
            '#e4e7e2',
        },

        '&:hover fieldset':
          {
            borderColor:
              'rgba(24,170,163,.42)',
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
            position:
              'relative',

            width: '100%',

            maxHeight:
              'calc(100dvh - 28px)',

            display: 'flex',

            flexDirection:
              'column',

            overflow:
              'hidden',

            borderRadius:
              '26px',

            border:
              '1px solid #e5e9e3',

            background:
              'linear-gradient(145deg, #ffffff 0%, #fbfdf9 100%)',

            boxShadow:
              '0 38px 110px rgba(23,24,44,.22)',

            '&::before': {
              content: '""',

              position:
                'absolute',

              top: 0,
              left: 0,
              right: 0,

              height: 5,

              zIndex: 20,

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
      {/* HEADER */}

      <DialogTitle
        sx={{
          flexShrink: 0,

          padding: 3,

          paddingBottom: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',

            alignItems:
              'center',

            justifyContent:
              'space-between',

            gap: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',

              alignItems:
                'center',

              gap: 1.3,
            }}
          >
            <Box
              sx={{
                width: 46,

                height: 46,

                display:
                  'flex',

                alignItems:
                  'center',

                justifyContent:
                  'center',

                borderRadius:
                  '14px',

                color:
                  '#159f99',

                background:
                  'linear-gradient(135deg, rgba(120,201,72,.12), rgba(24,170,163,.10))',
              }}
            >
              {renderTypeIcon()}
            </Box>

            <Box>
              <Typography
                sx={{
                  color:
                    '#159f99',

                  fontSize:
                    '0.64rem',

                  fontWeight:
                    900,

                  letterSpacing:
                    '0.15em',

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
                    '1.55rem',

                  fontWeight:
                    900,

                  letterSpacing:
                    '-0.04em',
                }}
              >
                Add Resource
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
              minWidth: 40,

              width: 40,

              height: 40,

              padding: 0,

              borderRadius:
                '12px',

              color:
                '#8a8e99',

              backgroundColor:
                '#f5f6f4',
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

          paddingX: 3,

          paddingTop:
            '6px !important',

          paddingBottom: 3,

          '&::-webkit-scrollbar':
            {
              width: 8,
            },

          '&::-webkit-scrollbar-thumb':
            {
              borderRadius:
                20,

              background:
                'linear-gradient(180deg, #78c948, #18aaa3)',
            },
        }}
      >
        {(localError ||
          assetStore.error) && (
          <Alert
            severity="error"

            sx={{
              marginBottom:
                2,

              borderRadius:
                '13px',
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
                2,

              borderRadius:
                '13px',
            }}
          >
            Resource added successfully.
          </Alert>
        )}

        {/* RESOURCE TYPE */}

        <Typography
          sx={{
            marginBottom:
              0.7,

            color:
              '#555968',

            fontSize:
              '0.68rem',

            fontWeight:
              900,

            letterSpacing:
              '0.08em',
          }}
        >
          RESOURCE TYPE
        </Typography>

        <Box
          sx={{
            display: 'grid',

            gridTemplateColumns:
              {
                xs:
                  'repeat(2, 1fr)',

                sm:
                  'repeat(4, 1fr)',
              },

            gap: 1,

            marginBottom:
              2.2,
          }}
        >
          {RESOURCE_TYPES.map(
            (
              option
            ) => {
              const selected =
                type ===
                option.value

              return (
                <Button
                  key={
                    option.value
                  }

                  onClick={() =>
                    handleTypeChange(
                      option.value
                    )
                  }

                  startIcon={
                    option.icon
                  }

                  sx={{
                    minHeight:
                      50,

                    paddingX:
                      1,

                    borderRadius:
                      '13px',

                    color:
                      selected
                        ? '#ffffff'
                        : '#656a78',

                    border:
                      selected
                        ? '1px solid transparent'
                        : '1px solid #e6e9e4',

                    background:
                      selected
                        ? 'linear-gradient(100deg, #58ad35, #18aaa3)'
                        : '#ffffff',

                    textTransform:
                      'none',

                    fontSize:
                      '0.7rem',

                    fontWeight:
                      900,

                    boxShadow:
                      selected
                        ? '0 9px 23px rgba(24,170,163,.18)'
                        : 'none',

                    '&:hover':
                      {
                        background:
                          selected
                            ? 'linear-gradient(100deg, #4e9e31, #159b96)'
                            : '#f8faf7',
                      },
                  }}
                >
                  {
                    option.label
                  }
                </Button>
              )
            }
          )}
        </Box>

        {/* TYPE EXPLANATION */}

        <Box
          sx={{
            marginBottom:
              2,

            padding: 1.5,

            borderRadius:
              '14px',

            display: 'flex',

            alignItems:
              'flex-start',

            gap: 1,

            background:
              'linear-gradient(100deg, rgba(120,201,72,.07), rgba(24,170,163,.055))',

            border:
              '1px solid rgba(120,201,72,.15)',
          }}
        >
          <AutoAwesomeOutlinedIcon
            sx={{
              marginTop:
                0.15,

              color:
                '#58ad35',

              fontSize: 19,
            }}
          />

          <Box>
            <Typography
              sx={{
                color:
                  '#202337',

                fontSize:
                  '0.73rem',

                fontWeight:
                  900,
              }}
            >
              {type}
            </Typography>

            <Typography
              sx={{
                marginTop:
                  0.2,

                color:
                  '#858995',

                fontSize:
                  '0.68rem',

                lineHeight:
                  1.5,
              }}
            >
              {
                currentConfig.description
              }
            </Typography>
          </Box>
        </Box>

        {/* RESOURCE NAME */}

        <Typography
          sx={{
            marginBottom:
              0.6,

            color:
              '#555968',

            fontSize:
              '0.68rem',

            fontWeight:
              900,

            letterSpacing:
              '0.08em',
          }}
        >
          RESOURCE NAME
        </Typography>

        {type ===
        'Room' ? (
          <TextField
            select

            fullWidth

            value={name}

            onChange={(
              event
            ) =>
              setName(
                event.target
                  .value
              )
            }

            sx={{
              ...fieldSx,

              marginBottom:
                0.8,
            }}
          >
            {ROOM_NAMES.map(
              (
                roomName
              ) => (
                <MenuItem
                  key={
                    roomName
                  }

                  value={
                    roomName
                  }
                >
                  <Box
                    sx={{
                      display:
                        'flex',

                      alignItems:
                        'center',

                      gap: 1,
                    }}
                  >
                    <RoomCreature
                      roomName={
                        roomName
                      }

                      size={30}
                    />

                    <Typography
                      sx={{
                        fontWeight:
                          800,
                      }}
                    >
                      {
                        roomName
                      }
                    </Typography>
                  </Box>
                </MenuItem>
              )
            )}
          </TextField>
        ) : (
          <TextField
            fullWidth

            value={name}

            onChange={(
              event
            ) =>
              setName(
                event.target
                  .value
              )
            }

            placeholder={
              currentConfig
                .examples[0]
            }

            sx={{
              ...fieldSx,

              marginBottom:
                0.8,
            }}
          />
        )}

        <Typography
          sx={{
            marginBottom:
              2,

            color:
              '#a0a3ad',

            fontSize:
              '0.64rem',
          }}
        >
          Examples:{' '}
          {currentConfig.examples.join(
            ' • '
          )}
        </Typography>

        {/* CATEGORY / FLOOR */}

        <Box
          sx={{
            display: 'grid',

            gridTemplateColumns:
              {
                xs: '1fr',

                sm:
                  '1fr 1fr',
              },

            gap: 1.4,

            marginBottom:
              2,
          }}
        >
          <Box>
            <Typography
              sx={{
                marginBottom:
                  0.6,

                color:
                  '#555968',

                fontSize:
                  '0.68rem',

                fontWeight:
                  900,

                letterSpacing:
                  '0.08em',
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
                  event.target
                    .value
                )
              }

              sx={fieldSx}
            >
              {currentConfig.categories.map(
                (
                  option
                ) => (
                  <MenuItem
                    key={
                      option
                    }

                    value={
                      option
                    }
                  >
                    {
                      option
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
                  0.6,

                color:
                  '#555968',

                fontSize:
                  '0.68rem',

                fontWeight:
                  900,

                letterSpacing:
                  '0.08em',
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
                  event.target
                    .value
                )
              }

              sx={fieldSx}
            >
              <MenuItem value="Floor 15">
                <Box
                  sx={{
                    display:
                      'flex',

                    alignItems:
                      'center',

                    gap: 0.6,
                  }}
                >
                  <LocationOnOutlinedIcon
                    sx={{
                      fontSize:
                        17,

                      color:
                        '#58ad35',
                    }}
                  />

                  Floor 15
                </Box>
              </MenuItem>

              <MenuItem value="Floor 16">
                <Box
                  sx={{
                    display:
                      'flex',

                    alignItems:
                      'center',

                    gap: 0.6,
                  }}
                >
                  <LocationOnOutlinedIcon
                    sx={{
                      fontSize:
                        17,

                      color:
                        '#18aaa3',
                    }}
                  />

                  Floor 16
                </Box>
              </MenuItem>
            </TextField>
          </Box>
        </Box>

        {/* DESCRIPTION */}

        <Typography
          sx={{
            marginBottom:
              0.6,

            color:
              '#555968',

            fontSize:
              '0.68rem',

            fontWeight:
              900,

            letterSpacing:
              '0.08em',
          }}
        >
          DESCRIPTION
        </Typography>

        <TextField
          fullWidth

          multiline

          minRows={2}

          maxRows={4}

          value={
            description
          }

          onChange={(
            event
          ) =>
            setDescription(
              event.target
                .value
            )
          }

          placeholder={
            type === 'Desk'
              ? 'Adjustable workstation near the east windows...'
              : type ===
                  'Equipment'
                ? 'Shared equipment available for employee use...'
                : type ===
                    'Shared Resource'
                  ? 'Shared workplace facility...'
                  : 'Meeting space for team collaboration...'
          }

          slotProps={{
            htmlInput: {
              maxLength: 300,
            },
          }}

          sx={{
            ...fieldSx,

            marginBottom:
              0.5,
          }}
        />

        <Typography
          sx={{
            marginBottom:
              2,

            color:
              '#a0a3ad',

            fontSize:
              '0.63rem',

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
              0.6,

            color:
              '#555968',

            fontSize:
              '0.68rem',

            fontWeight:
              900,

            letterSpacing:
              '0.08em',
          }}
        >
          FEATURES
        </Typography>

        <Autocomplete
          multiple

          freeSolo

          options={
            currentConfig.features
          }

          value={
            features
          }

          onChange={(
            _,
            newValue
          ) => {
            const cleanFeatures =
              newValue
                .map(
                  (feature) =>
                    feature.trim()
                )
                .filter(
                  Boolean
                )

            setFeatures(
              cleanFeatures.slice(
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

              placeholder={
                features.length
                  ? 'Add another feature'
                  : 'Select or type features'
              }

              sx={
                fieldSx
              }
            />
          )}
        />

        <Typography
          sx={{
            marginTop:
              0.55,

            marginBottom:
              2,

            color:
              '#a0a3ad',

            fontSize:
              '0.63rem',
          }}
        >
          Choose suggestions or type your own.
          Maximum 10 features.
        </Typography>

        {/* STATUS */}

        {type !==
          'Room' && (
          <>
            <Typography
              sx={{
                marginBottom:
                  0.6,

                color:
                  '#555968',

                fontSize:
                  '0.68rem',

                fontWeight:
                  900,

                letterSpacing:
                  '0.08em',
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
                  event.target
                    .value
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
          </>
        )}

        {/* ROOM INFO */}

        {type ===
          'Room' && (
          <Box
            sx={{
              padding:
                1.4,

              borderRadius:
                '13px',

              color:
                '#687085',

              backgroundColor:
                '#f7faf6',

              border:
                '1px solid #e4ebe1',
            }}
          >
            <Typography
              sx={{
                fontSize:
                  '0.7rem',

                lineHeight:
                  1.55,
              }}
            >
              Meeting rooms start as{' '}
              <strong>
                Available
              </strong>
              . Their live{' '}
              <strong>
                In Use
              </strong>{' '}
              status is calculated
              automatically from active
              reservations.
            </Typography>
          </Box>
        )}
      </DialogContent>

      {/* ACTIONS */}

      <DialogActions
        sx={{
          flexShrink: 0,

          paddingX: 3,

          paddingY: 2,

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
              '#7e828e',

            borderRadius:
              '11px',

            textTransform:
              'none',

            fontWeight:
              800,
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"

          onClick={() =>
            void handleSubmit()
          }

          disabled={
            assetStore.loading ||
            success
          }

          startIcon={
            assetStore.loading ? (
              <CircularProgress
                size={17}

                color="inherit"
              />
            ) : (
              <AddOutlinedIcon />
            )
          }

          sx={{
            minWidth: 150,

            minHeight: 43,

            borderRadius:
              '12px',

            color:
              '#ffffff',

            textTransform:
              'none',

            fontWeight:
              900,

            background:
              'linear-gradient(100deg, #58ad35 0%, #78c948 48%, #18aaa3 110%)',

            boxShadow:
              '0 12px 28px rgba(120,201,72,.22)',

            '&:hover': {
              background:
                'linear-gradient(100deg, #4e9e31 0%, #69bb40 48%, #159b96 110%)',
            },
          }}
        >
          {assetStore.loading
            ? 'Adding...'
            : 'Add Resource'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddAssetDialog