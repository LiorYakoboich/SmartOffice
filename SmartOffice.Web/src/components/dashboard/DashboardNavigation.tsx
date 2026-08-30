import {
  observer,
} from 'mobx-react-lite'

import {
  Box,
  Button,
  Paper,
  Typography,
} from '@mui/material'

import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'

import {
  authStore,
} from '../../stores/AuthStore'

export type DashboardSection =
  | 'overview'
  | 'rooms'
  | 'lockers'
  | 'resources'
  | 'users'

interface DashboardNavigationProps {
  activeSection: DashboardSection

  onSectionChange: (
    section: DashboardSection
  ) => void

  roomCount: number

  resourceCount: number

  availableLockerCount: number
}

const DashboardNavigation =
  observer(
    ({
      activeSection,
      onSectionChange,
      roomCount,
      resourceCount,
      availableLockerCount,
    }: DashboardNavigationProps) => {
      const items = [
        {
          id:
            'overview' as DashboardSection,

          label:
            'Overview',

          icon:
            <DashboardOutlinedIcon />,

          badge:
            null,
        },

        {
          id:
            'rooms' as DashboardSection,

          label:
            'Meeting Rooms',

          icon:
            <MeetingRoomOutlinedIcon />,

          badge:
            roomCount,
        },

        {
          id:
            'lockers' as DashboardSection,

          label:
            'Lockers',

          icon:
            <LockOutlinedIcon />,

          badge:
            availableLockerCount,
        },

        {
          id:
            'resources' as DashboardSection,

          label:
            'Resources',

          icon:
            <Inventory2OutlinedIcon />,

          badge:
            resourceCount,
        },
      ]

      /*
        User Management is an Admin-only area.

        Members should not see the navigation
        option at all.
      */

      if (
        authStore.isAdmin
      ) {
        items.push({
          id:
            'users' as DashboardSection,

          label:
            'Users',

          icon:
            <PeopleAltOutlinedIcon />,

          badge:
            null,
        })
      }

      return (
        <Paper
          elevation={0}

          sx={{
            marginBottom:
              3,

            padding:
              0.8,

            display:
              'flex',

            gap:
              0.7,

            overflowX:
              'auto',

            borderRadius:
              '18px',

            border:
              '1px solid #e4e8e2',

            backgroundColor:
              'rgba(255,255,255,.92)',

            boxShadow:
              '0 12px 34px rgba(23,24,44,.045)',

            '&::-webkit-scrollbar':
              {
                height:
                  5,
              },
          }}
        >
          {items.map(
            (item) => {
              const selected =
                activeSection ===
                item.id

              return (
                <Button
                  key={
                    item.id
                  }

                  onClick={() =>
                    onSectionChange(
                      item.id
                    )
                  }

                  startIcon={
                    item.icon
                  }

                  sx={{
                    minHeight:
                      46,

                    minWidth: {
                      xs:
                        145,

                      md:
                        'auto',
                    },

                    paddingX: {
                      xs:
                        1.5,

                      md:
                        2,
                    },

                    borderRadius:
                      '13px',

                    color:
                      selected
                        ? '#ffffff'
                        : '#6b7080',

                    background:
                      selected
                        ? 'linear-gradient(100deg, #58ad35 0%, #18aaa3 110%)'
                        : 'transparent',

                    textTransform:
                      'none',

                    fontSize:
                      '0.78rem',

                    fontWeight:
                      900,

                    whiteSpace:
                      'nowrap',

                    boxShadow:
                      selected
                        ? '0 9px 22px rgba(24,170,163,.18)'
                        : 'none',

                    '&:hover':
                      {
                        background:
                          selected
                            ? 'linear-gradient(100deg, #4e9e31 0%, #159b96 110%)'
                            : '#f5f8f4',
                      },
                  }}
                >
                  <Box
                    sx={{
                      display:
                        'flex',

                      alignItems:
                        'center',

                      gap:
                        0.8,
                    }}
                  >
                    {
                      item.label
                    }

                    {item.badge !==
                      null && (
                      <Box
                        sx={{
                          minWidth:
                            22,

                          height:
                            22,

                          paddingX:
                            0.6,

                          display:
                            'flex',

                          alignItems:
                            'center',

                          justifyContent:
                            'center',

                          borderRadius:
                            '999px',

                          color:
                            selected
                              ? '#ffffff'
                              : '#4f8e35',

                          backgroundColor:
                            selected
                              ? 'rgba(255,255,255,.15)'
                              : 'rgba(120,201,72,.10)',
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize:
                              '0.62rem',

                            fontWeight:
                              900,
                          }}
                        >
                          {
                            item.badge
                          }
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Button>
              )
            }
          )}
        </Paper>
      )
    }
  )

export default DashboardNavigation