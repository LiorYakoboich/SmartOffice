import {
  useEffect,
  useState,
} from 'react'

import {
  Box,
  Typography,
} from '@mui/material'

import DeskOutlinedIcon from '@mui/icons-material/DeskOutlined'
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import HeadphonesOutlinedIcon from '@mui/icons-material/HeadphonesOutlined'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import CableOutlinedIcon from '@mui/icons-material/CableOutlined'
import MonitorOutlinedIcon from '@mui/icons-material/MonitorOutlined'
import KeyboardOutlinedIcon from '@mui/icons-material/KeyboardOutlined'
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined'

import type {
  Asset,
} from '../../stores/AssetStore'

import {
  getResourceVisualConfig,
} from './resourceVisualConfig'

interface ResourceVisualProps {
  resource: Asset
}

function getFallbackIcon(
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
    )
  ) {
    return (
      <HeadphonesOutlinedIcon />
    )
  }

  if (
    category.includes(
      'webcam'
    )
  ) {
    return (
      <VideocamOutlinedIcon />
    )
  }

  if (
    name.includes(
      'hdmi'
    )
  ) {
    return (
      <CableOutlinedIcon />
    )
  }

  if (
    category.includes(
      'monitor'
    ) ||
    category.includes(
      'docking'
    )
  ) {
    return (
      <MonitorOutlinedIcon />
    )
  }

  if (
    category.includes(
      'keyboard'
    )
  ) {
    return (
      <KeyboardOutlinedIcon />
    )
  }

  if (
    category.includes(
      'printer'
    )
  ) {
    return (
      <PrintOutlinedIcon />
    )
  }

  if (
    resource.type ===
    'Desk'
  ) {
    return (
      <DeskOutlinedIcon />
    )
  }

  if (
    resource.type ===
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

function getAccent(
  resource: Asset
) {
  if (
    resource.type ===
    'Desk'
  ) {
    return {
      color: '#58ad35',

      background:
        'linear-gradient(145deg, rgba(120,201,72,.10), rgba(120,201,72,.025))',
    }
  }

  if (
    resource.type ===
    'Equipment'
  ) {
    return {
      color: '#159f99',

      background:
        'linear-gradient(145deg, rgba(24,170,163,.10), rgba(24,170,163,.025))',
    }
  }

  return {
    color: '#687085',

    background:
      'linear-gradient(145deg, rgba(104,112,133,.08), rgba(104,112,133,.02))',
  }
}

function ResourceVisual({
  resource,
}: ResourceVisualProps) {
  const [
    imageFailed,
    setImageFailed,
  ] = useState(false)

  const visual =
    getResourceVisualConfig(
      resource
    )

  const accent =
    getAccent(
      resource
    )

  useEffect(() => {
    setImageFailed(
      false
    )
  }, [
    visual.fileName,
  ])

  return (
    <Box
      sx={{
        width: '100%',

        height: 150,

        position: 'relative',

        overflow: 'hidden',

        display: 'flex',

        alignItems:
          'center',

        justifyContent:
          'center',

        borderRadius:
          '17px',

        color:
          accent.color,

        background:
          accent.background,

        border:
          '1px solid rgba(23,24,44,.045)',

        /*
          Decorative circles keep the card
          consistent with SmartOffice branding.
        */

        '&::before': {
          content: '""',

          position:
            'absolute',

          width: 110,

          height: 110,

          right: -45,

          top: -45,

          borderRadius:
            '50%',

          backgroundColor:
            'rgba(24,170,163,.055)',
        },

        '&::after': {
          content: '""',

          position:
            'absolute',

          width: 80,

          height: 80,

          left: -40,

          bottom: -45,

          borderRadius:
            '50%',

          backgroundColor:
            'rgba(120,201,72,.06)',
        },
      }}
    >
      {!imageFailed ? (
        <Box
          component="img"

          src={
            `/resource-gifs/${visual.fileName}`
          }

          alt={
            visual.label
          }

          onError={() =>
            setImageFailed(
              true
            )
          }

          sx={{
            width: '82%',

            height: '82%',

            position:
              'relative',

            zIndex: 1,

            objectFit:
              'contain',

            /*
              GIFs with transparent backgrounds
              will look especially good here.
            */

            filter:
              'drop-shadow(0 10px 15px rgba(23,24,44,.09))',
          }}
        />
      ) : (
        <Box
          sx={{
            position:
              'relative',

            zIndex: 1,

            display: 'flex',

            flexDirection:
              'column',

            alignItems:
              'center',

            justifyContent:
              'center',

            gap: 0.8,

            '& svg': {
              fontSize: 52,
            },
          }}
        >
          {getFallbackIcon(
            resource
          )}

          <Typography
            sx={{
              color:
                accent.color,

              fontSize:
                '0.63rem',

              fontWeight:
                900,

              letterSpacing:
                '0.03em',
            }}
          >
            {
              visual.label
            }
          </Typography>
        </Box>
      )}

      {/* CATEGORY BADGE */}

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
            accent.color,

          backgroundColor:
            'rgba(255,255,255,.88)',

          backdropFilter:
            'blur(7px)',

          border:
            '1px solid rgba(255,255,255,.80)',

          boxShadow:
            '0 4px 13px rgba(23,24,44,.05)',

          fontSize:
            '0.56rem',

          fontWeight:
            900,
        }}
      >
        {
          visual.label
        }
      </Box>
    </Box>
  )
}

export default ResourceVisual