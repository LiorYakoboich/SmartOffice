import {
  Box,
  Typography,
} from '@mui/material'

import type {
  Asset,
} from '../../stores/AssetStore'

interface ResourceCreatureProps {
  resource: Asset
}

function getResourceKind(
  resource: Asset
) {
  const name =
    resource.name
      .toLowerCase()

  const category =
    resource.category
      .toLowerCase()

  if (
    category.includes(
      'headset'
    ) ||
    name.includes(
      'jabra'
    )
  ) {
    return 'headset'
  }

  if (
    category.includes(
      'webcam'
    )
  ) {
    return 'webcam'
  }

  if (
    category.includes(
      'docking'
    ) ||
    name.includes(
      'dock'
    )
  ) {
    return 'dock'
  }

  if (
    name.includes(
      'hdmi'
    )
  ) {
    return 'hdmi'
  }

  if (
    category.includes(
      'portable monitor'
    )
  ) {
    return 'monitor'
  }

  if (
    category.includes(
      'keyboard'
    )
  ) {
    return 'keyboard'
  }

  if (
    category.includes(
      'printer'
    )
  ) {
    return 'printer'
  }

  if (
    category.includes(
      'parking'
    )
  ) {
    return 'parking'
  }

  if (
    category.includes(
      'storage'
    )
  ) {
    return 'storage'
  }

  if (
    category.includes(
      'visitor'
    )
  ) {
    return 'visitor'
  }

  if (
    category.includes(
      'presentation'
    )
  ) {
    return 'presentation'
  }

  if (
    resource.type ===
    'Desk'
  ) {
    return 'desk'
  }

  if (
    resource.type ===
    'Equipment'
  ) {
    return 'equipment'
  }

  return 'shared'
}

function ResourceCreature({
  resource,
}: ResourceCreatureProps) {
  const kind =
    getResourceKind(
      resource
    )

  const baseContainerSx = {
    width: '100%',

    height: 155,

    position:
      'relative',

    overflow:
      'hidden',

    display:
      'flex',

    alignItems:
      'center',

    justifyContent:
      'center',

    borderRadius:
      '18px',

    background:
      'linear-gradient(145deg, rgba(120,201,72,.075), rgba(24,170,163,.055), #fbfcfa)',

    border:
      '1px solid rgba(120,201,72,.11)',

    '&::before': {
      content: '""',

      position:
        'absolute',

      width: 120,

      height: 120,

      right: -48,

      top: -55,

      borderRadius:
        '50%',

      backgroundColor:
        'rgba(24,170,163,.055)',
    },

    '&::after': {
      content: '""',

      position:
        'absolute',

      width: 90,

      height: 90,

      left: -42,

      bottom: -50,

      borderRadius:
        '50%',

      backgroundColor:
        'rgba(120,201,72,.07)',
    },
  }

  // =========================================
  // HEADSET
  // =========================================

  if (
    kind ===
    'headset'
  ) {
    return (
      <Box
        sx={
          baseContainerSx
        }
      >
        <Box
          sx={{
            position:
              'relative',

            zIndex: 1,

            fontSize: 70,

            animation:
              'headsetFloat 2.8s ease-in-out infinite',

            '@keyframes headsetFloat':
              {
                '0%, 100%':
                  {
                    transform:
                      'translateY(0) rotate(-3deg)',
                  },

                '50%': {
                  transform:
                    'translateY(-8px) rotate(3deg)',
                },
              },
          }}
        >
          🎧
        </Box>

        <Box
          sx={{
            position:
              'absolute',

            left: '50%',

            bottom: 22,

            width: 65,

            height: 7,

            transform:
              'translateX(-50%)',

            borderRadius:
              '50%',

            backgroundColor:
              'rgba(23,24,44,.09)',

            filter:
              'blur(5px)',

            animation:
              'shadowPulse 2.8s ease-in-out infinite',

            '@keyframes shadowPulse':
              {
                '0%, 100%':
                  {
                    transform:
                      'translateX(-50%) scale(1)',
                  },

                '50%': {
                  transform:
                    'translateX(-50%) scale(.76)',
                },
              },
          }}
        />

        <ResourceLabel>
          Wireless Headset
        </ResourceLabel>
      </Box>
    )
  }

  // =========================================
  // WEBCAM
  // =========================================

  if (
    kind ===
    'webcam'
  ) {
    return (
      <Box
        sx={
          baseContainerSx
        }
      >
        <Box
          sx={{
            position:
              'relative',

            zIndex: 1,

            fontSize: 66,

            animation:
              'cameraMove 3s ease-in-out infinite',

            '@keyframes cameraMove':
              {
                '0%, 100%':
                  {
                    transform:
                      'rotate(-2deg)',
                  },

                '50%': {
                  transform:
                    'rotate(2deg)',
                  },
              },
          }}
        >
          📷

          <Box
            sx={{
              position:
                'absolute',

              top: 7,

              right: 1,

              width: 9,

              height: 9,

              borderRadius:
                '50%',

              backgroundColor:
                '#e65353',

              boxShadow:
                '0 0 0 5px rgba(230,83,83,.12)',

              animation:
                'recordBlink 1.3s ease-in-out infinite',

              '@keyframes recordBlink':
                {
                  '0%, 100%':
                    {
                      opacity:
                        1,
                    },

                  '50%': {
                    opacity:
                      .25,
                  },
                },
            }}
          />
        </Box>

        <ResourceLabel>
          4K Webcam
        </ResourceLabel>
      </Box>
    )
  }

  // =========================================
  // DOCK
  // =========================================

  if (
    kind ===
    'dock'
  ) {
    return (
      <Box
        sx={
          baseContainerSx
        }
      >
        <Box
          sx={{
            position:
              'relative',

            zIndex: 1,

            display:
              'flex',

            alignItems:
              'center',

            gap: 1.2,
          }}
        >
          <Box
            sx={{
              padding:
                '14px 20px',

              borderRadius:
                '14px',

              color:
                '#ffffff',

              background:
                'linear-gradient(135deg, #202337, #34364b)',

              boxShadow:
                '0 12px 25px rgba(23,24,44,.18)',

              fontSize:
                '0.72rem',

              fontWeight:
                900,
            }}
          >
            USB-C
            <br />
            DOCK
          </Box>

          <Box
            sx={{
              fontSize: 38,

              animation:
                'plugMove 1.8s ease-in-out infinite',

              '@keyframes plugMove':
                {
                  '0%, 100%':
                    {
                      transform:
                        'translateX(0)',
                    },

                  '50%': {
                    transform:
                      'translateX(-8px)',
                  },
                },
            }}
          >
            🔌
          </Box>
        </Box>

        <ResourceLabel>
          Docking Station
        </ResourceLabel>
      </Box>
    )
  }

  // =========================================
  // HDMI
  // =========================================

  if (
    kind ===
    'hdmi'
  ) {
    return (
      <Box
        sx={
          baseContainerSx
        }
      >
        <Box
          sx={{
            position:
              'relative',

            zIndex: 1,

            display:
              'flex',

            alignItems:
              'center',

            gap: 1,
          }}
        >
          <Typography
            sx={{
              color:
                '#202337',

              fontSize:
                '1rem',

              fontWeight:
                900,

              animation:
                'hdmiPulse 2s ease-in-out infinite',

              '@keyframes hdmiPulse':
                {
                  '0%, 100%':
                    {
                      opacity:
                        .7,
                    },

                  '50%': {
                    opacity:
                      1,
                  },
                },
            }}
          >
            HDMI
          </Typography>

          <Box
            sx={{
              fontSize: 55,

              animation:
                'cableMove 2.4s ease-in-out infinite',

              '@keyframes cableMove':
                {
                  '0%, 100%':
                    {
                      transform:
                        'rotate(-8deg)',
                    },

                  '50%': {
                    transform:
                      'rotate(8deg)',
                    },
                },
            }}
          >
            🔗
          </Box>
        </Box>

        <ResourceLabel>
          HDMI Cable
        </ResourceLabel>
      </Box>
    )
  }

  // =========================================
  // MONITOR
  // =========================================

  if (
    kind ===
    'monitor'
  ) {
    return (
      <Box
        sx={
          baseContainerSx
        }
      >
        <Box
          sx={{
            position:
              'relative',

            zIndex: 1,

            fontSize: 72,

            filter:
              'drop-shadow(0 12px 15px rgba(23,24,44,.09))',

            animation:
              'monitorGlow 2.4s ease-in-out infinite',

            '@keyframes monitorGlow':
              {
                '0%, 100%':
                  {
                    filter:
                      'drop-shadow(0 8px 12px rgba(23,24,44,.07))',
                  },

                '50%': {
                  filter:
                    'drop-shadow(0 10px 18px rgba(24,170,163,.28))',
                },
              },
          }}
        >
          🖥️
        </Box>

        <ResourceLabel>
          Portable Monitor
        </ResourceLabel>
      </Box>
    )
  }

  // =========================================
  // KEYBOARD
  // =========================================

  if (
    kind ===
    'keyboard'
  ) {
    return (
      <Box
        sx={
          baseContainerSx
        }
      >
        <Box
          sx={{
            position:
              'relative',

            zIndex: 1,

            fontSize: 68,

            animation:
              'keyboardTap 1.7s ease-in-out infinite',

            '@keyframes keyboardTap':
              {
                '0%, 100%':
                  {
                    transform:
                      'translateY(0)',
                  },

                '50%': {
                  transform:
                    'translateY(3px)',
                  },
              },
          }}
        >
          ⌨️
        </Box>

        <ResourceLabel>
          Keyboard & Mouse
        </ResourceLabel>
      </Box>
    )
  }

  // =========================================
  // PRINTER
  // =========================================

  if (
    kind ===
    'printer'
  ) {
    return (
      <Box
        sx={
          baseContainerSx
        }
      >
        <Box
          sx={{
            position:
              'relative',

            zIndex: 1,

            fontSize: 66,
          }}
        >
          🖨️

          <Box
            sx={{
              position:
                'absolute',

              left:
                '50%',

              bottom:
                -8,

              width:
                26,

              height:
                18,

              transform:
                'translateX(-50%)',

              borderRadius:
                '2px',

              backgroundColor:
                '#ffffff',

              border:
                '1px solid #dfe3de',

              animation:
                'printPage 2s ease-in-out infinite',

              '@keyframes printPage':
                {
                  '0%': {
                    transform:
                      'translate(-50%, -10px)',
                  },

                  '50%, 100%':
                    {
                      transform:
                        'translate(-50%, 8px)',
                  },
                },
            }}
          />
        </Box>

        <ResourceLabel>
          Printer Station
        </ResourceLabel>
      </Box>
    )
  }

  // =========================================
  // PARKING
  // =========================================

  if (
    kind ===
    'parking'
  ) {
    return (
      <Box
        sx={
          baseContainerSx
        }
      >
        <Box
          sx={{
            position:
              'relative',

            zIndex: 1,

            fontSize: 62,

            animation:
              'carDrive 3s ease-in-out infinite',

            '@keyframes carDrive':
              {
                '0%, 100%':
                  {
                    transform:
                      'translateX(-20px)',
                  },

                '50%': {
                  transform:
                    'translateX(20px)',
                  },
              },
          }}
        >
          🚗
        </Box>

        <ResourceLabel>
          Parking Spot
        </ResourceLabel>
      </Box>
    )
  }

  // =========================================
  // STORAGE
  // =========================================

  if (
    kind ===
    'storage'
  ) {
    return (
      <Box
        sx={
          baseContainerSx
        }
      >
        <Box
          sx={{
            position:
              'relative',

            zIndex: 1,

            fontSize: 68,

            animation:
              'cabinetMove 2.6s ease-in-out infinite',

            '@keyframes cabinetMove':
              {
                '0%, 100%':
                  {
                    transform:
                      'translateX(0)',
                  },

                '50%': {
                  transform:
                    'translateX(4px)',
                  },
              },
          }}
        >
          🗄️
        </Box>

        <ResourceLabel>
          Storage Cabinet
        </ResourceLabel>
      </Box>
    )
  }

  // =========================================
  // VISITOR
  // =========================================

  if (
    kind ===
    'visitor'
  ) {
    return (
      <Box
        sx={
          baseContainerSx
        }
      >
        <Box
          sx={{
            position:
              'relative',

            zIndex: 1,

            fontSize: 65,

            animation:
              'visitorFloat 2.6s ease-in-out infinite',

            '@keyframes visitorFloat':
              {
                '0%, 100%':
                  {
                    transform:
                      'translateY(0)',
                  },

                '50%': {
                  transform:
                    'translateY(-6px)',
                  },
              },
          }}
        >
          🎟️
        </Box>

        <ResourceLabel>
          Visitor Kit
        </ResourceLabel>
      </Box>
    )
  }

  // =========================================
  // PRESENTATION
  // =========================================

  if (
    kind ===
    'presentation'
  ) {
    return (
      <Box
        sx={
          baseContainerSx
        }
      >
        <Box
          sx={{
            position:
              'relative',

            zIndex: 1,

            fontSize: 67,

            animation:
              'presentationMove 2.5s ease-in-out infinite',

            '@keyframes presentationMove':
              {
                '0%, 100%':
                  {
                    transform:
                      'scale(1)',
                  },

                '50%': {
                  transform:
                    'scale(1.06)',
                  },
              },
          }}
        >
          📽️
        </Box>

        <ResourceLabel>
          Presentation Kit
        </ResourceLabel>
      </Box>
    )
  }

  // =========================================
  // DESK
  // =========================================

  if (
    kind ===
    'desk'
  ) {
    return (
      <Box
        sx={
          baseContainerSx
        }
      >
        <Box
          sx={{
            position:
              'relative',

            zIndex: 1,

            fontSize: 68,

            animation:
              'deskFloat 3.2s ease-in-out infinite',

            '@keyframes deskFloat':
              {
                '0%, 100%':
                  {
                    transform:
                      'translateY(0)',
                  },

                '50%': {
                  transform:
                    'translateY(-5px)',
                  },
              },
          }}
        >
          🖥️
        </Box>

        <Box
          sx={{
            position:
              'absolute',

            zIndex: 0,

            bottom: 32,

            width: 110,

            height: 7,

            borderRadius:
              '8px',

            background:
              'linear-gradient(90deg, #58ad35, #18aaa3)',

            opacity:
              .6,
          }}
        />

        <ResourceLabel>
          Workstation
        </ResourceLabel>
      </Box>
    )
  }

  // =========================================
  // DEFAULT
  // =========================================

  return (
    <Box
      sx={
        baseContainerSx
      }
    >
      <Box
        sx={{
          position:
            'relative',

          zIndex: 1,

          fontSize: 65,

          animation:
            'genericFloat 3s ease-in-out infinite',

          '@keyframes genericFloat':
            {
              '0%, 100%':
                {
                  transform:
                    'translateY(0)',
                },

              '50%': {
                transform:
                  'translateY(-6px)',
              },
            },
        }}
      >
        📦
      </Box>

      <ResourceLabel>
        Office Resource
      </ResourceLabel>
    </Box>
  )
}

interface ResourceLabelProps {
  children:
    React.ReactNode
}

function ResourceLabel({
  children,
}: ResourceLabelProps) {
  return (
    <Box
      sx={{
        position:
          'absolute',

        zIndex: 2,

        left: 10,

        top: 10,

        paddingX:
          0.85,

        paddingY:
          0.32,

        borderRadius:
          '999px',

        color:
          '#159f99',

        backgroundColor:
          'rgba(255,255,255,.88)',

        border:
          '1px solid rgba(255,255,255,.82)',

        boxShadow:
          '0 4px 14px rgba(23,24,44,.05)',

        backdropFilter:
          'blur(7px)',

        fontSize:
          '0.56rem',

        fontWeight:
          900,
      }}
    >
      {children}
    </Box>
  )
}

export default ResourceCreature