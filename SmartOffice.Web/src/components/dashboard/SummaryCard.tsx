import type { ReactNode } from 'react'

import {
  Box,
  Paper,
  Typography,
} from '@mui/material'

interface SummaryCardProps {
  title: string
  value: number
  subtitle: string
  icon: ReactNode
  accent: string
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  accent,
}: SummaryCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',

        minHeight: 158,

        overflow: 'hidden',

        padding: 2.3,

        borderRadius: '19px',

        border: '1px solid #e5e9e3',

        backgroundColor: '#ffffff',

        boxShadow:
          '0 14px 40px rgba(23,24,44,.045)',

        transition:
          'transform .2s ease, box-shadow .2s ease',

        '&::after': {
          content: '""',

          position: 'absolute',

          width: 90,
          height: 90,

          right: -35,
          top: -35,

          borderRadius: '50%',

          backgroundColor: `${accent}14`,
        },

        '&:hover': {
          transform: 'translateY(-3px)',

          boxShadow:
            '0 20px 45px rgba(23,24,44,.075)',
        },
      }}
    >
      {/* ICON */}

      <Box
        sx={{
          width: 43,
          height: 43,

          borderRadius: '13px',

          display: 'flex',

          alignItems: 'center',

          justifyContent: 'center',

          color: accent,

          backgroundColor: `${accent}12`,

          position: 'relative',

          zIndex: 1,
        }}
      >
        {icon}
      </Box>

      {/* TITLE */}

      <Typography
        sx={{
          marginTop: 1.4,

          color: '#777b89',

          fontSize: '0.67rem',

          fontWeight: 900,

          letterSpacing: '0.06em',

          textTransform: 'uppercase',
        }}
      >
        {title}
      </Typography>

      {/* VALUE */}

      <Typography
        sx={{
          marginTop: 0.15,

          color: '#202337',

          fontSize: '1.9rem',

          lineHeight: 1,

          fontWeight: 900,

          letterSpacing: '-0.03em',
        }}
      >
        {value}
      </Typography>

      {/* SUBTITLE */}

      <Typography
        sx={{
          marginTop: 0.55,

          color: '#a0a3ad',

          fontSize: '0.7rem',
        }}
      >
        {subtitle}
      </Typography>
    </Paper>
  )
}

export default SummaryCard