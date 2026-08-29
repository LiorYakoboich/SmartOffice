import { Box } from '@mui/material'
import { keyframes } from '@mui/material/styles'

interface RoomCreatureProps {
  roomName: string
  size?: number
}

const floatAnimation = keyframes`
  0% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-5px);
  }

  100% {
    transform: translateY(0px);
  }
`

const butterflyAnimation = keyframes`
  0% {
    transform: rotate(-4deg) scale(1);
  }

  50% {
    transform: rotate(4deg) scale(1.08);
  }

  100% {
    transform: rotate(-4deg) scale(1);
  }
`

const beetleAnimation = keyframes`
  0% {
    transform: translateX(-2px) rotate(-3deg);
  }

  50% {
    transform: translateX(3px) rotate(3deg);
  }

  100% {
    transform: translateX(-2px) rotate(-3deg);
  }
`

const fireflyAnimation = keyframes`
  0% {
    transform: translateY(1px);
    filter: drop-shadow(0 0 2px rgba(120, 201, 72, 0.35));
  }

  50% {
    transform: translateY(-4px);
    filter: drop-shadow(0 0 10px rgba(120, 201, 72, 0.95));
  }

  100% {
    transform: translateY(1px);
    filter: drop-shadow(0 0 2px rgba(120, 201, 72, 0.35));
  }
`

const dragonflyAnimation = keyframes`
  0% {
    transform: translateX(-3px) translateY(1px);
  }

  50% {
    transform: translateX(4px) translateY(-3px);
  }

  100% {
    transform: translateX(-3px) translateY(1px);
  }
`

const beeAnimation = keyframes`
  0% {
    transform: translateX(-2px) translateY(0);
  }

  25% {
    transform: translateX(2px) translateY(-3px);
  }

  50% {
    transform: translateX(4px) translateY(0);
  }

  75% {
    transform: translateX(0) translateY(2px);
  }

  100% {
    transform: translateX(-2px) translateY(0);
  }
`

const cricketAnimation = keyframes`
  0%, 80%, 100% {
    transform: translateY(0);
  }

  90% {
    transform: translateY(-7px);
  }
`

const mantisAnimation = keyframes`
  0% {
    transform: rotate(-3deg);
  }

  50% {
    transform: rotate(3deg);
  }

  100% {
    transform: rotate(-3deg);
  }
`

const roomConfig: Record<
  string,
  {
    emoji: string
    animation: ReturnType<typeof keyframes>
    duration: string
    background: string
  }
> = {
  Butterfly: {
    emoji: '🦋',
    animation: butterflyAnimation,
    duration: '1.8s',
    background:
      'linear-gradient(145deg, rgba(184, 149, 255, .16), rgba(24, 170, 163, .10))',
  },

  Beetle: {
    emoji: '🪲',
    animation: beetleAnimation,
    duration: '2.1s',
    background:
      'linear-gradient(145deg, rgba(120, 201, 72, .17), rgba(24, 170, 163, .10))',
  },

  Ladybug: {
    emoji: '🐞',
    animation: floatAnimation,
    duration: '2.4s',
    background:
      'linear-gradient(145deg, rgba(240, 89, 89, .12), rgba(120, 201, 72, .08))',
  },

  Firefly: {
    emoji: '✨',
    animation: fireflyAnimation,
    duration: '1.8s',
    background:
      'linear-gradient(145deg, rgba(120, 201, 72, .18), rgba(255, 220, 94, .13))',
  },

  Dragonfly: {
    emoji: '🪰',
    animation: dragonflyAnimation,
    duration: '1.7s',
    background:
      'linear-gradient(145deg, rgba(24, 170, 163, .15), rgba(103, 183, 255, .12))',
  },

  Bumblebee: {
    emoji: '🐝',
    animation: beeAnimation,
    duration: '1.5s',
    background:
      'linear-gradient(145deg, rgba(255, 205, 72, .18), rgba(120, 201, 72, .08))',
  },

  Cricket: {
    emoji: '🦗',
    animation: cricketAnimation,
    duration: '2.2s',
    background:
      'linear-gradient(145deg, rgba(120, 201, 72, .17), rgba(24, 170, 163, .07))',
  },

  Mantis: {
    emoji: '🌿',
    animation: mantisAnimation,
    duration: '2.4s',
    background:
      'linear-gradient(145deg, rgba(82, 171, 63, .15), rgba(120, 201, 72, .08))',
  },
}

function RoomCreature({
  roomName,
  size = 42,
}: RoomCreatureProps) {
  const config =
    roomConfig[roomName] ?? {
      emoji: '🏢',
      animation: floatAnimation,
      duration: '2.3s',
      background: '#f3f5f2',
    }

  return (
    <Box
      sx={{
        width: size,
        height: size,

        flexShrink: 0,

        borderRadius: '13px',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        background: config.background,

        border:
          '1px solid rgba(24, 170, 163, 0.08)',

        fontSize: size * 0.52,

        boxShadow:
          '0 8px 20px rgba(23, 24, 44, 0.05)',

        animation: `${config.animation} ${config.duration} ease-in-out infinite`,

        transformOrigin: 'center',
      }}
    >
      {config.emoji}
    </Box>
  )
}

export default RoomCreature