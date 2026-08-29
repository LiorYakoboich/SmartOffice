import {
  useMemo,
  useState,
} from 'react'

import {
  observer,
} from 'mobx-react-lite'

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'

import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined'

import {
  assetStore,
} from '../../stores/AssetStore'

import {
  authStore,
} from '../../stores/AuthStore'

import type {
  Asset,
} from '../../stores/AssetStore'

import ResourceVisual from './ResourceVisual'

interface ResourcesSectionProps {
  onAddResource: () => void

  onEditResource: (
    resource: Asset
  ) => void
}

type TypeFilter =
  | 'All'
  | 'Desk'
  | 'Equipment'
  | 'Shared Resource'

type FloorFilter =
  | 'All'
  | 'Floor 15'
  | 'Floor 16'

type StatusFilter =
  | 'All'
  | 'Available'
  | 'In Use'
  | 'Maintenance'

const TYPE_OPTIONS: {
  value: TypeFilter
  label: string
}[] = [
  {
    value: 'All',
    label: 'All',
  },

  {
    value: 'Desk',
    label: 'Desks',
  },

  {
    value: 'Equipment',
    label: 'Equipment',
  },

  {
    value: 'Shared Resource',
    label: 'Shared',
  },
]

function isLocker(
  asset: Asset
) {
  const category =
    (asset.category ?? '')
      .trim()
      .toLowerCase()

  const name =
    (asset.name ?? '')
      .trim()
      .toLowerCase()

  return (
    category ===
      'locker' ||

    /^l15-\d+$/i.test(
      name
    ) ||

    /^l16-\d+$/i.test(
      name
    ) ||

    /^locker[\s-]/i.test(
      name
    )
  )
}

function getStatusStyle(
  status: string
) {
  switch (status) {
    case 'Available':
      return {
        color:
          '#438f2a',

        backgroundColor:
          'rgba(120,201,72,.10)',

        borderColor:
          'rgba(120,201,72,.26)',
      }

    case 'In Use':
      return {
        color:
          '#117f7a',

        backgroundColor:
          'rgba(24,170,163,.09)',

        borderColor:
          'rgba(24,170,163,.22)',
      }

    case 'Maintenance':
      return {
        color:
          '#c34e4e',

        backgroundColor:
          'rgba(211,79,79,.08)',

        borderColor:
          'rgba(211,79,79,.20)',
      }

    default:
      return {
        color:
          '#777b86',

        backgroundColor:
          '#f5f6f4',

        borderColor:
          '#e1e4e0',
      }
  }
}

const ResourcesSection =
  observer(
    ({
      onAddResource,
      onEditResource,
    }: ResourcesSectionProps) => {
      const [
        search,
        setSearch,
      ] = useState('')

      const [
        typeFilter,
        setTypeFilter,
      ] =
        useState<TypeFilter>(
          'All'
        )

      const [
        floorFilter,
        setFloorFilter,
      ] =
        useState<FloorFilter>(
          'All'
        )

      const [
        statusFilter,
        setStatusFilter,
      ] =
        useState<StatusFilter>(
          'All'
        )

      const [
        deletingId,
        setDeletingId,
      ] = useState<
        string | null
      >(null)

      // =========================================
      // RESOURCES
      // =========================================

      const allResources =
        useMemo(
          () =>
            assetStore.assets
              .filter(
                (asset) =>
                  asset.type !==
                  'Room'
              )
              .filter(
                (asset) =>
                  !isLocker(
                    asset
                  )
              ),
          [
            assetStore.assets,
          ]
        )

      const resources =
        useMemo(
          () => {
            const normalizedSearch =
              search
                .trim()
                .toLowerCase()

            return allResources
              .filter(
                (asset) => {
                  if (
                    typeFilter !==
                      'All' &&
                    asset.type !==
                      typeFilter
                  ) {
                    return false
                  }

                  if (
                    floorFilter !==
                      'All' &&
                    asset.location !==
                      floorFilter
                  ) {
                    return false
                  }

                  if (
                    statusFilter !==
                      'All' &&
                    asset.status !==
                      statusFilter
                  ) {
                    return false
                  }

                  if (
                    !normalizedSearch
                  ) {
                    return true
                  }

                  const searchable =
                    [
                      asset.name,
                      asset.type,
                      asset.category,
                      asset.location,
                      asset.description,

                      ...(
                        asset.features ??
                        []
                      ),
                    ]
                      .join(' ')
                      .toLowerCase()

                  return searchable.includes(
                    normalizedSearch
                  )
                }
              )
              .sort(
                (a, b) =>
                  a.name.localeCompare(
                    b.name
                  )
              )
          },
          [
            allResources,
            search,
            typeFilter,
            floorFilter,
            statusFilter,
          ]
        )

      const availableCount =
        allResources.filter(
          (resource) =>
            resource.status ===
            'Available'
        ).length

      // =========================================
      // DELETE
      // =========================================

      const handleDelete =
        async (
          resource: Asset
        ) => {
          if (
            !resource.id
          ) {
            return
          }

          const confirmed =
            window.confirm(
              `Delete "${resource.name}"?`
            )

          if (
            !confirmed
          ) {
            return
          }

          try {
            setDeletingId(
              resource.id
            )

            await assetStore
              .deleteAsset(
                resource.id
              )
          } catch {
            // AssetStore displays API errors.
          } finally {
            setDeletingId(
              null
            )
          }
        }

      // =========================================
      // FILTERS
      // =========================================

      const hasFilters =
        search.trim() !==
          '' ||

        typeFilter !==
          'All' ||

        floorFilter !==
          'All' ||

        statusFilter !==
          'All'

      const clearFilters =
        () => {
          setSearch('')

          setTypeFilter(
            'All'
          )

          setFloorFilter(
            'All'
          )

          setStatusFilter(
            'All'
          )
        }

      return (
        <Box>
          {/* =====================================
              PAGE HEADER
          ====================================== */}

          <Box
            sx={{
              marginBottom:
                2.3,

              display:
                'flex',

              alignItems:
                'flex-end',

              justifyContent:
                'space-between',

              gap: 2,

              flexWrap:
                'wrap',
            }}
          >
            <Box>
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
                Workplace Inventory
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
                Office Resources
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
                Workstations, office equipment and shared facilities.
              </Typography>
            </Box>

            {authStore.isAdmin && (
              <Button
                variant="contained"

                startIcon={
                  <AddOutlinedIcon />
                }

                onClick={
                  onAddResource
                }

                sx={{
                  minHeight:
                    44,

                  paddingX:
                    2,

                  borderRadius:
                    '12px',

                  color:
                    '#ffffff',

                  background:
                    'linear-gradient(100deg, #58ad35 0%, #18aaa3 110%)',

                  boxShadow:
                    '0 11px 26px rgba(24,170,163,.18)',

                  textTransform:
                    'none',

                  fontWeight:
                    900,

                  '&:hover': {
                    background:
                      'linear-gradient(100deg, #4d9d30 0%, #159b96 110%)',
                  },
                }}
              >
                Add Resource
              </Button>
            )}
          </Box>

          {/* =====================================
              SUMMARY
          ====================================== */}

          <Box
            sx={{
              marginBottom:
                2,

              display:
                'grid',

              gridTemplateColumns:
                {
                  xs:
                    'repeat(2, 1fr)',

                  sm:
                    'repeat(4, 1fr)',
                },

              gap: 1,
            }}
          >
            {[
              {
                label:
                  'Resources',

                value:
                  allResources.length,
              },

              {
                label:
                  'Available',

                value:
                  availableCount,
              },

              {
                label:
                  'Desks',

                value:
                  allResources.filter(
                    (item) =>
                      item.type ===
                      'Desk'
                  ).length,
              },

              {
                label:
                  'Equipment',

                value:
                  allResources.filter(
                    (item) =>
                      item.type ===
                      'Equipment'
                  ).length,
              },
            ].map(
              (stat) => (
                <Paper
                  key={
                    stat.label
                  }

                  elevation={0}

                  sx={{
                    padding:
                      1.5,

                    borderRadius:
                      '15px',

                    border:
                      '1px solid #e5e9e3',

                    backgroundColor:
                      '#ffffff',
                  }}
                >
                  <Typography
                    sx={{
                      color:
                        '#202337',

                      fontSize:
                        '1.15rem',

                      fontWeight:
                        900,
                    }}
                  >
                    {
                      stat.value
                    }
                  </Typography>

                  <Typography
                    sx={{
                      marginTop:
                        0.15,

                      color:
                        '#9599a4',

                      fontSize:
                        '0.64rem',

                      fontWeight:
                        800,

                      textTransform:
                        'uppercase',

                      letterSpacing:
                        '0.05em',
                    }}
                  >
                    {
                      stat.label
                    }
                  </Typography>
                </Paper>
              )
            )}
          </Box>

          {/* =====================================
              FILTER BAR
          ====================================== */}

          <Paper
            elevation={0}
            sx={{
              marginBottom:
                2,

              padding:
                1.5,

              borderRadius:
                '18px',

              border:
                '1px solid #e4e8e2',

              backgroundColor:
                '#ffffff',
            }}
          >
            <Box
              sx={{
                display:
                  'grid',

                gridTemplateColumns:
                  {
                    xs:
                      '1fr',

                    md:
                      'minmax(260px, 1fr) auto auto',
                  },

                gap: 1,
              }}
            >
              <TextField
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

                placeholder="Search by name, category or feature..."

                size="small"

                slotProps={{
                  input: {
                    startAdornment:
                      (
                        <InputAdornment position="start">
                          <SearchOutlinedIcon
                            sx={{
                              color:
                                '#9296a1',

                              fontSize:
                                20,
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

              <TextField
                select

                size="small"

                value={
                  floorFilter
                }

                onChange={(
                  event
                ) =>
                  setFloorFilter(
                    event.target
                      .value as
                      FloorFilter
                  )
                }

                sx={{
                  minWidth:
                    130,

                  '& .MuiOutlinedInput-root':
                    {
                      minHeight:
                        42,

                      borderRadius:
                        '11px',
                    },
                }}
              >
                <MenuItem value="All">
                  All Floors
                </MenuItem>

                <MenuItem value="Floor 15">
                  Floor 15
                </MenuItem>

                <MenuItem value="Floor 16">
                  Floor 16
                </MenuItem>
              </TextField>

              <TextField
                select

                size="small"

                value={
                  statusFilter
                }

                onChange={(
                  event
                ) =>
                  setStatusFilter(
                    event.target
                      .value as
                      StatusFilter
                  )
                }

                sx={{
                  minWidth:
                    145,

                  '& .MuiOutlinedInput-root':
                    {
                      minHeight:
                        42,

                      borderRadius:
                        '11px',
                    },
                }}
              >
                <MenuItem value="All">
                  All Statuses
                </MenuItem>

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
            </Box>

            <Box
              sx={{
                marginTop:
                  1.2,

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
              <TuneOutlinedIcon
                sx={{
                  color:
                    '#999da7',

                  fontSize:
                    17,
                }}
              />

              {TYPE_OPTIONS.map(
                (
                  option
                ) => {
                  const selected =
                    typeFilter ===
                    option.value

                  return (
                    <Button
                      key={
                        option.value
                      }

                      onClick={() =>
                        setTypeFilter(
                          option.value
                        )
                      }

                      sx={{
                        minHeight:
                          32,

                        paddingX:
                          1.2,

                        borderRadius:
                          '9px',

                        color:
                          selected
                            ? '#ffffff'
                            : '#737885',

                        background:
                          selected
                            ? 'linear-gradient(100deg, #58ad35, #18aaa3)'
                            : '#f7f8f6',

                        border:
                          '1px solid #e5e8e3',

                        textTransform:
                          'none',

                        fontSize:
                          '0.66rem',

                        fontWeight:
                          900,
                      }}
                    >
                      {
                        option.label
                      }
                    </Button>
                  )
                }
              )}

              {hasFilters && (
                <Button
                  onClick={
                    clearFilters
                  }

                  sx={{
                    marginLeft:
                      'auto',

                    color:
                      '#159f99',

                    textTransform:
                      'none',

                    fontSize:
                      '0.67rem',

                    fontWeight:
                      900,
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </Box>
          </Paper>

          {/* =====================================
              RESULTS COUNT
          ====================================== */}

          <Typography
            sx={{
              marginBottom:
                1,

              color:
                '#8f939f',

              fontSize:
                '0.69rem',

              fontWeight:
                700,
            }}
          >
            {resources.length}{' '}
            {resources.length ===
            1
              ? 'resource'
              : 'resources'}{' '}
            found
          </Typography>

          {/* =====================================
              EMPTY STATE
          ====================================== */}

          {resources.length ===
          0 ? (
            <Paper
              elevation={0}
              sx={{
                minHeight:
                  230,

                display:
                  'flex',

                flexDirection:
                  'column',

                alignItems:
                  'center',

                justifyContent:
                  'center',

                padding: 3,

                borderRadius:
                  '20px',

                border:
                  '1px solid #e4e8e2',

                backgroundColor:
                  '#ffffff',

                textAlign:
                  'center',
              }}
            >
              <SearchOutlinedIcon
                sx={{
                  color:
                    '#78c948',

                  fontSize:
                    38,
                }}
              />

              <Typography
                sx={{
                  marginTop:
                    1,

                  color:
                    '#202337',

                  fontWeight:
                    900,
                }}
              >
                No matching resources
              </Typography>

              <Typography
                sx={{
                  marginTop:
                    0.4,

                  color:
                    '#969aa5',

                  fontSize:
                    '0.75rem',
                }}
              >
                Try changing your search or filters.
              </Typography>

              {hasFilters && (
                <Button
                  onClick={
                    clearFilters
                  }

                  sx={{
                    marginTop:
                      1,

                    color:
                      '#159f99',

                    textTransform:
                      'none',

                    fontWeight:
                      900,
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </Paper>
          ) : (
            /* ===================================
                RESOURCE CARDS
            ==================================== */

            <Box
              sx={{
                display:
                  'grid',

                gridTemplateColumns:
                  {
                    xs:
                      '1fr',

                    sm:
                      'repeat(2, minmax(0, 1fr))',

                    lg:
                      'repeat(3, minmax(0, 1fr))',

                    xl:
                      'repeat(4, minmax(0, 1fr))',
                  },

                gap:
                  1.5,
              }}
            >
              {resources.map(
                (
                  resource
                ) => {
                  const statusStyle =
                    getStatusStyle(
                      resource.status
                    )

                  return (
                    <Paper
                      key={
                        resource.id ??
                        `${resource.name}-${resource.location}`
                      }

                      elevation={0}

                      sx={{
                        minHeight:
                          400,

                        padding:
                          1.5,

                        display:
                          'flex',

                        flexDirection:
                          'column',

                        borderRadius:
                          '22px',

                        border:
                          '1px solid #e4e8e2',

                        background:
                          'linear-gradient(145deg, #ffffff, #fcfdfb)',

                        boxShadow:
                          '0 12px 32px rgba(23,24,44,.045)',

                        transition:
                          'transform .18s ease, box-shadow .18s ease, border-color .18s ease',

                        '&:hover':
                          {
                            transform:
                              'translateY(-4px)',

                            borderColor:
                              'rgba(120,201,72,.28)',

                            boxShadow:
                              '0 20px 42px rgba(23,24,44,.085)',
                          },
                      }}
                    >
                      {/* ===========================
                          LARGE IMAGE
                      ============================ */}

                      <ResourceVisual
                        resource={
                          resource
                        }
                      />

                      {/* ===========================
                          ADMIN ACTIONS
                      ============================ */}

                      {authStore.isAdmin &&
                        resource.id && (
                          <Box
                            sx={{
                              marginTop:
                                0.7,

                              display:
                                'flex',

                              justifyContent:
                                'flex-end',

                              gap:
                                0.5,
                            }}
                          >
                            <Tooltip title="Edit resource">
                              <IconButton
                                onClick={() =>
                                  onEditResource(
                                    resource
                                  )
                                }

                                sx={{
                                  width:
                                    34,

                                  height:
                                    34,

                                  borderRadius:
                                    '10px',

                                  color:
                                    '#159f99',

                                  backgroundColor:
                                    'rgba(24,170,163,.06)',

                                  '&:hover':
                                    {
                                      color:
                                        '#ffffff',

                                      backgroundColor:
                                        '#159f99',
                                    },
                                }}
                              >
                                <EditOutlinedIcon
                                  sx={{
                                    fontSize:
                                      18,
                                  }}
                                />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Delete resource">
                              <span>
                                <IconButton
                                  disabled={
                                    deletingId ===
                                    resource.id
                                  }

                                  onClick={() =>
                                    void handleDelete(
                                      resource
                                    )
                                  }

                                  sx={{
                                    width:
                                      34,

                                    height:
                                      34,

                                    borderRadius:
                                      '10px',

                                    color:
                                      '#d45454',

                                    backgroundColor:
                                      'rgba(212,84,84,.055)',

                                    '&:hover':
                                      {
                                        color:
                                          '#ffffff',

                                        backgroundColor:
                                          '#d45454',
                                      },
                                  }}
                                >
                                  {deletingId ===
                                  resource.id ? (
                                    <CircularProgress
                                      size={
                                        16
                                      }

                                      color="inherit"
                                    />
                                  ) : (
                                    <DeleteOutlinedIcon
                                      sx={{
                                        fontSize:
                                          18,
                                      }}
                                    />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Box>
                        )}

                      {/* ===========================
                          NAME
                      ============================ */}

                      <Typography
                        sx={{
                          marginTop:
                            authStore.isAdmin
                              ? 0.35
                              : 1.2,

                          color:
                            '#202337',

                          fontSize:
                            '1rem',

                          fontWeight:
                            900,

                          letterSpacing:
                            '-0.02em',
                        }}
                      >
                        {
                          resource.name
                        }
                      </Typography>

                      <Typography
                        sx={{
                          marginTop:
                            0.2,

                          color:
                            resource.type ===
                            'Equipment'
                              ? '#159f99'
                              : resource.type ===
                                  'Desk'
                                ? '#58ad35'
                                : '#687085',

                          fontSize:
                            '0.7rem',

                          fontWeight:
                            900,
                        }}
                      >
                        {resource.category ||
                          resource.type}
                      </Typography>

                      {/* ===========================
                          LOCATION + STATUS
                      ============================ */}

                      <Box
                        sx={{
                          marginTop:
                            0.9,

                          display:
                            'flex',

                          gap:
                            0.6,

                          flexWrap:
                            'wrap',
                        }}
                      >
                        <Chip
                          icon={
                            <LocationOnOutlinedIcon />
                          }

                          label={
                            resource.location
                          }

                          size="small"

                          sx={{
                            backgroundColor:
                              '#f5f6f4',

                            color:
                              '#656a77',

                            border:
                              '1px solid #e3e6e1',

                            fontSize:
                              '0.62rem',

                            fontWeight:
                              800,

                            '& .MuiChip-icon':
                              {
                                color:
                                  '#8b8f9a',

                                fontSize:
                                  15,
                              },
                          }}
                        />

                        <Chip
                          label={
                            resource.status
                          }

                          size="small"

                          variant="outlined"

                          sx={{
                            color:
                              statusStyle.color,

                            backgroundColor:
                              statusStyle.backgroundColor,

                            borderColor:
                              statusStyle.borderColor,

                            fontSize:
                              '0.62rem',

                            fontWeight:
                              900,
                          }}
                        />
                      </Box>

                      {/* ===========================
                          DESCRIPTION
                      ============================ */}

                      <Typography
                        sx={{
                          marginTop:
                            1,

                          color:
                            '#888c98',

                          fontSize:
                            '0.71rem',

                          lineHeight:
                            1.55,

                          display:
                            '-webkit-box',

                          WebkitLineClamp:
                            2,

                          WebkitBoxOrient:
                            'vertical',

                          overflow:
                            'hidden',
                        }}
                      >
                        {resource.description ||
                          'Smart Office workplace resource.'}
                      </Typography>

                      {/* ===========================
                          FEATURES
                      ============================ */}

                      <Box
                        sx={{
                          marginTop:
                            1,

                          display:
                            'flex',

                          gap:
                            0.45,

                          flexWrap:
                            'wrap',
                        }}
                      >
                        {(resource.features ??
                          [])
                          .slice(
                            0,
                            4
                          )
                          .map(
                            (
                              feature
                            ) => (
                              <Chip
                                key={
                                  feature
                                }

                                label={
                                  feature
                                }

                                size="small"

                                sx={{
                                  height:
                                    23,

                                  color:
                                    '#626775',

                                  backgroundColor:
                                    '#f7f8f6',

                                  border:
                                    '1px solid #e7e9e5',

                                  fontSize:
                                    '0.56rem',

                                  fontWeight:
                                    700,
                                }}
                              />
                            )
                          )}

                        {(resource.features ??
                          []).length >
                          4 && (
                          <Chip
                            label={`+${
                              resource.features
                                .length -
                              4
                            }`}

                            size="small"

                            sx={{
                              height:
                                23,

                              color:
                                '#159f99',

                              backgroundColor:
                                'rgba(24,170,163,.07)',

                              fontSize:
                                '0.56rem',

                              fontWeight:
                                900,
                            }}
                          />
                        )}
                      </Box>

                      <Box
                        sx={{
                          flexGrow:
                            1,
                        }}
                      />

                      {/* ===========================
                          FOOTER
                      ============================ */}

                      <Typography
                        sx={{
                          marginTop:
                            1.3,

                          paddingTop:
                            1,

                          color:
                            '#acafb7',

                          borderTop:
                            '1px solid #eff1ee',

                          fontSize:
                            '0.57rem',

                          fontWeight:
                            800,

                          letterSpacing:
                            '0.05em',

                          textTransform:
                            'uppercase',
                        }}
                      >
                        {
                          resource.type
                        }
                      </Typography>
                    </Paper>
                  )
                }
              )}
            </Box>
          )}
        </Box>
      )
    }
  )

export default ResourcesSection