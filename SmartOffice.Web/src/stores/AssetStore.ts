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
  location: string
  status: string
  createdAt?: string
}

export interface UpdateAssetRequest {
  location: string
  status: string
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
      this.assets =
        await apiRequest<Asset[]>(
          ASSET_API_URL,
          {
            headers: {
              Authorization:
                `Bearer ${authStore.token}`,
            },
          }
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
    asset: Omit<
      Asset,
      'id' | 'createdAt'
    >
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

            body: JSON.stringify(
              asset
            ),
          }
        )

      this.assets = [
        ...this.assets,
        createdAsset,
      ]

      return createdAsset
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'Failed to create asset'

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

            body: JSON.stringify(
              request
            ),
          }
        )

      this.assets =
        this.assets.map(
          (asset) =>
            asset.id === id
              ? updatedAsset
              : asset
        )

      return updatedAsset
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

  async deleteAsset(id: string) {
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