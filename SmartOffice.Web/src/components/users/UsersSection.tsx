import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  observer,
} from 'mobx-react-lite'

import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material'

import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'

import {
  authStore,
} from '../../stores/AuthStore'

import {
  userManagementStore,
} from '../../stores/UserManagementStore'

import type {
  ManagedUser,
  UserRole,
} from '../../stores/UserManagementStore'

function getInitials(
  user: ManagedUser
) {
  const first =
    user.firstName
      ?.trim()
      .charAt(0)

  const last =
    user.lastName
      ?.trim()
      .charAt(0)

  const initials =
    `${first ?? ''}${last ?? ''}`
      .trim()
      .toUpperCase()

  if (initials) {
    return initials
  }

  return user.username
    .slice(0, 2)
    .toUpperCase()
}

const UsersSection =
  observer(
    () => {
      const [
        search,
        setSearch,
      ] = useState('')

      useEffect(() => {
        void userManagementStore
          .loadUsers()
      }, [])

      const filteredUsers =
        useMemo(
          () => {
            const query =
              search
                .trim()
                .toLowerCase()

            if (!query) {
              return userManagementStore
                .users
            }

            return userManagementStore
              .users
              .filter(
                (user) => {
                  const searchable =
                    [
                      user.displayName,
                      user.username,
                      user.firstName,
                      user.lastName,
                      user.role,
                    ]
                      .join(' ')
                      .toLowerCase()

                  return searchable.includes(
                    query
                  )
                }
              )
          },
          [
            search,
            userManagementStore.users,
          ]
        )

      const handleRoleChange =
        async (
          user: ManagedUser,
          newRole: UserRole
        ) => {
          if (
            user.role ===
            newRole
          ) {
            return
          }

          const confirmed =
            window.confirm(
              `Change ${user.displayName}'s role from ${user.role} to ${newRole}?`
            )

          if (!confirmed) {
            return
          }

          try {
            await userManagementStore
              .updateRole(
                user.id,
                newRole
              )
          } catch {
            // Store displays error.
          }
        }

      return (
        <Box>
          {/* HEADER */}

          <Box
            sx={{
              marginBottom:
                2.4,
            }}
          >
            <Typography
              sx={{
                color:
                  '#159f99',

                fontSize:
                  '0.66rem',

                fontWeight:
                  900,

                letterSpacing:
                  '0.14em',

                textTransform:
                  'uppercase',
              }}
            >
              Administration
            </Typography>

            <Typography
              sx={{
                marginTop:
                  0.25,

                color:
                  '#202337',

                fontSize: {
                  xs:
                    '1.65rem',

                  md:
                    '2rem',
                },

                fontWeight:
                  900,

                letterSpacing:
                  '-0.045em',
              }}
            >
              User Management
            </Typography>

            <Typography
              sx={{
                marginTop:
                  0.4,

                color:
                  '#9195a1',

                fontSize:
                  '0.8rem',
              }}
            >
              View employees and manage system permissions.
            </Typography>
          </Box>

          {/* SUMMARY */}

          <Box
            sx={{
              marginBottom:
                2,

              display:
                'grid',

              gridTemplateColumns:
                {
                  xs:
                    '1fr',

                  sm:
                    'repeat(3, 1fr)',
                },

              gap: 1,
            }}
          >
            <Paper
              elevation={0}

              sx={{
                padding:
                  1.6,

                display:
                  'flex',

                alignItems:
                  'center',

                gap: 1,

                borderRadius:
                  '16px',

                border:
                  '1px solid #e5e9e3',

                backgroundColor:
                  '#ffffff',
              }}
            >
              <Box
                sx={{
                  width: 40,

                  height: 40,

                  display:
                    'flex',

                  alignItems:
                    'center',

                  justifyContent:
                    'center',

                  borderRadius:
                    '12px',

                  color:
                    '#202337',

                  backgroundColor:
                    '#f2f3f1',
                }}
              >
                <PeopleAltOutlinedIcon />
              </Box>

              <Box>
                <Typography
                  sx={{
                    color:
                      '#202337',

                    fontSize:
                      '1.1rem',

                    fontWeight:
                      900,
                  }}
                >
                  {
                    userManagementStore
                      .users.length
                  }
                </Typography>

                <Typography
                  sx={{
                    color:
                      '#979ba5',

                    fontSize:
                      '0.61rem',

                    fontWeight:
                      800,

                    textTransform:
                      'uppercase',
                  }}
                >
                  Total Users
                </Typography>
              </Box>
            </Paper>

            <Paper
              elevation={0}

              sx={{
                padding:
                  1.6,

                display:
                  'flex',

                alignItems:
                  'center',

                gap: 1,

                borderRadius:
                  '16px',

                border:
                  '1px solid #e5e9e3',

                backgroundColor:
                  '#ffffff',
              }}
            >
              <Box
                sx={{
                  width: 40,

                  height: 40,

                  display:
                    'flex',

                  alignItems:
                    'center',

                  justifyContent:
                    'center',

                  borderRadius:
                    '12px',

                  color:
                    '#159f99',

                  backgroundColor:
                    'rgba(24,170,163,.08)',
                }}
              >
                <PersonOutlineOutlinedIcon />
              </Box>

              <Box>
                <Typography
                  sx={{
                    color:
                      '#202337',

                    fontSize:
                      '1.1rem',

                    fontWeight:
                      900,
                  }}
                >
                  {
                    userManagementStore
                      .memberCount
                  }
                </Typography>

                <Typography
                  sx={{
                    color:
                      '#979ba5',

                    fontSize:
                      '0.61rem',

                    fontWeight:
                      800,

                    textTransform:
                      'uppercase',
                  }}
                >
                  Members
                </Typography>
              </Box>
            </Paper>

            <Paper
              elevation={0}

              sx={{
                padding:
                  1.6,

                display:
                  'flex',

                alignItems:
                  'center',

                gap: 1,

                borderRadius:
                  '16px',

                border:
                  '1px solid #e5e9e3',

                backgroundColor:
                  '#ffffff',
              }}
            >
              <Box
                sx={{
                  width: 40,

                  height: 40,

                  display:
                    'flex',

                  alignItems:
                    'center',

                  justifyContent:
                    'center',

                  borderRadius:
                    '12px',

                  color:
                    '#58ad35',

                  backgroundColor:
                    'rgba(120,201,72,.10)',
                }}
              >
                <AdminPanelSettingsOutlinedIcon />
              </Box>

              <Box>
                <Typography
                  sx={{
                    color:
                      '#202337',

                    fontSize:
                      '1.1rem',

                    fontWeight:
                      900,
                  }}
                >
                  {
                    userManagementStore
                      .adminCount
                  }
                </Typography>

                <Typography
                  sx={{
                    color:
                      '#979ba5',

                    fontSize:
                      '0.61rem',

                    fontWeight:
                      800,

                    textTransform:
                      'uppercase',
                  }}
                >
                  Admins
                </Typography>
              </Box>
            </Paper>
          </Box>

          {/* SEARCH */}

          <Paper
            elevation={0}

            sx={{
              marginBottom:
                1.5,

              padding:
                1.4,

              borderRadius:
                '17px',

              border:
                '1px solid #e4e8e2',

              backgroundColor:
                '#ffffff',
            }}
          >
            <TextField
              fullWidth

              size="small"

              value={
                search
              }

              onChange={(
                event
              ) =>
                setSearch(
                  event.target.value
                )
              }

              placeholder="Search by employee name, username or role..."

              slotProps={{
                input: {
                  startAdornment:
                    (
                      <InputAdornment position="start">
                        <SearchOutlinedIcon
                          sx={{
                            color:
                              '#969aa4',
                          }}
                        />
                      </InputAdornment>
                    ),
                },
              }}

              sx={{
                '& .MuiOutlinedInput-root':
                  {
                    minHeight:
                      42,

                    borderRadius:
                      '11px',

                    backgroundColor:
                      '#fafbf9',
                  },
              }}
            />
          </Paper>

          {/* ERROR */}

          {userManagementStore.error && (
            <Alert
              severity="error"

              sx={{
                marginBottom:
                  1.5,

                borderRadius:
                  '13px',
              }}
            >
              {
                userManagementStore.error
              }
            </Alert>
          )}

          {/* USERS */}

          {userManagementStore.loading ? (
            <Paper
              elevation={0}

              sx={{
                minHeight:
                  250,

                display:
                  'flex',

                alignItems:
                  'center',

                justifyContent:
                  'center',

                borderRadius:
                  '20px',

                border:
                  '1px solid #e4e8e2',

                backgroundColor:
                  '#ffffff',
              }}
            >
              <CircularProgress
                sx={{
                  color:
                    '#159f99',
                }}
              />
            </Paper>
          ) : (
            <Paper
              elevation={0}

              sx={{
                overflow:
                  'hidden',

                borderRadius:
                  '20px',

                border:
                  '1px solid #e4e8e2',

                backgroundColor:
                  '#ffffff',

                boxShadow:
                  '0 12px 32px rgba(23,24,44,.035)',
              }}
            >
              {/* TABLE HEADER */}

              <Box
                sx={{
                  paddingX:
                    2,

                  paddingY:
                    1.1,

                  display: {
                    xs:
                      'none',

                    md:
                      'grid',
                  },

                  gridTemplateColumns:
                    'minmax(260px, 1.5fr) minmax(180px, 1fr) 150px 180px',

                  gap: 2,

                  color:
                    '#9599a4',

                  backgroundColor:
                    '#f8faf7',

                  borderBottom:
                    '1px solid #e8ebe6',

                  fontSize:
                    '0.6rem',

                  fontWeight:
                    900,

                  letterSpacing:
                    '0.06em',

                  textTransform:
                    'uppercase',
                }}
              >
                <span>
                  Employee
                </span>

                <span>
                  Username
                </span>

                <span>
                  Current Role
                </span>

                <span>
                  Manage Role
                </span>
              </Box>

              {filteredUsers.length ===
              0 ? (
                <Box
                  sx={{
                    padding:
                      5,

                    textAlign:
                      'center',
                  }}
                >
                  <PeopleAltOutlinedIcon
                    sx={{
                      color:
                        '#b1b4bc',

                      fontSize:
                        36,
                    }}
                  />

                  <Typography
                    sx={{
                      marginTop:
                        0.7,

                      color:
                        '#7e828e',

                      fontSize:
                        '0.76rem',

                      fontWeight:
                        800,
                    }}
                  >
                    No users found.
                  </Typography>
                </Box>
              ) : (
                filteredUsers.map(
                  (
                    user,
                    index
                  ) => {
                    const isCurrentUser =
                      authStore.user?.id ===
                      user.id

                    const isUpdating =
                      userManagementStore
                        .updatingUserId ===
                      user.id

                    return (
                      <Box
                        key={
                          user.id
                        }

                        sx={{
                          paddingX:
                            2,

                          paddingY:
                            1.45,

                          display:
                            'grid',

                          gridTemplateColumns:
                            {
                              xs:
                                '1fr',

                              md:
                                'minmax(260px, 1.5fr) minmax(180px, 1fr) 150px 180px',
                            },

                          gap: {
                            xs:
                              1.2,

                            md:
                              2,
                          },

                          alignItems:
                            'center',

                          borderBottom:
                            index <
                            filteredUsers.length -
                              1
                              ? '1px solid #edf0eb'
                              : 'none',

                          transition:
                            'background-color .15s ease',

                          '&:hover':
                            {
                              backgroundColor:
                                '#fcfdfb',
                            },
                        }}
                      >
                        {/* EMPLOYEE */}

                        <Box
                          sx={{
                            display:
                              'flex',

                            alignItems:
                              'center',

                            gap:
                              1.1,
                          }}
                        >
                          <Avatar
                            sx={{
                              width:
                                42,

                              height:
                                42,

                              color:
                                '#ffffff',

                              background:
                                user.role ===
                                'Admin'
                                  ? 'linear-gradient(135deg, #202337, #159f99)'
                                  : 'linear-gradient(135deg, #78c948, #18aaa3)',

                              fontSize:
                                '0.75rem',

                              fontWeight:
                                900,
                            }}
                          >
                            {getInitials(
                              user
                            )}
                          </Avatar>

                          <Box>
                            <Box
                              sx={{
                                display:
                                  'flex',

                                alignItems:
                                  'center',

                                gap:
                                  0.6,

                                flexWrap:
                                  'wrap',
                              }}
                            >
                              <Typography
                                sx={{
                                  color:
                                    '#202337',

                                  fontSize:
                                    '0.79rem',

                                  fontWeight:
                                    900,
                                }}
                              >
                                {
                                  user.displayName
                                }
                              </Typography>

                              {isCurrentUser && (
                                <Chip
                                  label="You"

                                  size="small"

                                  sx={{
                                    height:
                                      20,

                                    color:
                                      '#159f99',

                                    backgroundColor:
                                      'rgba(24,170,163,.08)',

                                    fontSize:
                                      '0.55rem',

                                    fontWeight:
                                      900,
                                  }}
                                />
                              )}
                            </Box>

                            <Typography
                              sx={{
                                marginTop:
                                  0.15,

                                color:
                                  '#9a9da6',

                                fontSize:
                                  '0.62rem',
                              }}
                            >
                              User ID #{user.id}
                            </Typography>
                          </Box>
                        </Box>

                        {/* USERNAME */}

                        <Box
                          sx={{
                            display:
                              'flex',

                            alignItems:
                              'center',

                            gap:
                              0.5,

                            color:
                              '#696e7a',
                          }}
                        >
                          <BadgeOutlinedIcon
                            sx={{
                              fontSize:
                                17,

                              color:
                                '#9a9ea8',
                            }}
                          />

                          <Typography
                            sx={{
                              fontSize:
                                '0.71rem',

                              fontWeight:
                                750,
                            }}
                          >
                            {
                              user.username
                            }
                          </Typography>
                        </Box>

                        {/* ROLE */}

                        <Box>
                          <Chip
                            icon={
                              user.role ===
                              'Admin'
                                ? (
                                  <AdminPanelSettingsOutlinedIcon />
                                )
                                : (
                                  <PersonOutlineOutlinedIcon />
                                )
                            }

                            label={
                              user.role
                            }

                            size="small"

                            sx={{
                              color:
                                user.role ===
                                'Admin'
                                  ? '#117f7a'
                                  : '#4b9633',

                              backgroundColor:
                                user.role ===
                                'Admin'
                                  ? 'rgba(24,170,163,.08)'
                                  : 'rgba(120,201,72,.09)',

                              border:
                                user.role ===
                                'Admin'
                                  ? '1px solid rgba(24,170,163,.15)'
                                  : '1px solid rgba(120,201,72,.18)',

                              fontSize:
                                '0.62rem',

                              fontWeight:
                                900,

                              '& .MuiChip-icon':
                                {
                                  color:
                                    'inherit',

                                  fontSize:
                                    16,
                                },
                            }}
                          />
                        </Box>

                        {/* ROLE CONTROL */}

                        <Box>
                          <TextField
                            select

                            fullWidth

                            size="small"

                            value={
                              user.role
                            }

                            disabled={
                              isUpdating ||
                              isCurrentUser
                            }

                            onChange={(
                              event
                            ) =>
                              void handleRoleChange(
                                user,
                                event.target
                                  .value as
                                  UserRole
                              )
                            }

                            sx={{
                              maxWidth:
                                170,

                              '& .MuiOutlinedInput-root':
                                {
                                  minHeight:
                                    38,

                                  borderRadius:
                                    '10px',

                                  backgroundColor:
                                    isCurrentUser
                                      ? '#f5f6f4'
                                      : '#ffffff',
                                },
                            }}
                          >
                            <MenuItem value="Member">
                              Member
                            </MenuItem>

                            <MenuItem value="Admin">
                              Admin
                            </MenuItem>
                          </TextField>

                          {isUpdating && (
                            <CircularProgress
                              size={
                                15
                              }

                              sx={{
                                marginLeft:
                                  1,

                                color:
                                  '#159f99',
                              }}
                            />
                          )}

                          {isCurrentUser && (
                            <Typography
                              sx={{
                                marginTop:
                                  0.35,

                                color:
                                  '#a0a3ac',

                                fontSize:
                                  '0.55rem',
                              }}
                            >
                              You cannot change your own role.
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )
                  }
                )
              )}
            </Paper>
          )}
        </Box>
      )
    }
  )

export default UsersSection