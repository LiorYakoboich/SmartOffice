import { makeAutoObservable } from 'mobx'

import {
  apiRequest,
  ASSET_API_URL,
} from '../services/api'

import { authStore } from './AuthStore'

export interface Asset {
  id?: string

  name: string

  type: string

  category: string

  location: string

  description: string

  features: string[]

  status: string

  createdAt?: string
}

export interface CreateAssetRequest {
  name: string

  type: string

  category: string

  location: string

  description: string

  features: string[]

  status: string
}

export interface UpdateAssetRequest {
  location: string

  status: string

  category?: string

  description?: string

  features?: string[]
}

/*
  Lockers are managed by LockerStore and Locker Center.

  They must never appear inside the generic
  Office Resources inventory.
*/
function isLockerAsset(
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
    category === 'locker' ||

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

class AssetStore {
  assets: Asset[] = []

  loading = false

  error = ''

  constructor() {
    makeAutoObservable(this)
  }

  async loadAssets() {
    if (!authStore.token) {
      return
    }

    this.loading = true

    this.error = ''

    try {
      const assets =
        await apiRequest<Asset[]>(
          ASSET_API_URL,
          {
            headers: {
              Authorization:
                `Bearer ${authStore.token}`,
            },
          }
        )

      const normalizedAssets =
        assets.map(
          (asset) => ({
            ...asset,

            category:
              asset.category ??
              '',

            description:
              asset.description ??
              '',

            features:
              asset.features ??
              [],

            type:
              asset.type ===
              'Other'
                ? 'Shared Resource'
                : asset.type,
          })
        )

      /*
        Important:
        Locker Center owns all locker UI.
      */

      this.assets =
        normalizedAssets.filter(
          (asset) =>
            !isLockerAsset(
              asset
            )
        )
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'Failed to load assets'
    } finally {
      this.loading = false
    }
  }

  async createAsset(
    asset: CreateAssetRequest
  ) {
    if (!authStore.token) {
      throw new Error(
        'Authentication required'
      )
    }

    this.loading = true

    this.error = ''

    try {
      const createdAsset =
        await apiRequest<Asset>(
          ASSET_API_URL,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                `Bearer ${authStore.token}`,
            },

            body:
              JSON.stringify(
                asset
              ),
          }
        )

      const normalizedAsset: Asset =
        {
          ...createdAsset,

          category:
            createdAsset.category ??
            '',

          description:
            createdAsset.description ??
            '',

          features:
            createdAsset.features ??
            [],
        }

      if (
        !isLockerAsset(
          normalizedAsset
        )
      ) {
        this.assets = [
          ...this.assets,
          normalizedAsset,
        ]
      }

      return normalizedAsset
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'Failed to create resource'

      throw error
    } finally {
      this.loading = false
    }
  }

  async updateAsset(
    id: string,
    request: UpdateAssetRequest
  ) {
    if (!authStore.token) {
      throw new Error(
        'Authentication required'
      )
    }

    this.loading = true

    this.error = ''

    try {
      const updatedAsset =
        await apiRequest<Asset>(
          `${ASSET_API_URL}/${id}`,
          {
            method: 'PUT',

            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                `Bearer ${authStore.token}`,
            },

            body:
              JSON.stringify(
                request
              ),
          }
        )

      const normalizedAsset: Asset =
        {
          ...updatedAsset,

          category:
            updatedAsset.category ??
            '',

          description:
            updatedAsset.description ??
            '',

          features:
            updatedAsset.features ??
            [],
        }

      this.assets =
        this.assets
          .map(
            (asset) =>
              asset.id === id
                ? normalizedAsset
                : asset
          )
          .filter(
            (asset) =>
              !isLockerAsset(
                asset
              )
          )

      return normalizedAsset
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'Failed to update resource'

      throw error
    } finally {
      this.loading = false
    }
  }

  async deleteAsset(
    id: string
  ) {
    if (!authStore.token) {
      throw new Error(
        'Authentication required'
      )
    }

    this.loading = true

    this.error = ''

    try {
      await apiRequest<void>(
        `${ASSET_API_URL}/${id}`,
        {
          method: 'DELETE',

          headers: {
            Authorization:
              `Bearer ${authStore.token}`,
          },
        }
      )

      this.assets =
        this.assets.filter(
          (asset) =>
            asset.id !== id
        )
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'Failed to delete asset'

      throw error
    } finally {
      this.loading = false
    }
  }

  clear() {
    this.assets = []

    this.error = ''
  }
}

export const assetStore =
  new AssetStore()